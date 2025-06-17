// src/types/index.ts - ПОЛНАЯ ВЕРСИЯ С ДОБАВЛЕННЫМИ DTO

// Роли пользователей
export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ORGANIZER = "ORGANIZER",
  REVIEWER = "REVIEWER",
  PARTICIPANT = "PARTICIPANT",
}

// Тематики конференций
export enum ConferenceTheme {
  COMPUTER_SCIENCE = "COMPUTER_SCIENCE",
  MEDICINE = "MEDICINE",
  EDUCATION = "EDUCATION",
  ENGINEERING = "ENGINEERING",
  BUSINESS = "BUSINESS",
  SOCIAL_SCIENCES = "SOCIAL_SCIENCES",
  NATURAL_SCIENCES = "NATURAL_SCIENCES",
  HUMANITIES = "HUMANITIES",
  OTHER = "OTHER",
}

// Типы участия в конференции
export enum ParticipationType {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  HYBRID = "HYBRID",
}

// Статусы заявок
export enum ApplicationStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  UNDER_REVIEW = "UNDER_REVIEW",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  WAITLIST = "WAITLIST",
}

// Типы презентаций
export enum PresentationType {
  ORAL = "ORAL",
  POSTER = "POSTER",
  WORKSHOP = "WORKSHOP",
  KEYNOTE = "KEYNOTE",
  PANEL = "PANEL",
}

// Вспомогательные функции для лейблов
export const getPresentationTypeLabel = (type: PresentationType): string => {
  const labels: Record<PresentationType, string> = {
    [PresentationType.ORAL]: "Устный доклад",
    [PresentationType.POSTER]: "Постерная презентация",
    [PresentationType.WORKSHOP]: "Мастер-класс",
    [PresentationType.KEYNOTE]: "Пленарный доклад",
    [PresentationType.PANEL]: "Панельная дискуссия",
  };
  return labels[type];
};

export const getConferenceThemeLabel = (theme: ConferenceTheme): string => {
  const labels: Record<ConferenceTheme, string> = {
    [ConferenceTheme.COMPUTER_SCIENCE]: "Информатика",
    [ConferenceTheme.MEDICINE]: "Медицина",
    [ConferenceTheme.EDUCATION]: "Образование",
    [ConferenceTheme.ENGINEERING]: "Инженерия",
    [ConferenceTheme.BUSINESS]: "Бизнес",
    [ConferenceTheme.SOCIAL_SCIENCES]: "Социальные науки",
    [ConferenceTheme.NATURAL_SCIENCES]: "Естественные науки",
    [ConferenceTheme.HUMANITIES]: "Гуманитарные науки",
    [ConferenceTheme.OTHER]: "Другое",
  };
  return labels[theme];
};

export const getApplicationStatusLabel = (
  status: ApplicationStatus
): string => {
  const labels: Record<ApplicationStatus, string> = {
    [ApplicationStatus.DRAFT]: "Черновик",
    [ApplicationStatus.SUBMITTED]: "Подана",
    [ApplicationStatus.UNDER_REVIEW]: "На рассмотрении",
    [ApplicationStatus.ACCEPTED]: "Принята",
    [ApplicationStatus.REJECTED]: "Отклонена",
    [ApplicationStatus.WAITLIST]: "Список ожидания",
  };
  return labels[status];
};

// Базовый интерфейс для документов Appwrite
export interface BaseDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
}

// Пользователь
export interface User extends BaseDocument {
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  organization: string;
  position: string;
  bio: string;
  phone: string;
  orcid: string;
  website: string;
}

// Конференция
export interface Conference extends BaseDocument {
  title: string;
  description: string;
  theme: ConferenceTheme;
  startDate: string;
  endDate: string;
  submissionDeadline: string;
  location: string;
  participationType: ParticipationType;
  organizerId: string;
  contactEmail: string;
  website: string;
  maxParticipants?: number;
  registrationFee: number;
  isPublished: boolean;
  requirements: string;
  tags: string[];
  createdAt: string;
}

// Заявка на участие
export interface Application extends BaseDocument {
  conferenceId: string;
  participantId: string;
  status: ApplicationStatus;

  // Информация об участнике
  fullName: string;
  organization: string;
  position: string;
  email: string;
  phone: string;

  // Информация о докладе
  hasPresentation: boolean;
  presentationType?: PresentationType;
  presentationTitle: string;
  abstract: string;
  keywords: string[];

