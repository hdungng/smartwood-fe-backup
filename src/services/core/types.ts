export type ApiResult<TData> = {
  data?: TData;
  success: boolean;
  status: number;
  error?: string;
  meta?: DynamicObject;
};

export type Entity<TId> = {
  id: TId;
};

export type EntityWithName<TId> = Entity<TId> & {
  name: string;
};

export type PaginationRequest = {
  page?: number;
  size?: number;
};

export type SearchRequest = {
  search?: string;
};

export type SortDirection = 'asc' | 'desc';

export type SortRequest = {
  sortBy?: string;
  sortDirection?: SortDirection;
};

export type QueryRequest = PaginationRequest & SearchRequest & SortRequest;

export type PagingResponse = {
  canPrevious: boolean;
  canNext: boolean;
  page: number;
  size: number;
  total: number;
  totalPages: number;
};

export type PaginationResult<TData> = {
  data: TData[];
  meta?: PagingResponse & DynamicObject;
};
