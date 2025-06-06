import type { z } from 'zod/v4';
import { ZodError } from 'zod/v4';
import type { H3Error, H3Event } from 'h3';
import { parseBody } from './body';
import type { ParseBodyOptions } from './body';

interface Options<T extends z.ZodType | Promise<z.ZodType>> {
  source: Record<string, any>;
  schema: T | ((data: any, event: H3Event) => T) | ((data: any, event: H3Event) => Promise<T>);
  event: H3Event;
  error?: Partial<H3Error>;
  throwOnError?: boolean;
}

interface ValidateBodyOptions<T extends z.ZodType | Promise<z.ZodType>> extends Omit<Options<T>, 'source' | 'event'> {
  parserOptions?: ParseBodyOptions;
}

type ErrorResult = {
  name: string;
  message: string;
};

type ReturnValue<T extends z.ZodType | Promise<z.ZodType>> = {
  data: z.output<Awaited<T>>;
  errors: ErrorResult[];
  isValid: boolean;
};

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
 * @param options.issues - Zod errors value
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
export async function useValidator<T extends Promise<z.ZodType>>(options: Options<T>): Promise<ReturnValue<T>>;

export async function useValidator<T extends z.ZodType>({
  source,
  schema,
  event,
  error,
  throwOnError = true
}: Options<T>) {
  const _schema = typeof schema === 'function' ? await schema(source, event) : schema as z.ZodType;
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
export async function useValidateBody<T extends z.ZodType | Promise<z.ZodType>>(
  event: H3Event,
  options: ValidateBodyOptions<T>
): Promise<ReturnValue<T>>;

export async function useValidateBody<T extends Promise<z.ZodType>>(event: H3Event, options: ValidateBodyOptions<T>) {
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

  return await useValidator<T>({ source, error, event, ...options });
}
