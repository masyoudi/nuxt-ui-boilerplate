import type { NitroFetchRequest, TypedInternalResponse } from 'nitropack';
import type { FetchResponse } from 'ofetch';

type FetchOptions = NonNullable<Parameters<typeof $fetch>[1]>;

type RequestOptions = Omit<FetchOptions, 'headers'> & {
  headers?: Record<string, string>;
};

type TypedResponse<T> = Promise<{
  raw: FetchResponse<T>;
  res: T;
}>;

type ApiRoute = Extract<NitroFetchRequest, `/api/${string}`>;

type PrefixedApiRoute<T> = T extends `${infer R}` ? `/api${R}` : never;

type UnprefixedApiRoute<T> = T extends `/api${infer R}` ? R : never;

export async function useRequest<R extends UnprefixedApiRoute<ApiRoute>>(url: R, options?: RequestOptions): TypedResponse<
  TypedInternalResponse<PrefixedApiRoute<R>>
>;

export async function useRequest<T>(url: string, options?: RequestOptions): TypedResponse<T>;

export async function useRequest(url: string, options?: RequestOptions) {
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
