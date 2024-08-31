import type { SessionConfig } from 'h3';

export type UserSessionConfig = Omit<SessionConfig, 'name' | 'maxAge'> & {
  name: string;
  maxAge: number;
};

export type UserSessionData = Record<string, any> & {
  id: string;
  name: string;
};

export interface UserSessionCookie {
  id: string;
  name: string;
  created_at: number;
  expired_at: number;
}

export type UserSessionValue = UserSessionData & {
  cookie: UserSessionCookie;
};
