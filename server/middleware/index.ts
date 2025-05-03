import { useWAF } from '../waf';
import { authSessionConfig } from '~~/server/utils/session';
import type { AuthSessionData } from '~~/server/types/session';

/**
 * Create auth value for client/browser
 * @param sessionData - Session data
 * @returns string
 */
function createAuthClient(sessionData: AuthSessionData) {
  const currentTime = new Date().valueOf().toString();
  const expTime = sessionData.expiry.toString();
  const randSplitter = Math.floor(Math.random() * (9 - 1 + 1)) + 1;

  const firstPartExp = expTime.substring(0, randSplitter);
  const secondPartExp = expTime.substring(randSplitter);
  const roleAsCharCode = String(sessionData.role).split('').map((v) => v.charCodeAt(0)).join('');

  return [secondPartExp, roleAsCharCode, currentTime, firstPartExp, randSplitter].join('');
}

const waf = useWAF({
  ignoreModules: ['bad-bots'],
  ignoreRoutes: {
    '/api/profile': {
      ignoreModules: ['xml-injection'],
      method: 'POST'
    },
    '/__nuxt_error': false
  }
});

export default defineEventHandler(async (event) => {
  const authSession = await useSession<AuthSessionData>(event, authSessionConfig);

  event.context.session = undefined;
  event.context.auth = '';

  if (Object.keys(authSession.data).length > 0) {
    event.context.session = authSession.data;
    event.context.auth = createAuthClient(authSession.data);
  }

  const { success: isRequestSafe, results: wafResult } = await waf.check(event);
  if (!isRequestSafe) {
    const meta = {
      waf: wafResult
    };

    logger.warn('[WAF] malicious request detected', { event, meta });

    throw createError({
      statusCode: 400,
      message: 'Malicious request detected. Please contact administrator'
    });
  }
});
