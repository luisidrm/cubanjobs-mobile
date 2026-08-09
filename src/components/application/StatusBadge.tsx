import { StyleSheet, Text, View } from "react-native";
import type { ApplicationStatus } from "../../types/application";

const STATUS_STYLE: Record<ApplicationStatus, { bg: string; text: string }> = {
  pending: { bg: "#E6EEFF", text: "#3B5FE0" },
  reviewed: { bg: "#FCEBCB", text: "#B8760B" },
  accepted: { bg: "#E1F5E6", text: "#1E8A3C" },
  rejected: { bg: "#FBE3E3", text: "#C43E3E" },
  withdrawn: { bg: "#EEEEF0", text: "#6B6B70" },
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const style = STATUS_STYLE[status];
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <View style={[styles.pill, { backgroundColor: style.bg }]}>
      <Text style={[styles.text, { color: style.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  text: { fontWeight: "700", fontSize: 13 },
});