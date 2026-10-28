import { useEffect } from "react";
import { View, type DimensionValue, type StyleProp, type ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useTokens } from "../../theme/use-tokens";

/** Loading placeholder that pulses between fill-1 and fill-2. */
export function Skeleton({
  width = "100%",
  height = 16,
  radius = 8,
  style,
}: {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const p = useTokens();
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }), -1, true));
  }, [t]);
  const anim = useAnimatedStyle(() => ({ opacity: 0.55 + 0.45 * t.value }));
  return <Animated.View style={[{ width, height, borderRadius: radius, backgroundColor: p.fill2 }, anim, style]} />;
}

/** Three stacked card-shaped skeletons: the standard list loading state. */
export function CardSkeletons({ count = 3, height = 110 }: { count?: number; height?: number }) {
  return (
    <View style={{ gap: 14 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} height={height} radius={20} />
      ))}
    </View>
  );
}
