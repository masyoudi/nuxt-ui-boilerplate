import type { H3Event } from 'h3';
import type { z } from 'zod/v4';
import { paginationQuerySchema } from '~~/shared/schemas/pagination';
import type { PaginationDto } from '~~/shared/types/pagination';
import { useValidateQuery } from './validator';

interface PaginationQuery {
  page: number;
  perpage: number;
}

type ParsedPagination<T extends PaginationQuery> = Omit<T, keyof PaginationQuery> & PaginationDto;

export async function parsePaginationQuery(event: H3Event): Promise<PaginationDto>;

export async function parsePaginationQuery<TSchema extends z.ZodType<PaginationQuery>>(
  event: H3Event,
  schema: TSchema
): Promise<ParsedPagination<z.output<TSchema>>>;

export async function parsePaginationQuery(
  event: H3Event,
  schema: z.ZodType<PaginationQuery> = paginationQuerySchema
) {
  const { data } = await useValidateQuery(event, { schema });
  const { page, perpage, ...query } = data;

  return {
    ...query,
    limit: perpage,
    offset: (page - 1) * perpage
  };
}
