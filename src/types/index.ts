// src/types/index.ts

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ORGANIZER = "ORGANIZER",
  REVIEWER = "REVIEWER",
  PARTICIPANT = "PARTICIPANT",
}

export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "Супер админ",
  [UserRole.ORGANIZER]: "Организатор",
  [UserRole.REVIEWER]: "Рецензент",
  [UserRole.PARTICIPANT]: "Участник",
};

export const UserRoleColors: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "bg-red-100 text-red-800",
  [UserRole.ORGANIZER]: "bg-blue-100 text-blue-800",
  [UserRole.REVIEWER]: "bg-green-100 text-green-800",
  [UserRole.PARTICIPANT]: "bg-purple-100 text-purple-800",
};

// Статусы заявок
export enum ApplicationStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  UNDER_REVIEW = "UNDER_REVIEW",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  WAITLIST = "WAITLIST",
}

export const ApplicationStatusLabels: Record<ApplicationStatus, string> = {
  [ApplicationStatus.DRAFT]: "Черновик",
  [ApplicationStatus.SUBMITTED]: "Подана",
  [ApplicationStatus.UNDER_REVIEW]: "На рассмотрении",
  [ApplicationStatus.ACCEPTED]: "Принята",
  [ApplicationStatus.REJECTED]: "Отклонена",
  [ApplicationStatus.WAITLIST]: "В листе ожидания",
};

export const ApplicationStatusColors: Record<ApplicationStatus, string> = {
  [ApplicationStatus.DRAFT]: "bg-gray-100 text-gray-800 border-gray-200",
  [ApplicationStatus.SUBMITTED]:
    "bg-yellow-100 text-yellow-800 border-yellow-200",
  [ApplicationStatus.UNDER_REVIEW]: "bg-blue-100 text-blue-800 border-blue-200",
  [ApplicationStatus.ACCEPTED]: "bg-green-100 text-green-800 border-green-200",
  [ApplicationStatus.REJECTED]: "bg-red-100 text-red-800 border-red-200",
  [ApplicationStatus.WAITLIST]:
    "bg-orange-100 text-orange-800 border-orange-200",
};

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

export const ConferenceThemeLabels: Record<ConferenceTheme, string> = {
  [ConferenceTheme.COMPUTER_SCIENCE]: "Компьютерные науки",
  [ConferenceTheme.MEDICINE]: "Медицина",
  [ConferenceTheme.EDUCATION]: "Образование",
  [ConferenceTheme.ENGINEERING]: "Инженерия",
  [ConferenceTheme.BUSINESS]: "Бизнес и экономика",
  [ConferenceTheme.SOCIAL_SCIENCES]: "Социальные науки",
  [ConferenceTheme.NATURAL_SCIENCES]: "Естественные науки",
  [ConferenceTheme.HUMANITIES]: "Гуманитарные науки",
  [ConferenceTheme.OTHER]: "Другое",
};

// Формат участия
export enum ParticipationType {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  HYBRID = "HYBRID",
}

export const ParticipationTypeLabels: Record<ParticipationType, string> = {
  [ParticipationType.ONLINE]: "Онлайн",
  [ParticipationType.OFFLINE]: "Очно",
  [ParticipationType.HYBRID]: "Гибридный",
};

// Тип презентации
export enum PresentationType {
  ORAL = "ORAL",
  POSTER = "POSTER",
  WORKSHOP = "WORKSHOP",
  KEYNOTE = "KEYNOTE",
  PANEL = "PANEL",
}

export const PresentationTypeLabels: Record<PresentationType, string> = {
  [PresentationType.ORAL]: "Устный доклад",
  [PresentationType.POSTER]: "Постер",
  [PresentationType.WORKSHOP]: "Мастер-класс",
  [PresentationType.KEYNOTE]: "Ключевой доклад",
  [PresentationType.PANEL]: "Панельная дискуссия",
};

// Базовый интерфейс документа
export interface BaseDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $collectionId: string;
}

// Пользователь
export interface User extends BaseDocument {
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  organization?: string;
  position?: string;
  bio?: string;
  phone?: string;
  orcid?: string; // ORCID ID для исследователей
  website?: string;
}

// Конференция
export interface Conference extends BaseDocument {
  title: string;
  description: string;
  theme: ConferenceTheme;
  startDate: string;
  endDate: string;
  submissionDeadline: string;
  location: string; // адрес или "онлайн"
  participationType: ParticipationType;
  organizerId: string;
  contactEmail: string;
  website?: string;
  maxParticipants?: number;
  registrationFee?: number;
  isPublished: boolean;
  requirements?: string; // требования к докладам
  tags?: string[]; // теги для поиска
}

// Заявка на участие
export interface ConferenceApplication extends BaseDocument {
  conferenceId: string;
  participantId: string;
  status: ApplicationStatus;

  // Информация об участнике
  fullName: string;
  organization: string;
  position?: string;
  email: string;
  phone?: string;

  // Информация о докладе
  hasPresentation: boolean;
  presentationType?: PresentationType;
  presentationTitle?: string;
  abstract?: string;
  keywords?: string[];

  // Дополнительная информация
  dietaryRestrictions?: string;
  accessibilityNeeds?: string;
  accommodationNeeded?: boolean;

