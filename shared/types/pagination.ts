export interface PaginationDto {
  limit: number;
  offset: number;
}

export type PaginationWithFilterDto<T extends object = Record<string, never>> = PaginationDto & T;

export interface PaginatedResponseDto<T> {
  data: T[];
  total: number;
}
