import { baseQuery } from "@/lib/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  AccountPlanState,
  AdminPaymentDetail,
  AdminPaymentList,
  AdminPaymentRow,
  AdminMetrics,
  AdminPlan,
  AdminSettings,
  PlanEvent,
} from "../../src/types/admin-payments";
import type { PaymentStatus } from "../../src/types/plan";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: { pending: number };
}

type PlanTarget = { kind: "user" | "company"; id: string };

export const adminPaymentsApi = createApi({
  reducerPath: "adminPaymentsApi",
  baseQuery: baseQuery,
  tagTypes: ["AdminPayment", "AdminAccount", "AdminPlans", "AdminSettings"],
  endpoints: (builder) => ({
    getAdminMetrics: builder.query<AdminMetrics, void>({
      query: () => "/api/v1/admin/metrics",
      transformResponse: (r: ApiResponse<AdminMetrics>) => r.data,
      providesTags: ["AdminPayment", "AdminAccount"],
    }),

    getAdminPayments: builder.query<AdminPaymentList, PaymentStatus>({
      query: (status) => ({ url: "/api/v1/admin/payments", params: { status, limit: 50 } }),
      transformResponse: (r: ApiResponse<AdminPaymentRow[]>) => ({ items: r.data, pending: r.meta?.pending ?? 0 }),
      providesTags: ["AdminPayment"],
    }),

    getAdminPayment: builder.query<AdminPaymentDetail, string>({
      query: (id) => `/api/v1/admin/payments/${id}`,
      transformResponse: (r: ApiResponse<AdminPaymentDetail>) => r.data,
      providesTags: (_r, _e, id) => [{ type: "AdminPayment", id }],
    }),

    approvePayment: builder.mutation<{ id: string; status: string; expiresAt: string | null }, string>({
      query: (id) => ({ url: `/api/v1/admin/payments/${id}/approve`, method: "POST" }),
      transformResponse: (r: ApiResponse<{ id: string; status: string; expiresAt: string | null }>) => r.data,
      invalidatesTags: ["AdminPayment", "AdminAccount"],
    }),

    rejectPayment: builder.mutation<{ id: string; status: string }, { id: string; reason: string }>({
      query: ({ id, reason }) => ({ url: `/api/v1/admin/payments/${id}/reject`, method: "POST", body: { reason } }),
      transformResponse: (r: ApiResponse<{ id: string; status: string }>) => r.data,
      invalidatesTags: ["AdminPayment"],
    }),

    searchAccounts: builder.query<AccountPlanState[], string>({
      query: (q) => ({ url: "/api/v1/admin/accounts/search", params: { q } }),
      transformResponse: (r: ApiResponse<AccountPlanState[]>) => r.data,
      providesTags: ["AdminAccount"],
    }),

    getExpiringAccounts: builder.query<AccountPlanState[], number>({
      query: (days) => ({ url: "/api/v1/admin/accounts/expiring", params: { days } }),
      transformResponse: (r: ApiResponse<AccountPlanState[]>) => r.data,
      providesTags: ["AdminAccount"],
    }),

    getPlanHistory: builder.query<PlanEvent[], PlanTarget>({
      query: ({ kind, id }) => `/api/v1/admin/accounts/${kind}/${id}/history`,
      transformResponse: (r: ApiResponse<PlanEvent[]>) => r.data,
      providesTags: ["AdminAccount"],
    }),

    // expiresAt: ISO string, or null for no expiry
    setAccountPlan: builder.mutation<void, PlanTarget & { plan: string; expiresAt: string | null; note?: string }>({
      query: ({ kind, id, ...body }) => ({ url: `/api/v1/admin/accounts/${kind}/${id}/plan`, method: "PUT", body }),
      invalidatesTags: ["AdminAccount", "AdminPayment"],
    }),

    getAdminPlans: builder.query<AdminPlan[], void>({
      query: () => "/api/v1/admin/plans",
      transformResponse: (r: ApiResponse<AdminPlan[]>) => r.data,
      providesTags: ["AdminPlans"],
    }),

    updatePlan: builder.mutation<void, { id: string; patch: Partial<Pick<AdminPlan, "name" | "jobLimit" | "candidateSearch" | "isActive">> }>({
      query: ({ id, patch }) => ({ url: `/api/v1/admin/plans/${id}`, method: "PATCH", body: patch }),
      invalidatesTags: ["AdminPlans"],
    }),

    setPlanPrice: builder.mutation<void, { id: string; months: number; priceCup: number; isActive: boolean }>({
      query: ({ id, months, ...body }) => ({ url: `/api/v1/admin/plans/${id}/prices/${months}`, method: "PUT", body }),
      invalidatesTags: ["AdminPlans"],
    }),

    getPaymentSettings: builder.query<AdminSettings, void>({
      query: () => "/api/v1/admin/payment-settings",
      transformResponse: (r: ApiResponse<AdminSettings>) => r.data,
      providesTags: ["AdminSettings"],
    }),

    updatePaymentSettings: builder.mutation<AdminSettings, AdminSettings>({
      query: (body) => ({ url: "/api/v1/admin/payment-settings", method: "PUT", body }),
      transformResponse: (r: ApiResponse<AdminSettings>) => r.data,
      invalidatesTags: ["AdminSettings"],
    }),
  }),
});

export const {
  useGetAdminMetricsQuery,
  useGetAdminPaymentsQuery,
  useGetAdminPaymentQuery,
  useApprovePaymentMutation,
  useRejectPaymentMutation,
  useSearchAccountsQuery,
  useGetExpiringAccountsQuery,
  useGetPlanHistoryQuery,
  useSetAccountPlanMutation,
  useGetAdminPlansQuery,
  useUpdatePlanMutation,
  useSetPlanPriceMutation,
  useGetPaymentSettingsQuery,
  useUpdatePaymentSettingsMutation,
} = adminPaymentsApi;
