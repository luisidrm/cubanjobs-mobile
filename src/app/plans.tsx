import { useFocusEffect, useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Building2, Check, Copy, Hash, ImagePlus, Receipt, Sparkles, WifiOff, X } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { useGetMeQuery } from "../../store/api/usersApi";
import { useGetMyCompaniesQuery } from "../../store/api/companiesApi";
import {
  useGetMyPaymentsQuery,
  useGetPaymentDestinationQuery,
  useGetPlansQuery,
  useSubmitPaymentMutation,
} from "../../store/api/plansApi";
import {
  ACTION_BAR_CLEARANCE,
  Badge,
  Button,
  Card,
  CardSkeletons,
  EmptyState,
  GlassActionBar,
  Icon,
  IconButton,
  NavBar,
  PressableScale,
  Screen,
  SegmentedControl,
  StatusScreen,
  Text,
  TextField,
  type BadgeTone,
} from "../components/ds";
import { getErrorMessage } from "../lib/errors";
import { companyPlanExpiry, daysUntil, isEmployeePlanActive } from "../lib/plan-status";
import { showErrorToast, showSuccessToast } from "../lib/toast";
import { appendFilePart } from "../lib/upload";
import { useTokens } from "../theme/use-tokens";
import type { PaymentStatus, Plan } from "../types/plan";
import { goBack } from "../lib/navigation";

const STATUS_TONE: Record<PaymentStatus, BadgeTone> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

interface Shot {
  uri: string;
  name: string;
  mimeType: string;
  webFile?: File;
}

const fmtCup = (n: number) => n.toLocaleString();

/**
 * Pay for a plan with Transfermóvil: pick plan + duration, send the transfer,
 * report its number (required) and an optional screenshot. An admin checks it
 * and activates the plan; nothing here changes the plan by itself.
 */
