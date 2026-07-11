export type ApiError = {
  message: string;
  code?: string;
};

export type ApiResult<T> =
  | { data: T; error: null }
  | { data: null; error: ApiError };

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
