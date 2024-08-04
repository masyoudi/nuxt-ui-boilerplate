const ROLE_CODES = ['4951'];

const isValidDate = (val: string | number) => !Number.isNaN(new Date(val).getDate());

/**
 * Check auth role
 * @param auth - Auth value
 * @returns boolean
 */
export function isValidRole(auth: string) {
  const pos = Number.parseInt(auth.substring(auth.length - 1));

  if (pos > auth.length) {
    return false;
  }

  const parts = auth.substring(0, auth.length - 1);
  const role = parts.substring(pos, pos + 2);
  const char = role.split('').map((v) => v.charCodeAt(0));
  return ROLE_CODES.includes(char.join(''));
}

/**
 * Check auth expiry
 * @param auth - Auth value
 * @returns boolean
 */
export function isValidExpiry(auth: string) {
  const pos = Number.parseInt(auth.substring(auth.length - 1));

  if (pos > auth.length) {
    return false;
  }

  const parts = auth.substring(0, auth.length - 1);
  const exp = Number.parseInt(parts.substring(0, pos) + parts.substring(pos + 2, parts.length));

  return isValidDate(exp) ? new Date(exp).valueOf() > new Date().valueOf() : false;
}

/**
 * Check auth is valid
 * @param auth - Auth value
 * @returns boolean
 */
export function isValidAuth(auth: string) {
  if (!auth || typeof auth !== 'string' || !/^\d+$/.test(auth)) {
    return false;
  }

  return isValidExpiry(auth) && isValidRole(auth);
}
