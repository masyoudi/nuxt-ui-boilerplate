import { Fragment, type Component, type VNode } from 'vue-demi';
import { serialize, type Options as FormDataBuilder } from 'object-to-formdata';

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
  options: FormDataBuilder = { indices: true, dotsForObjectNotation: true }
) {
  return serialize(value, options);
}