  // Дополнительная информация
  dietaryRestrictions: string;
  accessibilityNeeds: string;
  accommodationNeeded: boolean;

  // Рецензирование
  assignedReviewerId?: string;
  reviewerComments: string;
  reviewDate?: string;

  // Сертификаты и участие
  attended: boolean;
  certificateIssued: boolean;
  certificateUrl: string;

  createdAt: string;
}

// ДОБАВЛЕНО: DTO для создания заявки
export interface CreateApplicationDto {
  conferenceId: string;
  fullName: string;
  organization: string;
  position?: string;
  email: string;
  phone?: string;
  hasPresentation: boolean;
  presentationType?: PresentationType;
  presentationTitle?: string;
  abstract?: string;
  keywords?: string[];
  dietaryRestrictions?: string;
  accessibilityNeeds?: string;
  accommodationNeeded?: boolean;
}

// ДОБАВЛЕНО: DTO для обновления заявки
export interface UpdateApplicationDto extends Partial<CreateApplicationDto> {
  status?: ApplicationStatus;
  assignedReviewerId?: string;
  reviewerComments?: string;
  attended?: boolean;
  certificateIssued?: boolean;
  certificateUrl?: string;
}

// ДОБАВЛЕНО: Алиас для обратной совместимости
export type ConferenceApplication = Application;

// ДОБАВЛЕНО: Заявка с дополнительными деталями для UI
export interface ApplicationWithDetails extends Application {
  conference?: Conference;
  participant?: User;
  reviewer?: User;
  organizer?: User;

  // Вычисляемые поля
  daysUntilDeadline?: number;
  isOverdue?: boolean;
  reviewProgress?: number;

  // Дополнительные метаданные
  lastActivity?: string;
  attachments?: ApplicationAttachment[];
  comments?: ApplicationComment[];
  history?: ApplicationHistory[];
}

// ДОБАВЛЕНО: Вложения к заявке
export interface ApplicationAttachment extends BaseDocument {
  applicationId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  uploadedBy: string;
  description?: string;
  createdAt: string;
}

// Комментарий к заявке
export interface ApplicationComment extends BaseDocument {
  applicationId: string;
  authorId: string;
  text: string;
  isInternal: boolean;
  createdAt: string;

  // Дополнительные поля для UI
  author?: User;
  isEdited?: boolean;
  editedAt?: string;
}

// История изменений заявки
export interface ApplicationHistory extends BaseDocument {
  applicationId: string;
  userId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  description: string;
  createdAt: string;

  // Дополнительные поля для UI
  user?: User;
  actionType?: "status_change" | "assignment" | "review" | "edit" | "comment";
}

// Временной слот в расписании
export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  title: string;
  description?: string;
  speaker?: string;
  location?: string;
  applicationId?: string;
  type?: "presentation" | "break" | "keynote" | "workshop" | "networking";
}

// Расписание конференции
export interface ConferenceSchedule extends BaseDocument {
  conferenceId: string;
  date: string;
  timeSlots: TimeSlot[];
  createdAt: string;
}

// ДОБАВЛЕНО: Конференция с дополнительными деталями для UI
export interface ConferenceWithDetails extends Conference {
  organizer?: User;
  applicationsCount?: number;
  acceptedApplicationsCount?: number;
  pendingApplicationsCount?: number;

  // Вычисляемые поля
  daysUntilStart?: number;
  daysUntilDeadline?: number;
  isRegistrationOpen?: boolean;
  isRegistrationClosed?: boolean;

  // Статистика
  totalApplications?: number;
  avgRating?: number;
  completionRate?: number;
}

// ДОБАВЛЕНО: Пользователь с дополнительными деталями для UI
export interface UserWithDetails extends User {
  // Статистика для участников
  applicationsCount?: number;
  acceptedApplicationsCount?: number;
  attendedConferencesCount?: number;

  // Статистика для организаторов
  organizedConferencesCount?: number;
  managedApplicationsCount?: number;

  // Статистика для рецензентов
  reviewedApplicationsCount?: number;
  averageReviewTime?: number;

  // Вычисляемые поля
  lastActivityDate?: string;
  accountAge?: number;
  isOnline?: boolean;
}

