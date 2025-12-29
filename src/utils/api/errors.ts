export class APIError extends Error {
    constructor(
        message: string,
        public endpoint?: string,
        public params?: Record<string, string | number | boolean>,
        public requestBody?: unknown,
    ) {
        super(message);
        this.name = "APIError";
    }
}

import type {ApiError} from "@/types/api";

export class RequestError extends APIError {
    constructor(
        message: string,
        endpoint?: string,
        params?: Record<string, string | number | boolean>,
        public structuredError?: ApiError,
        requestBody?: unknown,
    ) {
        super(message, endpoint, params, requestBody);
        this.name = "RequestError";
    }
}
