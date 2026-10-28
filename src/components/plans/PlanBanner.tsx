import { useRouter } from "expo-router";
import { CalendarClock } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useGetMyCompaniesQuery } from "../../../store/api/companiesApi";
import { useGetMeQuery } from "../../../store/api/usersApi";
import { companyPlanExpiry, isExpiringSoon } from "../../lib/plan-status";
import { useTokens } from "../../theme/use-tokens";
import { Button, Card, Icon, Text } from "../ds";

/**
 * "Your plan expires soon" notice for paid accounts whose Transfermóvil/manual
 * plan ends within 3 days. Renders nothing otherwise (free, open-ended, or
 * card-managed plans never lapse by date).
 */
export function PlanBanner() {
  const { t, i18n } = useTranslation();
  const p = useTokens();
  const router = useRouter();
  const { data: me } = useGetMeQuery();
  const { data: companies } = useGetMyCompaniesQuery(undefined, { skip: me?.role !== "employer" });

  const expiry =
    me?.role === "employer" ? companyPlanExpiry(companies?.[0]) : me?.plan === "paid" ? me.planExpiresAt : null;

  if (!isExpiringSoon(expiry) || !expiry) return null;

  const date = new Date(expiry).toLocaleDateString(i18n.language, { day: "numeric", month: "long" });

  return (
    <Card padding={14} radius={16}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: p.warningSoft, alignItems: "center", justifyContent: "center" }}>
          <Icon icon={CalendarClock} size={20} color={p.warningText} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="subhead" weight="semibold">
            {t("plans.bannerExpiringTitle")}
          </Text>
          <Text variant="footnote" tone="secondary">
            {t("plans.bannerExpiringBody", { date })}
          </Text>
        </View>
        <Button size="sm" variant="secondary" title={t("plans.renew")} onPress={() => router.push("/plans")} />
      </View>
    </Card>
  );
}
