import type { H3Event } from 'h3';
import { z } from 'zod';
import type { UserSessionData } from '@@/types/user-session';

interface Login {
  email: string;
  password: string;
}

const validation = z.object<Record<keyof Login, any>>({
  email: z.string().trim().min(1, 'Please enter email'),
  password: z.string().trim().min(1, 'Please enter your secret password')
});

/**
 * Post login
 * @param event - H3Event
 */
async function post(event: H3Event) {
  try {
    const { data: body } = await useValidateBody<Login>(event, { schema: validation });
    const session = await useUserSession(event);

    const sessionData: UserSessionData = {
      id: Date.now().toString(),
      name: body.email,
      email: body.email
    };

    await session.update(sessionData);

    const data = {
      success: true
    };

    return {
      data
    };
  } catch (err: any) {
    throw sendErrorServer(event, err);
  }
}

export default {
  post
};
