import type { PaginationDto, PaginatedResponseDto } from '~~/shared/types/pagination';

export interface BookDto {
  id: string;
  title: string;
  author: string;
  series: string;
  genre: string;
  format: string;
  publisher: string;
}

export type ListBooksDto = PaginationDto;

export type BookListDto = PaginatedResponseDto<BookDto>;
