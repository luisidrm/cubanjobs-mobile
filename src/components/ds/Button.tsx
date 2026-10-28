import type { LucideIcon } from "lucide-react-native";
import { ActivityIndicator, type StyleProp, type ViewStyle } from "react-native";
import { layout, radius, shadows } from "../../theme/tokens";
import { useTokens } from "../../theme/use-tokens";
import { Icon } from "./Icon";
import { PressableScale } from "./PressableScale";
import { Text } from "./Text";

export type ButtonVariant = "primary" | "secondary" | "tinted" | "plain" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

const SIZES = {
  sm: { h: layout.controlSm, px: 12, fs: 14, ic: 16 },
  md: { h: layout.controlMd, px: 18, fs: 15, ic: 18 },
  lg: { h: layout.controlLg, px: 22, fs: 16, ic: 20 },
} as const;

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  /** Fill the parent's width. */
  block?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Pill button. One primary per screen, usually pinned above the tab bar. */
export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  block,
  disabled,
  loading,
  style,
}: ButtonProps) {
  const p = useTokens();
  const s = SIZES[size];
  const off = disabled || loading;
  const v = {
    primary: { bg: p.accent, fg: p.onAccent },
    secondary: { bg: p.accentSoft, fg: p.accentText },
    tinted: { bg: p.fill1, fg: p.text1 },
    plain: { bg: "transparent", fg: p.accentText },
    destructive: { bg: p.dangerSoft, fg: p.dangerText },
  }[variant];
  const fg = disabled ? p.textDisabled : v.fg;
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      disabled={off}
      onPress={onPress}
      style={[
        {
          height: s.h,
          paddingHorizontal: s.px,
          borderRadius: radius.pill,
          backgroundColor: disabled ? p.fill1 : v.bg,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          alignSelf: block ? "stretch" : "flex-start",
        },
        variant === "primary" && !off ? { ...shadows.accent, shadowColor: p.accent, shadowOpacity: p.blurTint === "dark" ? 0.28 : 0.32 } : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={fg} />
      ) : icon ? (
        <Icon icon={icon} size={s.ic} color={fg} />
      ) : null}
      <Text weight="semibold" style={{ fontSize: s.fs, lineHeight: s.fs + 2, letterSpacing: -0.01 * s.fs, color: fg }}>
        {title}
      </Text>
      {iconRight ? <Icon icon={iconRight} size={s.ic} color={fg} /> : null}
    </PressableScale>
  );
}
