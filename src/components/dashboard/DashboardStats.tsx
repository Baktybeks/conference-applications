"use client";

import React from "react";
import { DashboardStats as StatsType } from "@/types";
import {
  Users,
  Calendar,
  FileText,
  TrendingUp,
  Activity,
  Award,
  Clock,
  CheckCircle,
  Star,
  Target,
} from "lucide-react";

// ИСПРАВЛЕНИЕ: Обновленный интерфейс фильтров
interface StatsFilters {
  organizerId?: string;
  userId?: string;
  participantId?: string; // ИСПРАВЛЕНИЕ: Добавлен participantId
  reviewerId?: string;
  dateFrom?: string;
  dateTo?: string;
  conferenceId?: string;
}

interface DashboardStatsProps {
  stats?: StatsType;
  filters?: StatsFilters;
  showDetailedView?: boolean;
  variant?: "admin" | "organizer" | "participant" | "reviewer";
}

export function DashboardStats({
  stats,
  filters,
  showDetailedView = true,
  variant = "admin",
}: DashboardStatsProps) {
  // ИСПРАВЛЕНИЕ: Функция для безопасного получения числового значения
  const safeNumber = (
    value: number | undefined,
    defaultValue: number = 0
  ): number => {
    return typeof value === "number" && !isNaN(value) ? value : defaultValue;
  };

  // ИСПРАВЛЕНИЕ: Обновленная функция получения статистики с поддержкой participantId
  const getFilteredStats = (): StatsType => {
    let baseStats: StatsType = {
      totalUsers: 248,
      activeUsers: 185,
      totalConferences: 42,
      publishedConferences: 38,
      totalApplications: 1847,
      pendingApplications: 127,
      acceptedApplications: 892,
      rejectedApplications: 234,
      newUsersThisMonth: 23,
      newConferencesThisMonth: 5,
      newApplicationsThisMonth: 156,
      systemHealth: 98.5,
      storageUsed: 67,
    };

    // ИСПРАВЛЕНИЕ: Логика для участника
    if (filters?.participantId) {
      baseStats = {
        ...baseStats,
        totalApplications: 12, // Мои заявки
        pendingApplications: 3, // Ожидающие рассмотрения
        acceptedApplications: 7, // Принятые заявки
        rejectedApplications: 2, // Отклоненные заявки
        totalConferences: 5, // Конференции, в которых участвую
        publishedConferences: 5, // Все доступные конференции
        newApplicationsThisMonth: 2,
        newConferencesThisMonth: 1,
        // Дополнительные метрики для участника
        averageReviewTime: 4.2,
        certificatesIssued: 5,
        participationRate: 85.7,
        satisfactionScore: 4.6,
      };
    }

    // Логика для организатора
    if (filters?.organizerId) {
      baseStats = {
        ...baseStats,
        totalConferences: 8,
        publishedConferences: 6,
        totalApplications: 234,
        pendingApplications: 23,
        acceptedApplications: 156,
        rejectedApplications: 31,
        newConferencesThisMonth: 2,
        newApplicationsThisMonth: 45,
        averageReviewTime: 5.8,
        acceptanceRate: 66.7,
      };
    }

    // Логика для обычного пользователя (userId)
    if (
      filters?.userId &&
      !filters?.participantId &&
      !filters?.organizerId &&
      !filters?.reviewerId
    ) {
      baseStats = {
        ...baseStats,
        totalApplications: 8,
        acceptedApplications: 5,
        rejectedApplications: 1,
        pendingApplications: 2,
        newApplicationsThisMonth: 2,
      };
    }

    return baseStats;
  };

  const currentStats = stats || getFilteredStats();

  // ИСПРАВЛЕНИЕ: Адаптированные карточки для участника
  const getStatCards = () => {
    const totalApps = safeNumber(currentStats.totalApplications);
    const acceptedApps = safeNumber(currentStats.acceptedApplications);
    const pendingApps = safeNumber(currentStats.pendingApplications);
    const totalConfs = safeNumber(currentStats.totalConferences);
    const activeUsers = safeNumber(currentStats.activeUsers);
    const totalUsers = safeNumber(currentStats.totalUsers);
    const publishedConfs = safeNumber(currentStats.publishedConferences);

    if (variant === "participant") {
      return [
        {
          title: "Мои заявки",
          value: totalApps,
          change: `+${safeNumber(
            currentStats.newApplicationsThisMonth
          )} за месяц`,
          icon: FileText,
          color: "bg-blue-500",
          changeColor: "text-green-600",
        },
        {
          title: "Принятые заявки",
          value: acceptedApps,
          change:
            totalApps > 0
              ? `${Math.round((acceptedApps / totalApps) * 100)}% успешности`
              : "0% успешности",
          icon: CheckCircle,
          color: "bg-green-500",
          changeColor: "text-green-600",
        },
        {
          title: "На рассмотрении",
          value: pendingApps,
          change:
            totalApps > 0
              ? `${Math.round(
                  (pendingApps / totalApps) * 100
                )}% от общего числа`
              : "0% от общего числа",
          icon: Clock,
          color: "bg-yellow-500",
          changeColor: "text-yellow-600",
        },
        {
          title: "Сертификаты",
          value: safeNumber(currentStats.certificatesIssued),
          change: "За все время",
          icon: Award,
          color: "bg-purple-500",
          changeColor: "text-purple-600",
        },
        {
          title: "Рейтинг участия",
          value: Math.round(safeNumber(currentStats.participationRate)),
          change: "Посещаемость конференций",
          icon: Star,
          color: "bg-orange-500",
          changeColor: "text-orange-600",
          suffix: "%",
        },
        {
          title: "Оценка качества",
          value:
            Math.round(safeNumber(currentStats.satisfactionScore) * 10) / 10, // Округляем до 1 знака
          change: "Средняя оценка докладов",
          icon: Target,
          color: "bg-indigo-500",
          changeColor: "text-indigo-600",
          suffix: "/5",
        },
      ];
    }

    // Карточки для организатора
    if (variant === "organizer") {
      return [
        {
          title: "Мои конференции",
          value: totalConfs,
          change: `${publishedConfs} опубликованы`,
          icon: Calendar,
          color: "bg-purple-500",
          changeColor: "text-purple-600",
        },
        {
          title: "Заявки в моих конференциях",
          value: totalApps,
          change: `+${safeNumber(
            currentStats.newApplicationsThisMonth
          )} за месяц`,
          icon: FileText,
          color: "bg-orange-500",
          changeColor: "text-green-600",
        },
        {
          title: "На рассмотрении",
          value: pendingApps,
          change:
            totalApps > 0
              ? `${Math.round(
                  (pendingApps / totalApps) * 100
                )}% от общего числа`
              : "0% от общего числа",
          icon: Clock,
          color: "bg-yellow-500",
          changeColor: "text-yellow-600",
        },
        {
          title: "Принятые заявки",
          value: acceptedApps,
          change:
            totalApps > 0
              ? `${Math.round((acceptedApps / totalApps) * 100)}% успешности`
              : "0% успешности",
          icon: CheckCircle,
          color: "bg-emerald-500",
          changeColor: "text-emerald-600",
        },
      ];
    }

    // Карточки для администратора (по умолчанию)
    return [
      {
        title: "Всего пользователей",
        value: totalUsers,
        change: `+${safeNumber(currentStats.newUsersThisMonth)} за месяц`,
        icon: Users,
        color: "bg-blue-500",
        changeColor: "text-green-600",
      },
      {
        title: "Активные пользователи",
        value: activeUsers,
        change:
          totalUsers > 0
            ? `${Math.round((activeUsers / totalUsers) * 100)}% от общего числа`
            : "0% от общего числа",
        icon: Activity,
        color: "bg-green-500",
        changeColor: "text-blue-600",
      },
      {
        title: "Конференции",
        value: totalConfs,
        change: `${publishedConfs} опубликованы`,
        icon: Calendar,
        color: "bg-purple-500",
        changeColor: "text-purple-600",
      },
      {
        title: "Заявки на участие",
        value: totalApps,
        change: `+${safeNumber(
          currentStats.newApplicationsThisMonth
        )} за месяц`,
        icon: FileText,
        color: "bg-orange-500",
        changeColor: "text-green-600",
      },
      {
        title: "На рассмотрении",
        value: pendingApps,
        change:
          totalApps > 0
            ? `${Math.round((pendingApps / totalApps) * 100)}% от общего числа`
            : "0% от общего числа",
        icon: Clock,
        color: "bg-yellow-500",
        changeColor: "text-yellow-600",
      },
      {
        title: "Принятые заявки",
        value: acceptedApps,
        change:
          totalApps > 0
            ? `${Math.round((acceptedApps / totalApps) * 100)}% успешности`
            : "0% успешности",
        icon: CheckCircle,
        color: "bg-emerald-500",
        changeColor: "text-emerald-600",
      },
    ];
  };

  const statCards = getStatCards();

  return (
    <div className="space-y-6">
      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {safeNumber(stat.value).toLocaleString()}
                  {stat.suffix || ""}
                </p>
                <p className={`text-sm ${stat.changeColor} mt-1`}>
                  {stat.change}
                </p>
              </div>
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
