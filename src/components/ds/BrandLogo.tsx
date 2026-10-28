import { View } from "react-native";
import Svg, { Circle, Polygon } from "react-native-svg";
import { useTokens } from "../../theme/use-tokens";
import { Text } from "./Text";

/**
 * Brújula compass needle: ring + split needle (north in the brand teal,
 * south in ink). Same geometry as the original logo mark, drawn with
 * react-native-svg so it works on native, and colored from the theme tokens
 * so it reads in light and dark.
 */
export function BrandMark({ size = 32, strokeWidth }: { size?: number; strokeWidth?: number }) {
  const p = useTokens();
  const sw = strokeWidth ?? (size < 24 ? 4 : size < 40 ? 3 : 2.5);
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Circle cx="50" cy="50" r="45" fill="none" stroke={p.text1} strokeWidth={sw} />
      <Polygon points="50,12 63,50 50,50" fill={p.accent} />
      <Polygon points="50,88 37,50 50,50" fill={p.text1} />
    </Svg>
  );
}

/** Horizontal lockup: mark on the left, "Brújula" wordmark (Geist Bold, -0.04em) on the right. */
export function BrandLogo({ size = 28 }: { size?: number }) {
  return (
    <View
      accessibilityRole="header"
      accessibilityLabel="Brújula"
      style={{ flexDirection: "row", alignItems: "center", gap: size * 0.36 }}
    >
      <BrandMark size={size * 1.15} />
      <Text weight="bold" style={{ fontSize: size, lineHeight: size * 1.15, letterSpacing: -0.04 * size }}>
        Brújula
      </Text>
    </View>
  );
}
