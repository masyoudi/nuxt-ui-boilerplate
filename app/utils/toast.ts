import { useEventBus } from '@vueuse/core';
import type { Toast } from '@nuxt/ui/composables/useToast';

interface ToastParamsId {
  id: string | number;
}

interface ToastActions {
  add: Partial<Toast> & {
    callback?: (toast: Toast) => void;
  };
  update: Partial<Toast> & ToastParamsId;
  remove: ToastParamsId;
  clear: undefined;
}

const appToastKey = Symbol('app:toast');

export function useAppToastBus() {
  const bus = useEventBus<any>(appToastKey);

  function emit<K extends keyof ToastActions>(event: K, ...args: ToastActions[K] extends undefined ? [] : [payload: ToastActions[K]]) {
    bus.emit({ event, payload: args[0] });
  }

  function on<K extends keyof ToastActions>(
    event: K,
    callback: (payload: ToastActions[K]) => void
  ) {
    return bus.on((data) => {
      if (data && data.event === event) {
        callback(data.payload);
      }
    });
  }

  return {
    emit,
    on
  };
}
