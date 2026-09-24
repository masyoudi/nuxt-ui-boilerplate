import type { H3Event } from 'h3';
import { listFakerDataQuerySchema } from '~~/server/domains/examples/faker/schema';
import service from '~~/server/domains/examples/faker/service';
import { parsePaginationQuery } from '~~/server/utils/pagination';

async function handler(event: H3Event) {
  const query = await parsePaginationQuery(event, listFakerDataQuerySchema);
  const result = await service.getAll(query);

  return result;
}

export default defineEventHandler({
  onRequest: [authSessionHandler],
  handler
});
