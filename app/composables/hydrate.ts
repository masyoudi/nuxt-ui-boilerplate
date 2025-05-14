import { defineAsyncComponent, hydrateOnVisible } from 'vue';
import type { AsyncComponentLoader, Component, HydrationStrategy } from 'vue';

/**
 * Create lazy component with hydration strategy
 * @returns - Vue async component
 */
export function useHydrate() {
  return <T extends Component>(
    component: AsyncComponentLoader<T>,
    hydrate?: HydrationStrategy
  ) => {
    if (!(import.meta.dev || import.meta.server) && typeof component === 'function') {
      hydrate = hydrate || hydrateOnVisible({ rootMargin: '0%' });
    }
    else {
      hydrate = undefined;
    }

    return defineAsyncComponent({
      loader: component,
      hydrate
    });
  };
}
