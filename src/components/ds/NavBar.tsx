import { ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { layout } from "../../theme/tokens";
import { useTokens } from "../../theme/use-tokens";
import { BrandLogo, BrandMark } from "./BrandLogo";
import { IconButton } from "./IconButton";
import { Text } from "./Text";
import { goBack } from "../../lib/navigation";

export interface NavBarProps {
  title: string;
  subtitle?: string;
  /** Large left-aligned title under the bar (top-level screens). */
  large?: boolean;
  /** Show a glass back button (pushed screens). */
  back?: boolean | (() => void);
  backLabel?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
}

/** Top bar. Compact: centered 16/600 title. Large: 32/700 title with -0.03em tracking. Applies the top safe-area inset itself. */
export function NavBar({ title, subtitle, large, back, backLabel = "Back", leading, trailing }: NavBarProps) {
  const p = useTokens();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const backNode = back ? (
    <IconButton
      icon={ChevronLeft}
      label={backLabel}
      onPress={typeof back === "function" ? back : () => goBack(router)}
    />
  ) : null;
  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingHorizontal: large ? 16 : 12,
        paddingBottom: large ? 12 : 0,
        borderBottomWidth: large ? 0 : StyleSheet.hairlineWidth,
        borderBottomColor: p.separator,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, minHeight: layout.navBarHeight }}>
        {large ? (
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8, minWidth: 0 }}>
            {backNode ?? leading}
            <BrandLogo size={22} />
          </View>
        ) : (
          <View style={{ minWidth: 44, flexDirection: "row", gap: 8 }}>{backNode ?? leading}</View>
        )}
        <View style={{ flex: large ? 0 : 1, alignItems: "center", minWidth: 0 }}>
          {!large ? (
            <>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <BrandMark size={20} />
                <Text variant="headline" numberOfLines={1} style={{ flexShrink: 1 }}>
                  {title}
                </Text>
              </View>
              {subtitle ? (
                <Text variant="caption" tone="tertiary" numberOfLines={1}>
                  {subtitle}
                </Text>
              ) : null}
            </>
          ) : null}
        </View>
        <View style={{ minWidth: 44, flexDirection: "row", gap: 8, justifyContent: "flex-end" }}>{trailing}</View>
      </View>
      {large ? (
        <View style={{ paddingHorizontal: 4 }}>
          <Text accessibilityRole="header" style={{ fontSize: 32, lineHeight: 38, letterSpacing: -0.03 * 32, fontFamily: "Geist_700Bold" }}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="callout" tone="secondary" style={{ marginTop: 2 }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
