import { ChevronRight, type LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { useTokens } from "../../theme/use-tokens";
import { Icon } from "./Icon";
import { Text } from "./Text";

export interface ListRowProps {
  /** Icon tile glyph (32px tile, radius 9, white glyph on a colored tile). */
  icon?: LucideIcon;
  iconBg?: string;
  /** Custom leading node (photo, avatar). Wins over `icon`. */
  leading?: ReactNode;
  title: string;
  subtitle?: string;
  value?: string;
  /** "chevron" or any node (Toggle, Badge). */
  accessory?: "chevron" | ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

/** One row inside a List. Min height 52 keeps the 44pt touch target. */
export function ListRow({
  icon,
  iconBg,
  leading,
  title,
  subtitle,
  value,
  accessory,
  onPress,
  destructive,
  disabled,
}: ListRowProps) {
  const p = useTokens();
  const acc =
    accessory === "chevron" ? <Icon icon={ChevronRight} size={18} color={p.text3} /> : accessory;
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={onPress ? title : undefined}
      disabled={!onPress || disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        minHeight: 52,
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: pressed ? p.fill1 : "transparent",
        opacity: disabled ? 0.5 : 1,
      })}
    >
      {leading ??
        (icon ? (
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              backgroundColor: destructive ? p.danger : (iconBg ?? p.accent),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon icon={icon} size={18} color="#FFFFFF" />
          </View>
        ) : null)}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text weight="medium" tone={destructive ? "danger" : "primary"} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="footnote" tone="tertiary" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value != null ? (
        <Text variant="callout" tone="secondary" tabular numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {acc}
    </Pressable>
  );
}
