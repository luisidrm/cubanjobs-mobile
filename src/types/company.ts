export type EmployeeCount = "1-10" | "11-50" | "51-200" | "200+";
export type CompanyPlan = "free" | "basic" | "pro";

export interface Company {
  id: string;
  ownerId: string | null;
  name: string;
  description: string | null;
  website: string | null;
  logoUrl: string | null;
  industry: string | null;
  employeeCount: EmployeeCount | null;
  location: string | null;
  isVerified: boolean;
  planTier: CompanyPlan;
  stripeCustomerId: string | null;
  stripeSubscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  /** Transfermóvil / manual plans: when the paid tier ends (null = no expiry). */
  planExpiresAt: string | null;
  planSource: "none" | "transfermovil" | "stripe" | "manual";
  /** Caller's role in this company (from GET /companies/my). Billing dates are null for members. */
  memberRole: "owner" | "member";
  createdAt: string;
  updatedAt: string;
}

/** What anyone sees of a company: the directory and the public profile. */
export interface PublicCompany {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  logoUrl: string | null;
  industry: string | null;
  employeeCount: EmployeeCount | null;
  location: string | null;
  isVerified: boolean;
  planTier: CompanyPlan;
  openJobs: number;
  createdAt: string;
}

export interface TeamMember {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  profilePictureUrl: string | null;
  role: "owner" | "member";
  joinedAt: string;
}

export interface TeamInfo {
  members: TeamMember[];
  seatsUsed: number;
  /** null = unlimited */
  seatLimit: number | null;
  planTier: CompanyPlan;
  invite: { code: string; expiresAt: string } | null;
  canManage: boolean;
}
