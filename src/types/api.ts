export interface APIResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface APIError {
  code: string;
  message: string;
  details: Record<string, unknown>;
  timestamp: string;
  request_id: string;
}

export interface APIErrorResponse {
  error: APIError;
}

export interface RequestConfig {
  baseURL?: string;
  url?: string;
  headers?: Record<string, string>;
  params?: URLSearchParams;
  body?: string;
  method?: string;
}

export interface RequestOptions {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  data?: unknown;
  config?: RequestConfig;
  params?: Record<string, string | number | boolean>;
  body?: unknown;
  isList?: boolean;
  raise?: boolean;
}
