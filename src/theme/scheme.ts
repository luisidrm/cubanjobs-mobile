import { useSyncExternalStore } from "react";
import { Appearance, useColorScheme } from "react-native";

export type Scheme = "light" | "dark";

// The user's explicit choice (null = follow the system). Kept in a tiny
// external store instead of Appearance.setColorScheme, which doesn't exist on
// react-native-web.
let override: Scheme | null = null;
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function setSchemeOverride(next: Scheme | null) {
  override = next;
  // Native only: also move the system chrome (keyboard, alerts, status bar).
  if (typeof Appearance.setColorScheme === "function") {
    try {
      Appearance.setColorScheme(next ?? "unspecified");
    } catch {
      // Not supported on this platform: the in-app override still applies.
    }
  }
  for (const l of listeners) l();
}

/** The scheme the whole app renders with: the user's choice, else the system's. */
export function useAppColorScheme(): Scheme {
  const system = useColorScheme();
  const chosen = useSyncExternalStore(
    subscribe,
    () => override,
    () => null,
  );
  return chosen ?? (system === "dark" ? "dark" : "light");
}
