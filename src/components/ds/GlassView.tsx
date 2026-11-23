import { BlurView } from "expo-blur";
import type { ReactNode } from "react";
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { shadows } from "../../theme/tokens";
import { useTokens } from "../../theme/use-tokens";

export type GlassStrength = "thin" | "regular" | "strong";

export interface GlassViewProps {
  strength?: GlassStrength;
  /** Blur radius, 1-100. */
  intensity?: number;
  /** Corner radius; the blur and border are clipped to it. */
  radius?: number;
  shadow?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

/**
 * The system's signature material: translucent fill + backdrop blur + a light
 * border + soft shadow. Use only over content (photos, lists), never
 * glass-on-glass. iOS blurs the backdrop; Android falls back to a stronger
 * translucent fill because BlurView needs a BlurTargetView there.
 */
export function GlassView({
  strength = "regular",
  intensity = 50,
  radius = 20,
  shadow = true,
  style,
  children,
}: GlassViewProps) {
  const p = useTokens();
  const fill =
    Platform.OS === "android"
      ? p.surfaceGlassStrong
      : strength === "thin"
        ? p.surfaceGlassThin
        : strength === "strong"
          ? p.surfaceGlassStrong
          : p.surfaceGlass;
  return (
    <View style={[{ borderRadius: radius }, shadow ? shadows.glass : null, style]}>
      <View
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: radius, overflow: "hidden", borderWidth: 1, borderColor: p.glassBorder, pointerEvents: "none" },
        ]}
      >
        {Platform.OS === "ios" ? (
          <BlurView intensity={intensity} tint={p.blurTint} style={StyleSheet.absoluteFill} />
        ) : null}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: fill }]} />
      </View>
      {children}
    </View>
  );
}
