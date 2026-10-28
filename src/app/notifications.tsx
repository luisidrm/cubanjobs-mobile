import { useRouter } from "expo-router";
import { Bell, BellOff, WifiOff } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, View } from "react-native";
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "../../store/api/notificationsApi";
import { Button, Card, CardSkeletons, EmptyState, Icon, NavBar, PressableScale, Screen, Text } from "../components/ds";
import { useTokens } from "../theme/use-tokens";
import type { Notification } from "../types/notification";

function NotificationRow({ notification, onPress }: { notification: Notification; onPress: () => void }) {
  const { i18n } = useTranslation();
  const p = useTokens();
  const date = new Date(notification.createdAt).toLocaleDateString(i18n.language, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <PressableScale accessibilityRole="button" onPress={onPress} style={{ marginBottom: 10 }}>
      <Card variant={notification.read ? "solid" : "grouped"} padding={14} radius={18} style={notification.read ? undefined : { backgroundColor: p.accentSoft }}>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: notification.read ? p.fill1 : p.accent,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon icon={Bell} size={18} color={notification.read ? p.text2 : p.onAccent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="headline" numberOfLines={2}>
              {notification.title}
            </Text>
            <Text variant="subhead" tone="secondary" numberOfLines={3}>
              {notification.body}
            </Text>
            <Text variant="caption" tone="tertiary" style={{ marginTop: 6 }}>
              {date}
            </Text>
          </View>
        </View>
      </Card>
    </PressableScale>
  );
}

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: notifications, isLoading, isError, refetch } = useGetNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();

  function handlePressNotification(notification: Notification) {
    if (!notification.read) markRead(notification.id);
    if (/^(plan_|payment_)/.test(notification.type)) router.push("/plans");
  }

  return (
    <Screen safeTop={false}>
      <NavBar
        back
        title={t("notifications.title")}
        trailing={<Button size="sm" variant="plain" title={t("notifications.markAllRead")} loading={markingAll} onPress={() => markAllRead()} />}
      />

      {isLoading ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <CardSkeletons height={84} />
        </View>
      ) : null}

      {isError && !isLoading ? (
        <EmptyState icon={WifiOff} tone="danger" message={t("notifications.error")} actionLabel={t("jobDetails.retry")} onAction={() => refetch()} />
      ) : null}

      {!isLoading && !isError ? (
        <FlatList showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
          data={notifications ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
          renderItem={({ item }) => <NotificationRow notification={item} onPress={() => handlePressNotification(item)} />}
          ListEmptyComponent={<EmptyState icon={BellOff} message={t("notifications.empty")} />}
          onRefresh={refetch}
          refreshing={isLoading}
        />
      ) : null}
    </Screen>
  );
}
