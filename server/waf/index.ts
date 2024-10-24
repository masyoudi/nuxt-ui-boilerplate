import type { H3Event } from 'h3';
import { getHeader, getHeaders } from 'h3';
import { addRoute, createRouter, findRoute } from 'rou3';
import modules from './modules';
import type { WAFOptions, WAFCheckOptions, WAFInput, WAFRouteRules, WAFModule } from './types';
import { flatObject } from '~~/shared/utils';
import { parseBody, isFormDataFile } from '~~/server/utils/body';

const HTTPMethods = ['GET', 'HEAD', 'PATCH', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE'];

/**
 * Filter affected input
 * @param _modules - WAF modules
 * @param inputs - Input to check
 * @returns object
 */
function lookup(_modules: WAFModule[], inputs: Record<WAFInput, string | string[]>) {
  const results = _modules.map((item) => {
    const data = item.inputs.map((name) => {
      const value = inputs[name as WAFInput];
      const values = (Array.isArray(value) ? value : [value]).filter((val) => val !== '');
      const res = values.map((val) => ({
        success: !item.regex.test(val),
        affected: val
      }));

      return {
        input: name,
        affected: res.filter((val) => !val.success).map((val) => val.affected)
      };
    });

    return {
      module: item.name,
      data: data.filter((item) => item.affected.length > 0)
    };
  });

  const success = results.every((res) => res.data.every((val) => val.affected.length < 1));

  return {
    success,
    results: results.filter((res) => res.data.some((val) => val.affected.length > 0))
  };
}

/**
 * WAF checker
 * @param options - Options
 * @returns object
 */
async function checker(options: WAFCheckOptions) {
  const { event, router, modules: _modules, inputs } = options;
  const [path] = event.path.split('?');
  const payload = findRoute(router, event.method, path)?.data?.payload;

  if (payload === false) {
    return {
      success: true,
      results: []
    };
  }

  const { ignoreModules: _ignoreModules } = payload ?? {};
  const ignoreModules = _ignoreModules ? Array.isArray(_ignoreModules) ? _ignoreModules : [_ignoreModules] : [];
  const filteredModules = _modules.filter((m) => !ignoreModules.includes(m.name));
  const result = lookup(filteredModules, inputs);

  return result;
}

/**
 * Parse input value from incoming request
 * @param event - H3Event
 * @returns object
 */
async function parseInputs(event: H3Event) {
  const headers = Object.values(getHeaders(event) ?? {}).filter((v) => typeof v === 'string');
  const contentType = getHeader(event, 'content-type') ?? '';
  const rawBody = await parseBody(event, { parseNestedJSON: false, encoding: 'utf-8' });
  const filteredBody = Object.entries(rawBody ?? {}).reduce((prev: Record<string, any>, [key, val]) => {
    const isFile = contentType.startsWith('multipart/form-data') && isFormDataFile(val);
    prev[key] = !isFile ? val : '';

    return prev;
  }, {});
  const body = Object.values(flatObject(filteredBody)).map((v) => String(v));

  const inputs: Record<WAFInput, string | string[]> = {
    url: event.path,
    headers,
    ua: getHeader(event, 'user-agent') ?? '',
    body
  };

  return inputs;
}

/**
 * WAF module
 * @param options - Options
 * @returns object
 */
export function useWAF(options?: WAFOptions) {
  const ignoreModules = options?.ignoreModules ?? [];
  const _modules = modules.filter((m) => !ignoreModules.includes(m.name));
  const router = createRouter<{ payload: false | WAFRouteRules }>();

  const routeEntries = Object.entries(options?.ignoreRoutes ?? {});
  for (let i = 0; i < routeEntries.length; i++) {
    const [path, payload] = routeEntries[i];

    if (!payload) {
      HTTPMethods.forEach((method) => {
        addRoute(router, method, path, { payload });
      });
    }
    else {
      const _methods = payload.method ? typeof payload.method === 'string' ? [payload.method] : payload.method : HTTPMethods;
      _methods.forEach((method) => {
        addRoute(router, method, path, { payload });
      });
    }
  }

  const check = async (event: H3Event) => {
    const inputs = await parseInputs(event);

    return await checker({
      event,
      modules: _modules,
      router,
      inputs
    });
  };

  return {
    check
  };
};
