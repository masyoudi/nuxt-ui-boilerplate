const BASIC_ROLE = 55;

/**
 * Validate auth schema
 * @param value - Auth value
 * @returns boolean
 */
function isValidSchema(value: string) {
  if (!/^\d+$/.test(value)) {
    return false;
  }

  const d = new Date().valueOf().toString();
  const length = d.length * 2 + 5;

  return value.length === length;
}

/**
 * Get expiry date from auth value
 * @param value - Auth value
 * @returns number
 */
function getExpiry(value: string) {
  if (!isValidSchema(value)) {
    return 0;
  }

  const dateLength = new Date().valueOf().toString().length;
  const splitter = Number(value.substring(value.length - 1));
  const firstPartExp = value.substring(value.length - splitter - 1, value.length - 1);
  const secondPartExp = value.substring(0, dateLength - splitter);
  const exp = firstPartExp + secondPartExp;

  return Number(exp);
}

/**
 * Get role number from auth value
 * @param value - Auth value
 * @returns boolean
 */
function getRole(value: string) {
  const isExpired = getExpiry(value) < new Date().valueOf();

  if (isExpired) {
    return 0;
  }

  const dateLength = new Date().valueOf().toString().length;
  const splitter = Number(value.substring(value.length - 1));
  const diff = dateLength - splitter;
  const roleCodes = value.substring(diff, diff + 4);
  const roleCode = [roleCodes.substring(0, 2), roleCodes.substring(2)].map((v) => String.fromCharCode(Number(v))).join('');

  return Number(roleCode);
}

/**
 * Check if auth is valid
 * @param value - Auth value
 * @returns boolean
 */
function isValidAuth(value: string) {
  return [BASIC_ROLE].includes(getRole(value));
}

export default function authValidator(value: string) {
  return {
    valid: () => isValidAuth(value),
    expired: () => getExpiry(value) >= new Date().valueOf()
  };
}
