// src/utils/permissions.ts - Утилиты для проверки прав доступа

import { UserRole } from "@/types";

// Функции для проверки прав доступа
export const canManageUsers = (role: UserRole): boolean => {
  return role === UserRole.SUPER_ADMIN;
};

export const canManageConferences = (role: UserRole): boolean => {
  return [UserRole.SUPER_ADMIN, UserRole.ORGANIZER].includes(role);
};

export const canReviewApplications = (role: UserRole): boolean => {
  return [UserRole.SUPER_ADMIN, UserRole.REVIEWER].includes(role);
};

export const canSubmitApplications = (role: UserRole): boolean => {
  return [UserRole.SUPER_ADMIN, UserRole.PARTICIPANT].includes(role);
};

export const canViewAllData = (role: UserRole): boolean => {
  return role === UserRole.SUPER_ADMIN;
};

export const canCreateConferences = (role: UserRole): boolean => {
  return [UserRole.SUPER_ADMIN, UserRole.ORGANIZER].includes(role);
};

export const canManageSystem = (role: UserRole): boolean => {
  return role === UserRole.SUPER_ADMIN;
};

// Функции для получения доступных действий по ролям
export const getAvailableActions = (role: UserRole): string[] => {
  const actions: Record<UserRole, string[]> = {
    [UserRole.SUPER_ADMIN]: [
      "manage_users",
      "manage_conferences",
      "review_applications",
      "submit_applications",
      "view_analytics",
      "manage_system",
      "export_data",
      "send_notifications",
    ],
    [UserRole.ORGANIZER]: [
      "manage_conferences",
      "view_applications",
      "assign_reviewers",
      "view_analytics",
      "export_conference_data",
    ],
    [UserRole.REVIEWER]: [
      "review_applications",
      "view_assigned_applications",
      "submit_reviews",
    ],
    [UserRole.PARTICIPANT]: [
      "submit_applications",
      "view_conferences",
      "view_own_applications",
      "edit_profile",
    ],
  };
  return actions[role] || [];
};

// Функции для получения разрешенных маршрутов
export const getAllowedRoutes = (role: UserRole): string[] => {
  const routes: Record<UserRole, string[]> = {
    [UserRole.SUPER_ADMIN]: [
      "/admin",
      "/admin/users",
      "/admin/conferences",
      "/admin/applications",
      "/admin/analytics",
      "/admin/settings",
      "/organizer",
      "/reviewer",
      "/participant",
    ],
    [UserRole.ORGANIZER]: [
      "/organizer",
      "/organizer/conferences",
      "/organizer/applications",
      "/organizer/analytics",
    ],
    [UserRole.REVIEWER]: [
      "/reviewer",
      "/reviewer/applications",
      "/reviewer/reviews",
    ],
    [UserRole.PARTICIPANT]: [
      "/participant",
      "/participant/conferences",
      "/participant/applications",
    ],
  };
  return routes[role] || [];
};

// Функция для проверки доступа к маршруту
export const canAccessRoute = (role: UserRole, route: string): boolean => {
  const allowedRoutes = getAllowedRoutes(role);
  return allowedRoutes.some((allowedRoute) => route.startsWith(allowedRoute));
};

// Функция для получения домашнего маршрута по роли
export const getHomeRoute = (role: UserRole): string => {
  const homeRoutes: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: "/admin",
    [UserRole.ORGANIZER]: "/organizer",
    [UserRole.REVIEWER]: "/reviewer",
    [UserRole.PARTICIPANT]: "/participant",
  };
  return homeRoutes[role] || "/";
};

// Функции для работы с ролями
export const getRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: "Супер администратор",
    [UserRole.ORGANIZER]: "Организатор",
    [UserRole.REVIEWER]: "Рецензент",
    [UserRole.PARTICIPANT]: "Участник",
  };
  return labels[role];
};

export const getRoleColor = (role: UserRole): string => {
  const colors: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: "bg-red-100 text-red-800",
    [UserRole.ORGANIZER]: "bg-blue-100 text-blue-800",
    [UserRole.REVIEWER]: "bg-green-100 text-green-800",
    [UserRole.PARTICIPANT]: "bg-purple-100 text-purple-800",
  };
  return colors[role];
};

