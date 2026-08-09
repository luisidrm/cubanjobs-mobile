import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { colors } from "../../theme/colors";

interface BaseProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}

export function SettingsToggleRow({
  icon, title, subtitle, value, onChange,
}: BaseProps & { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <RowLeft icon={icon} title={title} subtitle={subtitle} />
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.accent, false: "#E2E2E6" }}
      />
    </View>
  );
}

export function SettingsLinkRow({
  icon, title, subtitle, onPress,
}: BaseProps & { onPress: () => void }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <RowLeft icon={icon} title={title} subtitle={subtitle} />
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

function RowLeft({ icon, title, subtitle }: BaseProps) {
  return (
    <View style={styles.left}>
      <View style={styles.iconBadge}>
        <Ionicons name={icon} size={18} color={colors.textPrimary} />
      </View>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F2",
  },
  left: { flexDirection: "row", alignItems: "center", gap: 14 },
  iconBadge: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "#F1F1F3", alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 15, fontWeight: "700", color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
});