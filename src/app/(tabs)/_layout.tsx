import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { useGetMeQuery } from "../../../store/api/usersApi";
import { colors } from "../../theme/colors";

// Session gating for this whole group is handled once, globally, by
// AuthGate in the root layout — no need to re-check status here.
// Role, unlike session status, isn't known synchronously, so this layout
// waits on getMe before deciding which tab set to render.
export default function TabsLayout() {
  const { t } = useTranslation();
  const { data: me, isLoading } = useGetMeQuery();

  if (isLoading || !me) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const isEmployer = me.role === "employer";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarActiveBackgroundColor: colors.surface,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: "#EEEEF0",
        },
      }}
    >
      <Tabs.Screen
        name="jobs"
        options={{
          href: isEmployer ? null : undefined,
          title: t("tabs.explore"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          href: isEmployer ? null : undefined,
          title: t("tabs.activity"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-jobs"
        options={{
          href: isEmployer ? undefined : null,
          title: t("tabs.myJobs"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}