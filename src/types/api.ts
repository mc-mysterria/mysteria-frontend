export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

// Structured API error types used across the app
export interface ApiError {
  code: string; // e.g., AUTH_REQUIRED, VALIDATION_ERROR
  message: string;
  details: Record<string, unknown>;
  timestamp: string; // ISO string
  request_id: string;
}

export interface ApiErrorResponse {
  error: ApiError;
}
