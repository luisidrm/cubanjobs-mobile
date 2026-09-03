import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import { SkillChip } from "../users/SkillChip";
import type { WorkerSummary } from "../../types/user";

interface Props {
  worker: WorkerSummary;
  onPress: () => void;
}

export function WorkerCard({ worker, onPress }: Props) {
  const name = [worker.firstName, worker.lastName].filter(Boolean).join(" ") || "?";

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={1}>
            {name}
          </Text>
          {worker.location && (
            <Text style={styles.location} numberOfLines={1}>
              📍 {worker.location}
            </Text>
          )}
        </View>
      </View>

      {worker.bio && (
        <Text style={styles.bio} numberOfLines={2}>
          {worker.bio}
        </Text>
      )}

      {worker.skills.length > 0 && (
        <View style={styles.skillsRow}>
          {worker.skills.slice(0, 3).map((s) => (
            <SkillChip key={s.id} label={s.skill} />
          ))}
        </View>
      )}
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
  row: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F1F1F3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: { fontSize: 20, fontWeight: "700", color: colors.textPrimary },
  titleBlock: { flex: 1 },
  title: { fontSize: 17, fontWeight: "700", color: colors.textPrimary },
  location: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  bio: { fontSize: 14, color: colors.textSecondary, marginTop: 12 },
  skillsRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 12, marginBottom: -10 },
});