// Фильтры для поиска
export interface ConferenceFilters {
  theme?: ConferenceTheme;
  participationType?: ParticipationType;
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
  organizerId?: string;
  isPublished?: boolean;
  registrationStatus?: "open" | "closed" | "upcoming";
  tags?: string[];
}

export interface ApplicationFilters {
  conferenceId?: string;
  participantId?: string;
  status?: ApplicationStatus;
  hasPresentation?: boolean;
  presentationType?: PresentationType;
  assignedReviewerId?: string;
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
  isOverdue?: boolean;
  needsReview?: boolean;
}

export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  organization?: string;
  searchQuery?: string;
  registrationDateFrom?: string;
  registrationDateTo?: string;
  lastActivityFrom?: string;
  lastActivityTo?: string;
}

// ДОБАВЛЕНО: Статистика панели администратора
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalConferences: number;
  publishedConferences: number;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;

  // Дополнительная статистика
  newUsersThisMonth: number;
  newConferencesThisMonth: number;
  newApplicationsThisMonth: number;
  systemHealth: number;
  storageUsed: number;

  // Дополнительные метрики для разных ролей
  averageReviewTime?: number;
  certificatesIssued?: number;
  activeReviewers?: number;
  completedConferences?: number;
  upcomingDeadlines?: number;
  overdueReviews?: number;

  // Метрики качества
  acceptanceRate?: number;
  participationRate?: number;
  satisfactionScore?: number;

  // Финансовые метрики
  totalRevenue?: number;
  averageRegistrationFee?: number;

  // Метрики времени
  averageApplicationProcessingTime?: number;
  averageConferenceDuration?: number;
}

// ДОБАВЛЕНО: Элементы системной активности
export interface SystemActivity {
  id: string;
  type:
    | "conference_created"
    | "application_submitted"
    | "user_registered"
    | "user_activated"
    | "application_reviewed"
    | "conference_published"
    | "system_updated"
    | "security_event";
  description: string;
  userId?: string;
  user?: User;
  relatedEntityId?: string;
  relatedEntityType?: "conference" | "application" | "user";
  metadata?: Record<string, any>;
  timestamp: string;
  severity?: "low" | "medium" | "high" | "critical";
}

// ДОБАВЛЕНО: Элементы, требующие внимания администратора
export interface AdminAttentionItem {
  id: string;
  type:
    | "pending_users"
    | "review_delays"
    | "storage_warning"
    | "system_updates"
    | "security_alerts"
    | "conference_conflicts";
  title: string;
  description: string;
  urgency: "low" | "medium" | "high" | "critical";
  action: string;
  count: number;
  actionUrl?: string;
  relatedEntityIds?: string[];
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

// Ответы API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  documents: T[];
  total: number;
  offset: number;
  limit: number;
}

// Настройки уведомлений
export interface NotificationSettings {
  emailNotifications: boolean;
  applicationUpdates: boolean;
  conferenceReminders: boolean;
  systemMessages: boolean;
  digestFrequency: "daily" | "weekly" | "monthly" | "never";
  notificationTypes: {
    newApplications: boolean;
    statusChanges: boolean;
    deadlineReminders: boolean;
    systemAlerts: boolean;
  };
}

// Экспорт данных
export interface ExportOptions {
  format: "csv" | "xlsx" | "json" | "pdf";
  fields: string[];
  filters?: any;
  dateRange?: {
    from: string;
    to: string;
  };
  includeMetadata?: boolean;
  includeAttachments?: boolean;
}

// ДОБАВЛЕНО: Настройки системы
export interface SystemSettings {
  general: {
    systemName: string;
    adminEmail: string;
    timezone: string;
    language: string;
    supportEmail?: string;
    helpUrl?: string;
  };
  registration: {
    autoActivateUsers: boolean;
    requireEmailVerification: boolean;
    openRegistration: boolean;
    allowedDomains?: string[];
    defaultRole: UserRole;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    digestEnabled: boolean;
    templates: Record<string, string>;
  };
  security: {
    sessionTimeout: number; // в минутах
    maxLoginAttempts: number;
    minPasswordLength: number;
    lockoutDuration: number; // в минутах
    requireTwoFactor: boolean;
    allowedFileTypes: string[];
    maxFileSize: number; // в МБ
  };
  features: {
    enableReviews: boolean;
    enableCertificates: boolean;
    enablePayments: boolean;
    enableAnalytics: boolean;
    enableExports: boolean;
  };
}

