import type { H3Error } from 'h3';
import { authSessionConfig } from '~~/server/utils/session';

export default defineEventHandler(async (event) => {
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
});
