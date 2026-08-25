import type { FormErrorEvent, FormSubmitEvent } from '@nuxt/ui';
import type { z } from 'zod';

interface FormHandlerOptions<T extends z.ZodType, D extends Record<string, any>> {
  state: MaybeRefOrGetter<D>;
  schema: T | ((data: D) => T);
  refinement?: (ctx: z.core.ParsePayload<z.core.output<T>>) => void | Promise<void>;
  disabled?: MaybeRefOrGetter<boolean>;
  onSubmit?: (data: z.output<T>) => void | Promise<void>;
  onError?: (event: FormErrorEvent) => void | Promise<void>;
}

export function defineFormHandler<
  T extends z.ZodType,
  D extends MaybeRefOrGetter<Record<string, any>>
>(options: FormHandlerOptions<T, D>) {
  const { state, schema: formSchema, disabled, onError: handlerError } = options;
  const loading = ref(false);

  const validate = async (state: any) => {
    const baseSchema = typeof formSchema === 'function' ? formSchema(state) : formSchema;
    const schema = baseSchema.check(
      ...(typeof options.refinement === 'function' ? [options.refinement] : [])
    );
    const { error } = await schema.safeParseAsync(state);

    const errors = (error?.issues ?? []).map((item) => ({
      name: item.path.join('.'),
      message: item.message
    }));

    return errors;
  };

  const onSubmit = async (event: FormSubmitEvent<z.output<T>>) => {
    if (loading.value) {
      return;
    }

    loading.value = true;
    await options.onSubmit?.(event.data);
    loading.value = false;
  };

  const onError = (event: FormErrorEvent) => {
    handlerError?.(event);

    const errorId = event.errors.at(0)?.id;
    if (typeof errorId === 'string') {
      const node = document.querySelector(`#${errorId}`) as HTMLElement;

      node?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => node?.focus(), 150);
      return;
    }

    const errorNodes = Object.entries(document.querySelectorAll('.form-field-error')).map(([_, el]) => el);
    const firstNode = errorNodes.at(0);
    firstNode?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return {
    state: toLiveReactive(state),
    validate,
    onSubmit,
    onError,
    disabled: toValue(disabled)
  };
}

function toLiveReactive<T extends object>(source: MaybeRefOrGetter<T>): T {
  return new Proxy({} as T, {
    get(_, key, receiver) {
      return Reflect.get(toValue(source), key, receiver);
    },

    set(_, key, value, receiver) {
      return Reflect.set(toValue(source), key, value, receiver);
    },

    has(_, key) {
      return Reflect.has(toValue(source), key);
    },

    ownKeys() {
      return Reflect.ownKeys(toValue(source));
    },

    getOwnPropertyDescriptor(_, key) {
      const target = toValue(source);
      const desc = Object.getOwnPropertyDescriptor(target, key);

      if (!desc) {
        return undefined;
      }

      return {
        ...desc,
        enumerable: true,
        configurable: true
      };
    }
  });
}
