import { baseQuery } from "@/lib/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import type { SavedJobWithDetails } from "../../src/types/savedJob";

interface ApiResponse<T> { success: boolean; data: T; }

export const savedJobsApi = createApi({
  reducerPath: "savedJobsApi",
  baseQuery: baseQuery,
  tagTypes: ["Job"],
  endpoints: (builder) => ({
    getMySavedJobs: builder.query<SavedJobWithDetails[], void>({
      query: () => "/api/v1/saved-jobs",
      transformResponse: (r: ApiResponse<SavedJobWithDetails[]>) => r.data,
      providesTags: (result) =>
        result
          ? [...result.map((s) => ({ type: "Job" as const, id: s.jobId })), { type: "Job", id: "SAVED_LIST" }]
          : [{ type: "Job", id: "SAVED_LIST" }],
    }),
    saveJob: builder.mutation<void, string>({
      query: (jobId) => ({ url: `/api/v1/saved-jobs/${jobId}`, method: "POST" }),
      invalidatesTags: [{ type: "Job", id: "SAVED_LIST" }],
    }),
    unsaveJob: builder.mutation<void, string>({
      query: (jobId) => ({ url: `/api/v1/saved-jobs/${jobId}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Job", id: "SAVED_LIST" }],
    }),
  }),
});

export const { useGetMySavedJobsQuery, useSaveJobMutation, useUnsaveJobMutation } = savedJobsApi;