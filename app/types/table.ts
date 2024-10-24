interface Sorting {
  col: string;
  dir: 'asc' | 'desc';
}

export interface TableFetchParams {
  page: number;
  perpage: number;
  limit: number;
  offset: number;
  q?: string;
  sorting?: Sorting[];
}
