import type { Dispatch, UnknownAction } from "@reduxjs/toolkit";
import { adminApi } from "../../store/api/adminApi";
import { adminPaymentsApi } from "../../store/api/adminPaymentsApi";
import { applicationsApi } from "../../store/api/applicationApi";
import { billingApi } from "../../store/api/billingApi";
import { companiesApi } from "../../store/api/companiesApi";
import { freelancerApi } from "../../store/api/freelancerApi";
import { jobsApi } from "../../store/api/jobsApi";
import { notificationsApi } from "../../store/api/notificationsApi";
import { plansApi } from "../../store/api/plansApi";
import { savedJobsApi } from "../../store/api/savedJobsApi";
import { usersApi } from "../../store/api/usersApi";
import { clearAuth } from "../../store/slices/authSlice";

/**
 * Forgets everything cached for the signed-in account. Every API slice has to be listed:
 * one left out keeps the previous user's data in memory, and the next person to sign in on
 * the same phone could briefly see it (their freelancer posts, admin lists, saved jobs...).
 * Add new API slices here when you create them.
 */
export function resetSession(dispatch: Dispatch<UnknownAction>): void {
  dispatch(clearAuth());
  for (const api of [
    usersApi,
    applicationsApi,
    savedJobsApi,
    companiesApi,
    notificationsApi,
    billingApi,
    plansApi,
    jobsApi,
    adminApi,
    adminPaymentsApi,
    freelancerApi,
  ]) {
    dispatch(api.util.resetApiState());
  }
}