  // Рецензирование
  assignedReviewerId?: string;
  reviewerComments?: string;
  reviewDate?: string;

  // Сертификаты и участие
  attended?: boolean;
  certificateIssued?: boolean;
  certificateUrl?: string;
}

// Комментарии к заявке
export interface ApplicationComment extends BaseDocument {
  applicationId: string;
  authorId: string;
  text: string;
  isInternal: boolean; // Видно только организаторам/рецензентам
}

// История изменений заявки
export interface ApplicationHistory extends BaseDocument {
  applicationId: string;
  userId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  description: string;
}

// Расписание конференции
export interface ConferenceSchedule extends BaseDocument {
  conferenceId: string;
  date: string;
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  title: string;
  description?: string;
  speaker?: string;
  applicationId?: string; // связь с заявкой участника
  location?: string; // зал/аудитория
  type: "presentation" | "break" | "lunch" | "opening" | "closing";
}

// DTO для создания заявки
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

// DTO для обновления заявки
export interface UpdateApplicationDto {
  fullName?: string;
  organization?: string;
  position?: string;
  email?: string;
  phone?: string;
  hasPresentation?: boolean;
  presentationType?: PresentationType;
  presentationTitle?: string;
  abstract?: string;
  keywords?: string[];
  dietaryRestrictions?: string;
  accessibilityNeeds?: string;
  accommodationNeeded?: boolean;
  status?: ApplicationStatus;
  assignedReviewerId?: string;
  reviewerComments?: string;
  attended?: boolean;
}

// DTO для создания конференции
export interface CreateConferenceDto {
  title: string;
  description: string;
  theme: ConferenceTheme;
  startDate: string;
  endDate: string;
  submissionDeadline: string;
  location: string;
  participationType: ParticipationType;
  contactEmail: string;
  website?: string;
  maxParticipants?: number;
  registrationFee?: number;
  requirements?: string;
  tags?: string[];
}

// Расширенная информация о заявке
export interface ApplicationWithDetails extends ConferenceApplication {
  participant: User;
  conference: Conference;
  assignedReviewer?: User;
  comments?: ApplicationComment[];
  history?: ApplicationHistory[];
}

// Расширенная информация о конференции
export interface ConferenceWithDetails extends Conference {
  organizer: User;
  applications?: ConferenceApplication[];
  schedule?: ConferenceSchedule[];
  stats?: {
    totalApplications: number;
    acceptedApplications: number;
    pendingApplications: number;
    rejectedApplications: number;
  };
}

// Статистика для дашборда
export interface DashboardStats {
  totalConferences: number;
  activeConferences: number;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  upcomingConferences: number;
  applicationsByTheme: Record<ConferenceTheme, number>;
  applicationsByStatus: Record<ApplicationStatus, number>;
  monthlyStats: {
    month: string;
    conferences: number;
    applications: number;
  }[];
}

// Фильтры для конференций
export interface ConferenceFilters {
  theme?: ConferenceTheme[];
  participationType?: ParticipationType[];
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
  organizerId?: string;
  isPublished?: boolean;
}

// Фильтры для заявок
export interface ApplicationFilters {
  status?: ApplicationStatus[];
  conferenceId?: string;
  participantId?: string;
  hasPresentation?: boolean;
  presentationType?: PresentationType[];
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
  assignedReviewerId?: string;
}

// Утилитарные функции
export const getRoleLabel = (role: UserRole): string => {
  return UserRoleLabels[role] || role;
};

export const getRoleColor = (role: UserRole): string => {
  return UserRoleColors[role] || "bg-gray-100 text-gray-800";
};

export const getStatusLabel = (status: ApplicationStatus): string => {
  return ApplicationStatusLabels[status] || status;
};

export const getStatusColor = (status: ApplicationStatus): string => {
  return (
    ApplicationStatusColors[status] ||
    "bg-gray-100 text-gray-800 border-gray-200"
  );
};

export const getThemeLabel = (theme: ConferenceTheme): string => {
  return ConferenceThemeLabels[theme] || theme;
};

export const getParticipationTypeLabel = (type: ParticipationType): string => {
  return ParticipationTypeLabels[type] || type;
};

export const getPresentationTypeLabel = (type: PresentationType): string => {
  return PresentationTypeLabels[type] || type;
};

// Проверка прав доступа
export const canManageConferences = (userRole: UserRole): boolean => {
  return [UserRole.SUPER_ADMIN, UserRole.ORGANIZER].includes(userRole);
};

export const canReviewApplications = (userRole: UserRole): boolean => {
  return [UserRole.SUPER_ADMIN, UserRole.ORGANIZER, UserRole.REVIEWER].includes(
    userRole
  );
};

export const canViewAllApplications = (userRole: UserRole): boolean => {
  return [UserRole.SUPER_ADMIN, UserRole.ORGANIZER].includes(userRole);
};

export const canSubmitApplications = (userRole: UserRole): boolean => {
  return [
    UserRole.SUPER_ADMIN,
    UserRole.ORGANIZER,
    UserRole.PARTICIPANT,
  ].includes(userRole);
};

export const canManageUsers = (userRole: UserRole): boolean => {
  return [UserRole.SUPER_ADMIN].includes(userRole);
};
