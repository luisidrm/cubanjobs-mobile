import type { Currency } from "./job";

export interface SavedJobWithDetails {
  jobId: string;
  savedAt: string;
  job: {
    id: string;
    title: string;
    location: string | null;
    isRemote: boolean;
    salaryMin: number | null;
    salaryMax: number | null;
    currency: Currency | null;
    company: { id: string; name: string; logoUrl: string | null };
  };
}