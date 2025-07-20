import { StorageSerializers, useStorage } from '@vueuse/core';
import { authSchema } from '~/utils/auth';
import type { AuthSchema } from '~/utils/auth';

type Permission = string;

/**
 * Auth state
 */
export function useAuth() {
  const storage = useStorage<AuthSchema>('_auth', null, undefined, {
    serializer: StorageSerializers.object
  });

  const state = useState('auth', () => readonly(storage.value));

  /**
   * Set auth value
   * @param data - Value to assign
   * @returns boolean
   */
  const setState = async (data: AuthSchema) => {
    const { success } = authSchema.safeParse(data);
    if (!success) {
      return false;
    }

    storage.value = data;
    await nextTick();

    return true;
  };

  /**
   * Check auth validity
   * @returns boolean
   */
  const valid = () => {
    const isSchemaValid = authSchema.safeParse(state.value).success;
    if (!isSchemaValid) {
      return false;
    }

    const currentDate = new Date().valueOf();
    return currentDate < state.value.expiry;
  };

  /**
   * Check access
   * @param permissions - Permission to check
   * @returns boolean
   */
  const hasAction = (permissions: Permission | Permission[]) => {
    if (!valid() || !state.value.permissions.length) {
      return false;
    }

    const _permissions = Array.isArray(permissions) ? permissions : [permissions];
    return _permissions.some((p) => state.value.permissions.includes(p));
  };

  return {
    state,
    setState,
    valid,
    hasAction
  };
}
