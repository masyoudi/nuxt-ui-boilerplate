import { setHeaders, type H3Event } from 'h3';
import { getUserSession } from '@@/server/utils/session';
import type { UserSessionValue } from '~~/types/user-session';

const roleCodes = {
  BASIC: 13
};

/**
 * Set auth expiry to context
 * @param session - User session
 * @returns string
 */
function setAuth(session: UserSessionValue) {
  const exp = String(session.cookie.expired_at);
  const pos = Math.floor(Math.random() * 9);

  const result = [exp.substring(0, pos), roleCodes.BASIC, exp.substring(pos, exp.length), pos];
  return result.join('');
}

const createErrorNotFound = (event: H3Event) => ({
  statusCode: 404,
  message: 'Page not found',
  data: { 'X-User-Agent': event.node.req.headers['user-agent'] }
});

// Event handler to check user session
export const authHandler = defineEventHandler(async (event) => {
  const user = await getUserSession(event);

  if (!user) {
    throw createError(createErrorNotFound(event));
  }
});

export default defineEventHandler(async (event) => {
  // Set response header
  setHeaders(event, {
    'X-XSS-Protection': '1; mode=block',
    'X-Frame-Options': 'deny',
    'X-Content-Type-Options': 'nosniff',
    ...(!event.path.startsWith('/api') ? { 'Cache-Control': 'no-cache, no-store, must-revalidate, no-transform' } : {})
  });

  const session = await getUserSession(event);
  event.context.session = session;
  event.context.auth = session ? setAuth(session) : '';
});