// ДОБАВЛЕНО: Аналитические данные
export interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalConferences: number;
    totalApplications: number;
    totalRevenue?: number;
  };
  trends: {
    userRegistrations: TimeSeriesData[];
    applicationSubmissions: TimeSeriesData[];
    conferenceCreations: TimeSeriesData[];
  };
  demographics: {
    usersByRole: RoleDistribution[];
    usersByOrganization: OrganizationDistribution[];
    conferencesByTheme: ThemeDistribution[];
  };
  performance: {
    averageReviewTime: number;
    applicationAcceptanceRate: number;
    conferenceCompletionRate: number;
    userEngagementRate: number;
  };
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export interface RoleDistribution {
  role: UserRole;
  count: number;
  percentage: number;
}

export interface OrganizationDistribution {
  organization: string;
  count: number;
  percentage: number;
}

export interface ThemeDistribution {
  theme: ConferenceTheme;
  count: number;
  percentage: number;
}

// ДОБАВЛЕНО: Состояния UI
export interface UIState {
  loading: boolean;
  error: string | null;
  selectedItems: string[];
  filters: Record<string, any>;
  sortBy: string;
  sortOrder: "asc" | "desc";
  currentPage: number;
  itemsPerPage: number;
}

// ДОБАВЛЕНО: Модальные окна
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

// ДОБАВЛЕНО: Формы
export interface FormState<T> {
  data: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface StatsFilters {
  organizerId?: string;
  userId?: string;
  participantId?: string; // ИСПРАВЛЕНИЕ: Добавлен participantId
  reviewerId?: string; // ДОБАВЛЕНО: Для рецензентов
  dateFrom?: string;
  dateTo?: string;
  conferenceId?: string;
  role?: UserRole;
  theme?: ConferenceTheme;
  status?: ApplicationStatus;
  // Дополнительные фильтры
  applicationStatus?: ApplicationStatus[];
  conferenceThemes?: ConferenceTheme[];
  timeRange?: "day" | "week" | "month" | "quarter" | "year";
  includeInactive?: boolean;
}

// ДОБАВЛЕНО: Пропсы для компонента DashboardStats
export interface DashboardStatsProps {
  stats?: DashboardStats;
  filters?: StatsFilters;
  showDetailedView?: boolean;
  variant?: "admin" | "organizer" | "participant" | "reviewer";
}

// ДОБАВЛЕНО: Статистика по периодам
export interface PeriodStats {
  period: string; // например "2024-01", "2024-Q1", "2024"
  stats: DashboardStats;
}

// ДОБАВЛЕНО: Сравнительная статистика
export interface ComparativeStats {
  current: DashboardStats;
  previous: DashboardStats;
  growthRates: {
    users: number;
    conferences: number;
    applications: number;
    revenue?: number;
  };
}

// ДОБАВЛЕНО: Контекст для статистики (для определения, что показывать)
export interface StatsContext {
  userRole: UserRole;
  userId: string;
  organizationId?: string;
  permissions: string[];
  timeZone: string;
  dateFormat: string;
}

// ДОБАВЛЕНО: Настройки отображения статистики
export interface StatsDisplaySettings {
  showGrowthRates: boolean;
  showComparisons: boolean;
  defaultPeriod: "week" | "month" | "quarter" | "year";
  refreshInterval: number; // в секундах
  enableRealTime: boolean;
  charts: {
    showTrendLines: boolean;
    showPredictions: boolean;
    animateChanges: boolean;
  };
}

export interface ParticipantStatsFilters extends StatsFilters {
  participantId: string;
  applicationStatuses?: ApplicationStatus[];
  conferenceTypes?: ParticipationType[];
  showOnlyAccepted?: boolean;
  showUpcoming?: boolean;
}

export interface OrganizerStatsFilters extends StatsFilters {
  organizerId: string;
  includeUnpublished?: boolean;
  conferenceStatus?: "active" | "upcoming" | "completed" | "all";
}

export interface ReviewerStatsFilters extends StatsFilters {
  reviewerId: string;
  assignedOnly?: boolean;
  reviewStatus?: "pending" | "completed" | "overdue" | "all";
}

export interface AdminStatsFilters extends StatsFilters {
  globalView?: boolean;
  organizationFilter?: string;
  roleFilter?: UserRole[];
}
