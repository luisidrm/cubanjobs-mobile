import type { Company } from "../types/company";
import type { UserProfile } from "../types/user";

const DAY = 86_400_000;

/** Days from now until `iso` (rounded up); negative when already past. null when there is no date. */
export function daysUntil(iso: string | null | undefined, now = Date.now()): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - now) / DAY);
}

/** Employee plan state: paid and not lapsed (a paid plan without an expiry never lapses). */
export function isEmployeePlanActive(user: Pick<UserProfile, "plan" | "planExpiresAt"> | undefined): boolean {
  if (!user || user.plan !== "paid") return false;
  return user.planExpiresAt === null || new Date(user.planExpiresAt).getTime() > Date.now();
}

/** True when a plan with an expiry ends within `withinDays` (the "renew now" banner). */
export function isExpiringSoon(expiresAt: string | null | undefined, withinDays = 3): boolean {
  const d = daysUntil(expiresAt);
  return d !== null && d >= 0 && d <= withinDays;
}

/** The company's plan only runs out by date when it isn't managed by Stripe. */
export function companyPlanExpiry(c: Pick<Company, "planTier" | "planExpiresAt" | "planSource"> | undefined): string | null {
  if (!c || c.planTier === "free" || c.planSource === "stripe") return null;
  return c.planExpiresAt;
}
