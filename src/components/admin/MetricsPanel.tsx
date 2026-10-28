import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { useGetAdminMetricsQuery } from "../../../store/api/adminPaymentsApi";
import { useTokens } from "../../theme/use-tokens";
import type { AdminMetrics } from "../../types/admin-payments";
import { Card, EmptyState, Text } from "../ds";
import { WifiOff } from "lucide-react-native";

function Figure({ label, value, sub, strong }: { label: string; value: string; sub?: string; strong?: boolean }) {
  return (
    <View style={{ flex: 1, minWidth: 130, gap: 2 }}>
      <Text variant="footnote" tone="secondary">
        {label}
      </Text>
      <Text weight="semibold" tone={strong ? "accent" : undefined} numberOfLines={1} style={{ fontSize: strong ? 26 : 20, lineHeight: strong ? 32 : 26 }}>
        {value}
      </Text>
      {sub ? (
        <Text variant="footnote" tone="tertiary">
          {sub}
        </Text>
      ) : null}
    </View>
  );
}

function Bar({ label, value, max, display }: { label: string; value: number; max: number; display: string }) {
  const p = useTokens();
  const pct = max > 0 ? Math.max((value / max) * 100, value > 0 ? 3 : 0) : 0;
  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
        <Text variant="subhead" numberOfLines={1} style={{ flexShrink: 1 }}>
          {label}
        </Text>
        <Text variant="subhead" weight="medium">
          {display}
        </Text>
      </View>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: p.fill2, overflow: "hidden" }}>
        <View style={{ height: 8, width: `${pct}%`, borderRadius: 4, backgroundColor: p.accent }} />
      </View>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card padding={16} style={{ gap: 16 }}>
      <Text variant="headline" weight="semibold">
        {title}
      </Text>
      {children}
    </Card>
  );
}

function monthLabel(key: string, locale: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, 1)).toLocaleDateString(locale, { month: "short", timeZone: "UTC" });
}

function Loaded({ m }: { m: AdminMetrics }) {
  const { t, i18n } = useTranslation();
  const n = (v: number) => v.toLocaleString(i18n.language);
  const cup = (v: number) => `${n(v)} CUP`;
  const r = m.revenue;
  const maxMonth = Math.max(...r.byMonth.map((x) => x.amountCup), 0);
  const maxPlan = Math.max(...r.byPlan.map((x) => x.amountCup), 0);
  const empTotal = m.plans.employees.free + m.plans.employees.paid;
  const coTotal = m.plans.companies.free + m.plans.companies.basic + m.plans.companies.pro;
  const row = { flexDirection: "row", flexWrap: "wrap", gap: 16 } as const;

  return (
    <View style={{ gap: 16 }}>
      <Section title={t("adminPay.metrics.users")}>
        <View style={row}>
          <Figure label={t("adminPay.metrics.totalUsers")} value={n(m.users.total)} strong />
          <Figure label={t("adminPay.metrics.employees")} value={n(m.users.employees)} />
        </View>
        <View style={row}>
          <Figure label={t("adminPay.metrics.employers")} value={n(m.users.employers)} />
          <Figure label={t("adminPay.metrics.newWeek")} value={n(m.users.newLast7Days)} sub={`${t("adminPay.metrics.newMonth")}: ${n(m.users.newLast30Days)}`} />
        </View>
      </Section>

      <Section title={t("adminPay.metrics.platforms")}>
        <View style={row}>
          <Figure
            label={`${t("adminPay.metrics.web")} · ${t("adminPay.metrics.activeIn", { days: m.platforms.activeDays })}`}
            value={n(m.platforms.web.activeLast30Days)}
            sub={`${t("adminPay.metrics.seenSoFar")}: ${n(m.platforms.web.everSeen)}`}
            strong
          />
          <Figure
            label={`${t("adminPay.metrics.app")} · ${t("adminPay.metrics.activeIn", { days: m.platforms.activeDays })}`}
            value={n(m.platforms.app.activeLast30Days)}
            sub={`${t("adminPay.metrics.seenSoFar")}: ${n(m.platforms.app.everSeen)}`}
            strong
          />
        </View>
        <Figure label={t("adminPay.metrics.both")} value={n(m.platforms.both)} />
        <Text variant="footnote" tone="tertiary">
          {t("adminPay.metrics.trackingNote")}
        </Text>
      </Section>

      <Section title={t("adminPay.metrics.plans")}>
        <Text variant="footnote" weight="medium" tone="secondary">
          {t("adminPay.metrics.employeePlans")}
        </Text>
        <Bar label={t("adminPay.metrics.free")} value={m.plans.employees.free} max={empTotal} display={n(m.plans.employees.free)} />
        <Bar label={t("adminPay.metrics.paid")} value={m.plans.employees.paid} max={empTotal} display={n(m.plans.employees.paid)} />
        <Text variant="footnote" weight="medium" tone="secondary" style={{ marginTop: 4 }}>
          {t("adminPay.metrics.companyPlans")}
        </Text>
        {(["free", "basic", "pro"] as const).map((tier) => (
          <Bar key={tier} label={t(`adminPay.metrics.${tier}`)} value={m.plans.companies[tier]} max={coTotal} display={n(m.plans.companies[tier])} />
        ))}
      </Section>

      <Section title={t("adminPay.metrics.revenue")}>
        <View style={row}>
          <Figure label={t("adminPay.metrics.totalRevenue")} value={cup(r.totalCup)} sub={t("adminPay.metrics.approvedCount", { count: r.approvedCount })} strong />
          <Figure label={t("adminPay.metrics.last30")} value={cup(r.last30DaysCup)} />
        </View>
        <View style={row}>
          <Figure label={t("adminPay.metrics.thisMonth")} value={cup(r.thisMonthCup)} />
          <Figure label={t("adminPay.metrics.waiting")} value={cup(r.pendingCup)} sub={n(r.pendingCount)} />
        </View>

        {r.approvedCount === 0 ? (
          <Text variant="subhead" tone="secondary">
            {t("adminPay.metrics.noRevenue")}
          </Text>
        ) : (
          <>
            <Text variant="footnote" weight="medium" tone="secondary">
              {t("adminPay.metrics.byMonth")}
            </Text>
            {r.byMonth.map((x) => (
              <Bar key={x.month} label={monthLabel(x.month, i18n.language)} value={x.amountCup} max={maxMonth} display={cup(x.amountCup)} />
            ))}
            <Text variant="footnote" weight="medium" tone="secondary" style={{ marginTop: 4 }}>
              {t("adminPay.metrics.byPlan")}
            </Text>
            {r.byPlan.map((x) => (
              <Bar key={x.code} label={`${x.name} (${x.count})`} value={x.amountCup} max={maxPlan} display={cup(x.amountCup)} />
            ))}
          </>
        )}
        <Text variant="footnote" tone="tertiary">
          {t("adminPay.metrics.stripeNote")}
        </Text>
      </Section>
    </View>
  );
}

/** Admin overview: people per client, per plan, and money received. */
export function MetricsPanel() {
  const { t } = useTranslation();
  const p = useTokens();
  const { data, isLoading, isError, refetch } = useGetAdminMetricsQuery(undefined, { pollingInterval: 120_000 });

  if (isLoading) return <ActivityIndicator color={p.accent} style={{ marginTop: 24 }} />;
  if (isError || !data) {
    return <EmptyState icon={WifiOff} tone="danger" message={t("adminPay.metrics.loadError")} actionLabel={t("freelancers.retry")} onAction={() => refetch()} />;
  }
  return <Loaded m={data} />;
}
