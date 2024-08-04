const TYPEOF_OBJECTS = [
  'array',
  'bigint',
  'boolean',
  'date',
  'error',
  'file',
  'function',
  'map',
  'null',
  'number',
  'object',
  'regexp',
  'string',
  'undefined'
] as const;

type TypeOfObject = (typeof TYPEOF_OBJECTS)[number];

/**
 * Check data type
 * @param value - Value to check
 * @returns string
 */
export function checkType(value: any) {
  return typeof value;
}

/**
 * Check typeof `value` is equal with `typeOf` data
 * @param value any
 * @param typeOf string
 * @returns Boolean
 */
export function isType(value: any, typeOf: ReturnType<typeof checkType>): value is typeof typeOf {
  return typeof value === typeOf;
}

/**
 * Check typeof `value` is one of `types`
 * @param value any
 * @param types string
 * @returns Boolean
 */
export function isTypes(value: any, types: ReturnType<typeof checkType>[]) {
  return types.filter((v) => typeof value === v).length > 0;
}

/**
 * Check given `value` is plain object
 * @param value
 * @returns boolean
 */
export function isPlainObject(value: any): boolean {
  return isType(value, 'object') && isObjectType(value, 'object');
}

/**
 * Check if `value` is object-like. A value is object-like if it's not `null` and has a `typeof` result of "object"
 * @param value
 * @returns boolean
 */
export function isObjectLike(value: any): boolean {
  return isType(value, 'object') && !isNil(value);
}

/**
 * Check given `value` is boolean
 * @param value
 * @returns boolean
 */
export function isBoolean(value: any): boolean {
  return value === true || value === false || (isObjectLike(value) && isObjectType(value, 'boolean'));
}

/**
 * Check object has key/property
 * @param obj Object to check
 * @param key Key/property to check
 * @returns boolean
 */
export function hasObjKey(obj: any, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj || {}, key);
}

/**
 * Get object type
 * @param val Value to check
 * @returns String
 */
export function getObjectType(val: any): string {
  const [, tag] = Object.prototype.toString.call(val).split(/\s/);
  return tag ? tag.slice(0, -1).toLowerCase() : 'undefined';
}

/**
 * Check object type. (ex: `isObjectType('123', 'string')` => `true`)
 * @param value Value to check
 * @param objectType
 * @returns boolean
 */
export function isObjectType(value: any, objectType: TypeOfObject): boolean {
  return getObjectType(value) === objectType;
}

/**
 * Check `value` is `null` or `undefined`
 * @param value Value to check
 * @returns boolean
 */
export function isNil(value: any): boolean {
  return isObjectType(value, 'null') || isObjectType(value, 'undefined');
}

/**
 * Set data as array
 * @param value - Value to check
 * @param assign - Force assign to array
 * @returns array
 */
export function toArray<T>(value: T | T[], assign: boolean = false): T[] {
  return Array.isArray(value) ? [...value] : assign ? [value] : [];
}

/**
 * JSON parse
 * @param value - Value to parse
 * @param defaults - Default value if error parse
 */
export function parseJSON(value: any, defaults?: any) {
  try {
    return JSON.parse(value) ?? (defaults ? defaults : {});
  } catch {
    return defaults ? defaults : {};
  }
}

/**
 * Omit object by key
 * @param source - Source object
 * @param keys - Object keys to remove
 * @returns object
 */
export function omit<T extends Record<string, any>>(source: T, keys: keyof T | (keyof T)[]) {
  return Object.keys(source).reduce((prev: Record<string, any>, key) => {
    if (!(keys as string[]).includes(key)) {
      prev[key] = source[key];
    }

    return prev;
  }, {});
}
