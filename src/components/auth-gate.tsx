import { usePathname, useRouter } from "expo-router";
import { type ReactNode, useEffect } from "react";
import { useSelector } from "react-redux";
import { useSession } from "../lib/session";
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

  const isPublicRoute = PUBLIC_ROUTES.has(pathname);

  useEffect(() => {
    if (status === "unauthenticated" && !isPublicRoute) {
      router.replace("/");
    }
  }, [status, isPublicRoute, router]);

  if (status === "loading") {
    return isPersistedAuthenticated || isPublicRoute ? <>{children}</> : null;
  }

  // Redirect is in flight (effect above) — render nothing rather than
  // flashing protected content for a frame.
  if (status === "unauthenticated" && !isPublicRoute) return null;

  return <>{children}</>;
}
