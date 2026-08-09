import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import type { Job } from "../../types/job";

interface Props {
  job: Job;
  onPress: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

function formatSalary(min: number | null, max: number | null) {
  if (min == null && max == null) return null;
  const fmt = (n: number) => n.toLocaleString();
  if (min != null && max != null) return `${fmt(min)} - ${fmt(max)}`;
  return fmt((min ?? max) as number);
}

export function JobCard({ job, onPress, isSaved, onToggleSave }: Props) {
  const { t } = useTranslation();
  const salary = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(job.company?.name ?? "?").charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={1}>
            {job.title}
          </Text>
          <Text style={styles.company} numberOfLines={1}>
            {job.company?.name ?? ""}
          </Text>
        </View>

        {job.isRemote && (
          <View style={styles.remotePill}>
            <Text style={styles.remoteText}>🌐 {t("explore.remote").toUpperCase()}</Text>
          </View>
        )}

        {onToggleSave && (
          <Pressable style={styles.saveButton} onPress={onToggleSave} hitSlop={8}>
            <Ionicons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={20}
              color={isSaved ? colors.accent : colors.textMuted}
            />
          </Pressable>
        )}
      </View>

      <View style={styles.metaRow}>
        {salary && (
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>$</Text>
            <Text style={styles.metaValue}>{salary}</Text>
            {job.currency && <Text style={styles.currency}> {job.currency}</Text>}
          </View>
        )}
        {job.location && (
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>📍</Text>
            <Text style={styles.metaLocation}>{job.location}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EEEEF0",
  },
  row: { flexDirection: "row", alignItems: "flex-start" },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#F1F1F3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: { fontSize: 20, fontWeight: "700", color: colors.textPrimary },
  titleBlock: { flex: 1 },
  title: { fontSize: 17, fontWeight: "700", color: colors.textPrimary },
  company: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  remotePill: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  remoteText: { fontSize: 11, fontWeight: "700", color: colors.accent },
  saveButton: { marginLeft: 10, padding: 2 },
  metaRow: { flexDirection: "row", marginTop: 14, gap: 18 },
  metaItem: { flexDirection: "row", alignItems: "center" },
  metaIcon: { marginRight: 6, fontSize: 13 },
  metaValue: { fontWeight: "700", fontSize: 14, color: colors.textPrimary },
  currency: { fontWeight: "700", fontSize: 14, color: colors.accent },
  metaLocation: { fontSize: 14, color: colors.textSecondary },
});