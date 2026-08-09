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
  createdAt: string;
  updatedAt: string;
}
