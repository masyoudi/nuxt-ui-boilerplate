import type { z } from 'zod';
import { ZodError } from 'zod';
import { createError, readBody, getQuery, type H3Event } from 'h3';
import { readMultipart, type Options as OptionsMultipart } from './multipart';

interface Options {
  source: Record<string, any>;
  schema: z.ZodType | ((data: any) => z.ZodType);
  statusCode?: number;
  statusMessage?: string;
  message?: string;
  throwOnError?: boolean;
}

interface OptionsBase extends Omit<Options, 'source'> {}

interface OptionsValidateBody extends OptionsBase, OptionsMultipart {}

const MULTIPART_PATTERN = /[-\w]+\r\nContent-Disposition:\sform-data;\sname=.*\r\n/;
const PAYLOAD_METHODS = ['PATCH', 'POST', 'PUT', 'DELETE'] as string[];

/**
 * Check incoming request is multipart/form-data
 * @param event - H3Event
 * @returns boolean
 */
async function isRequestFormData(event: H3Event) {
  const { req } = event.node;
  const isMultipartHeader = String(req.headers['content-type'] || '').includes('multipart/form-data');

  if (!isMultipartHeader || !req.method || !PAYLOAD_METHODS.includes(req.method?.toUpperCase())) {
    return false;
  }

  if (!Number.parseInt(req.headers['content-length'] || '')) {
    const chunks = (req.headers['transfer-encoding'] || '').split(',').map((e) => e.trim());
    const isChunked = chunks.filter(Boolean).includes('chunked');

    if (!isChunked) {
      return false;
    }
  }

  const body = await readRawBody(event, 'utf-8');

  return MULTIPART_PATTERN.test(body ?? '');
}

/**
 * Create error path
 * @param value - Array of error path
 * @returns object
 */
function createPath(value: (string | number)[]) {
  const parsed = value.map((path, i) => {
    if (typeof path === 'number') {
      return `[${path}]`;
    }

    if (typeof path === 'string' && i > 0) {
      return '.'.concat(path);
    }

    return path;
  });

  return parsed.join('');
}

/**
 * Get error value
 * @param options - Zod Error
 * @param options.errors - Zod errors value
 * @returns array
 */
function parseError({ errors }: ZodError) {
  const arr = errors.map((err) => ({ path: createPath(err.path), message: err.message }));

  return arr.filter((value, index, self) => index === self.findIndex((t) => t.path === value.path));
}

/**
 * Request validator
 * @param options - Options
 * @param options.source - Data to validate
 * @param options.schema - Zod schema
 * @param options.statusCode - Response status code
 * @param options.statusMessage - Response status message
 * @param options.message - Response error message
 * @param options.throwOnError - Should throw error or not
 * @returns - object
 */
export function useValidator<T = any>({
  source,
  schema,
  statusCode = 400,
  statusMessage = 'Bad Request',
  message = 'Check your input fields',
  throwOnError = true
}: Options) {
  const result = typeof schema === 'function' ? schema(source).safeParse(source) : schema.safeParse(source);
  const errors = !result.success ? (result.error instanceof ZodError ? parseError(result.error) : []) : [];

  if (errors.length > 0 && throwOnError) {
    throw createError({ statusCode, statusMessage, message, data: { errors } });
  }

  return {
    data: (result.success ? result.data : source) as T,
    errors,
    isValid: !errors.length
  };
}

/**
 * Validate & parse body request json/form-data
 * @param event - H3Event
 * @param options - Options
 * @returns - object
 */
export async function useValidateBody<T = any>(event: H3Event, options: OptionsValidateBody) {
  let source = {};

  try {
    const parseNestedJSON = typeof options.parseNestedJSON !== 'boolean' ? true : options.parseNestedJSON;
    const isFormData = await isRequestFormData(event);

    source = isFormData ? await readMultipart(event, { parseNestedJSON }) : await readBody(event);
  } catch {
    // noop
  }

  return useValidator<T>({ source, ...options });
}

/**
 * Validate url query
 * @param event - H3Event
 * @param options - Options
 * @returns - object
 */
export function useValidateQuery<T = any>(event: H3Event, options: OptionsBase) {
  const source = getQuery(event);

  return useValidator<T>({ source, ...options });
}
