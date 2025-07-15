import { z } from 'zod';
import type { H3Error } from 'h3';
import { authSessionConfig, authSessionRoles } from '~~/server/utils/session';
import type { AuthSessionData } from '~~/server/types/session';

const validation = z.object({
  email: z.email('Invalid email address'),
  password: z.string().trim().min(1, 'Enter your password')
});

export default defineEventHandler(async (event) => {
  try {
    const { data: raw } = await useValidateBody(event, { schema: validation });

    const session = await useSession<AuthSessionData>(event, authSessionConfig);

    await session.update({
      name: raw.email.split('@')[0],
      email: raw.email,
      role: authSessionRoles.basic,
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
});
