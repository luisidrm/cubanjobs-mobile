import { Redirect, Tabs } from "expo-router";
import { Building2, Compass, Factory, Handshake, ListChecks, ShieldCheck, User, UserPlus, Users } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { useGetAdminPaymentsQuery } from "../../../store/api/adminPaymentsApi";
import { useGetMeQuery } from "../../../store/api/usersApi";
import { FloatingTabBar, type FloatingTabBarProps, type TabIcons } from "../../components/ds";
import { useTokens } from "../../theme/use-tokens";

const TAB_ICONS: TabIcons = {
  jobs: Compass,
  activity: ListChecks,
  "my-jobs": Building2,
  "explore-workers": Users,
  team: UserPlus,
  companies: Factory,
  freelancers: Handshake,
  admin: ShieldCheck,
  profile: User,
};

// Session gating for this whole group is handled once, globally, by
// AuthGate in the root layout — no need to re-check status here.
// Role, unlike session status, isn't known synchronously, so this layout
// waits on getMe before deciding which tab set to render.
export default function TabsLayout() {
  const { t } = useTranslation();
  const p = useTokens();
  const { data: me, isLoading } = useGetMeQuery();
  // Admin tab badge: payments waiting for review (refreshes every minute).
  const { data: pendingPayments } = useGetAdminPaymentsQuery("pending", { skip: me?.role !== "admin", pollingInterval: 60_000 });
  const pendingCount = pendingPayments?.pending ?? 0;

  if (isLoading || !me) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: p.bgApp }}>
        <ActivityIndicator color={p.accent} />
      </View>
    );
  }

  const isEmployer = me.role === "employer";
  const isAdmin = me.role === "admin";

  if (!isAdmin && !me.onboardingCompletedAt) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...(props as unknown as FloatingTabBarProps)} icons={TAB_ICONS} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="jobs" options={{ href: isEmployer || isAdmin ? null : undefined, title: t("tabs.explore") }} />
      <Tabs.Screen name="companies" options={{ href: isEmployer || isAdmin ? null : undefined, title: t("tabs.companies") }} />
      <Tabs.Screen name="activity" options={{ href: isEmployer || isAdmin ? null : undefined, title: t("tabs.activity") }} />
      <Tabs.Screen name="my-jobs" options={{ href: isEmployer ? undefined : null, title: t("tabs.myJobs") }} />
      <Tabs.Screen name="explore-workers" options={{ href: isEmployer ? undefined : null, title: t("tabs.exploreWorkers") }} />
      <Tabs.Screen name="team" options={{ href: isEmployer ? undefined : null, title: t("tabs.team") }} />
      <Tabs.Screen name="admin" options={{ href: isAdmin ? undefined : null, title: t("tabs.admin"), tabBarBadge: pendingCount > 0 ? pendingCount : undefined }} />
      <Tabs.Screen name="freelancers" options={{ href: isAdmin ? null : undefined, title: t("tabs.freelancers") }} />
      <Tabs.Screen name="profile" options={{ title: t("tabs.profile") }} />
    </Tabs>
  );
}
