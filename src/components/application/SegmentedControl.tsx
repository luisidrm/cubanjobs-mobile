import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";

interface Props {
  options: { key: string; label: string }[];
  value: string;
  onChange: (key: string) => void;
}

export function SegmentedControl({ options, value, onChange }: Props) {
  return (
    <View style={styles.track}>
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <Pressable
            key={opt.key}
            style={[styles.segment, active && styles.segmentActive]}
            onPress={() => onChange(opt.key)}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    backgroundColor: "#E9E9EC",
    borderRadius: 16,
    padding: 4,
  },
  segment: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  segmentActive: { backgroundColor: colors.surface },
  label: { fontWeight: "700", fontSize: 15, color: colors.textMuted },
  labelActive: { color: colors.textPrimary },
});