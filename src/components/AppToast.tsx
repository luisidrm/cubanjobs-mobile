import { AlertCircle, Bell, CheckCircle2, type LucideIcon } from "lucide-react-native";
import { View } from "react-native";
import type { ToastConfig, ToastConfigParams } from "react-native-toast-message";
import { radius } from "../theme/tokens";
import { useTokens } from "../theme/use-tokens";
import { GlassView, Icon, Text } from "./ds";

type Kind = "success" | "error" | "info";

function ToastCard({ text1, kind, glyph }: { text1?: string; kind: Kind; glyph: LucideIcon }) {
  const p = useTokens();
  const color = kind === "success" ? p.success : kind === "error" ? p.danger : p.accent;
  return (
    <View style={{ width: "90%", maxWidth: 340 }}>
      <GlassView strength="strong" intensity={80} radius={radius.pill}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 48, paddingLeft: 14, paddingRight: 18, paddingVertical: 12 }}>
          <Icon icon={glyph} size={20} color={color} />
          <Text weight="semibold" numberOfLines={2} style={{ flex: 1, fontSize: 14, lineHeight: 19 }}>
            {text1}
          </Text>
        </View>
      </GlassView>
    </View>
  );
}

export const toastConfig: ToastConfig = {
  success: ({ text1 }: ToastConfigParams<unknown>) => <ToastCard text1={text1} kind="success" glyph={CheckCircle2} />,
  error: ({ text1 }: ToastConfigParams<unknown>) => <ToastCard text1={text1} kind="error" glyph={AlertCircle} />,
  info: ({ text1 }: ToastConfigParams<unknown>) => <ToastCard text1={text1} kind="info" glyph={Bell} />,
};
