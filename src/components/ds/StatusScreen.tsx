import type { LucideIcon } from "lucide-react-native";
import { ActivityIndicator, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTokens } from "../../theme/use-tokens";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { Screen } from "./Screen";
import { Text } from "./Text";

export interface StatusAction {
  title: string;
  onPress: () => void;
}

export interface StatusScreenProps {
  /** Omit and set `spinner` for the verifying state. */
  icon?: LucideIcon;
  spinner?: boolean;
  tone?: "success" | "danger" | "accent";
  title?: string;
  message: string;
  primary?: StatusAction;
  secondary?: StatusAction;
}

/** Full-height outcome screen: 80pt tone tile, title, message, pinned actions. */
export function StatusScreen({ icon, spinner, tone = "accent", title, message, primary, secondary }: StatusScreenProps) {
  const p = useTokens();
  const insets = useSafeAreaInsets();
  const [bg, fg] =
    tone === "success" ? [p.successSoft, p.successText] : tone === "danger" ? [p.dangerSoft, p.dangerText] : [p.accentSoft, p.accentText];
  return (
    <Screen>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 20 }}>
        <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
          {spinner ? <ActivityIndicator size="large" color={p.accent} /> : icon ? <Icon icon={icon} size={38} color={fg} /> : null}
        </View>
        <View style={{ alignItems: "center", gap: 8 }}>
          {title ? (
            <Text accessibilityRole="header" variant="title1" style={{ textAlign: "center", maxWidth: 310 }}>
              {title}
            </Text>
          ) : null}
          <Text variant="body" tone="secondary" style={{ textAlign: "center", maxWidth: 320 }}>
            {message}
          </Text>
        </View>
      </View>
      {primary || secondary ? (
        <View style={{ paddingHorizontal: 20, paddingBottom: Math.max(44, insets.bottom + 12), gap: 8 }}>
          {primary ? <Button block size="lg" title={primary.title} onPress={primary.onPress} /> : null}
          {secondary ? <Button block variant="plain" title={secondary.title} onPress={secondary.onPress} /> : null}
        </View>
      ) : null}
    </Screen>
  );
}
