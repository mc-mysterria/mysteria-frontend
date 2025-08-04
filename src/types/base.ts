export type SortOrder = "asc" | "desc";

export type DefaultSort = "id" | "created_at" | "updated_at";

export type UserDefaultSort = "id" | "user_id" | "created_at" | "updated_at";

export interface TimestampsMixin {
  created_at: Date;
  updated_at?: Date;
}

export interface BaseResponse {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface BaseResponseList<T> {
  items: T[];
  total: number;
}

export interface BaseFilterParams {
  limit?: number;
  offset?: number;
  search?: string;
}

export interface BaseSortParams {
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface BaseCreate {
  [key: string]: unknown;
}

export interface BaseUpdate {
  [key: string]: unknown;
}
