/**
 * Omit object by key
 * @param source - Source object
 * @param keys - Object keys to remove
 * @returns object
 */
export function omit<T extends object, Keys extends keyof T>(source: T, keys: Keys | Keys[]) {
  const filteredKeys = Object.keys(source).filter((key) => !toArray(keys as string[], true).includes(key));
  const result = filteredKeys.reduce((prev: Record<string, any>, key) => {
    prev[key] = (source as any)[key];

    return prev;
  }, {});

  return result as Omit<T, Keys>;
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
 * Check `value` is an empty string
 * @param value - Value to check
 * @param defaultIfNotString - Default checking if value not a string
 * @returns boolean
 */
export function isEmptyString(value: any, defaultIfNotString: boolean = true): boolean {
  return typeof value === 'string' ? String(value).trim() === '' : defaultIfNotString;
};

/**
 * Uppercase the first char in every word
 * @param value - Value to convert
 * @returns String
 */
export function ucFirst(value: string) {
  return String(value).split(' ').map((v) => v.charAt(0).toUpperCase() + v.substring(1).toLowerCase()).join(' ');
}

/**
 * Get object constructor type
 * @param value - Value to check
 * @returns string
 */
export function getObjectType(value: any) {
  return Object.prototype.toString.call(value).replace(/^\[object (\S+)\]$/, '$1').toLowerCase();
}

/**
 * Check if value match with provided type
 * @param value - Value to check
 * @param type - Type to check
 * @returns boolean
 */
export function isObjectType(
  value: any,
  type: string | 'string' | 'number' | 'boolean' | 'function' | 'object' | 'date' | 'regex' | 'map' | 'set'
) {
  return getObjectType(value) === type;
}

/**
 * Flatten nested object
 * @param target - Object to parse
 * @returns object
 */
export function flatObject(target: Record<string, any>, delimiter: string = '.') {
  const output: Record<string, any> = {};

  const iterator = (result: Record<string, any>, separator: string, value: any, key: string) => {
    let k: number | string;

    if (typeof value !== 'object') {
      result[key] = value;
    }

    if (Array.isArray(value)) {
      for (k = 0; k < value.length; k++) {
        iterator(result, separator, value[k], key.concat('[', k.toString(), ']'));
      }
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      for (k in value) {
        iterator(result, separator, value[k], (key ? key + separator : key).concat(k));
      }
    }
  };

  if (typeof target == 'object') {
    iterator(output, delimiter, target, '');
  }

  return output;
}
