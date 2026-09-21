import type { H3Event } from 'h3';
import { createError, getHeader, readRawBody } from 'h3';
import { decodeHTML } from 'entities';
import { addRoute, createRouter, findRoute } from 'rou3';
import modules from './modules';
import { evaluateWAF } from './evaluator';
import type {
  WAFOptions,
  WAFBodyInputs,
  WAFCheckOptions,
  WAFInputs,
  WAFInputValue,
  WAFRouteRules
} from './types';
import { parseBody, isFormDataFile } from '~~/server/utils/body';

const HTTPMethods = ['GET', 'HEAD', 'PATCH', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE'];

const PAYLOAD_METHODS = ['PATCH', 'POST', 'PUT', 'DELETE'];

const DEFAULT_MAX_BODY_SIZE = 10 * 1024 * 1024;

const DEFAULT_ANOMALY_THRESHOLD = 5;

const MAX_DECODE_ROUNDS = 2;

function resolveAnomalyThreshold(value: number | undefined, fallback: number) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 1) {
    return fallback;
  }

  return Math.floor(value);
}

function decodePercentEncoding(value: string) {
  return value.replace(/(?:%[\da-f]{2})+/gi, (encoded) => {
    try {
      return decodeURIComponent(encoded);
    }
    catch {
      return encoded;
    }
  });
}

export function normalizeWAFInput(value: string, plusAsSpace: boolean = false) {
  let result = (plusAsSpace ? value.replaceAll('+', ' ') : value).normalize('NFKC');

  for (let index = 0; index < MAX_DECODE_ROUNDS; index++) {
    const decoded = decodeHTML(decodePercentEncoding(result)).normalize('NFKC');
    if (decoded === result) {
      break;
    }

    result = decoded;
  }

  return result;
}

function createInputVariants(value: string, plusAsSpace: boolean = false) {
  const normalized = normalizeWAFInput(value, plusAsSpace);

  return normalized === value ? [value] : [value, normalized];
}

function createInputValues(value: string, plusAsSpace: boolean = false, bodyPath?: string): WAFInputValue[] {
  return createInputVariants(value, plusAsSpace).map((inputValue) => ({
    value: inputValue,
    ...(bodyPath && { bodyPath })
  }));
}

export function collectBodyInputs(
  value: unknown,
  path: string = '',
  result: WAFBodyInputs = { keys: [], values: [] }
): WAFBodyInputs {
  if (isFormDataFile(value)) {
    return result;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectBodyInputs(item, `${path}[${index}]`, result);
    });

    return result;
  }

  if (value !== null && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => {
      const itemPath = path ? `${path}.${key}` : key;

      result.keys.push(itemPath);
      collectBodyInputs(item, itemPath, result);
    });

    return result;
  }

  result.values.push({
    path: path || '$',
    value: String(value ?? '')
  });

  return result;
}

/**
 * WAF checker
 * @param options - Options
 * @returns object
 */
async function checker(options: WAFCheckOptions) {
  const { event, router, modules: _modules, inputs, anomalyThreshold } = options;
  const [path] = event.path.split('?') as [string, string | undefined];
  const payload = findRoute(router, event.method, path)?.data?.payload;

  if (payload === false) {
    return {
      success: true,
      totalScore: 0,
      anomalyThreshold,
      results: []
    };
  }

  const {
    ignoreModules: _ignoreModules,
    anomalyThreshold: routeAnomalyThreshold,
    excludeBodyFields
  } = payload ?? {};
  const ignoreModules = _ignoreModules ? Array.isArray(_ignoreModules) ? _ignoreModules : [_ignoreModules] : [];
  const filteredModules = _modules.filter((m) => !ignoreModules.includes(m.name));
  const threshold = resolveAnomalyThreshold(routeAnomalyThreshold, anomalyThreshold);
  const result = evaluateWAF(filteredModules, inputs, threshold, excludeBodyFields);

  return result;
}

/**
 * Parse input value from incoming request
 * @param event - H3Event
 * @returns object
 */
async function parseInputs(event: H3Event, maxBodySize: number) {
  const contentLength = Number(getHeader(event, 'content-length') ?? 0);
  if (Number.isFinite(contentLength) && contentLength > maxBodySize) {
    throw createError({ statusCode: 413, message: 'Request body is too large' });
  }

  if (PAYLOAD_METHODS.includes(event.method)) {
    const rawBody = await readRawBody(event, false);
    if (rawBody && Buffer.byteLength(rawBody) > maxBodySize) {
      throw createError({ statusCode: 413, message: 'Request body is too large' });
    }
  }

  const contentType = getHeader(event, 'content-type') ?? '';
  const rawBody = await parseBody(event, { parseNestedJSON: false, encoding: 'utf-8' });
  const body = collectBodyInputs(rawBody);
  const bodyKey = body.keys.flatMap((path) => {
    return createInputValues(path, contentType.includes('urlencoded'), path);
  });
  const bodyValue = body.values.flatMap(({ path, value }) => {
    return createInputValues(value, contentType.includes('urlencoded'), path);
  });
  const rawUrl = event.node.req.originalUrl ?? '';

  const inputs: WAFInputs = {
    url: createInputValues(rawUrl, true),
    headers: [],
    ua: createInputValues(getHeader(event, 'user-agent') ?? ''),
    bodyKey,
    bodyValue
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
  const maxBodySize = options?.maxBodySize ?? DEFAULT_MAX_BODY_SIZE;
  const anomalyThreshold = resolveAnomalyThreshold(options?.anomalyThreshold, DEFAULT_ANOMALY_THRESHOLD);
  const filteredModules = modules.filter((m) => !ignoreModules.includes(m.name));
  const router = createRouter<{ payload: false | WAFRouteRules }>();

  const routeEntries = Object.entries(options?.ignoreRoutes ?? {});
  for (let i = 0; i < routeEntries.length; i++) {
    const [path, payload] = routeEntries[i]!;

    if (!payload) {
      HTTPMethods.forEach((method) => {
        addRoute(router, method, path, { payload });
      });
    }
    else {
      const _methods = payload.method ? !Array.isArray(payload.method) ? [payload.method] : payload.method : HTTPMethods;
      _methods.forEach((method) => {
        addRoute(router, method, path, { payload });
      });
    }
  }

  const check = async (event: H3Event) => {
    const inputs = await parseInputs(event, maxBodySize);

    return await checker({
      event,
      modules: filteredModules,
      router,
      inputs,
      anomalyThreshold
    });
  };

  return {
    check
  };
};
