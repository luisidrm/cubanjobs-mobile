import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check, Copy, ImageOff, WifiOff, X } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import {
  useApprovePaymentMutation,
  useGetAdminPaymentQuery,
  useRejectPaymentMutation,
} from "../../store/api/adminPaymentsApi";
import {
  ACTION_BAR_CLEARANCE,
  AlertDialog,
  Badge,
  Button,
  Card,
  CardSkeletons,
  EmptyState,
  GlassActionBar,
  Icon,
  IconButton,
  NavBar,
  Screen,
  Sheet,
  Text,
  TextField,
  type BadgeTone,
} from "../components/ds";
import { getErrorMessage } from "../lib/errors";
import { showErrorToast, showSuccessToast } from "../lib/toast";
import { useTokens } from "../theme/use-tokens";
import type { PaymentStatus } from "../types/plan";
import { goBack } from "../lib/navigation";

const STATUS_TONE: Record<PaymentStatus, BadgeTone> = { pending: "warning", approved: "success", rejected: "danger" };

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12, minHeight: 28 }}>
      <Text variant="subhead" tone="tertiary">
        {label}
      </Text>
      <View style={{ flexShrink: 1, alignItems: "flex-end" }}>{children}</View>
    </View>
  );
}

/** One payment to check: who, how much, the transfer number, the screenshot, and the account's current plan. */
export default function AdminPaymentScreen() {
  const { t, i18n } = useTranslation();
  const p = useTokens();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: payment, isLoading, isError, refetch } = useGetAdminPaymentQuery(id);
  const [approve, { isLoading: approving }] = useApprovePaymentMutation();
  const [reject, { isLoading: rejecting }] = useRejectPaymentMutation();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState(false);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(i18n.language, { day: "numeric", month: "short", year: "numeric" });

  async function copyNumber() {
    if (!payment) return;
    await Clipboard.setStringAsync(payment.transferNumber);
    showSuccessToast(t("adminPay.detail.copied"));
  }

  async function doApprove() {
    try {
      await approve(id).unwrap();
      showSuccessToast(t("adminPay.approvedToast"));
      goBack(router);
    } catch (err) {
      // e.g. 409 when the company has a live card subscription or it was already reviewed
      showErrorToast(getErrorMessage(err, t("plans.submitError")));
    }
  }

  async function doReject() {
    if (reason.trim().length < 3) {
      setReasonError(true);
      return;
    }
    try {
      await reject({ id, reason: reason.trim() }).unwrap();
      setRejectOpen(false);
      showSuccessToast(t("adminPay.rejectedToast"));
      goBack(router);
    } catch (err) {
      showErrorToast(getErrorMessage(err, t("plans.submitError")));
    }
  }

  const who = payment ? (payment.companyName ?? payment.payerEmail) : "";
  const pending = payment?.status === "pending";

  return (
    <Screen safeTop={false}>
      <NavBar back title={t("adminPay.detail.title")} />

      {isLoading ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <CardSkeletons count={3} height={140} />
        </View>
      ) : null}

      {isError && !isLoading ? (
        <EmptyState icon={WifiOff} tone="danger" message={t("adminPay.loadError")} actionLabel={t("jobDetails.retry")} onAction={() => refetch()} />
      ) : null}

      {payment ? (
        <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: ACTION_BAR_CLEARANCE, gap: 16 }}>
          <Card padding={16} style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
                <Text weight="bold" tabular style={{ fontSize: 32, lineHeight: 38 }}>
                  {payment.amountCup.toLocaleString()}
                </Text>
                <Text mono tone="secondary" weight="medium">
                  CUP
                </Text>
              </View>
              <Badge tone={STATUS_TONE[payment.status]} dot>
                {t(`plans.status.${payment.status}`)}
              </Badge>
            </View>
            <Row label={t("adminPay.detail.payer")}>
              <Text mono numberOfLines={1} style={{ fontSize: 13 }}>
                {payment.payerEmail}
              </Text>
            </Row>
            {payment.companyName ? (
              <Row label={t("adminPay.detail.company")}>
                <Text weight="medium">{payment.companyName}</Text>
              </Row>
            ) : null}
            <Row label={t("adminPay.detail.plan")}>
              <Text weight="medium">
                {payment.planName} · {t("plans.month", { count: payment.months })}
              </Text>
            </Row>
            <Row label={t("adminPay.detail.sent")}>
              <Text>{fmtDate(payment.createdAt)}</Text>
            </Row>
            {payment.reviewedAt ? (
              <Row label={t("adminPay.detail.reviewed")}>
                <Text>{fmtDate(payment.reviewedAt)}</Text>
              </Row>
            ) : null}
            {payment.rejectReason ? (
              <Text variant="footnote" tone="danger">
                {t("plans.rejectedReason", { reason: payment.rejectReason })}
              </Text>
            ) : null}
          </Card>

          <Card padding={16} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text variant="caps" tone="tertiary">
                {t("adminPay.detail.transfer")}
              </Text>
              <Text mono selectable weight="medium" style={{ fontSize: 18, lineHeight: 26 }}>
                {payment.transferNumber}
              </Text>
            </View>
            <IconButton icon={Copy} label={t("adminPay.detail.copy")} variant="fill" size={40} onPress={() => void copyNumber()} />
          </Card>

          <View style={{ gap: 8 }}>
            <Text variant="caps" tone="tertiary" style={{ paddingHorizontal: 4 }}>
              {t("adminPay.detail.screenshot")}
            </Text>
            {payment.screenshotUrl ? (
              <Image
                source={{ uri: payment.screenshotUrl }}
                contentFit="contain"
                accessibilityLabel={t("adminPay.detail.screenshot")}
                style={{ width: "100%", height: 420, borderRadius: 20, backgroundColor: p.fill1 }}
              />
            ) : (
              <Card variant="grouped" padding={16} radius={16} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Icon icon={ImageOff} size={18} color={p.text3} />
                <Text variant="subhead" tone="secondary">
                  {t("adminPay.detail.noScreenshot")}
                </Text>
              </Card>
            )}
          </View>

          {payment.account ? (
            <Card padding={16} style={{ gap: 8 }}>
              <Text variant="caps" tone="tertiary">
                {t("adminPay.detail.account")}
              </Text>
              <Text weight="semibold">{payment.account.label}</Text>
              <Row label={t("adminPay.detail.plan")}>
                <Text weight="medium">{payment.account.plan}</Text>
              </Row>
              <Row label={t("adminPay.detail.expiry")}>
                <Text>{payment.account.planExpiresAt ? fmtDate(payment.account.planExpiresAt) : t("adminPay.detail.none")}</Text>
              </Row>
              <Row label={t("adminPay.detail.source")}>
                <Text>{t(`adminPay.source.${payment.account.planSource}`)}</Text>
              </Row>
            </Card>
          ) : null}
        </ScrollView>
      ) : null}

      {payment && pending ? (
        <GlassActionBar>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button
              variant="destructive"
              icon={X}
              title={t("adminPay.reject")}
              onPress={() => {
                setReason("");
                setReasonError(false);
                setRejectOpen(true);
              }}
              style={{ flex: 1, alignSelf: "auto" }}
            />
            <Button icon={Check} title={t("adminPay.approve")} loading={approving} onPress={() => setConfirmOpen(true)} style={{ flex: 1, alignSelf: "auto" }} />
          </View>
        </GlassActionBar>
      ) : null}

      <AlertDialog
        open={confirmOpen}
        title={t("adminPay.approveTitle")}
        message={payment ? t("adminPay.approveMessage", { plan: payment.planName, months: t("plans.month", { count: payment.months }), who }) : ""}
        onClose={() => setConfirmOpen(false)}
        actions={[
          { label: t("jobDetails.cancel"), style: "cancel" },
          { label: t("adminPay.approve"), onPress: () => void doApprove() },
        ]}
      />

      <Sheet
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title={t("adminPay.rejectTitle")}
        footer={<Button block variant="destructive" title={t("adminPay.reject")} loading={rejecting} onPress={doReject} />}
      >
        <TextField
          value={reason}
          onChangeText={(v) => {
            setReason(v);
            if (reasonError) setReasonError(false);
          }}
          placeholder={t("adminPay.reasonPlaceholder")}
          multiline
          rows={3}
          autoFocus
          error={reasonError ? t("adminPay.reasonRequired") : undefined}
        />
      </Sheet>
    </Screen>
  );
}
