import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { AccountsPanel } from "../../components/admin/AccountsPanel";
import { CompanySection, UserSection } from "../../components/admin/AdminTools";
import { MetricsPanel } from "../../components/admin/MetricsPanel";
import { PaymentsQueue } from "../../components/admin/PaymentsQueue";
import { PlansPanel } from "../../components/admin/PlansPanel";
import { NavBar, Screen, SegmentedControl } from "../../components/ds";
import { TAB_BAR_CLEARANCE } from "../../theme/tokens";

type AdminSection = "overview" | "payments" | "accounts" | "plans" | "tools";

export default function AdminScreen() {
  const { t } = useTranslation();
  const [section, setSection] = useState<AdminSection>("overview");

  return (
    <Screen safeTop={false}>
      <NavBar large title={t("tabs.admin")} />

      <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
        <SegmentedControl<AdminSection>
          size="sm"
          value={section}
          onChange={setSection}
          options={[
            { value: "overview", label: t("adminPay.tabs.overview") },
            { value: "payments", label: t("adminPay.tabs.payments") },
            { value: "accounts", label: t("adminPay.tabs.accounts") },
            { value: "plans", label: t("adminPay.tabs.plans") },
            { value: "tools", label: t("adminPay.tabs.tools") },
          ]}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: TAB_BAR_CLEARANCE, gap: 28 }}
      >
        {section === "overview" ? <MetricsPanel /> : null}
        {section === "payments" ? <PaymentsQueue /> : null}
        {section === "accounts" ? <AccountsPanel /> : null}
        {section === "plans" ? <PlansPanel /> : null}
        {section === "tools" ? (
          <>
            <CompanySection />
            <UserSection />
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
