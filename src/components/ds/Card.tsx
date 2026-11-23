import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle, Platform } from "react-native";
import { radius as r, shadows } from "../../theme/tokens";
import { useTokens } from "../../theme/use-tokens";
import { GlassView } from "./GlassView";
import { PressableScale } from "./PressableScale";

export interface CardProps {
  variant?: "solid" | "glass" | "grouped";
  padding?: number;
  /** Default 20. Nest inner elements at radius - padding (concentric). */
  radius?: number;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

/** Rounded surface for grouping content: solid for dense data, glass over imagery. */
export function Card({
  variant = "solid",
  padding = 16,
  radius = r.lg,
  onPress,
  accessibilityLabel,
  style,
  children,
}: CardProps) {
  const p = useTokens();
  const body =
    variant === "glass" ? (
      <GlassView radius={radius} style={[{ padding }, style]}>
        {children}
      </GlassView>
    ) : (
      <View
        style={[
          {
            padding,
            borderRadius: radius,
            backgroundColor: variant === "grouped" ? p.fill1 : p.surfaceCard,
            borderWidth: variant === "grouped" ? 0 : 1,
            borderColor: p.separator,
          },
          variant === "solid" ? shadows.sm : null,
          style,
        ]}
      >
        {children}
      </View>
    );
  if (!onPress) return body;
  return (
    <PressableScale
      // On the web a "button" role renders a real <button>, and cards often hold their own
      // buttons (the job bookmark), which is invalid HTML. Phones keep the button role.
      accessibilityRole={Platform.OS === "web" ? undefined : "button"}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
    >
      {body}
    </PressableScale>
  );
}
