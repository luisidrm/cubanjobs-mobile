import AsyncStorage from "@react-native-async-storage/async-storage";
import { setSchemeOverride, type Scheme } from "../theme/scheme";

const KEY = "brujula:theme";

export type ThemePreference = Scheme;

/** Applies the saved theme (if any) at startup; with nothing saved the app follows the system. */
export async function loadThemePreference(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(KEY);
    if (stored === "light" || stored === "dark") setSchemeOverride(stored);
  } catch {
    // Storage unavailable: keep following the system.
  }
}

/** Switches the theme now and remembers it for the next launch. */
export async function setThemePreference(pref: ThemePreference): Promise<void> {
  setSchemeOverride(pref);
  try {
    await AsyncStorage.setItem(KEY, pref);
  } catch {
    // The switch still applies for this session.
  }
}
