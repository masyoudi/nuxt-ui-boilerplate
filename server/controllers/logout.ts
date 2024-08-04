import type { H3Event } from 'h3';
import { useUserSession } from '@@/server/utils/session';
import { sendErrorServer } from '@@/server/utils/error';

async function clear(event: H3Event) {
  try {
    const session = await useUserSession(event);
    await session.clear();
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
  clear
};
