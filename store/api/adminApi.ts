import { baseQuery } from "@/lib/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import type { Company } from "../../src/types/company";

interface ApiResponse<T> { success: boolean; data: T; }

export type AdminUserRole = "employee" | "employer" | "admin";

export interface AdminUser {
  id: string;
  email: string;
  role: AdminUserRole;
  firstName: string | null;
  lastName: string | null;
}

export interface UserLookupResult {
  localUser: AdminUser | null;
  supertokensUserId: string | null;
}

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: baseQuery,
  tagTypes: ["AdminCompany", "AdminUser"],
  endpoints: (builder) => ({
    searchCompanies: builder.query<Company[], string>({
      query: (q) => `/api/v1/admin/companies/search?q=${encodeURIComponent(q)}`,
      transformResponse: (r: ApiResponse<Company[]>) => r.data,
      providesTags: (result) =>
        result ? result.map((c) => ({ type: "AdminCompany" as const, id: c.id })) : [],
    }),

    verifyCompany: builder.mutation<Company, { id: string; isVerified: boolean }>({
      query: ({ id, isVerified }) => ({
        url: `/api/v1/admin/companies/${id}/verify`,
        method: "PATCH",
        body: { isVerified },
      }),
      transformResponse: (r: ApiResponse<Company>) => r.data,
      invalidatesTags: (result, error, { id }) => [{ type: "AdminCompany", id }],
    }),

    lookupUser: builder.query<UserLookupResult, string>({
      query: (email) => `/api/v1/admin/users/lookup?email=${encodeURIComponent(email)}`,
      transformResponse: (r: ApiResponse<UserLookupResult>) => r.data,
      providesTags: (result) =>
        result?.localUser ? [{ type: "AdminUser" as const, id: result.localUser.id }] : [],
    }),

    updateUserRole: builder.mutation<AdminUser, { id: string; role: AdminUserRole }>({
      query: ({ id, role }) => ({
        url: `/api/v1/admin/users/${id}/role`,
        method: "PATCH",
        body: { role },
      }),
      transformResponse: (r: ApiResponse<AdminUser>) => r.data,
      invalidatesTags: (result, error, { id }) => [{ type: "AdminUser", id }],
    }),

    deleteOrphanedUser: builder.mutation<void, string>({
      query: (supertokensUserId) => ({
        url: `/api/v1/admin/users/orphan/${supertokensUserId}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useSearchCompaniesQuery,
  useVerifyCompanyMutation,
  useLazyLookupUserQuery,
  useUpdateUserRoleMutation,
  useDeleteOrphanedUserMutation,
} = adminApi;
