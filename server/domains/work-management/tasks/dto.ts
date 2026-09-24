import type { PaginationDto, PaginatedResponseDto } from '~~/shared/types/pagination';

export interface TaskDto {
  id: number;
  task: string;
  description: string;
  created_at: Date;
}

export interface ListTasksDto extends PaginationDto {
  q?: string;
}

export type TaskListDto = PaginatedResponseDto<TaskDto>;
