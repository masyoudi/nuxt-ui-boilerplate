interface UserSchema {
  name: string;
  email: string;
}

export interface AuthSchema {
  user: UserSchema;
  expiry: number;
  permissions: string[];
}

export function useAuth() {
  const state = useState<AuthSchema | null>('auth', () => null);
  const isValid = computed(() => {
    if (!state.value) {
      return false;
    }

    const exp = Number(state.value.expiry);
    return !Number.isNaN(exp) ? new Date(exp).valueOf() > new Date().valueOf() : false;
  });

  return {
    state: computed(() => state.value ? readonly(state.value) : null),
    setState: (data: AuthSchema) => {
      state.value = data;

      return true;
    },
    isValid,
    hasAction: (permissions: string | string[]) => {
      if (!isValid.value) {
        return false;
      }

      const _permissions = Array.isArray(permissions) ? permissions : [permissions];
      return _permissions.some((p) => state.value!.permissions.includes(p));
    }
  };
}
