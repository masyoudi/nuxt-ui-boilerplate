import type { FetchOptions } from 'ofetch';
import type { HTTPMethod } from 'h3';
import { omit } from '@@/utils';

interface Options extends Omit<FetchOptions, 'headers' | 'method' | 'body' | 'query'> {
  headers?: Record<string, string>;
  method?: Readonly<HTTPMethod>;
  body?: any;
  query?: Record<string, any>;
  formRef?: Ref;
  ignoreErrorParser?: boolean;
}

export async function useRequest<T = any>(url: string, options?: Options) {
  const request = $fetch.create({
    method: 'GET',
    timeout: 30000,
    onResponseError: (ctx) => {
      if (!options?.ignoreErrorParser) {
        useRequestError(ctx, options?.formRef);
      }
    }
  });

  const opts = { ...(options ?? {}) };
  const result = await request<T>(url, omit(opts, ['formRef', 'ignoreErrorParser']));

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
