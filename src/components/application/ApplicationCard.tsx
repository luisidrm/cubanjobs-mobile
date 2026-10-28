import { Calendar, ChevronRight } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTokens } from "../../theme/use-tokens";
import type { ApplicationWithJob } from "../../types/application";
import { Card, Icon, PressableScale, Text } from "../ds";
import { StatusBadge } from "./StatusBadge";

interface Props {
  application: ApplicationWithJob;
  onPress: () => void;
  onWithdraw?: () => void;
}

/** Job header (tile, title, company) + status badge; hairline; 48pt footer with date and Withdraw (pending / reviewed only). */
export function ApplicationCard({ application, onPress, onWithdraw }: Props) {
  const { t, i18n } = useTranslation();
  const p = useTokens();
  const date = new Date(application.createdAt).toLocaleDateString(i18n.language, {
    month: "short",
    day: "numeric",
  });
  const canWithdraw = !!onWithdraw && (application.status === "pending" || application.status === "reviewed");

  return (
    <Card onPress={onPress} accessibilityLabel={application.job.title} padding={0} style={{ marginBottom: 14 }}>
      <View style={{ padding: 16, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: p.accentSoft, alignItems: "center", justifyContent: "center" }}>
          <Text weight="bold" tone="accent" style={{ fontSize: 18, lineHeight: 22 }}>
            {(application.job.company?.name ?? "?").charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text weight="semibold" numberOfLines={1} style={{ fontSize: 16, lineHeight: 21 }}>
            {application.job.title}
          </Text>
          <Text variant="subhead" tone="secondary" numberOfLines={1}>
            {application.job.company?.name ?? ""}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end", gap: 6 }}>
          <StatusBadge status={application.status} />
        </View>
        <Icon icon={ChevronRight} size={18} color={p.text3} />
      </View>
      <View style={{ height: 1, backgroundColor: p.separator }} />
      <View style={{ height: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingLeft: 16, paddingRight: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Icon icon={Calendar} size={14} color={p.text3} />
          <Text variant="footnote" tone="tertiary">
            {t("activity.appliedOn", { date })}
          </Text>
        </View>
        {canWithdraw ? (
          <PressableScale
            accessibilityRole="button"
            onPress={onWithdraw}
            style={{ minHeight: 44, paddingHorizontal: 12, justifyContent: "center", borderRadius: 14 }}
          >
            <Text variant="subhead" weight="semibold" tone="danger">
              {t("activity.withdraw")}
            </Text>
          </PressableScale>
        ) : null}
      </View>
    </Card>
  );
}
