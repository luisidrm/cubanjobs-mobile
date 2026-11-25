import Toast from "react-native-toast-message";

export function showSuccessToast(message: string) {
  Toast.show({ type: "success", text1: message });
}

export function showErrorToast(message: string) {
  Toast.show({ type: "error", text1: message });
}

export function showInfoToast(message: string, visibilityTime?: number) {
  Toast.show({ type: "info", text1: message, visibilityTime });
}
