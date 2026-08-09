import { baseQuery } from "@/lib/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import type { PublicUserProfile, UserProfile, UserSkill, WorkExperience } from "../../src/types/user";

interface ApiResponse<T> { success: boolean; data: T; }

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  location?: string;
  linkedinUrl?: string;
}

export interface AddSkillInput {
  skill: string;
  yearsExperience?: number;
}

export interface ExperienceInput {
  title: string;
  organization?: string;
  description?: string;
  contact?: string;
  startDate?: string;
  endDate?: string;
}

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: baseQuery,
  tagTypes: ["User", "PublicUser"],
  endpoints: (builder) => ({
    getMe: builder.query<UserProfile, void>({
      query: () => "/api/v1/users/me",
      transformResponse: (r: ApiResponse<UserProfile>) => r.data,
      providesTags: ["User"],
    }),

    getPublicProfile: builder.query<PublicUserProfile, string>({
      query: (userId) => `/api/v1/users/${userId}`,
      transformResponse: (r: ApiResponse<PublicUserProfile>) => r.data,
      providesTags: (_result, _error, userId) => [{ type: "PublicUser", id: userId }],
    }),

    updateProfile: builder.mutation<void, { id: string } & UpdateProfileInput>({
      query: ({ id, ...body }) => ({ url: `/api/v1/users/${id}`, method: "PATCH", body }),
      invalidatesTags: ["User"],
    }),

    uploadAvatar: builder.mutation<{ url: string }, FormData>({
      query: (formData) => ({
        url: "/api/v1/uploads/avatar",
        method: "POST",
        body: formData,
      }),
      transformResponse: (r: ApiResponse<{ url: string }>) => r.data,
      invalidatesTags: ["User"],
    }),

    uploadCv: builder.mutation<{ objectName: string }, FormData>({
      query: (formData) => ({
        url: "/api/v1/uploads/cv",
        method: "POST",
        body: formData,
      }),
      transformResponse: (r: ApiResponse<{ objectName: string }>) => r.data,
      invalidatesTags: ["User"],
    }),

    addSkill: builder.mutation<UserSkill, AddSkillInput>({
      query: (body) => ({ url: "/api/v1/users/me/skills", method: "POST", body }),
      transformResponse: (r: ApiResponse<UserSkill>) => r.data,
      invalidatesTags: ["User"],
    }),

    removeSkill: builder.mutation<void, string>({
      query: (skillId) => ({ url: `/api/v1/users/me/skills/${skillId}`, method: "DELETE" }),
      invalidatesTags: ["User"],
    }),

    addExperience: builder.mutation<WorkExperience, ExperienceInput>({
      query: (body) => ({ url: "/api/v1/users/me/experience", method: "POST", body }),
      transformResponse: (r: ApiResponse<WorkExperience>) => r.data,
      invalidatesTags: ["User"],
    }),

    updateExperience: builder.mutation<WorkExperience, { id: string } & Partial<ExperienceInput>>({
      query: ({ id, ...body }) => ({
        url: `/api/v1/users/me/experience/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (r: ApiResponse<WorkExperience>) => r.data,
      invalidatesTags: ["User"],
    }),

    deleteExperience: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/v1/users/me/experience/${id}`, method: "DELETE" }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetMeQuery,
  useGetPublicProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useUploadCvMutation,
  useAddSkillMutation,
  useRemoveSkillMutation,
  useAddExperienceMutation,
  useUpdateExperienceMutation,
  useDeleteExperienceMutation,
} = usersApi;
