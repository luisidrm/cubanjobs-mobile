import { baseQuery } from "@/lib/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import type { Company, EmployeeCount, PublicCompany, TeamInfo } from "../../src/types/company";

interface ApiResponse<T> { success: boolean; data: T; }

export interface CompanyInput {
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  employeeCount?: EmployeeCount;
  location?: string;
}

export const companiesApi = createApi({
  reducerPath: "companiesApi",
  baseQuery: baseQuery,
  tagTypes: ["Company", "Team"],
  endpoints: (builder) => ({
    getMyCompanies: builder.query<Company[], void>({
      query: () => "/api/v1/companies/my",
      transformResponse: (r: ApiResponse<Company[]>) => r.data,
      providesTags: (result) =>
        result
          ? [...result.map((c) => ({ type: "Company" as const, id: c.id })), { type: "Company", id: "LIST" }]
          : [{ type: "Company", id: "LIST" }],
    }),

    getCompanyById: builder.query<PublicCompany, string>({
      query: (id) => `/api/v1/companies/${id}`,
      transformResponse: (r: ApiResponse<PublicCompany>) => r.data,
      providesTags: (_result, _error, id) => [{ type: "Company", id }],
    }),

    /** Public directory (employees' Companies tab). */
    searchCompanies: builder.query<PublicCompany[], { q?: string; limit?: number; offset?: number } | void>({
      query: (params) => ({ url: "/api/v1/companies", params: params ?? undefined }),
      transformResponse: (r: ApiResponse<PublicCompany[]>) => r.data,
      providesTags: [{ type: "Company", id: "DIRECTORY" }],
    }),

    getTeam: builder.query<TeamInfo, string>({
      query: (companyId) => `/api/v1/companies/${companyId}/team`,
      transformResponse: (r: ApiResponse<TeamInfo>) => r.data,
      providesTags: (_r, _e, companyId) => [{ type: "Team", id: companyId }],
    }),

    createInvite: builder.mutation<{ code: string; expiresAt: string }, string>({
      query: (companyId) => ({ url: `/api/v1/companies/${companyId}/invite`, method: "POST" }),
      transformResponse: (r: ApiResponse<{ code: string; expiresAt: string }>) => r.data,
      invalidatesTags: (_r, _e, companyId) => [{ type: "Team", id: companyId }],
    }),

    revokeInvite: builder.mutation<void, string>({
      query: (companyId) => ({ url: `/api/v1/companies/${companyId}/invite`, method: "DELETE" }),
      invalidatesTags: (_r, _e, companyId) => [{ type: "Team", id: companyId }],
    }),

    removeTeamMember: builder.mutation<void, { companyId: string; userId: string }>({
      query: ({ companyId, userId }) => ({ url: `/api/v1/companies/${companyId}/team/${userId}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, { companyId }) => [{ type: "Team", id: companyId }, { type: "Company", id: "LIST" }],
    }),

    joinCompany: builder.mutation<PublicCompany, string>({
      query: (code) => ({ url: "/api/v1/companies/join", method: "POST", body: { code } }),
      transformResponse: (r: ApiResponse<PublicCompany>) => r.data,
      invalidatesTags: [{ type: "Company", id: "LIST" }, "Team"],
    }),

    createCompany: builder.mutation<Company, CompanyInput>({
      query: (body) => ({ url: "/api/v1/companies", method: "POST", body }),
      transformResponse: (r: ApiResponse<Company>) => r.data,
      invalidatesTags: [{ type: "Company", id: "LIST" }],
    }),

    updateCompany: builder.mutation<Company, { id: string } & Partial<CompanyInput>>({
      query: ({ id, ...body }) => ({ url: `/api/v1/companies/${id}`, method: "PATCH", body }),
      transformResponse: (r: ApiResponse<Company>) => r.data,
      invalidatesTags: (result, error, { id }) => [{ type: "Company", id }, { type: "Company", id: "LIST" }],
    }),

    uploadCompanyLogo: builder.mutation<Company, { companyId: string; formData: FormData }>({
      query: ({ companyId, formData }) => ({
        url: `/api/v1/uploads/company-logo/${companyId}`,
        method: "POST",
        body: formData,
      }),
      transformResponse: (r: ApiResponse<Company>) => r.data,
      invalidatesTags: (result, error, { companyId }) => [
        { type: "Company", id: companyId },
        { type: "Company", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetMyCompaniesQuery,
  useGetCompanyByIdQuery,
  useSearchCompaniesQuery,
  useGetTeamQuery,
  useCreateInviteMutation,
  useRevokeInviteMutation,
  useRemoveTeamMemberMutation,
  useJoinCompanyMutation,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useUploadCompanyLogoMutation,
} = companiesApi;
