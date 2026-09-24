import type { H3Event } from 'h3';
import { listTasksQuerySchema } from '~~/server/domains/work-management/tasks/schema';
import service from '~~/server/domains/work-management/tasks/service';
import { parsePaginationQuery } from '~~/server/utils/pagination';

async function handler(event: H3Event) {
  const query = await parsePaginationQuery(event, listTasksQuerySchema);
  const result = await service.getAll(query);

  return result;
}

export default defineEventHandler({
  onRequest: [authSessionHandler],
  handler
});
