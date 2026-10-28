import { useRouter } from "expo-router";
import { Building2, CheckCheck, ChevronRight, ImageIcon, WifiOff } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useGetAdminPaymentsQuery } from "../../../store/api/adminPaymentsApi";
import { useTokens } from "../../theme/use-tokens";
import type { AdminPaymentRow } from "../../types/admin-payments";
import type { PaymentStatus } from "../../types/plan";
import { Card, CardSkeletons, EmptyState, Icon, SegmentedControl, Text } from "../ds";

export function PaymentRow({ payment, onPress }: { payment: AdminPaymentRow; onPress: () => void }) {
  const { t, i18n } = useTranslation();
  const p = useTokens();
  const who = payment.companyName ?? payment.payerEmail;
  const date = new Date(payment.createdAt).toLocaleDateString(i18n.language, { day: "numeric", month: "short" });
  return (
    <Card onPress={onPress} accessibilityLabel={who} padding={14} style={{ gap: 10, marginBottom: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: p.accentSoft, alignItems: "center", justifyContent: "center" }}>
          <Icon icon={payment.audience === "employer" ? Building2 : CheckCheck} size={20} color={p.accentText} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text weight="semibold" numberOfLines={1}>
            {who}
          </Text>
          <Text variant="footnote" tone="secondary" numberOfLines={1}>
            {payment.planName} · {t("plans.month", { count: payment.months })}
          </Text>
        </View>
        <Icon icon={ChevronRight} size={18} color={p.text3} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
          <Text weight="bold" tabular style={{ fontSize: 18, lineHeight: 24 }}>
            {payment.amountCup.toLocaleString()}
          </Text>
          <Text mono tone="secondary" style={{ fontSize: 12 }}>
            CUP
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {payment.hasScreenshot ? <Icon icon={ImageIcon} size={16} color={p.text3} /> : null}
          <Text variant="footnote" tone="tertiary">
            {date}
          </Text>
        </View>
      </View>
      <Text mono tone="secondary" numberOfLines={1} style={{ fontSize: 13 }}>
        {payment.transferNumber}
      </Text>
    </Card>
  );
}

/** The review queue: Pending (oldest first), Approved and Rejected history. */
export function PaymentsQueue() {
  const { t } = useTranslation();
  const router = useRouter();
  const [status, setStatus] = useState<PaymentStatus>("pending");
  const { data, isLoading, isError, refetch, isFetching } = useGetAdminPaymentsQuery(status, { pollingInterval: 60_000 });

  return (
    <View style={{ gap: 14 }}>
      <SegmentedControl<PaymentStatus>
        value={status}
        onChange={setStatus}
        options={[
          { value: "pending", label: `${t("adminPay.filter.pending")}${data && status === "pending" && data.pending > 0 ? ` (${data.pending})` : ""}` },
          { value: "approved", label: t("adminPay.filter.approved") },
          { value: "rejected", label: t("adminPay.filter.rejected") },
        ]}
      />

      {isLoading || (isFetching && !data) ? <CardSkeletons height={120} /> : null}

      {isError ? (
        <EmptyState icon={WifiOff} tone="danger" message={t("adminPay.loadError")} actionLabel={t("jobDetails.retry")} onAction={() => refetch()} />
      ) : null}

      {data && data.items.length === 0 && !isError ? (
        <EmptyState icon={CheckCheck} message={status === "pending" ? t("adminPay.emptyPending") : t("adminPay.emptyList")} />
      ) : null}

      <View>
        {data?.items.map((payment) => (
          <PaymentRow key={payment.id} payment={payment} onPress={() => router.push({ pathname: "/admin-payment", params: { id: payment.id } })} />
        ))}
      </View>
    </View>
  );
}
