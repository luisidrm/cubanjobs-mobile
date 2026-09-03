import * as Notifications from "expo-notifications";
import { usePathname, useRouter } from "expo-router";
import { type ReactNode, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { notificationsApi } from "../../store/api/notificationsApi";
import { useSession } from "../lib/session";
import { showInfoToast } from "../lib/toast";
import { selectIsAuthenticated } from "../../store/slices/authSlice";

// Routes reachable without a session — sign-in itself, account creation,
// and the deep-link targets emailed for password reset / email verification
// (which must work whether or not the recipient currently has a session).
const PUBLIC_ROUTES = new Set(["/", "/sign-up", "/forgot-password", "/reset-password", "/verify-email"]);

interface Props {
  children: ReactNode;
}

/**
 * Single source of truth for route protection. `useSession()` (backed by
 * SuperTokens' doesSessionExist()) is the actual authorization check —
 * authSlice is only a persisted, synchronously-available hint used to skip
 * the login-flash while that async check is still resolving; it never by
 * itself grants access to a protected route.
 */
export function AuthGate({ children }: Props) {
  const { status } = useSession();
  const isPersistedAuthenticated = useSelector(selectIsAuthenticated);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const isPublicRoute = PUBLIC_ROUTES.has(pathname);

  useEffect(() => {
    if (status === "unauthenticated" && !isPublicRoute) {
      router.replace("/");
    }
  }, [status, isPublicRoute, router]);

  // Only listens for notifications that do arrive (push registration itself
  // stays an explicit opt-in toggle in Settings, not auto-registered here).
  useEffect(() => {
    if (status !== "authenticated") return;

    const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
      const title = notification.request.content.title;
      if (title) showInfoToast(title);
      dispatch(
        notificationsApi.util.invalidateTags([
          { type: "Notification", id: "LIST" },
          "NotificationUnreadCount",
        ])
      );
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(() => {
      router.push("/notifications");
    });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, [status, dispatch, router]);

  if (status === "loading") {
    return isPersistedAuthenticated || isPublicRoute ? <>{children}</> : null;
  }

  // Redirect is in flight (effect above) — render nothing rather than
  // flashing protected content for a frame.
  if (status === "unauthenticated" && !isPublicRoute) return null;

  return <>{children}</>;
}
