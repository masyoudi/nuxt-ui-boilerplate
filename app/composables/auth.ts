interface UserSchema {
  name: string;
  email: string;
}

interface AuthSchema {
  user: UserSchema;
  token: string;
  permissions: string[];
}

const BASIC_ROLE = 55;

/**
 * Validate token
 * @param value - Token value
 * @returns boolean
 */
function isValidToken(value: string) {
  if (!/^\d+$/.test(value)) {
    return false;
  }

  const d = new Date().valueOf().toString();
  const length = d.length * 2 + 5;

  return value.length === length;
}

/**
 * Get expiry date from token value
 * @param token - Token value
 * @returns number
 */
function getExpiry(token: string) {
  if (!isValidToken(token)) {
    return 0;
  }

  const dateLength = new Date().valueOf().toString().length;
  const splitter = Number(token.substring(token.length - 1));
  const firstPartExp = token.substring(token.length - splitter - 1, token.length - 1);
  const secondPartExp = token.substring(0, dateLength - splitter);
  const exp = firstPartExp + secondPartExp;

  return Number(exp);
}

/**
 * Get role number from token
 * @param token - Token value
 * @returns boolean
 */
function getRole(token: string) {
  const dateLength = new Date().valueOf().toString().length;
  const splitter = Number(token.substring(token.length - 1));
  const diff = dateLength - splitter;
  const roleCodes = token.substring(diff, diff + 4);
  const roleCode = [roleCodes.substring(0, 2), roleCodes.substring(2)].map((v) => String.fromCharCode(Number(v))).join('');

  return Number(roleCode);
}

/**
 * Check if token is valid
 * @param token - Token value
 * @returns boolean
 */
function isValid(token: string) {
  const isExpired = getExpiry(token) < new Date().valueOf();
  if (isExpired) {
    return false;
  }

  return [BASIC_ROLE].includes(getRole(token));
}

export function useAuth() {
  const state = useState<AuthSchema | null>('auth', () => null);

  return {
    state: computed(() => state.value ? readonly(state.value) : null),
    setState: (data: AuthSchema) => {
      if (!isValid(data.token)) {
        return false;
      }

      state.value = data;

      return true;
    },
    clear: () => {
      state.value = null;
    },
    valid: () => state.value?.token ? isValid(state.value.token) : false,
    hasAction: (permissions: string | string[]) => {
      if (!state.value || (state.value && !isValid(state.value.token))) {
        return false;
      }

      const _permissions = Array.isArray(permissions) ? permissions : [permissions];
      return _permissions.some((p) => state.value!.permissions.includes(p));
    }
  };
}
