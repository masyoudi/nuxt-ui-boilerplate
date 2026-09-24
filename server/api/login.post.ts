import type { H3Event, H3Error } from 'h3';
import { loginSchema as schema } from '~~/shared/schemas/auth';
import type { AuthSessionData } from '~~/server/types/session';
import { authSessionConfig } from '~~/server/utils/session';

async function handler(event: H3Event) {
  try {
    const { data: input } = await useValidateBody(event, { schema });
    const session = await useSession<AuthSessionData>(event, authSessionConfig);

    await session.update({
      name: input.email.split('@')[0],
      email: input.email,
      expiry: Date.now() + (authSessionConfig.maxAge! * 1000)
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
