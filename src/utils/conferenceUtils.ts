// src/utils/conferenceUtils.ts
import {
  ConferenceTheme,
  ParticipationType,
  getConferenceThemeLabel,
  Conference,
} from "@/types";

// Опции для селектов
export const CONFERENCE_THEME_OPTIONS = Object.values(ConferenceTheme).map(
  (theme) => ({
    value: theme,
    label: getConferenceThemeLabel(theme),
  })
);

export const PARTICIPATION_TYPE_OPTIONS = [
  { value: ParticipationType.OFFLINE, label: "Очно" },
  { value: ParticipationType.ONLINE, label: "Онлайн" },
  { value: ParticipationType.HYBRID, label: "Гибридный формат" },
];

// Функция для получения лейбла типа участия
export const getParticipationTypeLabel = (type: ParticipationType): string => {
  const labels: Record<ParticipationType, string> = {
    [ParticipationType.OFFLINE]: "Очно",
    [ParticipationType.ONLINE]: "Онлайн",
    [ParticipationType.HYBRID]: "Гибридный",
  };
  return labels[type];
};

// Статусы конференций для UI
export type ConferenceStatus =
  | "draft"
  | "upcoming"
  | "open"
  | "closed"
  | "active"
  | "ended";

export interface ConferenceStatusInfo {
  status: ConferenceStatus;
  label: string;
  variant: "default" | "success" | "warning" | "error" | "info" | "secondary";
}

// Функция для определения статуса конференции
export const getConferenceStatus = (
  conference: Conference
): ConferenceStatusInfo => {
  const now = new Date();
  const startDate = new Date(conference.startDate);
  const endDate = new Date(conference.endDate);
  const submissionDeadline = new Date(conference.submissionDeadline);

  if (!conference.isPublished) {
    return { status: "draft", label: "Черновик", variant: "secondary" };
  }

  if (endDate < now) {
    return { status: "ended", label: "Завершена", variant: "default" };
  }

  if (startDate <= now && endDate >= now) {
    return { status: "active", label: "Идет", variant: "success" };
  }

  if (submissionDeadline < now && startDate > now) {
    return { status: "closed", label: "Прием закрыт", variant: "warning" };
  }

  if (submissionDeadline >= now && startDate > now) {
    return { status: "open", label: "Прием заявок", variant: "info" };
  }

  if (startDate > now) {
    return { status: "upcoming", label: "Предстоящая", variant: "info" };
  }

  return { status: "draft", label: "Неизвестно", variant: "default" };
};

// Функция для форматирования дат
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Функция для форматирования даты и времени
export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Функция для получения количества дней до события
export const getDaysUntil = (dateString: string): number => {
  const now = new Date();
  const targetDate = new Date(dateString);
  const diffTime = targetDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Валидация дат для формы создания конференции
export const validateConferenceDates = (
  startDate: string,
  endDate: string,
  submissionDeadline: string
): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  const deadline = new Date(submissionDeadline);

  if (start <= now) {
    errors.startDate = "Дата начала должна быть в будущем";
  }

  if (end <= start) {
    errors.endDate = "Дата окончания должна быть позже даты начала";
  }

  if (deadline >= start) {
    errors.submissionDeadline =
      "Дедлайн подачи заявок должен быть раньше даты начала конференции";
  }

  if (deadline <= now) {
    errors.submissionDeadline = "Дедлайн подачи заявок должен быть в будущем";
  }

  return errors;
};

// Функция для создания тегов из строки
export const parseTagsFromString = (tagsString: string): string[] => {
  return tagsString
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
};

// Функция для конвертации тегов в строку
export const tagsToString = (tags: string[]): string => {
  return tags.join(", ");
};

// Функция для форматирования цены
export const formatPrice = (price: number): string => {
  if (price === 0) {
    return "Бесплатно";
  }
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(price);
};
