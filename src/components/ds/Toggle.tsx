import { useEffect } from "react";
import { Pressable } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useTokens } from "../../theme/use-tokens";

export interface ToggleProps {
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
  /** Accessible name; required since the switch has no visible text. */
  label: string;
}

/** 52x32 on/off switch with a spring thumb. Usually a ListRow accessory. */
export function Toggle({ value, onValueChange, disabled, label }: ToggleProps) {
  const p = useTokens();
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, { damping: 14, stiffness: 260, mass: 0.6 });
  }, [value, progress]);

  const track = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [p.fill3, p.accent]),
  }));
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: progress.value * 20 }] }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value, disabled: !!disabled }}
      disabled={disabled}
      hitSlop={6}
      onPress={() => onValueChange(!value)}
      style={{ opacity: disabled ? 0.45 : 1 }}
    >
      <Animated.View style={[{ width: 52, height: 32, borderRadius: 16, padding: 2 }, track]}>
        <Animated.View
          style={[
            {
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: "#FFFFFF",
              shadowColor: "#000",
              shadowOpacity: 0.18,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: 3,
            },
            thumb,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}
