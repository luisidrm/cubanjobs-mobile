export type Currency = "CUP" | "MLC" | "USD";
export type JobType = "full_time" | "part_time" | "contract" | "freelance" | "internship";
export type JobStatus = "draft" | "active" | "closed" | "expired";

export interface JobCompany {
  id: string;
  name: string;
  logoUrl: string | null;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: Currency | null;
  location: string | null;
  jobType: JobType | null;
  isRemote: boolean;
  viewCount: number;
  createdAt: string;
  company: JobCompany;
}

// The raw job row as returned by employer-only endpoints (getJobsByCompany,
// createJob, updateJob) — flat `companyId` and a visible `status`, unlike
// the public search/getById shape above which nests `company` and only
// ever returns active jobs.
export interface EmployerJob {
  id: string;
  companyId: string;
  title: string;
  description: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: Currency | null;
  location: string | null;
  jobType: JobType | null;
  isRemote: boolean;
  status: JobStatus;
  expiresAt: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobSearchFilters {
  q?: string;
  isRemote?: boolean;
  location?: string;
  currency?: Currency;
  jobType?: JobType;
  tagIds?: string;
  limit?: number;
  offset?: number;
}