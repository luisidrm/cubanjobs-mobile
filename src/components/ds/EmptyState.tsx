import type { LucideIcon } from "lucide-react-native";
import { View } from "react-native";
import { useTokens } from "../../theme/use-tokens";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { Text } from "./Text";

/** Empty / error block: icon tile, message, optional secondary action. */
export function EmptyState({
  icon,
  tone = "accent",
  message,
  actionLabel,
  onAction,
}: {
  icon: LucideIcon;
  tone?: "accent" | "danger";
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const p = useTokens();
  const [bg, fg] = tone === "danger" ? [p.dangerSoft, p.dangerText] : [p.accentSoft, p.accentText];
  return (
    <View style={{ alignItems: "center", gap: 14, paddingTop: 48, paddingHorizontal: 24 }}>
      <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
        <Icon icon={icon} size={28} color={fg} />
      </View>
      <Text variant="callout" tone="secondary" style={{ textAlign: "center", maxWidth: 280 }}>
        {message}
      </Text>
      {actionLabel && onAction ? <Button variant="secondary" title={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}
