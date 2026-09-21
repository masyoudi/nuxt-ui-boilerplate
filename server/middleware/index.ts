import { authSessionConfig } from '~~/server/utils/session';
import type { AuthSessionData } from '~~/server/types/session';
import { useWAF } from '~~/server/waf';

const waf = useWAF({
  ignoreModules: ['nosql-injection', 'directory-traversal'],
  ignoreRoutes: {
    '/__nuxt_error': false
  }
});

export default defineEventHandler(async (event) => {
  if (event.path.startsWith('/api')) {
    const wafResult = await waf.check(event);
    const { success: isRequestSafe, results: wafResults } = wafResult;
    if (wafResults.length > 0) {
      logger.warn('WAF middleware detected suspicious request', { event, meta: { waf: wafResult } });
    }

    if (!isRequestSafe) {
      throw createError({
        statusCode: 400,
        message: 'Malicious request detected. Your request has been blocked, please contact web administrator'
      });
    }
  }

  const authSession = await useSession<AuthSessionData>(event, authSessionConfig);
  event.context.session = Object.keys(authSession.data).length > 0 ? authSession.data : undefined;
});
