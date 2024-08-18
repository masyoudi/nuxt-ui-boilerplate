import { Fragment, type Component, type VNode } from 'vue-demi';
import { serialize, type Options as FormDataBuilderOptions } from 'object-to-formdata';

/**
 * Find childrend nodes
 * @param vnodes - Vue Nodes
 * @param names - Node names
 * @returns vnode
 */
export function findNodeChildrens(vnodes: VNode[], ...names: string[]) {
  const scan = [...vnodes];
  const result = [] as VNode[];

  while (scan.length > 0) {
    const vnode = scan.shift() as VNode;

    if (vnode?.type === Fragment && Array.isArray(vnode.children)) {
      scan.push(...(vnode.children as VNode[]));
    } else if (names[0] === '*' || (vnode?.type && names.includes((vnode.type as Component).name ?? ''))) {
      result.push(vnode as VNode);
    }
  }

  return result;
}

export function formDataBuilder(
  value: Record<string, any>,
  options: FormDataBuilderOptions = { indices: true, dotsForObjectNotation: true }
) {
  return serialize(value, options);
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
