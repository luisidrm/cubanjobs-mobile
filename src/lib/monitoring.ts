import * as Sentry from "@sentry/react-native";

// Expo only inlines EXPO_PUBLIC_ variables read as a literal `process.env.NAME`.
const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

/** Starts crash and error reporting. Does nothing until a DSN is set for the build (eas.json). */
export function initMonitoring() {
  if (!dsn || dsn.includes("REPLACE_WITH")) return;

  Sentry.init({
    dsn,
    environment: process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT || (__DEV__ ? "development" : "production"),
    // Errors are always sent; performance traces are sampled to stay inside the free quota.
    tracesSampleRate: 0.05,
    // Never ship request bodies, cookies or headers (passwords, payment details).
    beforeSend(event) {
      if (event.request) {
        const { cookies: _c, headers: _h, data: _d, ...safe } = event.request;
        event.request = safe;
      }
      return event;
    },
  });
}

/** For errors the app catches and handles but someone should still hear about. */
export function reportError(error: unknown, context?: Record<string, unknown>) {
  Sentry.captureException(error, context ? { extra: context } : undefined);
}
