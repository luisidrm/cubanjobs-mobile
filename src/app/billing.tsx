import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react-native";
import { ActivityIndicator, Platform, ScrollView, View } from "react-native";
import { useCreateCheckoutSessionMutation, useCreatePortalSessionMutation } from "../../store/api/billingApi";
import { useGetMyCompaniesQuery } from "../../store/api/companiesApi";
import { APP_SCHEME, STRIPE_ENABLED } from "../lib/config";
import { getErrorMessage } from "../lib/errors";
import { showErrorToast, showInfoToast } from "../lib/toast";
import { Badge, Button, Card, CardSkeletons, Icon, NavBar, Screen, Text } from "../components/ds";
import { RenewalNotice } from "../components/plans/RenewalNotice";
import { useTokens } from "../theme/use-tokens";
import type { CompanyPlan } from "../types/company";

const PAID_TIERS: readonly CompanyPlan[] = ["basic", "pro"];

// Must match how the backend picks a return URL for the same "platform"
// value (billingReturnUrl in back/src/modules/billing/billing.queries.ts) —
// openAuthSessionAsync only auto-closes the browser once it navigates to
// this exact URL, so the two sides have to agree on it.
const BILLING_PLATFORM: "web" | "native" = Platform.OS === "web" ? "web" : "native";
// `typeof window` (not a direct reference) is required here: Expo's static
// web export does a server-side render pass in Node where Platform.OS is
// already "web" but the `window` global doesn't exist at all yet — a direct
// reference throws ReferenceError during that pass, crashing the module.
const BILLING_RETURN_URL =
  Platform.OS === "web" && typeof window !== "undefined"
    ? `${window.location.origin}/billing`
    : `${APP_SCHEME}://billing`;

export default function BillingScreen() {
  const { t } = useTranslation();
  const p = useTokens();
  const router = useRouter();

  const { data: companies, isLoading, refetch } = useGetMyCompaniesQuery();
  const company = companies?.[0];
  const isOwner = company?.memberRole === "owner";

  const [createCheckoutSession] = useCreateCheckoutSessionMutation();
  const [createPortalSession] = useCreatePortalSessionMutation();
  const [busyPlan, setBusyPlan] = useState<CompanyPlan | "portal" | null>(null);

  async function afterReturn() {
    // Only the Stripe webhook actually confirms payment — the browser
    // returning here just means the session ended (success, cancel, or
    // dismiss are all treated the same). Refetch and let the real plan
    // tier speak for itself instead of assuming success.
    showInfoToast(t("billing.processing"));
    await refetch();
  }

  async function handleUpgrade(plan: "basic" | "pro") {
    if (!company) return;
    setBusyPlan(plan);
    try {
      const { url } = await createCheckoutSession({
        companyId: company.id,
        plan,
        platform: BILLING_PLATFORM,
      }).unwrap();
      await WebBrowser.openAuthSessionAsync(url, BILLING_RETURN_URL);
      await afterReturn();
    } catch (err) {
      showErrorToast(getErrorMessage(err, t("billing.checkoutError")));
    } finally {
      setBusyPlan(null);
    }
  }

  async function handleManageSubscription() {
    if (!company) return;
    setBusyPlan("portal");
    try {
      const { url } = await createPortalSession({
        companyId: company.id,
        platform: BILLING_PLATFORM,
      }).unwrap();
      await WebBrowser.openAuthSessionAsync(url, BILLING_RETURN_URL);
      await afterReturn();
    } catch (err) {
      showErrorToast(getErrorMessage(err, t("billing.portalError")));
    } finally {
      setBusyPlan(null);
    }
  }

  return (
    <Screen safeTop={false}>
      <NavBar back title={t("billing.title")} />

      {isLoading || !company ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <CardSkeletons height={140} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40, gap: 14 }}>
          <Card variant="grouped" padding={18} style={{ backgroundColor: p.accentSoft, gap: 4 }}>
            <Text variant="caps" tone="accent">
              {t("billing.currentPlanLabel")}
            </Text>
            <Text variant="title1">{t(`billing.tiers.${company.planTier}.name`)}</Text>
            <RenewalNotice company={company} />
          </Card>

          {(["free", "basic", "pro"] as const).map((tier) => {
            const isCurrent = company.planTier === tier;
            return (
              <Card
                key={tier}
                style={[{ gap: 10 }, isCurrent ? { borderColor: p.accent, borderWidth: 2 } : null]}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text variant="title3">{t(`billing.tiers.${tier}.name`)}</Text>
                  <Text variant="headline" tone="accent" mono tabular>
                    {t(`billing.tiers.${tier}.price`)}
                  </Text>
                </View>
                {(["feature1", "feature2"] as const).map((f) => (
                  <View key={f} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Icon icon={CheckCircle2} size={16} color={p.success} />
                    <Text variant="subhead" tone="secondary" style={{ flex: 1 }}>
                      {t(`billing.tiers.${tier}.${f}`)}
                    </Text>
                  </View>
                ))}

                {isCurrent ? (
                  <Badge tone="accent">{t("billing.currentPlanLabel")}</Badge>
                ) : STRIPE_ENABLED && isOwner && PAID_TIERS.includes(tier) ? (
                  <Button
                    block
                    title={t("billing.upgradeTo", { plan: t(`billing.tiers.${tier}.name`) })}
                    loading={busyPlan === tier}
                    disabled={busyPlan !== null}
                    onPress={() => handleUpgrade(tier as "basic" | "pro")}
                  />
                ) : null}
              </Card>
            );
          })}

          {isOwner ? (
            <Button block variant={STRIPE_ENABLED ? "secondary" : "primary"} title={t("plans.payTransfermovil")} onPress={() => router.push("/plans")} />
          ) : null}

          {STRIPE_ENABLED && isOwner && company.stripeCustomerId ? (
            <Button
              block
              variant="tinted"
              title={t("billing.manageSubscription")}
              loading={busyPlan === "portal"}
              disabled={busyPlan !== null}
              onPress={handleManageSubscription}
            />
          ) : null}
        </ScrollView>
      )}
    </Screen>
  );
}
