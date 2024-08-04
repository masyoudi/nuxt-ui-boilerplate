import type { FetchError } from 'ofetch';
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

  const reqOptions = {
    ...omit(opts, ['formRef', 'ignoreErrorParser', 'onResponseError'])
  };

  const onResponseError = (ctx: any) => {
    (opts as any)?.onResponseError?.(ctx);

    if (!opts.ignoreErrorParser) {
      useRequestError(ctx.response, opts.formRef);
    }
  };

  const request = useFetch<ResT, ErrorT, ReqT, Method, _ResT, DataT, PickKeys, DefaultT>(url as any, {
    ...reqOptions,
    onResponseError
  });

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

export function useRequestError(response: any, formRef?: Ref) {
  const { status, _data, statusText } = response;

  if (status === 400 && Array.isArray(_data?.data?.errors)) {
    formRef?.value?.setErrors(_data.data.errors);
    return;
  }

  const toast = useToast();
  const description = typeof _data?.message === 'string' ? _data.message : statusText || 'Something went wrong';

  toast.add({ description, color: 'red' });
}
