/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DISCORD_URL: string;
  readonly VITE_MINECRAFT_IP: string;
  readonly SENTRY_AUTH_TOKEN: string;
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_SENTRY_ENVIRONMENT: string;
  readonly VITE_SENTRY_TRACES_SAMPLE_RATE: string;
  readonly VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE: string;
  readonly VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE: string;
  readonly VITE_CATWALK_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
