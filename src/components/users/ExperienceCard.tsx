import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import type { WorkExperience } from "../../types/user";

interface Props {
  experience: WorkExperience;
  onEdit: () => void;
  onDelete: () => void;
}

export function ExperienceCard({ experience, onEdit, onDelete }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.title}>{experience.title}</Text>
        {experience.organization && <Text style={styles.organization}>{experience.organization}</Text>}
        {experience.description && (
          <Text style={styles.description} numberOfLines={3}>
            {experience.description}
          </Text>
        )}
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.actionButton} onPress={onEdit} hitSlop={8}>
          <Ionicons name="pencil" size={16} color={colors.textSecondary} />
        </Pressable>
        <Pressable style={styles.actionButton} onPress={onDelete} hitSlop={8}>
          <Ionicons name="trash-outline" size={16} color="#D64545" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EEEEF0",
    marginBottom: 10,
  },
  info: { flex: 1, marginRight: 10 },
  title: { fontWeight: "700", fontSize: 14, color: colors.textPrimary },
  organization: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  description: { fontSize: 13, color: colors.chipText, marginTop: 6, lineHeight: 18 },
  actions: { flexDirection: "row", gap: 12 },
  actionButton: { padding: 4 },
});
