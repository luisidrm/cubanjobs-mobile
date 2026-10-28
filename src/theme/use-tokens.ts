import { darkPalette, lightPalette, type Palette } from "./tokens";
import { useAppColorScheme } from "./scheme";

/** Active palette: the user's light/dark choice, else the system scheme. */
export function useTokens(): Palette {
  return useAppColorScheme() === "dark" ? darkPalette : lightPalette;
}
