import type { FormErrorEvent, FormSubmitEvent } from '@nuxt/ui';
import type { z } from 'zod';

interface FormHandlerOptions<T extends z.ZodType, D extends Record<string, any>> {
  state: MaybeRefOrGetter<D>;
  schema: T | ((data: D) => T);
  disabled?: MaybeRefOrGetter<boolean>;
  onSubmit?: (data: z.output<T>) => void | Promise<void>;
}

export function defineFormHandler<
  T extends z.ZodType,
  D extends MaybeRefOrGetter<Record<string, any>>
>(options: FormHandlerOptions<T, D>) {
  const validate = async (state: any) => {
    const schema = typeof options.schema === 'function' ? options.schema(state) : options.schema;
    const { error } = await schema.safeParseAsync(state);

    const errors = (error?.issues ?? []).map((item) => ({
      name: item.path.join('.'),
      message: item.message
    }));

    return errors;
  };

  const loading = ref(false);

  const onSubmit = async (event: FormSubmitEvent<z.output<T>>) => {
    if (loading.value) {
      return;
    }

    loading.value = true;
    await options.onSubmit?.(event.data);
    loading.value = false;
  };

  const onError = (event: FormErrorEvent) => {
    const errorId = event.errors.at(0)?.id;

    if (typeof errorId === 'string') {
      const node = document.querySelector(`#${errorId}`) as HTMLElement;

      node?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => node?.focus(), 150);
      return;
    }
  };

  return {
    state: options.state,
    validate,
    onSubmit,
    onError,
    disabled: toValue(options.disabled)
  };
}
