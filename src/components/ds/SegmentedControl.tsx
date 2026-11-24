import { useState } from "react";
import { Pressable, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { radius, shadows } from "../../theme/tokens";
import { useTokens } from "../../theme/use-tokens";
import { GlassView } from "./GlassView";
import { Text } from "./Text";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  /** Over-photo variant. */
  glass?: boolean;
  /**
   * Fixed width of each segment. Use it where the control sits in a row with no width to fill
   * (a header): without it the segments are flex: 1 and have nothing to size against, so the
   * control can stretch past the screen edge. Left unset, the control fills its parent.
   */
  segmentWidth?: number;
}

/** Pill switch between 2-4 mutually exclusive views, with a sliding raised thumb. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  glass,
  segmentWidth,
}: SegmentedControlProps<T>) {
  const p = useTokens();
  const [width, setWidth] = useState(0);
  const found = options.findIndex((o) => o.value === value);
  const index = Math.max(0, found);
  const segW = width > 0 ? (width - 6) / options.length : 0;
  const x = useSharedValue(0);
  x.value = withSpring(index * segW, { damping: 16, stiffness: 240, mass: 0.7 });
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const h = size === "sm" ? 36 : 44;

  const track = (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{
        flexDirection: "row",
        padding: 3,
        borderRadius: radius.pill,
        backgroundColor: glass ? undefined : p.fill1,
        // Explicit size (track = segments + padding) so it can never grow past its content.
        ...(segmentWidth ? { width: segmentWidth * options.length + 6, flexShrink: 0 } : null),
      }}
    >
      {segW > 0 && found >= 0 ? (
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 3,
              left: 3,
              width: segW,
              height: h - 6,
              borderRadius: radius.pill,
              backgroundColor: p.surfaceRaised,
            },
            shadows.md,
            thumb,
          ]}
        />
      ) : null}
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={{
              ...(segmentWidth ? { width: segmentWidth } : { flex: 1 }),
              height: h - 6,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: segmentWidth ? 0 : 12,
            }}
          >
            <Text
              weight={on ? "semibold" : "medium"}
              tone={on ? "primary" : "secondary"}
              numberOfLines={1}
              style={{ fontSize: size === "sm" ? 13 : 14, lineHeight: 18 }}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
  return glass ? (
    <GlassView radius={radius.pill} shadow={false}>
      {track}
    </GlassView>
  ) : (
    track
  );
}
