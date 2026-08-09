import { Alert, Platform } from "react-native";

/** Cross-platform confirm dialog — react-native-web's Alert.alert() is a
 * no-op (never renders, never fires callbacks), so web needs window.confirm
 * instead. Resolves true/false with the user's choice. */
export function confirmAction(
  title: string,
  message: string,
  labels: { confirm: string; cancel: string }
): Promise<boolean> {
  if (Platform.OS === "web") {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: labels.cancel, style: "cancel", onPress: () => resolve(false) },
      { text: labels.confirm, style: "destructive", onPress: () => resolve(true) },
    ]);
  });
}
