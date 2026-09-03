import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useGetUnreadCountQuery } from "../../../store/api/notificationsApi";
import { colors } from "../../theme/colors";

export function NotificationBell() {
  const router = useRouter();
  const { data: count } = useGetUnreadCountQuery(undefined, { pollingInterval: 30000 });
  const unread = count ?? 0;

  return (
    <Pressable onPress={() => router.push("/notifications")} hitSlop={8}>
      <Ionicons name="notifications-outline" size={26} color={colors.textPrimary} />
      {unread > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unread > 9 ? "9+" : unread}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: colors.error,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: "800",
  },
});
