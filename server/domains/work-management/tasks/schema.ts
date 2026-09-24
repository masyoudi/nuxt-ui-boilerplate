import { z } from 'zod';
import { paginationQuerySchema } from '~~/shared/schemas/pagination';

export const listTasksQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().optional()
});
