import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Why a push token could (or could not) be obtained, so the UI can say the right thing. */
export type PushRegistration =
  | { status: "granted"; token: string }
  /** Simulators and the web cannot receive push at all: nothing the user can fix. */
  | { status: "unsupported" }
  /**
   * `canAskAgain` false means the system will no longer show its prompt (the user denied it, or
   * denied it twice on Android): the only way back is the phone's settings.
   */
  | { status: "denied"; canAskAgain: boolean };

/**
 * Requests permission and returns an Expo push token for this device. Also sets up the Android
 * notification channel, which Android 13+ requires before the permission prompt can appear.
 * Throws if the permission was granted but the token could not be issued (e.g. no network).
 */
export async function registerForPushNotificationsAsync(): Promise<PushRegistration> {
  if (!Device.isDevice || Platform.OS === "web") return { status: "unsupported" };

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      // expo-notifications 58 exports the enum through `export *`, which this lint rule cannot follow (TypeScript can).
      // eslint-disable-next-line import/namespace
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  let permission = await Notifications.getPermissionsAsync();
  if (permission.status !== "granted" && permission.canAskAgain) {
    permission = await Notifications.requestPermissionsAsync();
  }
  if (permission.status !== "granted") return { status: "denied", canAskAgain: permission.canAskAgain };

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  return { status: "granted", token };
}
