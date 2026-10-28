import { useTranslation } from "react-i18next";
import type { ApplicationStatus } from "../../types/application";
import { Badge, type BadgeTone } from "../ds";

// Semantic mapping from the design system: pending=warning, reviewed=info,
// accepted=success, rejected=danger, withdrawn=neutral.
const TONE: Record<ApplicationStatus, BadgeTone> = {
  pending: "warning",
  reviewed: "info",
  accepted: "success",
  rejected: "danger",
  withdrawn: "neutral",
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const { t } = useTranslation();
  const fallback = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <Badge tone={TONE[status]} dot>
      {t(`applicationStatus.${status}`, { defaultValue: fallback })}
    </Badge>
  );
}
