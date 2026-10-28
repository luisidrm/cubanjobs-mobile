// Design tokens: the Food Combos design system's structure (semantic keys,
// glass, fills, radii, motion) carrying Brújula's own colors. The palette is the
// original brand: verdemar teal #0F6E62 on bone #F5F4EF with ink #12211D text
// (the lightened #4FA79A is the brand's on-dark teal). Light and dark palettes
// share the same keys; components read them through useTokens() so dark mode
// needs no per-screen work.

/** Verdemar ramp around the brand teal (500). 400 is the brand's on-dark teal. */
export const teal = {
  50: "#EEF6F4",
  100: "#DCEEEA",
  200: "#B8DCD5",
  300: "#85C0B6",
  400: "#4FA79A",
  500: "#0F6E62",
  600: "#0C5C52",
  700: "#0B5148",
  800: "#08403A",
  900: "#052B27",
} as const;

export interface Palette {
  accent: string;
  accentHover: string;
  accentPress: string;
  accentText: string;
  accentSoft: string;
  accentSoftPress: string;
  onAccent: string;
  bgApp: string;
  bgGrouped: string;
  surfaceCard: string;
  surfaceRaised: string;
  surfaceGlass: string;
  surfaceGlassStrong: string;
  surfaceGlassThin: string;
  glassBorder: string;
  text1: string;
  text2: string;
  text3: string;
  textDisabled: string;
  fill1: string;
  fill2: string;
  fill3: string;
  separator: string;
  border1: string;
  focusRing: string;
  danger: string;
  dangerText: string;
  dangerSoft: string;
  warning: string;
  warningText: string;
  warningSoft: string;
  info: string;
  infoText: string;
  infoSoft: string;
  success: string;
  successText: string;
  successSoft: string;
  scrim: string;
  /** Blur tint passed to expo-blur's BlurView. */
  blurTint: "light" | "dark";
  /** Status bar / system style that reads on bgApp. */
  statusBar: "dark" | "light";
}

export const lightPalette: Palette = {
  accent: teal[500],
  accentHover: teal[600],
  accentPress: teal[700],
  accentText: teal[700],
  accentSoft: teal[100],
  accentSoftPress: teal[200],
  onAccent: "#FFFFFF",
  bgApp: "#F5F4EF",
  bgGrouped: "#EEEDE5",
  surfaceCard: "#FFFFFF",
  surfaceRaised: "#FFFFFF",
  surfaceGlass: "rgba(255,255,255,0.62)",
  surfaceGlassStrong: "rgba(255,255,255,0.8)",
  surfaceGlassThin: "rgba(255,255,255,0.42)",
  glassBorder: "rgba(255,255,255,0.7)",
  text1: "#12211D",
  text2: "#4A5C57",
  text3: "#7C8C86",
  textDisabled: "#B3BDB8",
  fill1: "rgba(18,33,29,0.06)",
  fill2: "rgba(18,33,29,0.10)",
  fill3: "rgba(18,33,29,0.16)",
  separator: "rgba(18,33,29,0.10)",
  border1: "rgba(18,33,29,0.14)",
  focusRing: "rgba(15,110,98,0.45)",
  danger: "#D64545",
  dangerText: "#C43E3E",
  dangerSoft: "#FBE3E3",
  warning: "#E8A33D",
  warningText: "#9A5B06",
  warningSoft: "#FCEBCB",
  info: "#3B5FE0",
  infoText: "#2F4FC2",
  infoSoft: "#E6EEFF",
  success: "#1E8A3C",
  successText: "#176B2F",
  successSoft: "#E1F5E6",
  scrim: "rgba(10,20,17,0.36)",
  blurTint: "light",
  statusBar: "dark",
};

