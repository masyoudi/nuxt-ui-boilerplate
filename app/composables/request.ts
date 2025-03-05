import type { FetchOptions } from 'ofetch';
import type { HTTPMethod } from 'h3';
import { omit, toArray } from '~~/shared/utils';

interface Options extends Omit<FetchOptions, 'headers' | 'method' | 'body' | 'query'> {
  headers?: Record<string, string>;
  method?: Readonly<HTTPMethod>;
  body?: Record<string, any>;
  query?: Record<string, any>;
  isRawResponse?: boolean;
}

/**
 * Fetch API request
 * @param url - API path
 * @param options - ofetch options
 * @returns object
 */
export async function useRequest<T = any>(url: string, options?: Options) {
  const instance = $fetch.create({
    method: 'GET',
    timeout: 30000
  });

  const opts = (options ?? {});
  const reqUrl = !options?.baseURL ? '/api'.concat(url) : url;
  const raw = await instance.raw(reqUrl, omit(opts, ['isRawResponse']));

  return { raw, data: raw._data as T };
}

/**
 * Parse error request
 * @param err - Error response
 * @param formRef - FormRoot ref
 */
export function useRequestError(err: any, formRef?: Ref) {
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
