import { X } from "lucide-react-native";
import { useEffect, useState, type ReactNode } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { radius, shadows } from "../../theme/tokens";
import { useTokens } from "../../theme/use-tokens";
import { GlassView } from "./GlassView";
import { IconButton } from "./IconButton";
import { Text } from "./Text";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** "medium" caps at 62% of the screen, "large" fills it. */
  detent?: "medium" | "large";
  footer?: ReactNode;
  closeLabel?: string;
  children: ReactNode;
}

/** Floating bottom sheet for a focused subtask: inset 8, radius 36, grabber on top. */
export function Sheet({ open, onClose, title, detent = "medium", footer, closeLabel = "Close", children }: SheetProps) {
  const p = useTokens();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(open);
  const progress = useSharedValue(0);

  // Mount synchronously when opened (derived state), unmount after the exit animation.
  if (open && !mounted) setMounted(true);

  useEffect(() => {
    if (open) {
      progress.set(withSpring(1, { damping: 18, stiffness: 220, mass: 0.8 }));
    } else {
      progress.set(withTiming(0, { duration: 240 }));
      const t = setTimeout(() => setMounted(false), 260);
      return () => clearTimeout(t);
    }
  }, [open, progress]);

  const scrim = useAnimatedStyle(() => ({ opacity: Math.min(1, progress.value) }));
  const sheet = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - progress.value) * (height * 0.7) }] }));

  if (!mounted) return null;
  const maxH = detent === "large" ? height - insets.top - 24 : height * 0.62;
  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, justifyContent: "flex-end" }}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: p.scrim }, scrim]}>
          <Pressable accessibilityLabel={closeLabel} style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
        <Animated.View style={[{ margin: 8, marginBottom: 8 + insets.bottom, maxHeight: maxH }, shadows.lg, sheet]}>
          <GlassView strength="strong" intensity={80} radius={radius["2xl"]} style={{ maxHeight: maxH }}>
            <View
              style={{ width: 36, height: 5, borderRadius: 3, backgroundColor: p.fill3, alignSelf: "center", marginTop: 8 }}
            />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingLeft: 20, paddingRight: 12, paddingVertical: 6 }}>
              <Text variant="headline" style={{ flex: 1, fontSize: 17, lineHeight: 22 }}>
                {title}
              </Text>
              <IconButton icon={X} label={closeLabel} variant="fill" size={32} onPress={onClose} />
            </View>
            <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: footer ? 12 : 20, flexShrink: 1 }}>
              {children}
            </View>
            {footer ? <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>{footer}</View> : null}
          </GlassView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
