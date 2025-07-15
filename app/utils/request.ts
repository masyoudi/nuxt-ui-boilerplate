import type { FetchOptions } from 'ofetch';
import type { HTTPMethod } from 'h3';

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
  const instance = $fetch.create({
    baseURL: options?.baseURL,
    method: 'GET',
    timeout: 30000,
    retry: false
  });

  const raw = await instance.raw(path, options);
  const res = raw._data as T;

  return {
    raw,
    res
  };
}

/**
 * Parse error request
 * @param err - Error response
 */
export function useRequestError(err: any) {
  const toast = useToast();

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
