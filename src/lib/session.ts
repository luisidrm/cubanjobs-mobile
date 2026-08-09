import { useEffect, useState } from "react";
import SuperTokens from "supertokens-react-native";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

export function useSession() {
  const [status, setStatus] = useState<SessionStatus>("loading");

  useEffect(() => {
    let mounted = true;
    SuperTokens.doesSessionExist()
      .then((exists) => {
        if (mounted) setStatus(exists ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        if (mounted) setStatus("unauthenticated");
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { status };
}