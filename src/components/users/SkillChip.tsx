import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";

export function SkillChip({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.text}>{label}</Text>
      {onRemove && (
        <Pressable onPress={onRemove} hitSlop={8} style={styles.removeButton}>
          <Ionicons name="close" size={14} color={colors.textSecondary} />
        </Pressable>
      )}
    </View>
  );
}

export function AddSkillChip({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.addChip} onPress={onPress}>
      <Ionicons name="add" size={16} color={colors.textSecondary} />
      <Text style={styles.addText}>Add skill</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E9EEF5",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  text: { fontWeight: "700", fontSize: 14, color: colors.textPrimary },
  removeButton: { marginLeft: 2 },
  addChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.chipBorder,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  addText: { fontWeight: "700", fontSize: 14, color: colors.textSecondary },
});