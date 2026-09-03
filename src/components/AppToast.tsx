import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { ToastConfig, ToastConfigParams } from "react-native-toast-message";
import { colors } from "../theme/colors";

function renderToast(
  { text1 }: ToastConfigParams<unknown>,
  icon: React.ComponentProps<typeof Ionicons>["name"],
  iconColor: string
) {
  return (
    <View style={styles.card}>
      <Ionicons name={icon} size={20} color={iconColor} />
      <Text style={styles.text} numberOfLines={2}>
        {text1}
      </Text>
    </View>
  );
}

export const toastConfig: ToastConfig = {
  success: (params) => renderToast(params, "checkmark-circle", colors.success),
  error: (params) => renderToast(params, "alert-circle", colors.error),
  info: (params) => renderToast(params, "notifications", colors.accent),
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 20,
    minHeight: 56,
    width: "90%",
    maxWidth: 400,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
});
