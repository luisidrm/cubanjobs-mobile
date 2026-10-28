import type { ReactNode } from "react";
import { View } from "react-native";
import { radius } from "../../theme/tokens";
import { useTokens } from "../../theme/use-tokens";
import { Text } from "./Text";

export type BadgeTone = "success" | "info" | "warning" | "danger" | "neutral" | "accent";

export interface BadgeProps {
  tone?: BadgeTone;
  dot?: boolean;
  size?: "sm" | "md";
  children: ReactNode;
}

/** Pill status label. Application status: pending=warning, reviewed=info, accepted=success, rejected=danger, withdrawn=neutral. */
export function Badge({ tone = "neutral", dot, size = "md", children }: BadgeProps) {
  const p = useTokens();
  const [bg, fg] = {
    success: [p.successSoft, p.successText],
    info: [p.infoSoft, p.infoText],
    warning: [p.warningSoft, p.warningText],
    danger: [p.dangerSoft, p.dangerText],
    neutral: [p.fill1, p.text2],
    accent: [p.accent, p.onAccent],
  }[tone];
  const sm = size === "sm";
  return (
    <View
      style={{
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        height: sm ? 20 : 24,
        paddingHorizontal: sm ? 8 : 10,
        borderRadius: radius.pill,
        backgroundColor: bg,
      }}
    >
      {dot ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: fg }} /> : null}
      <Text weight="semibold" style={{ fontSize: sm ? 11 : 12, lineHeight: sm ? 13 : 14, color: fg }}>
        {children}
      </Text>
    </View>
  );
}
