import { createGlobalState, useStorage, StorageSerializers } from '@vueuse/core';

interface UserData {
  name: string;
  email: string;
}

interface AuthData {
  user: UserData;
  expiry: number;
}

export const useStateAuth = createGlobalState(() => {
  const auth = useStorage<AuthData | undefined>('auth_sess', null, undefined, { serializer: StorageSerializers.object });

  const setAuth = (value: AuthData) => (auth.value = value);
  const clearAuth = () => (auth.value = null);

  const isValid = () => {
    if (!auth.value) {
      return false;
    }

    return new Date(auth.value.expiry).getTime() > new Date().getTime();
  };

  return { auth, setAuth, clearAuth, isValid };
});
