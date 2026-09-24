import type { H3Event, H3Error } from 'h3';
import { updateProfileSchema } from '~~/server/domains/identity/profile/schema';
import service from '~~/server/domains/identity/profile/service';

async function handler(event: H3Event) {
  try {
    const { data: input } = await useValidateBody(event, { schema: updateProfileSchema });
    const data = await service.update(input);

    return {
      data
    };
  }
  catch (err) {
    throw sendErrorServer(event, err as H3Error);
  }
}

export default defineEventHandler({
  onRequest: [authSessionHandler],
  handler
});
