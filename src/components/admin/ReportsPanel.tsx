import { Briefcase, Building2, CheckCheck, User, WifiOff } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useGetAdminReportsQuery, useResolveReportMutation } from "../../../store/api/reportsApi";
import { showErrorToast, showSuccessToast } from "../../lib/toast";
import { useTokens } from "../../theme/use-tokens";
import type { AdminReportRow, ReportStatus, ReportTargetType } from "../../types/report";
import { Button, Card, CardSkeletons, EmptyState, Icon, SegmentedControl, Text } from "../ds";

const TARGET_ICON = { job: Briefcase, freelancer_post: User, company: Building2 } as const;

/** Reports queue: dismiss, mark as handled, or take the reported job / post down. */
export function ReportsPanel() {
  const { t, i18n } = useTranslation();
  const p = useTokens();
  const [status, setStatus] = useState<ReportStatus>("open");
  const [confirming, setConfirming] = useState<string | null>(null);
  const { data, isLoading, isError, refetch, isFetching } = useGetAdminReportsQuery(status, { pollingInterval: 60_000 });
  const [resolve, { isLoading: resolving }] = useResolveReportMutation();

  async function act(row: AdminReportRow, next: "dismissed" | "actioned", takedown: boolean) {
    try {
      await resolve({ id: row.id, status: next, takedown }).unwrap();
      showSuccessToast(t("adminReports.resolved"));
      setConfirming(null);
    } catch {
      showErrorToast(t("adminReports.resolveError"));
    }
  }

  return (
    <View style={{ gap: 14 }}>
      <SegmentedControl<ReportStatus>
        value={status}
        onChange={(s) => {
          setStatus(s);
          setConfirming(null);
        }}
        options={[
          { value: "open", label: t("adminReports.filter.open") },
          { value: "actioned", label: t("adminReports.filter.actioned") },
          { value: "dismissed", label: t("adminReports.filter.dismissed") },
        ]}
      />

      {isLoading || (isFetching && !data) ? <CardSkeletons height={140} /> : null}

      {isError ? <EmptyState icon={WifiOff} tone="danger" message={t("adminReports.loadError")} actionLabel={t("jobDetails.retry")} onAction={() => refetch()} /> : null}

      {data && data.length === 0 && !isError ? <EmptyState icon={CheckCheck} message={status === "open" ? t("adminReports.emptyOpen") : t("adminReports.empty")} /> : null}

      {data?.map((r) => {
        const TargetIcon = TARGET_ICON[r.targetType as ReportTargetType];
        const canTakeDown = r.status === "open" && r.target.exists && r.targetType !== "company";
        const date = new Date(r.createdAt).toLocaleDateString(i18n.language, { day: "numeric", month: "short" });
        return (
          <Card key={r.id} padding={14} style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: p.accentSoft, alignItems: "center", justifyContent: "center" }}>
                <Icon icon={TargetIcon} size={20} color={p.accentText} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text weight="semibold" numberOfLines={1}>
                  {r.target.title}
                </Text>
                <Text variant="footnote" tone="secondary" numberOfLines={1}>
                  {t(`adminReports.target.${r.targetType}`)}
                  {r.target.extra ? ` · ${r.target.extra}` : ""}
                </Text>
              </View>
            </View>
            <Text weight="semibold" style={{ color: p.warningText }}>
              {t(`report.reasons.${r.reason}`)}
            </Text>
            {r.note ? <Text variant="footnote">{r.note}</Text> : null}
            <Text variant="footnote" tone="tertiary">
              {t("adminReports.reportedBy", { email: r.reporterEmail })} · {date}
            </Text>
            {r.status === "open" ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                <Button title={t("adminReports.dismiss")} size="sm" variant="secondary" disabled={resolving} onPress={() => act(r, "dismissed", false)} />
                <Button title={t("adminReports.handled")} size="sm" variant="tinted" disabled={resolving} onPress={() => act(r, "actioned", false)} />
                {canTakeDown ? (
                  confirming === r.id ? (
                    <Button title={t("adminReports.confirmTakedown")} size="sm" variant="destructive" disabled={resolving} onPress={() => act(r, "actioned", true)} />
                  ) : (
                    <Button
                      title={r.targetType === "job" ? t("adminReports.closeJob") : t("adminReports.deletePost")}
                      size="sm"
                      variant="destructive"
                      disabled={resolving}
                      onPress={() => setConfirming(r.id)}
                    />
                  )
                ) : null}
              </View>
            ) : null}
          </Card>
        );
      })}
    </View>
  );
}
