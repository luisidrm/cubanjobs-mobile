/**
 * Build-time configuration. Expo only inlines variables whose names start with
 * EXPO_PUBLIC_, and only when they are read with a literal `process.env.NAME`.
 * They are set per build profile in eas.json (and in .env for local runs).
 */
const url = process.env.EXPO_PUBLIC_API_URL;

function resolveApiUrl(): string {
  if (url && !url.includes("REPLACE_WITH")) {
    // A release build that points at localhost can only ever fail on a real phone.
    if (!__DEV__ && /localhost|127\.0\.0\.1/.test(url)) {
      throw new Error(`EXPO_PUBLIC_API_URL points at ${url}, which a release build cannot reach.`);
    }
    return url.replace(/\/+$/, "");
  }
  if (__DEV__) return "http://localhost:5000";
  // Fail loudly at startup rather than shipping an app that silently talks to nothing.
  throw new Error("EXPO_PUBLIC_API_URL is not set for this build. Set it in the eas.json build profile.");
}

export const API_URL = resolveApiUrl();

/** Deep-link scheme from app.json, used for return URLs. */
export const APP_SCHEME = "brujula";

/** Stripe is hidden for now; flip to "true" in the build profile to bring it back. */
export const STRIPE_ENABLED = process.env.EXPO_PUBLIC_STRIPE_ENABLED === "true";
