export type ReportTargetType = "job" | "freelancer_post" | "company";

export type ReportReason = "scam" | "upfront_payment" | "inappropriate" | "spam" | "fake" | "other";

export type ReportStatus = "open" | "dismissed" | "actioned";

export const REPORT_REASONS: ReportReason[] = ["scam", "upfront_payment", "inappropriate", "spam", "fake", "other"];

export interface CreateReportInput {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  note?: string;
}

export interface AdminReportRow {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  note: string | null;
  status: ReportStatus;
  createdAt: string;
  resolvedAt: string | null;
  resolutionNote: string | null;
  reporterEmail: string;
  target: { title: string; exists: boolean; extra?: string };
}

export interface ResolveReportInput {
  id: string;
  status: "dismissed" | "actioned";
  takedown: boolean;
  note?: string;
}
