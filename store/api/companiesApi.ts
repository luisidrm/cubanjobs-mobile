import { baseQuery } from "@/lib/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import type { Company, EmployeeCount } from "../../src/types/company";

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
  tagTypes: ["Company"],
  endpoints: (builder) => ({
    getMyCompanies: builder.query<Company[], void>({
      query: () => "/api/v1/companies/my",
      transformResponse: (r: ApiResponse<Company[]>) => r.data,
      providesTags: (result) =>
        result
          ? [...result.map((c) => ({ type: "Company" as const, id: c.id })), { type: "Company", id: "LIST" }]
          : [{ type: "Company", id: "LIST" }],
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
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useUploadCompanyLogoMutation,
} = companiesApi;
