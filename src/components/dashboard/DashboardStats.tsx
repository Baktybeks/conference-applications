// src/components/dashboard/DashboardStats.tsx

"use client";

import React, { useMemo } from "react";
import { useDashboardStats } from "@/services/conferenceService";
import {
  BarChart3,
  Calendar,
  FileText,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  Activity,
  Award,
} from "lucide-react";
import {
  DashboardStats as StatsType,
  ConferenceTheme,
  ApplicationStatus,
  getThemeLabel,
  getStatusLabel,
} from "@/types";

interface DashboardStatsProps {
  filters?: {
    organizerId?: string;
    participantId?: string;
  };
}

export function DashboardStats({ filters }: DashboardStatsProps) {
  const { data: stats, isLoading, error, refetch } = useDashboardStats(filters);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState onRetry={refetch} />;
  }

  if (!stats) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Основная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Всего конференций"
          value={stats.totalConferences}
          icon={Calendar}
          color="blue"
          trend={
            stats.monthlyStats.length > 1
              ? calculateTrend(
                  stats.monthlyStats,
                  "conferences",
                  stats.monthlyStats.length - 2,
                  stats.monthlyStats.length - 1
                )
              : undefined
          }
        />
        <StatCard
          title="Активные конференции"
          value={stats.activeConferences}
          icon={Star}
          color="green"
          description="Проходят сейчас"
        />
        <StatCard
          title="Всего заявок"
          value={stats.totalApplications}
          icon={FileText}
          color="purple"
          trend={
            stats.monthlyStats.length > 1
              ? calculateTrend(
                  stats.monthlyStats,
                  "applications",
                  stats.monthlyStats.length - 2,
                  stats.monthlyStats.length - 1
                )
              : undefined
          }
        />
        <StatCard
          title="Предстоящие"
          value={stats.upcomingConferences}
          icon={Clock}
          color="orange"
          description="Конференции в будущем"
        />
      </div>

      {/* Статистика заявок */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="На рассмотрении"
          value={stats.pendingApplications}
          icon={Clock}
          color="yellow"
          description="Требуют внимания"
        />
        <StatCard
          title="Принято"
          value={stats.acceptedApplications}
          icon={CheckCircle}
          color="green"
          percentage={
            stats.totalApplications > 0
              ? Math.round(
                  (stats.acceptedApplications / stats.totalApplications) * 100
                )
              : 0
          }
        />
        <StatCard
          title="Отклонено"
          value={stats.rejectedApplications}
          icon={XCircle}
          color="red"
          percentage={
            stats.totalApplications > 0
              ? Math.round(
                  (stats.rejectedApplications / stats.totalApplications) * 100
                )
              : 0
          }
        />
        <StatCard
          title="Процент принятия"
          value={
            stats.totalApplications > 0
              ? `${Math.round(
                  (stats.acceptedApplications / stats.totalApplications) * 100
                )}%`
              : "0%"
          }
          icon={Award}
          color="indigo"
          description="Успешных заявок"
        />
      </div>

      {/* Графики и детальная статистика */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Статистика по тематикам */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
            Заявки по тематикам
          </h3>
          <ThemeStatsChart data={stats.applicationsByTheme} />
        </div>

        {/* Статистика по статусам */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-indigo-600" />
            Статусы заявок
          </h3>
          <StatusStatsChart data={stats.applicationsByStatus} />
        </div>
      </div>

      {/* Месячная статистика */}
      {stats.monthlyStats.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
            Динамика по месяцам
          </h3>
          <MonthlyStatsChart data={stats.monthlyStats} />
        </div>
      )}
    </div>
  );
}

