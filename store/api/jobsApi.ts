import { baseQuery } from "@/lib/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  Currency,
  EmployerJob,
  Job,
  JobSearchFilters,
  JobStatus,
  JobType,
} from "../../src/types/job";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface CreateJobInput {
  companyId: string;
  title: string;
  description: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: Currency;
  location?: string;
  jobType?: JobType;
  isRemote?: boolean;
  status?: JobStatus;
  expiresAt?: string;
}

export type UpdateJobInput = Partial<Omit<CreateJobInput, "companyId">>;

export const jobsApi = createApi({
  reducerPath: "jobsApi",
  baseQuery: baseQuery, // Replace with your actual API base URL
  tagTypes: ["Job"],
  endpoints: (builder) => ({
    searchJobs: builder.query<Job[], JobSearchFilters>({
      query: (filters) => ({
        url: "/api/v1/jobs",
        params: filters,
      }),
      transformResponse: (response: ApiResponse<Job[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Job" as const, id })),
              { type: "Job", id: "LIST" },
            ]
          : [{ type: "Job", id: "LIST" }],
    }),

    getJobById: builder.query<Job, string>({
      query: (id) => `/api/v1/jobs/${id}`,
      transformResponse: (response: ApiResponse<Job>) => response.data,
      providesTags: (result, error, id) => [{ type: "Job", id }],
    }),

    getJobsByCompany: builder.query<EmployerJob[], string>({
      query: (companyId) => `/api/v1/jobs/company/${companyId}`,
      transformResponse: (response: ApiResponse<EmployerJob[]>) => response.data,
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Job" as const, id })), { type: "Job", id: "MY_LIST" }]
          : [{ type: "Job", id: "MY_LIST" }],
    }),

    createJob: builder.mutation<EmployerJob, CreateJobInput>({
      query: (body) => ({ url: "/api/v1/jobs", method: "POST", body }),
      transformResponse: (response: ApiResponse<EmployerJob>) => response.data,
      invalidatesTags: [{ type: "Job", id: "MY_LIST" }],
    }),

    updateJob: builder.mutation<EmployerJob, { id: string } & UpdateJobInput>({
      query: ({ id, ...body }) => ({ url: `/api/v1/jobs/${id}`, method: "PATCH", body }),
      transformResponse: (response: ApiResponse<EmployerJob>) => response.data,
      invalidatesTags: (result, error, { id }) => [{ type: "Job", id }, { type: "Job", id: "MY_LIST" }],
    }),

    deleteJob: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/v1/jobs/${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [{ type: "Job", id }, { type: "Job", id: "MY_LIST" }],
    }),
  }),
});

export const {
  useSearchJobsQuery,
  useGetJobByIdQuery,
  useGetJobsByCompanyQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,
} = jobsApi;