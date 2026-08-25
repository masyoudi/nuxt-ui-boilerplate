import type { NitroFetchRequest, TypedInternalResponse } from 'nitropack';
import type { FetchResponse } from 'ofetch';

type FetchOptions = NonNullable<Parameters<typeof $fetch>[1]>;

type HttpMethod = Exclude<FetchOptions['method'], undefined>;

interface RequestOptions<M extends HttpMethod> extends Omit<FetchOptions, 'headers' | 'method'> {
  baseURL?: string;
  headers?: Record<string, string>;
  method?: M;
}

type TypedResponse<T> = Promise<{
  raw: FetchResponse<T>;
  res: T;
}>;

type ApiRoute = Extract<NitroFetchRequest, `/api/${string}`>;

type ApiResponseMap<M extends HttpMethod = 'GET'> = {
  [K in ApiRoute as K extends `/api${infer R}` ? R : never]: TypedInternalResponse<K, unknown, Lowercase<M>>;
};

type UnprefixedApiRoute = keyof ApiResponseMap;

export async function useRequest<R extends UnprefixedApiRoute, M extends HttpMethod = 'GET'>(url: R, options?: RequestOptions<M>): TypedResponse<
  ApiResponseMap<M>[R]
>;

export async function useRequest<T, M extends HttpMethod = 'GET'>(url: string, options?: RequestOptions<M>): TypedResponse<T>;

export async function useRequest(url: string, options?: RequestOptions<'GET'>) {
  const headers = {
    'X-Requested-With': 'XMLHttpRequest',
    ...options?.headers
  };

  const _fetch = $fetch.create({
    baseURL: options?.baseURL ?? '/api',
    method: 'GET',
    timeout: 30000,
    headers,
    retry: false
  });

  const raw = await _fetch.raw(url, omit(options ?? {}, 'headers'));
  const res = raw._data;

  return {
    raw,
    res
  };
}
