import type { FetchError, FetchOptions } from 'ofetch';
import type { HTTPMethod } from 'h3';
import type { NitroFetchRequest, TypedInternalResponse, AvailableRouterMethod } from 'nitropack';
import { omit } from '@@/utils';
import type { AsyncData, KeysOf, PickFrom } from '#app/composables/asyncData.js';
import type { UseFetchOptions } from '#app/composables/fetch.js';

type Methods<R extends NitroFetchRequest> = AvailableRouterMethod<R> | Uppercase<AvailableRouterMethod<R>>;

type FetchResult<ReqT extends NitroFetchRequest, M extends Methods<ReqT>> = TypedInternalResponse<ReqT, unknown, Lowercase<M>>;

type DoRequestT<DataT, DefaultT, PickKeys extends KeysOf<DataT> = KeysOf<DataT>> = Promise<DefaultT | PickFrom<DataT, PickKeys>>;

type ReturnT<DataT, DefaultT, ErrorT, PickKeys extends KeysOf<DataT>> = AsyncData<
  PickFrom<DataT, PickKeys> | DefaultT,
  ErrorT | undefined
> & {
  run: () => DoRequestT<DataT, DefaultT, PickKeys>;
};

interface Options {
  formRef?: Ref;
  ignoreErrorParser?: boolean;
}

interface OptionsRaw extends Omit<FetchOptions, 'headers' | 'method' | 'body' | 'query'>, Options {
  headers?: Record<string, string>;
  method: Readonly<HTTPMethod>;
  body?: any;
  query?: Record<string, any>;
}

const defaults: UseFetchOptions<any> & Options = {
  method: 'GET',
  lazy: true,
  server: false,
  immediate: false,
  watch: false,
  retry: false,
  timeout: 30000,
  dedupe: 'cancel',
  ignoreErrorParser: false
};

const defaultRaw: OptionsRaw = {
  method: 'GET',
  timeout: 30000
};

export function useRequest<
  ResT = void,
  ErrorT = FetchError,
  ReqT extends NitroFetchRequest = NitroFetchRequest,
  Method extends Methods<ReqT> = ResT extends void ? ('get' extends Methods<ReqT> ? 'get' : Methods<ReqT>) : Methods<ReqT>,
  _ResT = ResT extends void ? FetchResult<ReqT, Method> : ResT,
  DataT = _ResT,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
  DefaultT = undefined
>(
  url: string,
  options?: UseFetchOptions<_ResT, DataT, PickKeys, DefaultT, ReqT, Method> & Options
): ReturnT<DataT, DefaultT, ErrorT, PickKeys>;

export function useRequest<
  ResT = void,
  ErrorT = FetchError,
  ReqT extends NitroFetchRequest = NitroFetchRequest,
  Method extends Methods<ReqT> = ResT extends void ? ('get' extends Methods<ReqT> ? 'get' : Methods<ReqT>) : Methods<ReqT>,
  _ResT = ResT extends void ? FetchResult<ReqT, Method> : ResT,
  DataT = _ResT,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
  DefaultT = DataT
>(
  url: string,
  options?: UseFetchOptions<_ResT, DataT, PickKeys, DefaultT, ReqT, Method> & Options
): ReturnT<DataT, DefaultT, ErrorT, PickKeys>;

/**
 * Request with useFetch
 * @param url - Request URL
 * @param options - Request options
 */
export function useRequest<
  ResT = void,
  ErrorT = FetchError,
  ReqT extends NitroFetchRequest = NitroFetchRequest,
  Method extends Methods<ReqT> = ResT extends void ? ('get' extends Methods<ReqT> ? 'get' : Methods<ReqT>) : Methods<ReqT>,
  _ResT = ResT extends void ? FetchResult<ReqT, Method> : ResT,
  DataT = _ResT,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
  DefaultT = undefined
>(url: string, options?: UseFetchOptions<_ResT, DataT, PickKeys, DefaultT, ReqT, Method> & Options) {
  const opts = { ...defaults, ...(options ?? {}) };

  const onResponseError = (ctx: any) => {
    (opts as any)?.onResponseError?.(ctx);

    if (!opts.ignoreErrorParser) {
      useRequestError(ctx, opts.formRef);
    }
  };

  const reqOptions = {
    ...omit(opts, ['formRef', 'ignoreErrorParser']),
    onResponseError
  };

  const request = useFetch<ResT, ErrorT, ReqT, Method, _ResT, DataT, PickKeys, DefaultT>(url as any, reqOptions);

  const doRequest = async () => {
    await request.execute();
    return request.data.value;
  };

  const result: ReturnT<DataT, DefaultT, ErrorT, PickKeys> = {
    ...request,
    run: doRequest
  };

  return result;
}

/**
 * Request with ofetch
 * @param url - Request URL
 * @param options - Request options
 */
export async function useRequestRaw<T = any>(url: string, options?: OptionsRaw) {
  const opts = { ...defaultRaw, ...(options ?? {}) };
  const reqOptions = omit(opts, ['formRef', 'ignoreErrorParser']);

  const result = await $fetch<T>(url, reqOptions);

  return result;
}

/**
 * Parse error request
 * @param err - Error response
 * @param formRef - FormRoot ref
 */
export function useRequestError(err: any, formRef?: Ref) {
  const toast = useToast();

  if (err.response?.status === 400 && Array.isArray(err.response?._data?.data?.errors) && !!formRef) {
    formRef?.value?.setErrors(err.response?._data.data.errors);
    return;
  }

  if (!!err.response?._data) {
    const description = typeof err.response._data.message === 'string' ? err.response._data.message : err.response.statusText;
    toast.add({ description, color: 'red' });
    return;
  }

  if (typeof err === 'string') {
    toast.add({ description: err, color: 'red' });
    return;
  }

  toast.add({ description: typeof err.message === 'string' ? err.message : 'Something went wrong', color: 'red' });
}
