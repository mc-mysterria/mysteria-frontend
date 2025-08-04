import { type RequestConfig, type APIErrorResponse } from "@/types";
import { APIError, RequestError } from "./errors";
import * as Sentry from "@sentry/vue";
import { useNotification } from "@/services/useNotification";

export type RequestPrefix = `/${string}`;

export interface RequestOptions {
  params?: Record<string, string | number | boolean>;
  body?: unknown;
  prefix?: RequestPrefix;
  isList?: boolean;
  raise?: boolean;
  suppressAuthRequired?: boolean;
}

export interface APIResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: Record<string, unknown>;
}

export class BaseCRUD<
  TModel extends object,
  TCreate extends object,
  TUpdate extends object,
  TFilter extends object,
> {
  protected prefix: string;
  protected defaultPrefix: string = "/api";

  constructor(prefix: string = "", withDefaultPrefix: boolean = true) {
    this.defaultPrefix = withDefaultPrefix ? this.defaultPrefix : "";
    this.prefix =
      this.defaultPrefix + (prefix.startsWith("/") ? prefix : `/${prefix}`);
  }

  private preprocessJsonForLargeNumbers(jsonText: string): string {
    // Convert all large numbers (15+ digits) to strings to prevent precision loss
    // This prevents issues with JavaScript Number.MAX_SAFE_INTEGER (2^53 - 1)
    return jsonText.replace(/"([^"]+)":\s*(\d{15,})/g, '"$1":"$2"');
  }

  private getAuthToken(): string | null {
    // Try to get token from localStorage first (new JWT system)
    const token = localStorage.getItem('access_token');
    if (token) {
      return token;
    }

    // Fallback to cookie-based token for legacy support during migration
    const value = `; ${document.cookie}`;
    const parts = value.split(`; access_token=`);
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift() || null;
    }
    
    return null;
  }

  protected async request<T>(
    method: string,
    endpoint: string,
    options: Partial<RequestOptions> = {},
    prefix: string | null = null,
  ): Promise<APIResponse<T>> {
    const { params, body, isList = false, raise = true, suppressAuthRequired = false } = options;
    const url = `${prefix || this.prefix}${endpoint}`.replace(/\/+/g, "/");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept-Language": "uk",
    };

    // Add JWT Bearer token if available
    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const searchParams = params
      ? new URLSearchParams(
          Object.entries(params).map(([key, value]) => [key, String(value)]),
        )
      : undefined;

    const config: RequestConfig = {
      method,
      url,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      params: searchParams,
    };

    try {
      const queryString = searchParams ? `?${searchParams.toString()}` : "";
      const fullUrl = `${url}${queryString}`;

      const response = await fetch(fullUrl, {
        method: config.method,
        headers: config.headers,
        body: config.body,
        // Remove credentials: "include" for JWT Bearer token auth
        // credentials: "include",
      });

      const responseText = await response.text();

      let data;
      try {
        const processedText = this.preprocessJsonForLargeNumbers(responseText);
        data = JSON.parse(processedText);
      } catch (e) {
        Sentry.captureException(e, {
          extra: {
            responseText,
            url,
            params,
            type: "JSON_PARSE_ERROR",
          },
        });
        throw new APIError(
          `Invalid JSON response: ${responseText}`,
          url,
          params,
          e as Error,
          body,
        );
      }

      if (response.status === 404) {
        return {
          data: (isList ? [] : null) as T,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          config: {},
        };
      }

      if (response.status >= 400) {
        // Special handling for 500 errors with 404 in detail message
        if (
          response.status === 500 &&
          data.detail &&
          typeof data.detail === "string" &&
          data.detail.includes("404")
        ) {
          return {
            data: (isList ? [] : null) as T,
            status: 404,
            statusText: "Not Found",
            headers: Object.fromEntries(response.headers.entries()),
            config: {},
          };
        }

        // Check if response has new structured error format
        let error: RequestError;
        if (data.error && typeof data.error === 'object' && data.error.code) {
          // New structured error format
          const apiErrorResponse = data as APIErrorResponse;
          error = new RequestError(
            apiErrorResponse.error.message || "Сталася невідома помилка!",
            url,
            params,
            apiErrorResponse.error,
            body
          );
          
          // Show notification for structured errors, but suppress AUTH_REQUIRED in popup windows or when requested
          const { showError } = useNotification();
          const isPopupWindow = window.opener !== null;
          showError(error, { suppressAuthRequired: isPopupWindow || suppressAuthRequired });
        } else {
          // Legacy error format
          error = new RequestError(
            data.detail || data.message || "Unknown error",
            url,
            params,
            undefined,
            body
          );
          
          // Show notification for legacy errors
          const { showError } = useNotification();
          showError(error);
        }

        // Enhanced logging for 500 errors
        if (response.status === 500) {
          console.error('API 500 Error Details:', {
            url,
            params,
            requestBody: this.prefix,
            responseData: data,
            timestamp: new Date().toISOString(),
          });
        }

        Sentry.captureException(error, {
          extra: {
            response: data,
            status: response.status,
            url,
            params,
            type: "API_ERROR",
            requestDetails: response.status === 500 ? {
              fullUrl: url,
              method,
              timestamp: new Date().toISOString(),
            } : undefined,
          },
        });
        throw error;
      }

      if (raise && !data) {
        const error = new RequestError(
          `Empty or None response received\n${data.detail || ""}`,
          url,
          params,
          undefined,
          body
        );
        Sentry.captureException(error, {
          extra: {
            response: data,
            url,
            params,
            type: "EMPTY_RESPONSE",
          },
        });
        throw error;
      }

      return {
        data: data as T,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        config: {},
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage === "Error when receiving discord user information." ||
        errorMessage.includes("Error when receiving discord user information.")
      ) {
        console.warn(
          "Discord user info error - authentication may need to be refreshed",
        );
      }
      if (error instanceof RequestError) {
        throw error;
      }

      const apiError = new APIError(
        error instanceof Error ? error.message : "Unknown error",
        url,
        params,
        error as Error,
        body,
      );

      Sentry.captureException(error, {
        extra: {
          url,
          params,
          error: error instanceof Error ? error.message : "Unknown error",
          type: "UNEXPECTED_ERROR",
          requestConfig: config,
        },
      });

      throw apiError;
    }
  }

  async create(data: TCreate): Promise<APIResponse<TModel>> {
    return this.request<TModel>("POST", "", { body: data });
  }

  async update(id: string, data: TUpdate): Promise<APIResponse<TModel>> {
    return this.request<TModel>("PUT", `/${id}`, { body: data });
  }

  async delete(id: string): Promise<APIResponse<TModel>> {
    return this.request<TModel>("DELETE", `/${id}`);
  }

  async get(id: string): Promise<APIResponse<TModel>> {
    return this.request<TModel>("GET", `/${id}`);
  }

  async getByUserId(
    userId: string,
    endpoint?: string,
    params?: Record<string, string | number | boolean>,
    isList: boolean = false,
  ): Promise<APIResponse<TModel | TModel[]>> {
    const path = endpoint || `/users/${userId}`;
    return this.request<TModel | TModel[]>("GET", path, {
      params: { ...params, user_id: userId },
      isList,
    });
  }

  async getList(
    endpoint: string = "",
    options: {
      filters?: TFilter;
      params?: Record<string, string | number | boolean>;
      raise?: boolean;
    } = {},
  ): Promise<APIResponse<TModel[]>> {
    const { filters, params = {}, raise = true } = options;
    const queryParams = { ...params };

    if (filters) {
      Object.assign(queryParams, filters);
    }

    return this.request<TModel[]>("GET", endpoint, {
      params: queryParams,
      isList: true,
      raise,
    });
  }
}
