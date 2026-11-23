import { useGetMyCompaniesQuery } from "../../store/api/companiesApi";
import { useGetMeQuery } from "../../store/api/usersApi";
import type { FreelancerContact } from "../types/freelancer";
import { isEmployeePlanActive } from "./plan-status";
import { hasCandidateSearchAccess } from "./plans";
import { whatsappChatUrl } from "./whatsapp";

/**
 * Who may browse the freelancer board: paying employees, members of a paid
 * company, admins. The API enforces the same rule; this only decides whether to
 * show the board or the upgrade prompt.
 */
export function useFreelancerAccess() {
  const { data: me, isLoading: meLoading } = useGetMeQuery();
  const employer = me?.role === "employer";
  const { data: companies, isLoading: companiesLoading } = useGetMyCompaniesQuery(undefined, { skip: !employer });

  const isLoading = meLoading || (employer && companiesLoading);
  let canBrowse = false;
  if (me?.role === "admin") canBrowse = true;
  else if (me?.role === "employee") canBrowse = isEmployeePlanActive(me);
  else if (employer) canBrowse = !!companies?.some((c) => hasCandidateSearchAccess(c.planTier));

  return {
    me,
    isLoading,
    canBrowse,
    /** Posting is for paying employees only. */
    canPost: me?.role === "employee" && isEmployeePlanActive(me),
  };
}

export interface ContactLink {
  key: "phone" | "whatsapp" | "email" | "telegram";
  value: string;
  url: string;
}

/** Tap-to-contact links for whichever methods the author filled in. */
export function contactLinks(c: FreelancerContact): ContactLink[] {
  const out: ContactLink[] = [];
  if (c.contactPhone) out.push({ key: "phone", value: c.contactPhone, url: `tel:${c.contactPhone.replace(/[^\d+]/g, "")}` });
  if (c.contactWhatsapp) {
    out.push({ key: "whatsapp", value: c.contactWhatsapp, url: whatsappChatUrl(c.contactWhatsapp) });
  }
  if (c.contactEmail) out.push({ key: "email", value: c.contactEmail, url: `mailto:${c.contactEmail}` });
  if (c.contactTelegram) {
    out.push({ key: "telegram", value: c.contactTelegram, url: `https://t.me/${c.contactTelegram.replace(/^@/, "")}` });
  }
  return out;
}

export function authorName(a: { firstName: string | null; lastName: string | null }): string {
  return [a.firstName, a.lastName].filter(Boolean).join(" ") || "?";
}
