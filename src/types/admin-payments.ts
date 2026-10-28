import type { PaymentStatus } from "./plan";

export interface AdminPaymentRow {
  id: string;
  status: PaymentStatus;
  payerEmail: string;
  userId: string | null;
  companyId: string | null;
  companyName: string | null;
  planCode: string;
  planName: string;
  audience: "employee" | "employer";
  months: number;
  amountCup: number;
  transferNumber: string;
  hasScreenshot: boolean;
  rejectReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

/** The target account's plan right now (user = employee plan, company = employer tier). */
export interface AccountPlanState {
  kind: "user" | "company";
  id: string;
  label: string;
  plan: string;
  planExpiresAt: string | null;
  planSource: "none" | "transfermovil" | "stripe" | "manual";
}

export interface AdminPaymentDetail extends AdminPaymentRow {
  /** Signed link, valid ~10 minutes. */
  screenshotUrl: string | null;
  account: AccountPlanState | null;
}

export interface AdminPaymentList {
  items: AdminPaymentRow[];
  pending: number;
}

export interface PlanEvent {
  id: string;
  fromPlan: string;
  toPlan: string;
  expiresAt: string | null;
  reason: "payment_approved" | "manual" | "expired" | "stripe";
  note: string | null;
  createdAt: string;
}

export interface AdminPlan {
  id: string;
  code: string;
  audience: "employee" | "employer";
  name: string;
  jobLimit: number | null;
  candidateSearch: boolean;
  isActive: boolean;
  prices: { months: number; priceCup: number; isActive: boolean }[];
}

export type AdminSettings = Record<string, string>;

export interface AdminMetrics {
  generatedAt: string;
  users: {
    total: number;
    employees: number;
    employers: number;
    admins: number;
    newLast7Days: number;
    newLast30Days: number;
  };
  /** Tracking began when it shipped, so "everSeen" only covers people seen since then. */
  platforms: {
    web: { everSeen: number; activeLast30Days: number };
    app: { everSeen: number; activeLast30Days: number };
    both: number;
    activeDays: number;
  };
  plans: {
    employees: { free: number; paid: number };
    companies: { free: number; basic: number; pro: number };
  };
  revenue: {
    currency: "CUP";
    totalCup: number;
    last30DaysCup: number;
    thisMonthCup: number;
    approvedCount: number;
    pendingCount: number;
    pendingCup: number;
    rejectedCount: number;
    byPlan: { code: string; name: string; audience: string; count: number; amountCup: number }[];
    byMonth: { month: string; amountCup: number; count: number }[];
  };
}
