import type { SessionConfig } from 'h3';

export const authSessionConfig: SessionConfig = {
  name: '__auth_sess',
  password: 'oaIbYctIpepnfBvzPtdquATVUSQfmFpHUbl',
  maxAge: 24 * 60 * 60, // 1 day
  cookie: {
    path: '/',
    sameSite: 'strict',
    httpOnly: true
  },
  sessionHeader: false
};

export const authSessionRoles = {
  basic: 55
};
