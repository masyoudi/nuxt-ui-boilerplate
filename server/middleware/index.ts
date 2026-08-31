import { authSessionConfig } from '~~/server/utils/session';
import type { AuthSessionData } from '~~/server/types/session';

export default defineEventHandler(async (event) => {
  const authSession = await useSession<AuthSessionData>(event, authSessionConfig);
  event.context.session = Object.keys(authSession.data).length > 0 ? authSession.data : undefined;
});
