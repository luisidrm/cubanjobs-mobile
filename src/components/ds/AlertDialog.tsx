import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { radius, shadows } from "../../theme/tokens";
import { useTokens } from "../../theme/use-tokens";
import { GlassView } from "./GlassView";
import { PressableScale } from "./PressableScale";
import { Text } from "./Text";

export interface AlertAction {
  label: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
}

export interface AlertDialogProps {
  open: boolean;
  title: string;
  message?: string;
  actions?: AlertAction[];
  onClose: () => void;
}

/** Centered modal for confirmations. Title asks the question, message names the consequence. */
export function AlertDialog({ open, title, message, actions = [{ label: "OK" }], onClose }: AlertDialogProps) {
  const p = useTokens();
  const [mounted, setMounted] = useState(open);
  const progress = useSharedValue(0);

  // Mount synchronously when opened (derived state), unmount after the exit animation.
  if (open && !mounted) setMounted(true);

  useEffect(() => {
    if (open) {
      progress.set(withSpring(1, { damping: 16, stiffness: 240, mass: 0.7 }));
    } else {
      progress.set(withTiming(0, { duration: 160 }));
      const t = setTimeout(() => setMounted(false), 180);
      return () => clearTimeout(t);
    }
  }, [open, progress]);

  const scrim = useAnimatedStyle(() => ({ opacity: Math.min(1, progress.value) }));
  const card = useAnimatedStyle(() => ({
    opacity: Math.min(1, progress.value),
    transform: [{ scale: 1.08 - 0.08 * progress.value }],
  }));

  if (!mounted) return null;
  const stacked = actions.length > 2;
  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: p.scrim }, scrim]}>
          <Pressable accessibilityLabel={title} style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
        <Animated.View style={[{ width: 300 }, shadows.lg, card]}>
          <GlassView strength="strong" intensity={80} radius={radius.xl} style={{ paddingHorizontal: 18, paddingTop: 22, paddingBottom: 16 }}>
            <Text weight="semibold" style={{ fontSize: 17, lineHeight: 22, textAlign: "center" }}>
              {title}
            </Text>
            {message ? (
              <Text variant="subhead" tone="secondary" style={{ textAlign: "center", marginTop: 6 }}>
                {message}
              </Text>
            ) : null}
            <View style={{ flexDirection: stacked ? "column" : "row", gap: 8, marginTop: 18 }}>
              {actions.map((a, i) => {
                const bg = a.style === "destructive" ? p.danger : a.style === "cancel" ? p.fill2 : p.accent;
                const fg = a.style === "cancel" ? p.text1 : "#FFFFFF";
                return (
                  <PressableScale
                    key={i}
                    accessibilityRole="button"
                    onPress={() => {
                      onClose();
                      a.onPress?.();
                    }}
                    style={{ flex: stacked ? undefined : 1, height: 44, borderRadius: radius.pill, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}
                  >
                    <Text weight="semibold" style={{ fontSize: 15, lineHeight: 18, color: fg }}>
                      {a.label}
                    </Text>
                  </PressableScale>
                );
              })}
            </View>
          </GlassView>
        </Animated.View>
      </View>
    </Modal>
  );
}
