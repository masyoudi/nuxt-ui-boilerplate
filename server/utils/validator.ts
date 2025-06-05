import type { z } from 'zod/v4';
import { ZodError } from 'zod/v4';
import type { H3Error, H3Event } from 'h3';
import { parseBody } from './body';
import type { ParseBodyOptions } from './body';

interface Options<T extends z.ZodType> {
  source: Record<string, any>;
  schema: T | ((data: any) => T);
  error?: Partial<H3Error>;
  throwOnError?: boolean;
}

interface ValidateBodyOptions<T extends z.ZodType> extends Omit<Options<T>, 'source'> {
  parserOptions?: ParseBodyOptions;
}

/**
 * Create error path
 * @param value - Array of error path
 * @returns object
 */
function createPath(value: (string | number | symbol)[]) {
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
function parseError({ issues }: ZodError<any>) {
  const arr = issues.map((err) => ({ name: createPath(err.path), message: err.message }));

  return arr.filter((value, index, self) => index === self.findIndex((t) => t.name === value.name));
}

/**
 * Request validator
 * @param options - Options
 * @param options.source - Data to validate
 * @param options.schema - Zod schema
 * @param options.error - Throw error data
 * @returns - object
 */
export function useValidator<T extends z.ZodType>({
  source,
  schema,
  error,
  throwOnError = true
}: Options<T>) {
  const _schema = typeof schema === 'function' ? schema(source) : schema;
  const result = _schema.safeParse(source);
  const errors = !result.success ? (result.error instanceof ZodError ? parseError(result.error) : []) : [];

  if (errors.length > 0 && throwOnError) {
    throw createError({ ...error, data: { errors } });
  }

  return {
    data: (result.success ? result.data : source) as z.output<T>,
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
export async function useValidateBody<T extends z.ZodType>(event: H3Event, options: ValidateBodyOptions<T>) {
  let source: Record<string, any> = {};
  const error: Partial<H3Error> = {
    statusCode: 400,
    statusMessage: 'Bad Request',
    message: 'Check your input fields'
  };

  try {
    source = await parseBody(event, options.parserOptions);
  }
  catch {
    // noop
  }

  return useValidator<T>({ source, error, ...options });
}
