import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import type { ApplicationWithJob } from "../../types/application";
import { StatusBadge } from "./StatusBadge";

interface Props {
  application: ApplicationWithJob;
  onPress: () => void;
  onWithdraw?: () => void;
}

export function ApplicationCard({ application, onPress, onWithdraw }: Props) {
  const { t, i18n } = useTranslation();
  const date = new Date(application.createdAt).toLocaleDateString(i18n.language, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  const canWithdraw = onWithdraw && application.status !== "withdrawn";

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.title}>{application.job.title}</Text>
          <Text style={styles.company}>{application.job.company?.name ?? ""}</Text>
        </View>
        <StatusBadge status={application.status} />
      </View>
      <View style={styles.footer}>
        <Text style={styles.date}>{t("activity.appliedOn", { date })}</Text>
        <View style={styles.footerRight}>
          {canWithdraw && (
            <Pressable onPress={onWithdraw} hitSlop={8}>
              <Text style={styles.withdrawText}>{t("activity.withdraw")}</Text>
            </Pressable>
          )}
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#EEEEF0",
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  left: { flex: 1, marginRight: 12 },
  title: { fontSize: 17, fontWeight: "700", color: colors.textPrimary },
  company: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14 },
  footerRight: { flexDirection: "row", alignItems: "center", gap: 14 },
  date: { fontSize: 13, color: colors.textMuted },
  withdrawText: { fontSize: 13, fontWeight: "700", color: "#D64545" },
});