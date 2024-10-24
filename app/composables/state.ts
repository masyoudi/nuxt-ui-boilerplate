interface UserSchema {
  name: string;
  email: string;
}

/**
 * Auth state
 * @returns string
 */
export function useStateAuth() {
  return useState('auth', () => '');
}

/**
 * User state
 * @returns object
 */
export function useStateUser() {
  return useState<UserSchema | undefined>('user', () => undefined);
}
