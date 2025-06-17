// src/types/organizer.ts

// Базовые типы для статистики
export interface OrganizerStats {
  conferences: number;
  activeConferences: number;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
}

// Типы для последних действий
export type ActivityType =
  | "application_submitted"
  | "review_completed"
  | "conference_published"
  | "deadline_reminder"
  | "conference_started"
  | "conference_ended"
  | "reviewer_assigned"
  | "schedule_updated";

export interface RecentActivity {
  id: string;
  type: ActivityType;
  description: string;
  conference: string;
  timestamp: string;
  userId?: string;
  userName?: string;
}

// Типы для элементов, требующих внимания
export type AttentionType =
  | "pending_reviews"
  | "deadline_approaching"
  | "incomplete_schedule"
  | "missing_reviewers"
  | "overdue_reviews"
  | "low_registrations";

export type UrgencyLevel = "high" | "medium" | "low";

export interface AttentionItem {
  id: string;
  type: AttentionType;
  title: string;
  description: string;
  urgency: UrgencyLevel;
  action: string;
  conferenceId?: string;
  dueDate?: string;
}

export interface ReviewerAssignment {
  id: string;
  reviewerId: string;
  reviewerName: string;
  applicationId: string;
  assignedAt: string;
  dueDate: string;
  status: "pending" | "in_progress" | "completed" | "overdue";
}

// Типы для настроек
export interface NotificationSettings {
  newApplications: boolean;
  completedReviews: boolean;
  deadlines: boolean;
  reviewerResponses: boolean;
  conferenceUpdates: boolean;
  systemMessages: boolean;
}

export interface MessageTemplate {
  id: string;
  type: "acceptance" | "rejection" | "review_request" | "deadline_reminder";
  subject: string;
  body: string;
  isDefault: boolean;
}

export interface OrganizerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  website?: string;
  bio?: string;
  avatar?: string;
  notificationSettings: NotificationSettings;
  messageTemplates: MessageTemplate[];
}

// Типы для программы конференции
export interface ScheduleSlot {
  id: string;
  startTime: string;
  endTime: string;
  title: string;
  description?: string;
  type: "presentation" | "keynote" | "break" | "workshop" | "panel";
  speakers?: string[];
  location?: string;
  applicationId?: string;
}

export interface ConferenceSchedule {
  id: string;
  conferenceId: string;
  days: {
    date: string;
    slots: ScheduleSlot[];
  }[];
  isPublished: boolean;
  lastUpdated: string;
}

// Фильтры и параметры запросов
export interface OrganizerFilters {
  organizerId: string;
  conferenceId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}

export interface ReviewFilters extends OrganizerFilters {
  reviewStatus?: "pending" | "assigned" | "in_review" | "completed";
  reviewerId?: string;
}

// Типы для действий
export interface OrganizerActions {
  onCreateConference?: () => void;
  onEditConference?: (conferenceId: string) => void;
  onDeleteConference?: (conferenceId: string) => void;
  onAssignReviewer?: (applicationId: string, reviewerId: string) => void;
  onRemoveReviewer?: (assignmentId: string) => void;
  onPublishSchedule?: (scheduleId: string) => void;
  onSendNotification?: (type: string, recipients: string[]) => void;
}

// Утилитарные типы
export type SortDirection = "asc" | "desc";

export interface SortOptions {
  field: string;
  direction: SortDirection;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  total?: number;
}
