export interface SearchPaginateOptions {
  page?: number;
  limit?: number;
  q?: string;  // search keyword
  searchFields?: string[]; // field yang ingin dicari
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
  };
}
