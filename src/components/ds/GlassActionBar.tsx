import type { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassView } from "./GlassView";

/** Pinned wrapper for a screen's one primary action: floating strong glass, radius 36. */
export function GlassActionBar({ children, inset = 16 }: { children: ReactNode; inset?: number }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ position: "absolute", left: inset, right: inset, bottom: Math.max(28, insets.bottom + 8), pointerEvents: "box-none" }}>
      <GlassView strength="strong" intensity={80} radius={36} style={{ padding: 8 }}>
        {children}
      </GlassView>
    </View>
  );
}

/** Bottom padding scroll content needs so the GlassActionBar never covers it. */
export const ACTION_BAR_CLEARANCE = 140;
