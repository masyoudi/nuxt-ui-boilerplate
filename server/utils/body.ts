import type { MultiPartData, H3Event, HTTPMethod, Encoding } from 'h3';
import { parseFormData as parseFormData } from 'parse-nested-form-data';
import { readMultipartFormData } from 'h3';
import { isObjectType } from '~~/shared/utils';

export interface FormDataOptions {
  parseNestedJSON?: boolean;
  encoding?: Encoding;
}

export interface FormDataFile {
  name: string;
  filename: string;
  data: Buffer;
  size: number;
  type: string;
}

export type ParseBodyOptions = FormDataOptions;

const PayloadMethods: HTTPMethod[] = ['POST', 'PUT', 'DELETE', 'PATCH'];

/**
 * Check if value is file
 * @param value - Value to check
 * @param parsed - Check all file properties
 * @returns boolean
 */
export function isFormDataFile(value: any, parsed: boolean = true): value is FormDataFile {
  if (!isObjectType(value, 'object')) {
    return false;
  }

  const keys = ['name', 'filename', 'type', 'data', ...(!parsed ? ['size'] : [])];
  const isValidKeys = Object.keys(value).filter((key) => keys.includes(key)).length === keys.length;

  if (!isValidKeys) {
    return false;
  }

  return Object.values(omit(value, ['data', 'size'])).every((v) => typeof v === 'string') && Buffer.isBuffer(value.data);
}

/**
 * Read multipart form data
 * @param event - H3Event
 * @param options - Options
 * @returns object
 */
export async function parseBodyFormData(event: H3Event, options: FormDataOptions = { parseNestedJSON: true }) {
  const data = await readMultipartFormData(event);
  const arr = (Array.isArray(data) ? data : []) as MultiPartData[];

  const result = arr.reduce((prev: Record<string, any>, curr) => {
    const isFile = isFormDataFile(curr, false);

    prev[String(curr.name)] = isFile ? { ...curr, size: Buffer.byteLength(curr.data.buffer) } : curr.data.toString('utf-8');

    return prev;
  }, {});

  return (options.parseNestedJSON ? parseFormData(Object.entries(result)) : result) as Record<string, any>;
}

/**
 * Parse body request
 * @param event - H3Event
 * @param options - Options
 * @returns object | undefined
 */
export async function parseBody(
  event: H3Event,
  options: ParseBodyOptions = {
    parseNestedJSON: true,
    encoding: 'utf-8'
  }
) {
  const contentType = getRequestHeader(event, 'content-type');
  const CONTENT_TYPES = ['application/json', 'application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain'];

  if (!contentType || !PayloadMethods.includes(event.method) || !CONTENT_TYPES.some((v) => contentType?.includes(v))) {
    return;
  }

  if (contentType.startsWith('multipart/form-data')) {
    return await parseBodyFormData(event, options);
  }

  return await readBody(event);
}
