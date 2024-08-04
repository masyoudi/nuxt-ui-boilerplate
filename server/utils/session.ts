import { type H3Event, getCookie, useSession, unsealSession } from 'h3';
import type { UserSessionConfig, UserSessionValue } from '@@/types/user-session';
// import { isValid as isValidDate } from 'date-fns';

const EXPIRY = 60 * 60 * 24 * 365; // 1 year

export const userSessionConfig: UserSessionConfig = {
  name: 'user_sess',
  cookie: {
    sameSite: 'lax',
    httpOnly: true,
    secure: false,
    path: '/'
  },
  maxAge: EXPIRY,
  sessionHeader: false,
  password: 'gdum9$98y*G8KXfb#YNBM1@uuWIjof+HOwHwFBHOHd'
};

export async function useUserSession(event: H3Event, expiry: number = EXPIRY) {
  const session = await useSession<UserSessionValue>(event, {
    ...userSessionConfig,
    maxAge: expiry
  });

  return session;
}

/**
 * Get user session data from cookie value
 * @param event - H3Event
 * @returns Object
 */
export async function getUserSession(event: H3Event): Promise<UserSessionValue | null> {
  try {
    const cookie = getCookie(event, userSessionConfig.name);
    const session = typeof cookie === 'string' ? await unsealSession(event, userSessionConfig, cookie) : null;
    if (!session) {
      return null;
    }

    const sessData = session.data as UserSessionValue;
    const createdAt = session.createdAt as number;
    const maxAge = userSessionConfig.maxAge * 1000;
    const cookieValue = {
      id: session.id as string,
      name: userSessionConfig.name,
      created_at: createdAt,
      expired_at: new Date(createdAt + maxAge).valueOf()
      // expired_at: isValidDate(sessData.token.exp) ? new Date(sessData.token.exp).valueOf() : new Date(createdAt + maxAge).valueOf()
    };

    const data = {
      ...sessData,
      cookie: cookieValue
    };

    return data;
  } catch {
    return null;
  }
}
