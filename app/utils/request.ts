import type { FetchOptions } from 'ofetch';
import type { HTTPMethod } from 'h3';
import { toArray } from '~~/shared/utils';

interface Options extends Omit<FetchOptions, 'headers' | 'method' | 'body' | 'query'> {
  headers?: Record<string, string>;
  method?: Readonly<HTTPMethod>;
  body?: Record<string, any>;
  query?: Record<string, any>;
}

/**
 * Fetch API request
 * @param path - API path
 * @param options - ofetch options
 * @returns object
 */
export async function useRequest<T = any>(path: string, options?: Options) {
  const _fetch = $fetch.create({
    baseURL: options?.baseURL ?? '/api',
    method: 'GET',
    timeout: 30000,
    retry: false
  });

  const raw = await _fetch.raw(path, options);
  const res = raw._data as T;

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
