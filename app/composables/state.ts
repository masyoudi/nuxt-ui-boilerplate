import { StorageSerializers, useStorage } from '@vueuse/core';
import { authSchema } from '~/utils/auth';
import type { AuthSchema } from '~/utils/auth';

/**
 * Auth state
 */
export function useStateAuth() {
  const storage = useStorage<AuthSchema>('_auth', null, undefined, {
    serializer: StorageSerializers.object
  });

  const state = useState('auth', () => readonly(storage.value));

  const setState = async (data: AuthSchema) => {
    const { success } = authSchema.safeParse(data);
    if (!success) {
      return false;
    }

    storage.value = data;
    await nextTick();

    return true;
  };

  const valid = () => {
    const isSchemaValid = authSchema.safeParse(state.value).success;
    if (!isSchemaValid) {
      return false;
    }

    const currentDate = new Date().valueOf();
    return currentDate < state.value.expiry;
  };

  return {
    state,
    setState,
    valid
  };
}
