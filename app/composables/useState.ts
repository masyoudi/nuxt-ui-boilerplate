export function useStateAuth() {
  return useState('auth', () => '');
}

export function useStateUser() {
  return useState<Record<string, any> | null>('user', () => null);
}
