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
      userGrowthRate: 12.5,
      applicationGrowthRate: 8.3,
      conferenceGrowthRate: 15.2,
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
        userGrowthRate: 0, // Не релевантно для участника
        applicationGrowthRate: 20.0,
        conferenceGrowthRate: 0,
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
        conferenceGrowthRate: 25.0,
        applicationGrowthRate: 15.2,
        averageReviewTime: 5.8,
        acceptanceRate: 66.7,
      };
    }

    // Логика для рецензента
    if (filters?.reviewerId) {
      baseStats = {
        ...baseStats,
        totalApplications: 45, // Заявки на рецензирование
        pendingApplications: 8, // Ожидающие рецензии
        acceptedApplications: 28, // Рекомендованные к принятию
        rejectedApplications: 9, // Рекомендованные к отклонению
        newApplicationsThisMonth: 12,
        averageReviewTime: 3.2,
        satisfactionScore: 4.4,
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
    if (variant === "participant") {
      return [
        {
          title: "Мои заявки",
          value: currentStats.totalApplications,
          change: `+${currentStats.newApplicationsThisMonth} за месяц`,
          icon: FileText,
          color: "bg-blue-500",
          changeColor: "text-green-600",
        },
        {
          title: "Принятые заявки",
          value: currentStats.acceptedApplications,
          change: `${Math.round(
            (currentStats.acceptedApplications /
              currentStats.totalApplications) *
              100
          )}% успешности`,
          icon: CheckCircle,
          color: "bg-green-500",
          changeColor: "text-green-600",
        },
        {
          title: "На рассмотрении",
          value: currentStats.pendingApplications,
          change: `${Math.round(
            (currentStats.pendingApplications /
              currentStats.totalApplications) *
              100
          )}% от общего числа`,
          icon: Clock,
          color: "bg-yellow-500",
          changeColor: "text-yellow-600",
        },
        {
          title: "Сертификаты",
          value: currentStats.certificatesIssued || 0,
          change: "За все время",
          icon: Award,
          color: "bg-purple-500",
          changeColor: "text-purple-600",
        },
        {
          title: "Рейтинг участия",
          value: Math.round(currentStats.participationRate || 0),
          change: "Посещаемость конференций",
          icon: Star,
          color: "bg-orange-500",
          changeColor: "text-orange-600",
          suffix: "%",
        },
        {
          title: "Оценка качества",
          value: currentStats.satisfactionScore || 0,
          change: "Средняя оценка докладов",
          icon: Target,
          color: "bg-indigo-500",
          changeColor: "text-indigo-600",
          suffix: "/5",
        },
      ];
    }

    if (variant === "reviewer") {
      return [
        {
          title: "Заявки на рецензию",
          value: currentStats.totalApplications,
          change: `+${currentStats.newApplicationsThisMonth} за месяц`,
          icon: FileText,
          color: "bg-blue-500",
          changeColor: "text-green-600",
        },
        {
          title: "Завершенные рецензии",
          value:
            currentStats.acceptedApplications +
            currentStats.rejectedApplications,
          change: `${Math.round(
            ((currentStats.acceptedApplications +
              currentStats.rejectedApplications) /
              currentStats.totalApplications) *
              100
          )}% выполнено`,
          icon: CheckCircle,
          color: "bg-green-500",
          changeColor: "text-green-600",
        },
        {
          title: "Ожидают рецензии",
          value: currentStats.pendingApplications,
          change: `${Math.round(
            (currentStats.pendingApplications /
              currentStats.totalApplications) *
              100
          )}% от общего числа`,
          icon: Clock,
          color: "bg-yellow-500",
          changeColor: "text-yellow-600",
        },
        {
          title: "Среднее время рецензии",
          value: Math.round(currentStats.averageReviewTime || 0),
          change: "дней на заявку",
          icon: Activity,
          color: "bg-purple-500",
          changeColor: "text-purple-600",
          suffix: " дн.",
        },
      ];
    }

    // Карточки для организатора
    if (variant === "organizer") {
      return [
        {
          title: "Мои конференции",
          value: currentStats.totalConferences,
          change: `${currentStats.publishedConferences} опубликованы`,
          icon: Calendar,
          color: "bg-purple-500",
          changeColor: "text-purple-600",
        },
        {
          title: "Заявки в моих конференциях",
          value: currentStats.totalApplications,
          change: `+${currentStats.newApplicationsThisMonth} за месяц`,
          icon: FileText,
          color: "bg-orange-500",
          changeColor: "text-green-600",
        },
        {
          title: "На рассмотрении",
          value: currentStats.pendingApplications,
          change: `${Math.round(
            (currentStats.pendingApplications /
              currentStats.totalApplications) *
              100
          )}% от общего числа`,
          icon: Clock,
          color: "bg-yellow-500",
          changeColor: "text-yellow-600",
        },
        {
          title: "Принятые заявки",
          value: currentStats.acceptedApplications,
          change: `${Math.round(
            (currentStats.acceptedApplications /
              currentStats.totalApplications) *
              100
          )}% успешности`,
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
        value: currentStats.totalUsers,
        change: `+${currentStats.newUsersThisMonth} за месяц`,
        icon: Users,
        color: "bg-blue-500",
        changeColor: "text-green-600",
      },
      {
        title: "Активные пользователи",
        value: currentStats.activeUsers,
        change: `${Math.round(
          (currentStats.activeUsers / currentStats.totalUsers) * 100
        )}% от общего числа`,
        icon: Activity,
        color: "bg-green-500",
        changeColor: "text-blue-600",
      },
      {
        title: "Конференции",
        value: currentStats.totalConferences,
        change: `${currentStats.publishedConferences} опубликованы`,
        icon: Calendar,
        color: "bg-purple-500",
        changeColor: "text-purple-600",
      },
      {
        title: "Заявки на участие",
        value: currentStats.totalApplications,
        change: `+${currentStats.newApplicationsThisMonth} за месяц`,
        icon: FileText,
        color: "bg-orange-500",
        changeColor: "text-green-600",
      },
      {
        title: "На рассмотрении",
        value: currentStats.pendingApplications,
        change: `${Math.round(
          (currentStats.pendingApplications / currentStats.totalApplications) *
            100
        )}% от общего числа`,
        icon: Clock,
        color: "bg-yellow-500",
        changeColor: "text-yellow-600",
      },
      {
        title: "Принятые заявки",
        value: currentStats.acceptedApplications,
        change: `${Math.round(
          (currentStats.acceptedApplications / currentStats.totalApplications) *
            100
        )}% успешности`,
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
                  {stat.value.toLocaleString()}
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

      {/* Дополнительная статистика */}
      {showDetailedView && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {variant === "participant"
                  ? "Активность"
                  : variant === "organizer"
                  ? "Рост заявок"
                  : variant === "reviewer"
                  ? "Эффективность"
                  : "Рост пользователей"}
              </h3>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600">
              {variant === "participant"
                ? `${Math.round(currentStats.participationRate || 85)}%`
                : variant === "organizer"
                ? `+${currentStats.applicationGrowthRate}%`
                : variant === "reviewer"
                ? `${Math.round(currentStats.averageReviewTime || 3.2)}`
                : `+${currentStats.userGrowthRate}%`}
            </div>
            <p className="text-sm text-gray-600">
              {variant === "participant"
                ? "Уровень участия в конференциях"
                : variant === "organizer"
                ? "По сравнению с прошлым месяцем"
                : variant === "reviewer"
                ? "Среднее время рецензии (дни)"
                : "По сравнению с прошлым месяцем"}
            </p>
          </div>

          {variant !== "participant" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {variant === "admin" ? "Здоровье системы" : "Качество работы"}
                </h3>
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {variant === "admin"
                  ? `${currentStats.systemHealth}%`
                  : variant === "organizer"
                  ? `${Math.round(currentStats.acceptanceRate || 67)}%`
                  : `${currentStats.satisfactionScore || 4.4}`}
              </div>
              <p className="text-sm text-gray-600">
                {variant === "admin"
                  ? "Время работы и производительность"
                  : variant === "organizer"
                  ? "Коэффициент принятия заявок"
                  : "Средняя оценка качества рецензий"}
              </p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {variant === "participant"
                  ? "Достижения"
                  : variant === "organizer"
                  ? "Эффективность"
                  : variant === "reviewer"
                  ? "Производительность"
                  : "Использование места"}
              </h3>
              <Award className="h-5 w-5 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-orange-600">
              {variant === "participant"
                ? `${currentStats.certificatesIssued || 5}`
                : variant === "organizer"
                ? `${Math.round(
                    (currentStats.acceptedApplications /
                      currentStats.totalApplications) *
                      100
                  )}%`
                : variant === "reviewer"
                ? `${
                    currentStats.acceptedApplications +
                    currentStats.rejectedApplications
                  }`
                : `${currentStats.storageUsed}%`}
            </div>
            <div className="text-sm text-gray-600">
              {variant === "participant" ? (
                "Полученных сертификатов"
              ) : variant === "organizer" ? (
                "Коэффициент принятия заявок"
              ) : variant === "reviewer" ? (
                "Завершенных рецензий"
              ) : (
                <>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${currentStats.storageUsed}%` }}
                    ></div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Показываем информацию о фильтрах */}
      {filters && Object.keys(filters).length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Activity className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm text-blue-800">
              {filters.participantId &&
                "Показана ваша персональная статистика как участника"}
              {filters.organizerId &&
                "Показана статистика для ваших конференций"}
              {filters.reviewerId && "Показана ваша статистика как рецензента"}
              {filters.userId &&
                !filters.participantId &&
                !filters.organizerId &&
                !filters.reviewerId &&
                "Показана ваша персональная статистика"}
              {filters.conferenceId &&
                "Показана статистика для выбранной конференции"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
