import { baseQuery } from "@/lib/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";

interface ApiResponse<T> { success: boolean; data: T; }

export const billingApi = createApi({
  reducerPath: "billingApi",
  baseQuery: baseQuery,
  tagTypes: [],
  endpoints: (builder) => ({
    // planTier itself is flipped by the Stripe webhook, not by this
    // mutation's response — callers should refetch companiesApi after the
    // Checkout browser session resolves, not trust this call directly.
    createCheckoutSession: builder.mutation<
      { url: string },
      { companyId: string; plan: "basic" | "pro"; platform?: "web" | "native" }
    >({
      query: (body) => ({ url: "/api/v1/billing/checkout-session", method: "POST", body }),
      transformResponse: (r: ApiResponse<{ url: string }>) => r.data,
    }),

    createPortalSession: builder.mutation<{ url: string }, { companyId: string; platform?: "web" | "native" }>({
      query: (body) => ({ url: "/api/v1/billing/portal-session", method: "POST", body }),
      transformResponse: (r: ApiResponse<{ url: string }>) => r.data,
    }),
  }),
});

export const { useCreateCheckoutSessionMutation, useCreatePortalSessionMutation } = billingApi;
