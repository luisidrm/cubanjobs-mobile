import { useRouter } from "expo-router";
import { ChevronLeft, type LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTokens } from "../../theme/use-tokens";
import { BrandMark, Icon, IconButton, Screen, Text } from "../ds";
import { goBack } from "../../lib/navigation";

interface Props {
  /** Brand lockup (mark left of the wordmark) + tagline: the login screen. */
  brand?: boolean;
  /** Glass back button. `true` goes back in the stack; pass a function to override. */
  back?: boolean | (() => void);
  backLabel?: string;
  /** 56pt accent-soft tile above the title (forgot / reset). */
  icon?: LucideIcon;
  title?: string;
  subtitle?: string;
  /** 32/38 (sign up) instead of 28/34. */
  largeTitle?: boolean;
  /** Pinned to the bottom of the screen (links such as "No account? Sign up"). */
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Frame for signed-out form screens: optional 52pt back row, left-aligned
 * header block, form column, and a footer pinned to the bottom. Gutter 20.
 */
export function AuthScreen({ brand, back, backLabel = "Back", icon, title, subtitle, largeTitle, footer, children }: Props) {
  const p = useTokens();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {back ? (
          <View style={{ height: 52, justifyContent: "center", paddingHorizontal: 12 }}>
            <IconButton
              icon={ChevronLeft}
              label={backLabel}
              onPress={typeof back === "function" ? back : () => goBack(router)}
            />
          </View>
        ) : null}
        <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: back ? 12 : 40, paddingBottom: Math.max(40, insets.bottom + 16) }}
        >
          <View style={{ flex: 1, width: "100%", maxWidth: 420, alignSelf: "center" }}>
            {brand ? (
              <View style={{ gap: 14, paddingHorizontal: 4, paddingBottom: 32 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                  <BrandMark size={56} />
                  <Text accessibilityRole="header" weight="bold" style={{ fontSize: 36, lineHeight: 40, letterSpacing: -0.04 * 36 }}>
                    Brújula
                  </Text>
                </View>
                <Text variant="body" tone="secondary">
                  Tu norte profesional.
                </Text>
              </View>
            ) : null}
            {icon || title ? (
              <View style={{ gap: 14, paddingHorizontal: 4, paddingBottom: 24 }}>
                {icon ? (
                  <View style={{ width: 56, height: 56, borderRadius: 17, backgroundColor: p.accentSoft, alignItems: "center", justifyContent: "center" }}>
                    <Icon icon={icon} size={26} color={p.accentText} />
                  </View>
                ) : null}
                {title ? (
                  <View style={{ gap: 6 }}>
                    <Text
                      accessibilityRole="header"
                      weight="bold"
                      style={{
                        fontSize: largeTitle ? 32 : 28,
                        lineHeight: largeTitle ? 38 : 34,
                        letterSpacing: (largeTitle ? -0.03 : -0.025) * (largeTitle ? 32 : 28),
                      }}
                    >
                      {title}
                    </Text>
                    {subtitle ? (
                      <Text variant="callout" tone="secondary">
                        {subtitle}
                      </Text>
                    ) : null}
                  </View>
                ) : null}
              </View>
            ) : null}
            <View style={{ gap: 12 }}>{children}</View>
            <View style={{ flex: 1, minHeight: 16 }} />
            {footer ? <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 2 }}>{footer}</View> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
