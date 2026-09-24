import { z } from 'zod';

export function createPaginationQuerySchema(maxPerPage = 100) {
  return z.object({
    page: z.coerce.number().int().min(1).default(1),
    perpage: z.coerce.number().int().min(1).max(maxPerPage).default(10)
  });
}

export const paginationQuerySchema = createPaginationQuerySchema();
