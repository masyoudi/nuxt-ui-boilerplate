import type { ApiMethod, ApiResponse, ApiRoute } from '~/types/api';
import type { FetchOptions, FetchResponse } from 'ofetch';

type HttpMethod = ApiMethod | Uppercase<ApiMethod>;

interface RequestOptions<M extends HttpMethod = HttpMethod> extends Omit<FetchOptions, 'headers' | 'method'> {
  baseURL?: string;
  headers?: Record<string, string>;
  method?: M;
}

type TypedResponse<T> = Promise<{
  raw: FetchResponse<T>;
  res: T;
}>;

export async function useRequest<R extends ApiRoute, M extends HttpMethod = 'GET'>(url: R, options?: RequestOptions<M>): TypedResponse<
  ApiResponse<R, Lowercase<M> & ApiMethod>
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
