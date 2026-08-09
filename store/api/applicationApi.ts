import { baseQuery } from "@/lib/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  ApplicationRecord,
  ApplicationWithApplicant,
  ApplicationWithJob,
  EmployerSettableStatus,
} from "../../src/types/application";

interface ApiResponse<T> { success: boolean; data: T; }

export interface ApplyToJobInput {
  jobId: string;
  coverLetter?: string;
  resumeUrl?: string;
}

export const applicationsApi = createApi({
  reducerPath: "applicationsApi",
  baseQuery: baseQuery,
  tagTypes: ["Application"],
  endpoints: (builder) => ({
    getMyApplications: builder.query<ApplicationWithJob[], void>({
      query: () => "/api/v1/applications/mine",
      transformResponse: (r: ApiResponse<ApplicationWithJob[]>) => r.data,
      providesTags: (result) =>
        result
          ? [...result.map((a) => ({ type: "Application" as const, id: a.id })), { type: "Application", id: "LIST" }]
          : [{ type: "Application", id: "LIST" }],
    }),
    applyToJob: builder.mutation<ApplicationWithJob, ApplyToJobInput>({
      query: (body) => ({ url: "/api/v1/applications", method: "POST", body }),
      invalidatesTags: [{ type: "Application", id: "LIST" }],
    }),
    withdrawApplication: builder.mutation<ApplicationWithJob, string>({
      query: (id) => ({ url: `/api/v1/applications/${id}/withdraw`, method: "PATCH" }),
      invalidatesTags: [{ type: "Application", id: "LIST" }],
    }),

    getApplicationsForJob: builder.query<ApplicationWithApplicant[], string>({
      query: (jobId) => `/api/v1/jobs/${jobId}/applications`,
      transformResponse: (r: ApiResponse<ApplicationWithApplicant[]>) => r.data,
      providesTags: (result) =>
        result
          ? [...result.map((a) => ({ type: "Application" as const, id: a.id })), { type: "Application", id: "JOB_LIST" }]
          : [{ type: "Application", id: "JOB_LIST" }],
    }),
    updateApplicationStatus: builder.mutation<ApplicationRecord, { id: string; status: EmployerSettableStatus }>({
      query: ({ id, status }) => ({ url: `/api/v1/applications/${id}/status`, method: "PATCH", body: { status } }),
      transformResponse: (r: ApiResponse<ApplicationRecord>) => r.data,
      invalidatesTags: (result, error, { id }) => [{ type: "Application", id }, { type: "Application", id: "JOB_LIST" }],
    }),
    updateApplicationNotes: builder.mutation<ApplicationRecord, { id: string; employerNotes: string }>({
      query: ({ id, employerNotes }) => ({ url: `/api/v1/applications/${id}/notes`, method: "PATCH", body: { employerNotes } }),
      transformResponse: (r: ApiResponse<ApplicationRecord>) => r.data,
      invalidatesTags: (result, error, { id }) => [{ type: "Application", id }, { type: "Application", id: "JOB_LIST" }],
    }),
  }),
});

export const {
  useGetMyApplicationsQuery,
  useApplyToJobMutation,
  useWithdrawApplicationMutation,
  useGetApplicationsForJobQuery,
  useUpdateApplicationStatusMutation,
  useUpdateApplicationNotesMutation,
} = applicationsApi;