import { Linking } from "react-native";
import { showErrorToast } from "./toast";

/**
 * Opens a link, phone number or mail address in whatever app handles it. `Linking.openURL`
 * rejects when nothing can (no mail app, a malformed number), and an unhandled rejection
 * just looks like a button that does nothing, so say so instead.
 */
export async function openExternal(url: string, failMessage: string): Promise<void> {
  try {
    await Linking.openURL(url);
  } catch {
    showErrorToast(failMessage);
  }
}
