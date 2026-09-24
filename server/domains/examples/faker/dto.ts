import type { PaginationDto, PaginatedResponseDto } from '~~/shared/types/pagination';

export interface ListFakerDataDto extends PaginationDto {
  modules: string[];
}

export type FakerDataDto = Record<string, any>;

export type FakerDataListDto = PaginatedResponseDto<FakerDataDto>;
