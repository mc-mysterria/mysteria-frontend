import { ref } from "vue";
import { RequestError } from "@/utils/api/errors";
import type { ApiError, ApiErrorResponse } from "@/types/api";

interface NotificationOptions {
  type: "info" | "warn" | "error" | "fatal" | "debug" | "success";
  duration?: number;
  clickable?: boolean;
  copyable?: boolean;
}

export interface Notification {
  id: string;
  message: string;
  type: "info" | "warn" | "error" | "fatal" | "debug" | "success";
  duration?: number;
  clickable?: boolean;
  copyable?: boolean;
  errorDetails?: ApiError;
  requestDetails?: {
    endpoint?: string;
    params?: Record<string, string | number | boolean>;
    requestBody?: unknown;
  };
}

const notifications = ref<Notification[]>([]);

export function useNotification() {
  const show = (
    message: string,
    options: NotificationOptions = { type: "info", duration: 3000 },
  ) => {
    const notification = {
      id: String(Date.now()),
      message,
      type: options.type,
      duration: options.duration,
      clickable: options.clickable,
      copyable: options.copyable,
    };
    notifications.value.push(notification);

    if (options.type === "error") {
      console.error(message);
    }

    if (options.type === "debug") {
      console.debug(message);
    }

    return notification.id;
  };

  const showError = (
    error: ApiErrorResponse | ApiError | string | RequestError,
    options?: { suppressAuthRequired?: boolean },
  ) => {
    if (typeof error === "string") {
      return show(error, { type: "error", duration: 5000 });
    }

    let apiError: ApiError;
    let requestDetails:
      | {
          endpoint?: string;
          params?: Record<string, string | number | boolean>;
          requestBody?: unknown;
        }
      | undefined;

    if (error instanceof RequestError) {
      apiError = error.structuredError || {
        code: "UNKNOWN_ERROR",
        message: error.message,
        details: {},
        timestamp: new Date().toISOString(),
        request_id: "unknown",
      };
      requestDetails = {
        endpoint: error.endpoint,
        params: error.params,
        requestBody: error.requestBody,
      };
    } else {
      apiError = "error" in error ? error.error : error;
    }

    if (options?.suppressAuthRequired && apiError.code === "AUTH_REQUIRED") {
      return;
    }

    const userMessage = getHumanReadableError(apiError);
    show(userMessage, { type: "error", duration: 5000 });

    const detailsMessage =
      "Натисніть щоб скопіювати детальну інформацію для адміністратора";
    const detailsNotification = {
      id: String(Date.now() + 1),
      message: detailsMessage,
      type: "error" as const,
      duration: 10000,
      clickable: true,
      copyable: true,
      errorDetails: apiError,
      requestDetails: requestDetails,
    };
    notifications.value.push(detailsNotification);

    return detailsNotification.id;
  };

  const getHumanReadableError = (error: ApiError): string => {
    if (error.message && error.message.trim()) {
      return error.message;
    }

    const errorMessages: Record<string, string> = {
      AUTH_REQUIRED: "Необхідна авторизація",
      AUTH_PERMISSION_DENIED: "Відмовлено в доступі",
      VALIDATION_ERROR: "Помилка валідації даних",
      NOT_FOUND: "Ресурс не знайдено",
      INTERNAL_ERROR: "Внутрішня помилка сервера",
      RATE_LIMIT_EXCEEDED: "Перевищено ліміт запитів",
      MAINTENANCE_MODE: "Технічні роботи",
    };

    if (errorMessages[error.code]) {
      return errorMessages[error.code];
    }

    return "Невідома помилка!";
  };

  const copyErrorDetails = (notification: Notification) => {
    if (!notification.errorDetails) return;

    const error = notification.errorDetails;
    const request = notification.requestDetails;

    let errorText = `
Помилка: ${error.code}
Повідомлення: ${error.message}
Час: ${error.timestamp}
ID запиту: ${error.request_id}`;

    if (request?.endpoint) {
      errorText += `\nURL: ${request.endpoint}`;
    }

    if (request?.params && Object.keys(request.params).length > 0) {
      errorText += `\nПараметри запиту: ${JSON.stringify(request.params, null, 2)}`;
    }

    if (request?.requestBody) {
      errorText += `\nДані запиту: ${JSON.stringify(request.requestBody, null, 2)}`;
    }

    errorText += `\nДодаткова інформація: ${JSON.stringify(error.details, null, 2)}

Будь ласка, надайте цю інформацію адміністратору для швидшого вирішення проблеми.`;

    navigator.clipboard
      .writeText(errorText.trim())
      .then(() => {
        show("Інформацію про помилку скопійовано в буфер обміну", {
          type: "success",
          duration: 3000,
        });
      })
      .catch(() => {
        show("Не вдалося скопіювати інформацію", {
          type: "error",
          duration: 3000,
        });
      });
  };

  const remove = (id: string) => {
    const index = notifications.value.findIndex((n) => n.id === id);
    if (index !== -1) {
      notifications.value.splice(index, 1);
    }
  };

  return {
    notifications,
    show,
    showError,
    copyErrorDetails,
    remove,
  };
}
