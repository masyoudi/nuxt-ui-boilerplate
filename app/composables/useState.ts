import { createGlobalState, useStorage, StorageSerializers } from '@vueuse/core';
import { z } from 'zod';

interface UserData {
  name: string;
  email: string;
}

interface AuthData {
  user: UserData;
  expiry: number;
}

/**
 * Check auth schema
 * @param value - Value to check
 * @returns boolean
 */
function isValidAuthSchema(value: AuthData) {
  const user = z.object<Record<keyof UserData, z.ZodSchema>>({
    name: z.string().min(1),
    email: z.string().email()
  });

  const schema = z.object<Record<keyof AuthData, z.ZodSchema>>({
    user,
    expiry: z.number()
  });

  return schema.safeParse(value).success;
}

export const useStateAuth = createGlobalState(() => {
  const auth = useStorage<AuthData | undefined>('auth_sess', null, undefined, { serializer: StorageSerializers.object });

  /**
   * Set auth state
   * @param value - Value to set
   * @returns boolean
   */
  const setAuth = (value: AuthData) => {
    if (!isValidAuthSchema(value)) {
      return false;
    }

    auth.value = value;
    return true;
  };

  /**
   * Clear auth state
   */
  const clear = () => {
    auth.value = null;
  };

  /**
   * Check auth value
   * @returns boolean
   */
  const isAuthenticated = () => {
    if (!auth.value || (auth.value && !isValidAuthSchema(auth.value))) {
      return false;
    }

    return new Date(auth.value.expiry).getTime() > new Date().getTime();
  };

  return {
    auth: computed(() => auth.value),
    setAuth,
    clear,
    isAuthenticated
  };
});
