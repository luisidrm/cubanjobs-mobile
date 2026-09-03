export type NotificationType = "application_status_changed";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: { applicationId?: string; jobId?: string } | null;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListFilters {
  limit?: number;
  offset?: number;
}
