import type { LucideIcon } from "lucide-react-native";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { motion } from "../../theme/tokens";
import { useTokens } from "../../theme/use-tokens";
import { GlassView } from "./GlassView";
import { Icon } from "./Icon";
import { PressableScale } from "./PressableScale";
import { Text } from "./Text";

export type IconButtonVariant = "glass" | "fill" | "plain" | "primary";

export interface IconButtonProps {
  icon: LucideIcon;
  /** Required: icon-only buttons need an accessible name. */
  label: string;
  onPress?: () => void;
  variant?: IconButtonVariant;
  /** Diameter. Touch targets stay >= 44 via hitSlop when the visual is smaller. */
  size?: number;
  badge?: number | string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function IconButton({
  icon,
  label,
  onPress,
  variant = "glass",
  size = 44,
  badge,
  disabled,
  style,
}: IconButtonProps) {
  const p = useTokens();
  const fg = disabled ? p.textDisabled : variant === "primary" ? p.onAccent : p.text1;
  const bg = variant === "fill" ? p.fill1 : variant === "primary" ? p.accent : "transparent";
  const inner = (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: variant === "glass" ? undefined : bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon icon={icon} size={Math.round(size * 0.48)} color={fg} />
    </View>
  );
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      pressScale={motion.pressScaleIcon}
      hitSlop={size < 44 ? (44 - size) / 2 : 0}
      style={[{ width: size, height: size }, style]}
    >
      {variant === "glass" ? (
        <GlassView radius={size / 2} style={{ width: size, height: size }}>
          {inner}
        </GlassView>
      ) : (
        inner
      )}
      {badge != null ? (
        <View
          style={{
            position: "absolute",
            top: -2,
            right: -2,
            minWidth: 18,
            height: 18,
            paddingHorizontal: 5,
            borderRadius: 9,
            backgroundColor: p.accent,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: p.bgApp,
          }}
        >
          <Text weight="bold" style={{ fontSize: 11, lineHeight: 13, color: p.onAccent }}>
            {badge}
          </Text>
        </View>
      ) : null}
    </PressableScale>
  );
}
