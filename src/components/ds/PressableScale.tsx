import type { ReactNode } from "react";
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { motion } from "../../theme/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends Omit<PressableProps, "style" | "children"> {
  style?: StyleProp<ViewStyle>;
  /** Scale while pressed. Defaults to the system's 0.97 (icon buttons use 0.92). */
  pressScale?: number;
  children?: ReactNode;
}

// Spring approximates the system's cubic-bezier(.34,1.56,.64,1) at ~320ms.
const SPRING = { damping: 14, stiffness: 260, mass: 0.6 } as const;

/** Pressable that shrinks slightly on press and springs back. */
export function PressableScale({
  style,
  pressScale = motion.pressScale,
  onPressIn,
  onPressOut,
  disabled,
  children,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={(e) => {
        if (!disabled) scale.set(withSpring(pressScale, SPRING));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withSpring(1, SPRING));
        onPressOut?.(e);
      }}
      style={[style, animated]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
