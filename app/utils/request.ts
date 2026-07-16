import { toArray } from '~~/shared/utils';

import type { NitroFetchRequest, TypedInternalResponse } from 'nitropack';
import type { FetchResponse } from 'ofetch';

type FetchOptions = Parameters<typeof $fetch>[1];

type TypedResponse<T> = Promise<{
  raw: FetchResponse<T>;
  res: T;
}>;

type ApiRoute = Extract<NitroFetchRequest, `/api/${string}`>;

type RemoveApiPrefix<T> = T extends `/api${infer R}` ? R : never;

type AddApiPrefix<T> = T extends `${infer R}` ? `/api${R}` : never;

type UnprefixedApiRoute = RemoveApiPrefix<ApiRoute>;

export async function useRequest<R extends UnprefixedApiRoute>(url: R, options?: FetchOptions): TypedResponse<TypedInternalResponse<AddApiPrefix<R>>>;

export async function useRequest<T>(url: string, options?: FetchOptions): TypedResponse<T>;

export async function useRequest(url: string, options?: FetchOptions) {
  const _fetch = $fetch.create({
    baseURL: options?.baseURL ?? '/api',
    method: 'GET',
    timeout: 30000,
    retry: false
  });

  const raw = await _fetch.raw(url, options);
  const res = raw._data;

  return { raw, res };
}

/**
 * Parse error request
 * @param err - Error response
 * @param formRef - FormRoot ref
 */
export function useRequestErrorParser(err: any, formRef?: Ref) {
  const toast = useToast();

  if (err.response?.status === 400 && Array.isArray(err.response?._data?.data?.errors) && !!formRef) {
    const errors = toArray(err.response?._data.data.errors);
    formRef?.value?.setErrors?.(errors);
    return;
  }

  if (err.response?._data) {
    const description = typeof err.response._data.message === 'string' ? err.response._data.message : err.response.statusText;
    toast.add({ description, color: 'danger' });
    return;
  }

  if (typeof err === 'string') {
    toast.add({ description: err, color: 'danger' });
    return;
  }

  toast.add({ description: typeof err.message === 'string' ? err.message : 'Something went wrong', color: 'danger' });
}
