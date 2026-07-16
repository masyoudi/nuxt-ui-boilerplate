import type { H3Event, H3Error } from 'h3';
import { authSessionConfig } from '~~/server/utils/session';

async function handler(event: H3Event) {
  try {
    const session = await useSession(event, authSessionConfig);

    await session.clear();

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
