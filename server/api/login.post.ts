import type { H3Event, H3Error } from 'h3';
import { authSessionConfig } from '~~/server/utils/session';
import type { AuthSessionData } from '~~/server/types/session';
import { loginSchema as schema } from '~~/shared/schemas/auth';

async function handler(event: H3Event) {
  try {
    const { data: raw } = await useValidateBody(event, { schema });
    const session = await useSession<AuthSessionData>(event, authSessionConfig);

    await session.update({
      name: raw.email.split('@')[0],
      email: raw.email,
      expiry: new Date().valueOf() + (authSessionConfig.maxAge! * 1000)
    });

    const data = {
      success: true
    };

    return {
      data
    };
  }
  catch (err) {
    throw sendErrorServer(event, err as H3Error);
  }
}

export default defineEventHandler({
  handler
});
