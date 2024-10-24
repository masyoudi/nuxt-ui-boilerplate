import { Fragment, type Component, type VNode } from 'vue-demi';

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
    }
    else if (names[0] === '*' || (vnode?.type && names.includes((vnode.type as Component).name ?? ''))) {
      result.push(vnode as VNode);
    }
  }

  return result;
}

/**
 * Find focusable node
 * @param element - Root element to find focusable node
 */
export function trapFocus(element: HTMLElement) {
  if (!element || !document) {
    return;
  }

  const nodes = 'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';
  const focusableNodes = [
    ...Array.from(element.querySelectorAll(nodes))
  ].filter((el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));

  const focusableNodeFirst = focusableNodes[0] as HTMLElement;
  const focusableNodeLast = focusableNodes[focusableNodes.length - 1] as HTMLElement;

  if (focusableNodeFirst) {
    focusableNodeFirst.focus();
  }

  element.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') {
      return;
    }

    if (e.shiftKey) {
      if (document.activeElement === focusableNodeFirst) {
        focusableNodeLast.focus();
        e.preventDefault();
      }
    }
    else {
      if (document.activeElement === focusableNodeLast) {
        focusableNodeFirst.focus();
        e.preventDefault();
      }
    }
  });

  return focusableNodeFirst;
}
