import type { H3Event, HTTPMethod, Encoding } from 'h3';
import { parseFormData as parseFormData } from 'parse-nested-form-data';
import { getRequestHeader, readBody, readMultipartFormData, readRawBody } from 'h3';
import { isObjectType, omit } from '~~/shared/utils';

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
const MultipartBodyCache = Symbol('multipart-body-cache');

type MultipartBodyContext = H3Event['context'] & {
  [MultipartBodyCache]?: Promise<Record<string, any>>;
};

/**
 * Check if value is file
 * @param value - Value to check
 * @param isAfterParsed - Check value after parsed
 * @returns boolean
 */
export function isFormDataFile(value: any, isAfterParsed: boolean = true): value is FormDataFile {
  if (!isObjectType(value, 'object')) {
    return false;
  }

  const keys = ['name', 'filename', 'type', 'data', ...(isAfterParsed ? ['size'] : [])];
  const isValidKeys = Object.keys(value).filter((key) => keys.includes(key)).length === keys.length;

  if (!isValidKeys) {
    return false;
  }

  const isMetadataValid = Object.values(omit(value, ['data', 'size'])).every((v) => typeof v === 'string');

  return isMetadataValid && Buffer.isBuffer(value.data);
}

/**
 * Read multipart form data
 * @param event - H3Event
 * @param options - Options
 * @returns object
 */
export async function parseBodyFormData(event: H3Event, options: FormDataOptions = { parseNestedJSON: true }) {
  const context = event.context as MultipartBodyContext;
  context[MultipartBodyCache] ??= readMultipartFormData(event).then((data) => toArray(data).reduce((prev: Record<string, any>, curr) => {
    const isFile = isFormDataFile(curr, false);

    prev[String(curr.name)] = isFile ? { ...curr, size: Buffer.byteLength(curr.data.buffer) } : curr.data.toString('utf-8');

    return prev;
  }, {}));

  const result = await context[MultipartBodyCache];

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
  const CONTENT_TYPES = [
    'application/json',
    'application/x-www-form-urlencoded',
    'multipart/form-data',
    'application/xml'
  ];
  const isText = contentType?.startsWith('text/');
  const isSupportedContentType = CONTENT_TYPES.some((value) => contentType?.includes(value));

  if (!contentType || !PayloadMethods.includes(event.method) || (!isText && !isSupportedContentType)) {
    return;
  }

  if (contentType.startsWith('multipart/form-data')) {
    return await parseBodyFormData(event, options);
  }

  if (contentType.includes('xml')) {
    return await readRawBody(event, options.encoding);
  }

  return await readBody(event);
}
