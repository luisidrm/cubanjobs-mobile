import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useCreateCheckoutSessionMutation, useCreatePortalSessionMutation } from "../../store/api/billingApi";
import { useGetMyCompaniesQuery } from "../../store/api/companiesApi";
import { getErrorMessage } from "../lib/errors";
import { showErrorToast, showInfoToast } from "../lib/toast";
import { colors } from "../theme/colors";
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
    : "mobile://billing";

export default function BillingScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const { data: companies, isLoading, refetch } = useGetMyCompaniesQuery();
  const company = companies?.[0];

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
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("billing.title")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading || !company ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.currentPlanCard}>
            <Text style={styles.currentPlanLabel}>{t("billing.currentPlanLabel")}</Text>
            <Text style={styles.currentPlanName}>{t(`billing.tiers.${company.planTier}.name`)}</Text>
            {company.currentPeriodEnd && company.planTier !== "free" && (
              <Text style={styles.renewsOn}>
                {t("billing.renewsOn", { date: new Date(company.currentPeriodEnd).toLocaleDateString() })}
              </Text>
            )}
          </View>

          {(["free", "basic", "pro"] as const).map((tier) => (
            <View key={tier} style={[styles.tierCard, company.planTier === tier && styles.tierCardActive]}>
              <View style={styles.tierHeader}>
                <Text style={styles.tierName}>{t(`billing.tiers.${tier}.name`)}</Text>
                <Text style={styles.tierPrice}>{t(`billing.tiers.${tier}.price`)}</Text>
              </View>
              <View style={styles.tierFeature}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.tierFeatureText}>{t(`billing.tiers.${tier}.feature1`)}</Text>
              </View>
              <View style={styles.tierFeature}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.tierFeatureText}>{t(`billing.tiers.${tier}.feature2`)}</Text>
              </View>

              {company.planTier === tier ? (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>{t("billing.currentPlanLabel")}</Text>
                </View>
              ) : (
                PAID_TIERS.includes(tier) && (
                  <Pressable
                    style={styles.upgradeButton}
                    onPress={() => handleUpgrade(tier as "basic" | "pro")}
                    disabled={busyPlan !== null}
                  >
                    {busyPlan === tier ? (
                      <ActivityIndicator color={colors.surface} />
                    ) : (
                      <Text style={styles.upgradeButtonText}>
                        {t("billing.upgradeTo", { plan: t(`billing.tiers.${tier}.name`) })}
                      </Text>
                    )}
                  </Pressable>
                )
              )}
            </View>
          ))}

          {company.stripeCustomerId && (
            <Pressable
              style={styles.manageButton}
              onPress={handleManageSubscription}
              disabled={busyPlan !== null}
            >
              {busyPlan === "portal" ? (
                <ActivityIndicator color={colors.textPrimary} />
              ) : (
                <Text style={styles.manageButtonText}>{t("billing.manageSubscription")}</Text>
              )}
            </Pressable>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: colors.surface,
  },
  headerTitle: { fontSize: 17, fontWeight: "800", color: colors.textPrimary, fontFamily: "InstrumentSerif_400Regular" },
  headerSpacer: { width: 26 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  body: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  currentPlanCard: {
    backgroundColor: colors.accentSoft, borderRadius: 18, padding: 18, marginBottom: 20,
  },
  currentPlanLabel: { fontSize: 12, fontWeight: "700", color: colors.textSecondary },
  currentPlanName: { fontSize: 22, fontWeight: "800", color: colors.textPrimary, marginTop: 4 },
  renewsOn: { fontSize: 13, color: colors.textSecondary, marginTop: 6 },
  tierCard: {
    backgroundColor: colors.surface, borderRadius: 18, padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: "#EEEEF0",
  },
  tierCardActive: { borderColor: colors.accent, borderWidth: 2 },
  tierHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  tierName: { fontSize: 17, fontWeight: "800", color: colors.textPrimary },
  tierPrice: { fontSize: 15, fontWeight: "700", color: colors.accent, fontFamily: "IBMPlexMono_600SemiBold" },
  tierFeature: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  tierFeatureText: { fontSize: 13, color: colors.textSecondary },
  currentBadge: {
    alignSelf: "flex-start", backgroundColor: colors.accentSoft, borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 6, marginTop: 10,
  },
  currentBadgeText: { fontSize: 12, fontWeight: "700", color: colors.textPrimary },
  upgradeButton: {
    backgroundColor: colors.accent, borderRadius: 999, paddingVertical: 12,
    alignItems: "center", marginTop: 10,
  },
  upgradeButtonText: { color: colors.surface, fontWeight: "800", fontSize: 14 },
  manageButton: {
    borderWidth: 1, borderColor: colors.chipBorder, borderRadius: 999, paddingVertical: 14,
    alignItems: "center", marginTop: 6,
  },
  manageButtonText: { color: colors.textPrimary, fontWeight: "700", fontSize: 14 },
});
