import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/baseQuery";
import { pagedList } from "./paging";
import type {
  FreelancerListFilters,
  FreelancerPostDetail,
  FreelancerPostInput,
  FreelancerPostSummary,
  MyFreelancerPost,
} from "../../src/types/freelancer";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

const unwrap = <T>(r: ApiResponse<T>) => r.data;

export const freelancerApi = createApi({
  reducerPath: "freelancerApi",
  baseQuery: baseQuery,
  tagTypes: ["FreelancerPost"],
  endpoints: (builder) => ({
    listFreelancerPosts: builder.query<
      FreelancerPostSummary[],
      FreelancerListFilters
    >({
      query: (params) => ({ url: "/api/v1/freelancer-posts", params }),
      transformResponse: unwrap<FreelancerPostSummary[]>,
      ...pagedList<FreelancerPostSummary, FreelancerListFilters>(),
      providesTags: [{ type: "FreelancerPost", id: "LIST" }],
    }),

    getMyFreelancerPosts: builder.query<MyFreelancerPost[], void>({
      query: () => "/api/v1/freelancer-posts/mine",
      transformResponse: unwrap<MyFreelancerPost[]>,
      providesTags: [{ type: "FreelancerPost", id: "MINE" }],
    }),

    getFreelancerPost: builder.query<FreelancerPostDetail, string>({
      query: (id) => `/api/v1/freelancer-posts/${id}`,
      transformResponse: unwrap<FreelancerPostDetail>,
      providesTags: (_r, _e, id) => [{ type: "FreelancerPost", id }],
    }),

    createFreelancerPost: builder.mutation<
      MyFreelancerPost,
      FreelancerPostInput
    >({
      query: (body) => ({
        url: "/api/v1/freelancer-posts",
        method: "POST",
        body,
      }),
      transformResponse: unwrap<MyFreelancerPost>,
      invalidatesTags: [
        { type: "FreelancerPost", id: "MINE" },
        { type: "FreelancerPost", id: "LIST" },
      ],
    }),

    updateFreelancerPost: builder.mutation<
      MyFreelancerPost,
      { id: string } & Partial<FreelancerPostInput>
    >({
      query: ({ id, ...body }) => ({
        url: `/api/v1/freelancer-posts/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: unwrap<MyFreelancerPost>,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "FreelancerPost", id },
        { type: "FreelancerPost", id: "MINE" },
        { type: "FreelancerPost", id: "LIST" },
      ],
    }),

    deleteFreelancerPost: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/freelancer-posts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "FreelancerPost", id },
        { type: "FreelancerPost", id: "MINE" },
        { type: "FreelancerPost", id: "LIST" },
      ],
    }),

    addFreelancerImage: builder.mutation<
      MyFreelancerPost,
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `/api/v1/freelancer-posts/${id}/images`,
        method: "POST",
        body: formData,
      }),
      transformResponse: unwrap<MyFreelancerPost>,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "FreelancerPost", id },
        { type: "FreelancerPost", id: "MINE" },
        { type: "FreelancerPost", id: "LIST" },
      ],
    }),

    removeFreelancerImage: builder.mutation<
      MyFreelancerPost,
      { id: string; url: string }
    >({
      query: ({ id, url }) => ({
        url: `/api/v1/freelancer-posts/${id}/images`,
        method: "DELETE",
        params: { url },
      }),
      transformResponse: unwrap<MyFreelancerPost>,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "FreelancerPost", id },
        { type: "FreelancerPost", id: "MINE" },
        { type: "FreelancerPost", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useListFreelancerPostsQuery,
  useGetMyFreelancerPostsQuery,
  useGetFreelancerPostQuery,
  useCreateFreelancerPostMutation,
  useUpdateFreelancerPostMutation,
  useDeleteFreelancerPostMutation,
  useAddFreelancerImageMutation,
  useRemoveFreelancerImageMutation,
} = freelancerApi;