export const getRoleDescription = (role: UserRole): string => {
  const descriptions: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: "Полный доступ к системе управления конференциями",
    [UserRole.ORGANIZER]: "Создание и управление конференциями",
    [UserRole.REVIEWER]: "Рецензирование заявок на участие",
    [UserRole.PARTICIPANT]: "Подача заявок на участие в конференциях",
  };
  return descriptions[role];
};

export const getRolePriority = (role: UserRole): number => {
  const priorities: Record<UserRole, number> = {
    [UserRole.SUPER_ADMIN]: 4,
    [UserRole.ORGANIZER]: 3,
    [UserRole.REVIEWER]: 2,
    [UserRole.PARTICIPANT]: 1,
  };
  return priorities[role];
};

// Типы для навигации (используются в Navbar)
export interface NavigationItem {
  href: string;
  label: string;
  icon: string; // Имя иконки Lucide
  badge?: number;
  description?: string;
  requiresPermission?: string;
}

export interface NavigationGroup {
  title: string;
  items: NavigationItem[];
}

// Функция для получения навигационных элементов по роли
export const getNavigationItems = (role: UserRole): NavigationGroup[] => {
  const baseGroups: NavigationGroup[] = [
    {
      title: "Основное",
      items: [
        {
          href: getHomeRoute(role),
          label: "Главная",
          icon: "Home",
          description: "Обзор и статистика",
        },
      ],
    },
  ];

  // Добавляем группы в зависимости от роли
  if (canManageConferences(role)) {
    baseGroups.push({
      title: "Конференции",
      items: [
        {
          href: "/organizer/conferences",
          label: "Конференции",
          icon: "Calendar",
          description: "Управление конференциями",
        },
        {
          href: "/organizer/conferences/create",
          label: "Создать конференцию",
          icon: "Plus",
          description: "Добавить новую конференцию",
        },
      ],
    });
  }

  if (role === UserRole.PARTICIPANT) {
    baseGroups.push({
      title: "Конференции",
      items: [
        {
          href: "/participant/conferences",
          label: "Доступные конференции",
          icon: "Calendar",
          description: "Просмотр конференций",
        },
      ],
    });
  }

  // Добавляем заявки
  const applicationItems: NavigationItem[] = [];

  if (role === UserRole.SUPER_ADMIN) {
    applicationItems.push({
      href: "/admin/applications",
      label: "Все заявки",
      icon: "FileText",
      description: "Управление всеми заявками",
    });
  }

  if (canManageConferences(role)) {
    applicationItems.push({
      href: "/organizer/applications",
      label: "Заявки конференций",
      icon: "FileText",
      description: "Заявки на мои конференции",
    });
  }

  if (canReviewApplications(role)) {
    applicationItems.push({
      href: "/reviewer/applications",
      label: "На рецензирование",
      icon: "Eye",
      description: "Заявки для рецензирования",
    });
  }

  if (canSubmitApplications(role)) {
    applicationItems.push({
      href: "/participant/applications",
      label: "Мои заявки",
      icon: "FileText",
      description: "Поданные заявки",
    });
    applicationItems.push({
      href: "/participant/applications/create",
      label: "Подать заявку",
      icon: "Plus",
      description: "Создать новую заявку",
    });
  }

  if (applicationItems.length > 0) {
    baseGroups.push({
      title: "Заявки",
      items: applicationItems,
    });
  }

  // Управление (только для админов)
  if (canManageUsers(role)) {
    baseGroups.push({
      title: "Управление",
      items: [
        {
          href: "/admin/users",
          label: "Пользователи",
          icon: "Users",
          description: "Управление пользователями",
        },
        {
          href: "/admin/analytics",
          label: "Аналитика",
          icon: "BarChart3",
          description: "Отчеты и статистика",
        },
        {
          href: "/admin/settings",
          label: "Настройки",
          icon: "Settings",
          description: "Настройки системы",
        },
      ],
    });
  }

  return baseGroups;
};
