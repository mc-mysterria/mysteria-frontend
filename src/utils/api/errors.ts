import type { APIError as APIErrorType } from "@/types/api";

export class APIError extends Error {
  constructor(
    message: string,
    public endpoint?: string,
    public params?: Record<string, string | number | boolean>,
    public originalError?: Error,
    public requestBody?: unknown,
  ) {
    super(message);
    this.name = "APIError";
  }
}

export class RequestError extends APIError {
  constructor(
    message: string,
    endpoint?: string,
    params?: Record<string, string | number | boolean>,
    public structuredError?: APIErrorType,
    requestBody?: unknown,
  ) {
    super(message, endpoint, params, undefined, requestBody);
    this.name = "RequestError";
  }
}
