import type { MultiPartData, H3Event } from 'h3';
import { parseFormData } from 'parse-nested-form-data';
import { isObjectLike } from '@@/utils';

export interface Options {
  parseNestedJSON?: boolean;
}

export interface ObjectFile {
  filename: string;
  type: string;
  data: Buffer;
}

const FILE_KEYS = ['name', 'filename', 'type', 'data'];

/**
 * Check if data is file
 * @param data - Data to check
 */
export function isMultipartFile(data: any): data is ObjectFile {
  if (!isObjectLike(data)) {
    return false;
  }

  const hasFileKeys = Object.keys(data).filter((key) => FILE_KEYS.includes(key)).length === FILE_KEYS.length;

  return hasFileKeys ? Buffer.isBuffer(data.data) : false;
}

/**
 * Read multipart form data
 * @param event - H3Event
 * @param options - Options
 * @returns object
 */
export async function readMultipart(event: H3Event, options: Options = { parseNestedJSON: true }) {
  const data = await readMultipartFormData(event);
  const arr = (Array.isArray(data) ? data : []) as MultiPartData[];

  const result = arr.reduce((prev: Record<string, any>, curr) => {
    const isFile = isMultipartFile(curr);

    prev[String(curr.name)] = isFile ? { ...curr, size: Buffer.byteLength(curr.data.buffer) } : curr.data.toString('utf-8');

    return prev;
  }, {});

  return (options.parseNestedJSON ? parseFormData(Object.entries(result)) : result) as Record<string, any>;
}
