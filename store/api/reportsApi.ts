import { baseQuery } from "@/lib/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import type { AdminReportRow, CreateReportInput, ReportStatus, ResolveReportInput } from "../../src/types/report";

interface ApiResponse<T> { success: boolean; data: T; }

export const reportsApi = createApi({
  reducerPath: "reportsApi",
  baseQuery: baseQuery,
  tagTypes: ["Report"],
  endpoints: (builder) => ({
    createReport: builder.mutation<{ alreadyReported: boolean }, CreateReportInput>({
      query: (body) => ({ url: "/api/v1/reports", method: "POST", body }),
      transformResponse: (r: ApiResponse<{ alreadyReported: boolean }>) => r.data,
      invalidatesTags: ["Report"],
    }),

    getAdminReports: builder.query<AdminReportRow[], ReportStatus>({
      query: (status) => ({ url: "/api/v1/admin/reports", params: { status, limit: 50 } }),
      transformResponse: (r: ApiResponse<AdminReportRow[]>) => r.data,
      providesTags: ["Report"],
    }),

    getOpenReportsCount: builder.query<number, void>({
      query: () => "/api/v1/admin/reports/open-count",
      transformResponse: (r: ApiResponse<{ open: number }>) => r.data.open,
      providesTags: ["Report"],
    }),

    resolveReport: builder.mutation<{ resolvedCount: number }, ResolveReportInput>({
      query: ({ id, ...body }) => ({ url: `/api/v1/admin/reports/${id}`, method: "PATCH", body }),
      transformResponse: (r: ApiResponse<{ resolvedCount: number }>) => r.data,
      invalidatesTags: ["Report"],
    }),
  }),
});

export const { useCreateReportMutation, useGetAdminReportsQuery, useGetOpenReportsCountQuery, useResolveReportMutation } = reportsApi;