export default function PlansScreen() {
  const { t, i18n } = useTranslation();
  const p = useTokens();
  const router = useRouter();

  const { data: me } = useGetMeQuery();
  const isEmployer = me?.role === "employer";
  const audience = isEmployer ? "employer" : "employee";

  const { data: plans, isLoading: plansLoading, isError: plansError, refetch: refetchPlans } = useGetPlansQuery(audience, { skip: !me });
  const { data: companies } = useGetMyCompaniesQuery(undefined, { skip: !isEmployer });
  const company = companies?.[0];
  const { data: dest } = useGetPaymentDestinationQuery(undefined, { skip: !me });
  const { data: payments, refetch: refetchPayments } = useGetMyPaymentsQuery();
  const [submitPayment, { isLoading: submitting }] = useSubmitPaymentMutation();

  const [chosenCode, setChosenCode] = useState<string | null>(null);
  const [chosenMonths, setChosenMonths] = useState(1);
  const [transferNumber, setTransferNumber] = useState("");
  const [numberError, setNumberError] = useState(false);
  const [shot, setShot] = useState<Shot | null>(null);
  const [sent, setSent] = useState(false);

  // The admin may approve while this screen is open in the background.
  useFocusEffect(
    useCallback(() => {
      void refetchPayments();
    }, [refetchPayments]),
  );

  const plan: Plan | undefined = useMemo(() => plans?.find((x) => x.code === chosenCode) ?? plans?.[0], [plans, chosenCode]);
  const months = plan?.prices.some((x) => x.months === chosenMonths) ? chosenMonths : (plan?.prices[0]?.months ?? 1);
  const price = plan?.prices.find((x) => x.months === months)?.priceCup ?? null;
  const hasPending = payments?.some((x) => x.status === "pending") ?? false;
  const lang = i18n.language?.startsWith("es") ? "es" : "en";

  // ---- current plan summary ----
  const employeeActive = isEmployeePlanActive(me);
  const currentName = isEmployer ? (company && company.planTier !== "free" ? company.planTier : null) : employeeActive ? "paid" : null;
  const expiry = isEmployer ? companyPlanExpiry(company) : (me?.planExpiresAt ?? null);
  const expiryDays = daysUntil(expiry);
  const managedByCard = isEmployer && company?.planSource === "stripe" && company.planTier !== "free";

  async function copy(value: string) {
    if (!value) return;
    await Clipboard.setStringAsync(value);
    showSuccessToast(t("plans.copied"));
  }

  async function pickScreenshot() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7 });
    if (result.canceled) return;
    const asset = result.assets[0];
    const ext = asset.mimeType?.split("/")[1] ?? "jpg";
    setShot({ uri: asset.uri, name: asset.fileName ?? `receipt.${ext}`, mimeType: asset.mimeType ?? "image/jpeg", webFile: asset.file });
  }

  async function handleSubmit() {
    if (!plan || price === null) return;
    if (transferNumber.trim().length < 4) {
      setNumberError(true);
      return;
    }
    if (isEmployer && !company) return;

    const form = new FormData();
    form.append("planCode", plan.code);
    form.append("months", String(months));
    form.append("transferNumber", transferNumber.trim());
    if (isEmployer && company) form.append("companyId", company.id);
    if (shot) await appendFilePart(form, "screenshot", shot);

    try {
      await submitPayment(form).unwrap();
      setSent(true);
      setTransferNumber("");
      setShot(null);
    } catch (err) {
      showErrorToast(getErrorMessage(err, t("plans.submitError")));
    }
  }

  if (sent) {
    return (
      <StatusScreen
        icon={Receipt}
        tone="success"
        title={t("plans.sentTitle")}
        message={t("plans.sentMessage")}
        primary={{ title: t("plans.done"), onPress: () => goBack(router) }}
      />
    );
  }

  const needsCompany = isEmployer && companies !== undefined && !company;

  return (
    <Screen safeTop={false}>
      <NavBar back title={t("plans.title")} />

      <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: ACTION_BAR_CLEARANCE, gap: 24 }}
      >
        {/* Current plan */}
        <Card padding={16} style={{ gap: 6 }}>
          <Text variant="caps" tone="tertiary">
            {t("plans.current")}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <Text variant="title2">
              {currentName
                ? (plans?.find((x) => x.code === (currentName === "paid" ? "employee_paid" : currentName))?.name ?? currentName)
                : t("plans.free")}
            </Text>
            {currentName ? <Badge tone="success" dot>{t("plans.paid")}</Badge> : <Badge tone="neutral">{t("plans.free")}</Badge>}
          </View>
          {currentName ? (
            <Text variant="subhead" tone="secondary">
              {managedByCard
                ? t("plans.cardPlan")
                : expiry
                  ? expiryDays !== null && expiryDays >= 0 && expiryDays <= 7
                    ? t("plans.expiresIn", { count: expiryDays })
                    : t("plans.activeUntil", { date: new Date(expiry).toLocaleDateString(i18n.language, { day: "numeric", month: "long", year: "numeric" }) })
                  : t("plans.noExpiry")}
            </Text>
          ) : (
            <Text variant="subhead" tone="secondary">
              {isEmployer ? t("plans.freeEmployerHint") : t("plans.freeEmployeeHint")}
            </Text>
          )}
        </Card>

        {hasPending ? (
          <Card variant="grouped" padding={14} radius={16} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Icon icon={Sparkles} size={20} color={p.accentText} />
            <Text variant="subhead" style={{ flex: 1 }}>
              {t("plans.pendingBanner")}
            </Text>
          </Card>
        ) : null}

        {plansLoading ? <CardSkeletons count={2} height={120} /> : null}

        {plansError ? (
          <EmptyState icon={WifiOff} tone="danger" message={t("plans.loadError")} actionLabel={t("jobDetails.retry")} onAction={() => refetchPlans()} />
        ) : null}

        {needsCompany ? (
          <EmptyState icon={Building2} message={t("plans.needCompany")} actionLabel={t("plans.createCompany")} onAction={() => router.push("/company-profile")} />
        ) : null}

        {plan && !needsCompany && !managedByCard ? (
          <>
            {/* Plan + duration */}
            <View style={{ gap: 12 }}>
              <Text variant="caps" tone="tertiary" style={{ paddingHorizontal: 4 }}>
                {t("plans.choosePlan")}
              </Text>

              {(plans ?? []).map((pl) => {
                const on = pl.code === plan.code;
                const cheapest = pl.prices[0];
                return (
                  <PressableScale
                    key={pl.code}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    onPress={() => setChosenCode(pl.code)}
                  >
                    <Card
                      padding={16}
                      style={{ gap: 8, borderWidth: on ? 2 : 1, borderColor: on ? p.accent : p.separator }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <Text variant="title3">{pl.name}</Text>
                        {cheapest ? (
                          <Text weight="semibold" tabular>
                            {fmtCup(cheapest.priceCup / cheapest.months)}{" "}
                            <Text mono tone="secondary" style={{ fontSize: 12 }}>
                              {t("plans.perMonthShort")}
                            </Text>
                          </Text>
                        ) : null}
                      </View>
                      {pl.audience === "employer" ? (
                        <View style={{ gap: 4 }}>
                          {[pl.jobLimit === null ? t("plans.jobsUnlimited") : t("plans.jobLimit", { count: pl.jobLimit }), pl.candidateSearch ? t("plans.candidateSearch") : null]
                            .filter(Boolean)
                            .map((line) => (
                              <View key={line} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                <Icon icon={Check} size={16} color={p.success} />
                                <Text variant="subhead" tone="secondary">
                                  {line}
                                </Text>
                              </View>
                            ))}
                        </View>
                      ) : null}
                    </Card>
                  </PressableScale>
                );
              })}

              <View style={{ gap: 8 }}>
                <Text variant="footnote" weight="medium" tone="secondary" style={{ paddingLeft: 4 }}>
                  {t("plans.duration")}
                </Text>
                <SegmentedControl<string>
                  value={String(months)}
                  onChange={(v) => setChosenMonths(Number(v))}
                  options={plan.prices.map((x) => ({ value: String(x.months), label: t("plans.month", { count: x.months }) }))}
                />
              </View>

              <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", paddingHorizontal: 4 }}>
                <Text variant="subhead" tone="secondary">
                  {t("plans.total")}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
                  <Text weight="bold" tabular style={{ fontSize: 28, lineHeight: 34 }}>
                    {price !== null ? fmtCup(price) : "—"}
                  </Text>
                  <Text mono tone="secondary" weight="medium">
                    CUP
                  </Text>
                </View>
              </View>
            </View>

            {/* How to pay */}
            <View style={{ gap: 12 }}>
              <Text variant="caps" tone="tertiary" style={{ paddingHorizontal: 4 }}>
                {t("plans.howToPay")}
              </Text>
              <Card padding={16} style={{ gap: 14 }}>
                <Text variant="subhead" tone="secondary">
                  {t("plans.stepSend")}
                </Text>
                {(
                  [
                    ["card", t("plans.card"), dest?.card],
                    ["phone", t("plans.phone"), dest?.phone],
                    ["holder", t("plans.holder"), dest?.holder],
                  ] as const
                ).map(([key, label, value]) =>
                  value ? (
                    <View key={key} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text variant="caption" tone="tertiary">
                          {label}
                        </Text>
                        <Text mono={key !== "holder"} weight="medium" selectable style={{ fontSize: 16, lineHeight: 22 }}>
                          {value}
                        </Text>
                      </View>
                      <IconButton icon={Copy} label={`${t("plans.copy")} ${label}`} variant="fill" size={40} onPress={() => void copy(value)} />
                    </View>
                  ) : null,
                )}
                {(lang === "es" ? dest?.instructionsEs : dest?.instructionsEn) ? (
                  <Text variant="footnote" tone="tertiary">
                    {lang === "es" ? dest?.instructionsEs : dest?.instructionsEn}
                  </Text>
                ) : null}
              </Card>

              <TextField
                label={t("plans.transferNumber")}
                value={transferNumber}
                onChangeText={(v) => {
                  setTransferNumber(v);
                  if (numberError) setNumberError(false);
                }}
                icon={Hash}
                placeholder={t("plans.transferNumberPlaceholder")}
                autoCapitalize="characters"
                autoCorrect={false}
                hint={t("plans.transferNumberHint")}
                error={numberError ? t("plans.transferNumberRequired") : undefined}
              />

              <View style={{ gap: 8 }}>
                <Text variant="footnote" weight="medium" tone="secondary" style={{ paddingLeft: 4 }}>
                  {t("plans.screenshot")}
                </Text>
                {shot ? (
                  <Card padding={10} radius={16} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <Image source={{ uri: shot.uri }} style={{ width: 64, height: 64, borderRadius: 10 }} />
                    <Text variant="subhead" numberOfLines={1} style={{ flex: 1 }}>
                      {shot.name}
                    </Text>
                    <IconButton icon={X} label={t("plans.removeScreenshot")} variant="fill" size={40} onPress={() => setShot(null)} />
                  </Card>
                ) : (
                  <Button variant="tinted" icon={ImagePlus} title={t("plans.addScreenshot")} onPress={pickScreenshot} block />
                )}
              </View>
            </View>
          </>
        ) : null}

        {/* History */}
        <View style={{ gap: 12 }}>
          <Text variant="caps" tone="tertiary" style={{ paddingHorizontal: 4 }}>
            {t("plans.history")}
          </Text>
          {payments && payments.length === 0 ? (
            <Text variant="subhead" tone="tertiary" style={{ paddingHorizontal: 4 }}>
              {t("plans.historyEmpty")}
            </Text>
          ) : null}
          {payments?.map((pay) => (
            <Card key={pay.id} padding={14} radius={16} style={{ gap: 6 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <Text weight="semibold">
                  {pay.planName} · {t("plans.month", { count: pay.months })}
                </Text>
                <Badge tone={STATUS_TONE[pay.status]} dot>
                  {t(`plans.status.${pay.status}`)}
                </Badge>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text mono tone="secondary" style={{ fontSize: 13 }}>
                  {pay.transferNumber}
                </Text>
                <Text variant="subhead" tabular>
                  {fmtCup(pay.amountCup)} CUP
                </Text>
              </View>
              <Text variant="footnote" tone="tertiary">
                {new Date(pay.createdAt).toLocaleDateString(i18n.language, { day: "numeric", month: "short", year: "numeric" })}
              </Text>
              {pay.status === "rejected" && pay.rejectReason ? (
                <Text variant="footnote" tone="danger">
                  {t("plans.rejectedReason", { reason: pay.rejectReason })}
                </Text>
              ) : null}
            </Card>
          ))}
        </View>
      </ScrollView>

      {plan && !needsCompany && !managedByCard ? (
        <GlassActionBar>
          <Button
            block
            size="lg"
            title={submitting ? t("plans.sending") : t("plans.submit", { amount: price !== null ? fmtCup(price) : "—" })}
            loading={submitting}
            disabled={price === null}
            onPress={handleSubmit}
          />
        </GlassActionBar>
      ) : null}
    </Screen>
  );
}
