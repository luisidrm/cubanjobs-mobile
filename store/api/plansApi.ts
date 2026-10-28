import { baseQuery } from "@/lib/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import type { MyPayment, PaymentDestination, Plan } from "../../src/types/plan";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const plansApi = createApi({
  reducerPath: "plansApi",
  baseQuery: baseQuery,
  tagTypes: ["Payment"],
  endpoints: (builder) => ({
    getPlans: builder.query<Plan[], "employee" | "employer">({
      query: (audience) => ({ url: "/api/v1/plans", params: { audience } }),
      transformResponse: (r: ApiResponse<Plan[]>) => r.data,
    }),

    getPaymentDestination: builder.query<PaymentDestination, void>({
      query: () => "/api/v1/plans/payment-destination",
      transformResponse: (r: ApiResponse<PaymentDestination>) => r.data,
    }),

    getMyPayments: builder.query<MyPayment[], void>({
      query: () => "/api/v1/payments/mine",
      transformResponse: (r: ApiResponse<MyPayment[]>) => r.data,
      providesTags: ["Payment"],
    }),

    // multipart/form-data: planCode, months, transferNumber, companyId?, screenshot?
    submitPayment: builder.mutation<{ id: string; status: string }, FormData>({
      query: (formData) => ({ url: "/api/v1/payments", method: "POST", body: formData }),
      transformResponse: (r: ApiResponse<{ id: string; status: string }>) => r.data,
      invalidatesTags: ["Payment"],
    }),
  }),
});

export const {
  useGetPlansQuery,
  useGetPaymentDestinationQuery,
  useGetMyPaymentsQuery,
  useSubmitPaymentMutation,
} = plansApi;
