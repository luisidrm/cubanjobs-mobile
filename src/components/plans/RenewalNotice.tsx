import { CalendarClock } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { daysUntil, isExpiringSoon } from "../../lib/plan-status";
import { useTokens } from "../../theme/use-tokens";
import type { Company } from "../../types/company";
import { Icon, Text } from "../ds";

/** When the company's next payment is due: Stripe renewal date, or the Transfermóvil/manual expiry. */
export function companyNextPaymentDate(c: Pick<Company, "planTier" | "planSource" | "planExpiresAt" | "currentPeriodEnd">): string | null {
  if (c.planTier === "free") return null;
  return c.planSource === "stripe" ? c.currentPeriodEnd : c.planExpiresAt;
}

/**
 * "Next payment: 12 Nov (in 20 days)". Members never see dates (the API hides them), so they
 * get a pointer to the owner instead. Turns amber inside the 3-day reminder window.
 */
export function RenewalNotice({ company }: { company: Company }) {
  const { t, i18n } = useTranslation();
  const p = useTokens();

  if (company.planTier === "free") return null;

  if (company.memberRole !== "owner") {
    return (
      <Text variant="subhead" tone="secondary">
        {t("billing.ownerOnly")}
      </Text>
    );
  }

  const date = companyNextPaymentDate(company);
  if (!date) {
    return (
      <Text variant="subhead" tone="secondary">
        {t("billing.noExpiry")}
      </Text>
    );
  }

  const days = daysUntil(date) ?? 0;
  const soon = isExpiringSoon(date);
  const when = new Date(date).toLocaleDateString(i18n.language, { day: "numeric", month: "long", year: "numeric" });
  const rel = days <= 0 ? t("billing.today") : t("billing.inDays", { count: days });
  const stripe = company.planSource === "stripe";

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Icon icon={CalendarClock} size={16} color={soon ? p.warningText : p.text2} />
      <Text variant="subhead" weight={soon ? "semibold" : "regular"} style={{ color: soon ? p.warningText : p.text2, flexShrink: 1 }}>
        {stripe ? t("billing.nextPaymentOn", { date: when }) : t("billing.expiresOn", { date: when })} · {rel}
      </Text>
    </View>
  );
}
