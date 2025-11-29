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
