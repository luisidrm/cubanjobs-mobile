import type { useRouter } from "expo-router";

/**
 * Goes back when the stack has somewhere to go back to, otherwise to the
 * root, which sends signed-in users to their role's home. A screen opened by a
 * deep link or a notification tap is first in the stack, where a bare
 * `router.back()` does nothing and strands the user.
 */
export function goBack(router: ReturnType<typeof useRouter>): void {
  if (router.canGoBack()) router.back();
  else router.replace("/");
}
