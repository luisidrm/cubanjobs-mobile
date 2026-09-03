import { baseQuery } from "@/lib/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import type { Notification, NotificationListFilters } from "../../src/types/notification";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const notificationsApi = createApi({
  reducerPath: "notificationsApi",
  baseQuery: baseQuery,
  tagTypes: ["Notification", "NotificationUnreadCount"],
  endpoints: (builder) => ({
    getNotifications: builder.query<Notification[], NotificationListFilters | void>({
      query: (filters) => ({ url: "/api/v1/notifications", params: filters ?? undefined }),
      transformResponse: (response: ApiResponse<Notification[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Notification" as const, id })),
              { type: "Notification", id: "LIST" },
            ]
          : [{ type: "Notification", id: "LIST" }],
    }),

    getUnreadCount: builder.query<number, void>({
      query: () => "/api/v1/notifications/unread-count",
      transformResponse: (response: ApiResponse<{ count: number }>) => response.data.count,
      providesTags: ["NotificationUnreadCount"],
    }),

    markNotificationRead: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/v1/notifications/${id}/read`, method: "PATCH" }),
      invalidatesTags: (result, error, id) => [
        { type: "Notification", id },
        { type: "Notification", id: "LIST" },
        "NotificationUnreadCount",
      ],
    }),

    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({ url: "/api/v1/notifications/read-all", method: "PATCH" }),
      invalidatesTags: [{ type: "Notification", id: "LIST" }, "NotificationUnreadCount"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationsApi;
