import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "../../store/api/notificationsApi";
import { colors } from "../theme/colors";
import type { Notification } from "../types/notification";

function NotificationRow({ notification, onPress }: { notification: Notification; onPress: () => void }) {
  const { i18n } = useTranslation();
  const date = new Date(notification.createdAt).toLocaleDateString(i18n.language, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Pressable
      style={[styles.row, !notification.read && styles.rowUnread]}
      onPress={onPress}
    >
      <Text style={styles.rowTitle} numberOfLines={2}>{notification.title}</Text>
      <Text style={styles.rowBody} numberOfLines={3}>{notification.body}</Text>
      <Text style={styles.rowDate}>{date}</Text>
    </Pressable>
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
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("notifications.title")}</Text>
        <Pressable onPress={() => markAllRead()} disabled={markingAll} hitSlop={12}>
          <Text style={styles.markAllText}>{t("notifications.markAllRead")}</Text>
        </Pressable>
      </View>

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} />
        </View>
      )}

      {isError && !isLoading && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{t("notifications.error")}</Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>{t("jobDetails.retry")}</Text>
          </Pressable>
        </View>
      )}

      {!isLoading && !isError && (
        <FlatList
          data={notifications ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <NotificationRow notification={item} onPress={() => handlePressNotification(item)} />
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>{t("notifications.empty")}</Text>}
          onRefresh={refetch}
          refreshing={isLoading}
        />
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
  markAllText: { fontSize: 13, fontWeight: "700", color: colors.accent },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  errorText: { color: colors.textSecondary, fontSize: 14 },
  retryButton: { backgroundColor: colors.accent, borderRadius: 999, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: colors.surface, fontWeight: "700", fontSize: 13 },
  listContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 },
  emptyText: { textAlign: "center", color: colors.textSecondary, marginTop: 40, fontSize: 14 },
  row: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEEEF0",
  },
  rowUnread: { backgroundColor: colors.accentSoft, borderColor: colors.accentSoft },
  rowTitle: { fontSize: 15, fontWeight: "700", color: colors.textPrimary },
  rowBody: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  rowDate: { fontSize: 11, color: colors.textMuted, marginTop: 8 },
});
