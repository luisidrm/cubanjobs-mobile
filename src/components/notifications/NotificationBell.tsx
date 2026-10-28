import { useRouter } from "expo-router";
import { Bell } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useGetUnreadCountQuery } from "../../../store/api/notificationsApi";
import { IconButton } from "../ds";

export function NotificationBell() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: count } = useGetUnreadCountQuery(undefined, { pollingInterval: 30000 });
  const unread = count ?? 0;

  return (
    <IconButton
      icon={Bell}
      label={t("notifications.title")}
      variant="glass"
      badge={unread > 0 ? (unread > 9 ? "9+" : unread) : undefined}
      onPress={() => router.push("/notifications")}
    />
  );
}
