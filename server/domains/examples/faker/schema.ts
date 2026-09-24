import { z } from 'zod';
import { createPaginationQuerySchema } from '~~/shared/schemas/pagination';

export const listFakerDataQuerySchema = createPaginationQuerySchema(1000).extend({
  modules: z.string()
    .default('book,lorem')
    .transform((value) => value.split(',').map((module) => module.trim()).filter(Boolean))
});
