import type { H3Event } from 'h3';
import { listBooksQuerySchema } from '~~/server/domains/library/books/schema';
import service from '~~/server/domains/library/books/service';
import { parsePaginationQuery } from '~~/server/utils/pagination';

async function handler(event: H3Event) {
  const query = await parsePaginationQuery(event, listBooksQuerySchema);
  const result = await service.getAll(query);

  return result;
}

export default defineEventHandler({
  onRequest: [authSessionHandler],
  handler
});
