import { Share } from "react-native";
import { WEB_URL } from "./config";

/**
 * Opens the phone's share sheet (WhatsApp, Telegram, SMS...) with `message` and,
 * when the build knows the website address, a link to `path` on it.
 */
export async function shareText(message: string, path?: string) {
  const url = WEB_URL && path ? `${WEB_URL}${path}` : null;
  try {
    await Share.share({ message: url ? `${message}\n${url}` : message });
  } catch {
    // The sheet failed to open: nothing useful to tell the person.
  }
}