// Компонент карточки статистики
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "green" | "purple" | "orange" | "yellow" | "red" | "indigo";
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  percentage?: number;
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  description,
  trend,
  percentage,
}: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-500 text-blue-600",
    green: "bg-green-500 text-green-600",
    purple: "bg-purple-500 text-purple-600",
    orange: "bg-orange-500 text-orange-600",
    yellow: "bg-yellow-500 text-yellow-600",
    red: "bg-red-500 text-red-600",
    indigo: "bg-indigo-500 text-indigo-600",
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center">
        <div className={`${colorClasses[color].split(" ")[0]} rounded-lg p-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {percentage !== undefined && (
              <p className="ml-2 text-sm text-gray-500">({percentage}%)</p>
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
          {trend && (
            <div className="flex items-center mt-1">
              <TrendingUp
                className={`h-3 w-3 mr-1 ${
                  trend.isPositive ? "text-green-500" : "text-red-500"
                } ${trend.isPositive ? "" : "transform rotate-180"}`}
              />
              <span
                className={`text-xs ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}% за месяц
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Компонент графика по тематикам
function ThemeStatsChart({ data }: { data: Record<ConferenceTheme, number> }) {
  const sortedData = useMemo(() => {
    return Object.entries(data)
      .filter(([_, count]) => count > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6); // Показываем топ-6
  }, [data]);

  const maxValue = Math.max(...sortedData.map(([, count]) => count));

  if (sortedData.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Нет данных для отображения</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedData.map(([theme, count]) => (
        <div key={theme} className="flex items-center">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">
                {getThemeLabel(theme as ConferenceTheme)}
              </span>
              <span className="text-sm text-gray-500">{count}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${maxValue > 0 ? (count / maxValue) * 100 : 0}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Компонент графика по статусам
function StatusStatsChart({
  data,
}: {
  data: Record<ApplicationStatus, number>;
}) {
  const statusColors = {
    [ApplicationStatus.DRAFT]: "bg-gray-500",
    [ApplicationStatus.SUBMITTED]: "bg-yellow-500",
    [ApplicationStatus.UNDER_REVIEW]: "bg-blue-500",
    [ApplicationStatus.ACCEPTED]: "bg-green-500",
    [ApplicationStatus.REJECTED]: "bg-red-500",
    [ApplicationStatus.WAITLIST]: "bg-orange-500",
  };

  const sortedData = useMemo(() => {
    return Object.entries(data)
      .filter(([_, count]) => count > 0)
      .sort(([, a], [, b]) => b - a);
  }, [data]);

  const totalCount = sortedData.reduce((sum, [, count]) => sum + count, 0);

  if (sortedData.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Нет данных для отображения</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedData.map(([status, count]) => {
        const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
        return (
          <div key={status} className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-3 ${
                statusColors[status as ApplicationStatus]
              }`}
            ></div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {getStatusLabel(status as ApplicationStatus)}
                </span>
                <span className="text-sm text-gray-500">
                  {count} ({percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    statusColors[status as ApplicationStatus]
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Компонент месячной статистики
function MonthlyStatsChart({
  data,
}: {
  data: Array<{
    month: string;
    conferences: number;
    applications: number;
  }>;
}) {
  const maxConferences = Math.max(...data.map((d) => d.conferences));
  const maxApplications = Math.max(...data.map((d) => d.applications));

  return (
    <div className="space-y-6">
      {/* Конференции */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Конференции</h4>
        <div className="grid grid-cols-1 sm:grid-cols-6 lg:grid-cols-12 gap-2">
          {data.map((item) => {
            const height =
              maxConferences > 0
                ? (item.conferences / maxConferences) * 100
                : 0;
            return (
              <div key={`conf-${item.month}`} className="text-center">
                <div className="h-20 flex items-end justify-center mb-2">
                  <div
                    className="bg-blue-500 rounded-t transition-all duration-300 min-h-1"
                    style={{
                      height: `${Math.max(height, 4)}%`,
                      width: "20px",
                    }}
                    title={`${item.conferences} конференций`}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">
                  {formatMonth(item.month)}
                </div>
                <div className="text-xs font-medium text-gray-700">
                  {item.conferences}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Заявки */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Заявки</h4>
        <div className="grid grid-cols-1 sm:grid-cols-6 lg:grid-cols-12 gap-2">
          {data.map((item) => {
            const height =
              maxApplications > 0
                ? (item.applications / maxApplications) * 100
                : 0;
            return (
              <div key={`app-${item.month}`} className="text-center">
                <div className="h-20 flex items-end justify-center mb-2">
                  <div
                    className="bg-purple-500 rounded-t transition-all duration-300 min-h-1"
                    style={{
                      height: `${Math.max(height, 4)}%`,
                      width: "20px",
                    }}
                    title={`${item.applications} заявок`}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">
                  {formatMonth(item.month)}
                </div>
                <div className="text-xs font-medium text-gray-700">
                  {item.applications}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Состояние загрузки
function LoadingState() {
  return (
    <div className="space-y-6">
      {/* Основная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-md p-6 animate-pulse"
          >
            <div className="flex items-center">
              <div className="bg-gray-300 rounded-lg w-12 h-12"></div>
              <div className="ml-4 flex-1">
                <div className="bg-gray-300 rounded h-4 w-24 mb-2"></div>
                <div className="bg-gray-300 rounded h-6 w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Вторая строка статистики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-md p-6 animate-pulse"
          >
            <div className="flex items-center">
              <div className="bg-gray-300 rounded-lg w-12 h-12"></div>
              <div className="ml-4 flex-1">
                <div className="bg-gray-300 rounded h-4 w-24 mb-2"></div>
                <div className="bg-gray-300 rounded h-6 w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-md p-6 animate-pulse"
          >
            <div className="bg-gray-300 rounded h-6 w-48 mb-4"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex items-center">
                  <div className="bg-gray-300 rounded h-4 flex-1 mr-4"></div>
                  <div className="bg-gray-300 rounded h-4 w-12"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Состояние ошибки
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="text-center py-12">
      <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Ошибка загрузки статистики
      </h3>
      <p className="text-gray-600 mb-4">
        Не удалось загрузить данные статистики. Проверьте соединение с
        интернетом.
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
      >
        <TrendingUp className="h-4 w-4 mr-2" />
        Повторить
      </button>
    </div>
  );
}

// Пустое состояние
function EmptyState() {
  return (
    <div className="text-center py-12">
      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Нет данных для статистики
      </h3>
      <p className="text-gray-600">
        Статистика будет доступна после создания конференций и подачи заявок.
      </p>
    </div>
  );
}

// Утилитарные функции
function calculateTrend(
  data: Array<{ month: string; conferences: number; applications: number }>,
  field: "conferences" | "applications",
  prevIndex: number,
  currentIndex: number
): { value: number; isPositive: boolean } | undefined {
  if (prevIndex < 0 || currentIndex >= data.length) return undefined;

  const prevValue = data[prevIndex][field];
  const currentValue = data[currentIndex][field];

  if (prevValue === 0) return undefined;

  const changePercent = ((currentValue - prevValue) / prevValue) * 100;

  return {
    value: Math.abs(Math.round(changePercent)),
    isPositive: changePercent >= 0,
  };
}

function formatMonth(monthString: string): string {
  const [year, month] = monthString.split("-");
  const monthNames = [
    "Янв",
    "Фев",
    "Мар",
    "Апр",
    "Май",
    "Июн",
    "Июл",
    "Авг",
    "Сен",
    "Окт",
    "Ноя",
    "Дек",
  ];

  const monthIndex = parseInt(month) - 1;
  return `${monthNames[monthIndex]} ${year.slice(-2)}`;
}
