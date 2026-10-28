import { CircleAlert } from "lucide-react-native";
import { View } from "react-native";
import { radius } from "../../theme/tokens";
import { useTokens } from "../../theme/use-tokens";
import { Icon } from "./Icon";
import { Text } from "./Text";

/** Inline non-field error above a form. No accent border, per the system. */
export function DangerBanner({ message }: { message: string }) {
  const p = useTokens();
  return (
    <View
      accessibilityRole="alert"
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: radius.md,
        backgroundColor: p.dangerSoft,
      }}
    >
      <Icon icon={CircleAlert} size={18} color={p.dangerText} />
      <Text variant="subhead" weight="medium" tone="danger" style={{ flex: 1 }}>
        {message}
      </Text>
    </View>
  );
}