export const darkPalette: Palette = {
  accent: teal[400],
  accentHover: teal[300],
  accentPress: teal[500],
  accentText: teal[300],
  accentSoft: "rgba(79,167,154,0.16)",
  accentSoftPress: "rgba(79,167,154,0.26)",
  onAccent: "#0B1613",
  bgApp: "#0E1815",
  bgGrouped: "#0E1815",
  surfaceCard: "#12211D",
  surfaceRaised: "#1B2C27",
  surfaceGlass: "rgba(27,44,39,0.58)",
  surfaceGlassStrong: "rgba(27,44,39,0.78)",
  surfaceGlassThin: "rgba(27,44,39,0.38)",
  glassBorder: "rgba(255,255,255,0.12)",
  text1: "#F5F4EF",
  text2: "#B4C5BF",
  text3: "#7E9990",
  textDisabled: "#4D635B",
  fill1: "rgba(255,255,255,0.07)",
  fill2: "rgba(255,255,255,0.11)",
  fill3: "rgba(255,255,255,0.17)",
  separator: "rgba(255,255,255,0.10)",
  border1: "rgba(255,255,255,0.14)",
  focusRing: "rgba(79,167,154,0.50)",
  danger: "#E2726B",
  dangerText: "#F0908A",
  dangerSoft: "rgba(226,114,107,0.16)",
  warning: "#E8A33D",
  warningText: "#F2BE72",
  warningSoft: "rgba(232,163,61,0.16)",
  info: "#6F8CF0",
  infoText: "#9DB1F6",
  infoSoft: "rgba(111,140,240,0.16)",
  success: "#5FC97D",
  successText: "#7EDB98",
  successSoft: "rgba(95,201,125,0.16)",
  scrim: "rgba(0,0,0,0.55)",
  blurTint: "dark",
  statusBar: "light",
};

export const space = {
  0: 0,
  1: 2,
  2: 4,
  3: 8,
  4: 12,
  5: 16,
  6: 20,
  7: 24,
  8: 32,
  9: 40,
  10: 48,
  11: 64,
} as const;

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  "2xl": 36,
  pill: 999,
} as const;

export const layout = {
  gutter: 16,
  controlSm: 32,
  controlMd: 44,
  controlLg: 52,
  tabBarHeight: 64,
  /** Gap between the floating tab bar and the screen's bottom edge. */
  tabBarOffset: 20,
  navBarHeight: 52,
} as const;

/** Bottom padding scroll content needs so the floating tab bar never covers it. */
export const TAB_BAR_CLEARANCE = layout.tabBarHeight + layout.tabBarOffset + 24;

export const motion = {
  fast: 120,
  base: 200,
  slow: 320,
  pressScale: 0.97,
  pressScaleIcon: 0.92,
} as const;

// Font families registered by useFonts() in app/_layout.tsx
// (@expo-google-fonts/geist, @expo-google-fonts/geist-mono). Native has no
// variable-weight support here, so each weight is its own family.
export const fontFamily = {
  regular: "Geist_400Regular",
  medium: "Geist_500Medium",
  semibold: "Geist_600SemiBold",
  bold: "Geist_700Bold",
  monoRegular: "GeistMono_400Regular",
  monoMedium: "GeistMono_500Medium",
} as const;

export type TextVariant =
  | "display"
  | "title1"
  | "title2"
  | "title3"
  | "headline"
  | "body"
  | "callout"
  | "subhead"
  | "footnote"
  | "caption"
  | "caps";

type WeightKey = "regular" | "medium" | "semibold" | "bold";

export const typography: Record<
  TextVariant,
  { size: number; line: number; weight: WeightKey; tracking: number; uppercase?: boolean }
> = {
  display: { size: 36, line: 40, weight: "bold", tracking: -0.03 * 36 },
  title1: { size: 28, line: 34, weight: "bold", tracking: -0.025 * 28 },
  title2: { size: 22, line: 28, weight: "bold", tracking: -0.02 * 22 },
  title3: { size: 19, line: 24, weight: "semibold", tracking: -0.015 * 19 },
  headline: { size: 16, line: 22, weight: "semibold", tracking: 0 },
  body: { size: 16, line: 24, weight: "regular", tracking: 0 },
  callout: { size: 15, line: 22, weight: "regular", tracking: 0 },
  subhead: { size: 14, line: 20, weight: "regular", tracking: 0 },
  footnote: { size: 13, line: 18, weight: "regular", tracking: 0 },
  caption: { size: 12, line: 16, weight: "regular", tracking: 0 },
  caps: { size: 12, line: 16, weight: "semibold", tracking: 0.06 * 12, uppercase: true },
};

export const shadows = {
  sm: {
    shadowColor: "#12211D",
    shadowOpacity: 0.06,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  md: {
    shadowColor: "#12211D",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  lg: {
    shadowColor: "#12211D",
    shadowOpacity: 0.16,
    shadowRadius: 48,
    shadowOffset: { width: 0, height: 18 },
    elevation: 12,
  },
  glass: {
    shadowColor: "#12211D",
    shadowOpacity: 0.12,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  accent: {
    shadowColor: teal[500],
    shadowOpacity: 0.32,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
} as const;
