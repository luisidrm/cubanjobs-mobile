export interface UserSkill {
  id: string;
  skill: string;
  yearsExperience: number | null;
}

export interface WorkExperience {
  id: string;
  title: string;
  organization: string | null;
  description: string | null;
  contact: string | null;
  startDate: string | null;
  endDate: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  role: "employee" | "employer" | "admin";
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  profilePictureUrl: string | null;
  cvUrl: string | null;
  linkedinUrl: string | null;
  expoPushToken: string | null;
  onboardingCompletedAt: string | null;
  skills: UserSkill[];
  experience: WorkExperience[];
}

/** A row from the seeded master skills/job-title catalog (GET /api/v1/skills-catalog) —
 * used as an autocomplete/picker source, not a validation allowlist. */
export interface SkillCatalogItem {
  id: string;
  name: string;
}

/** Shape returned by the public, unauthenticated GET /api/v1/users/:id — a
 * safe subset of UserProfile (no email/cvUrl, experience entries without
 * `contact`). Used for the employer-facing applicant profile view. */
export interface PublicUserProfile {
  id: string;
  role: "employee" | "employer" | "admin";
  isVerified: boolean;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  profilePictureUrl: string | null;
  linkedinUrl: string | null;
  createdAt: string;
  skills: UserSkill[];
  experience: Omit<WorkExperience, "contact">[];
}

/** Lightweight row returned by the employer-only worker directory search
 * (GET /api/v1/users/workers) — enough to render a card, not a full profile. */
export interface WorkerSummary {
  id: string;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  location: string | null;
  profilePictureUrl: string | null;
  skills: UserSkill[];
}

export interface WorkerSearchFilters {
  q?: string;
  skills?: string;
  location?: string;
  limit?: number;
  offset?: number;
}
