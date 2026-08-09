export type ApplicationStatus = "pending" | "reviewed" | "rejected" | "accepted" | "withdrawn";

export interface ApplicationWithJob {
  id: string;
  status: ApplicationStatus;
  coverLetter: string | null;
  resumeUrl: string;
  createdAt: string;
  job: {
    id: string;
    title: string;
    company: { id: string; name: string };
  };
}

// Employer-settable statuses exclude "withdrawn" — applicants set that
// themselves via the separate withdraw endpoint.
export type EmployerSettableStatus = Exclude<ApplicationStatus, "withdrawn">;

// Raw shape returned by the status/notes PATCH endpoints — unlike
// ApplicationWithApplicant below, these aren't joined with applicant info.
export interface ApplicationRecord {
  id: string;
  status: ApplicationStatus;
  coverLetter: string | null;
  resumeUrl: string;
  employerNotes: string | null;
  createdAt: string;
}

export interface ApplicationWithApplicant {
  id: string;
  status: ApplicationStatus;
  coverLetter: string | null;
  resumeUrl: string;
  employerNotes: string | null;
  createdAt: string;
  applicant: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
    profilePictureUrl: string | null;
  };
}