import * as Sentry from "@sentry/vue";
import type { App } from "vue";
import type { Router } from "vue-router";

export function initSentry(app: App, router: Router) {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || "development";
  const tracesSampleRate = parseFloat(
    import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || "1.0",
  );
  const replaysSessionSampleRate = parseFloat(
    import.meta.env.VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE || "1.0",
  );
  const replaysOnErrorSampleRate = parseFloat(
    import.meta.env.VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE || "1.0",
  );

  if (!dsn) {
    console.warn("Sentry DSN not configured. Check environment variables.");
    return;
  }

  Sentry.init({
    app,
    dsn,
    environment,
    debug: false,
    enabled: environment !== "development",
    sendDefaultPii: true,
    tunnel: "/sentry",
    integrations: [
      Sentry.browserTracingIntegration({
        router,
      }),
      Sentry.vueIntegration({
        tracingOptions: {
          trackComponents: true,
          timeout: 2000,
          hooks: ["create", "mount", "destroy"],
        },
        attachProps: true,
      }),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
        useCompression: false,
        networkDetailAllowUrls: [
          "/api/user/profile",
          "/api/shop/services",
          "/api/user/balance",
          "/api/user/transactions",
          "/catwalk/patways/*",
        ],
        networkRequestHeaders: ["Authorization", "Cookie"],
        networkResponseHeaders: ["Set-Cookie", "Authorization"],
      }),
    ],
    tracesSampleRate: environment === "development" ? 0 : tracesSampleRate,
    replaysSessionSampleRate:
      environment === "development" ? 0 : replaysSessionSampleRate,
    replaysOnErrorSampleRate:
      environment === "development" ? 0 : replaysOnErrorSampleRate,
    tracePropagationTargets: ["localhost", /^https:\/\/.*uaproject\.net/],
    beforeSend(event) {
      if (event.request?.headers) {
        delete event.request.headers["Authorization"];
        delete event.request.headers["Cookie"];
      }
      return event;
    },
  });

  app.config.errorHandler = (error, vm, info) => {
    if (environment === "development") {
      console.error("Vue Error Handler:", error);
      return;
    }
    Sentry.captureException(error, {
      extra: {
        componentName: vm?.$options?.name,
        info,
      },
    });
  };

  window.addEventListener("unhandledrejection", (event) => {
    if (environment === "development") {
      console.error("Unhandled Promise Rejection:", event.reason);
      return;
    }
    Sentry.captureException(event.reason, {
      extra: {
        type: "unhandledrejection",
      },
    });
  });
}
