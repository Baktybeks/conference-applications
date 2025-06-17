// src/components/organizer/dashboard/RecentActivities.tsx
"use client";

import React from "react";
import {
  FileText,
  CheckCircle,
  Calendar,
  AlertTriangle,
  Clock,
  UserCheck,
  Users,
  Settings,
} from "lucide-react";
import { RecentActivity, ActivityType } from "@/types/organizer";

interface RecentActivitiesProps {
  organizerId: string;
  limit?: number;
  className?: string;
}

export function RecentActivities({
  organizerId,
  limit = 10,
  className = "",
}: RecentActivitiesProps) {
  // TODO: Заменить на реальный API вызов
  const activities: RecentActivity[] = [
    {
      id: "1",
      type: "application_submitted",
      description: "Новая заявка от Иванова И.И.",
      conference: "Конференция по ИИ 2024",
      timestamp: "2024-01-28T10:30:00Z",
      userName: "Иванов И.И.",
    },
    {
      id: "2",
      type: "review_completed",
      description: "Завершено рецензирование заявки",
      conference: "Симпозиум по ML",
      timestamp: "2024-01-28T09:15:00Z",
    },
    {
      id: "3",
      type: "conference_published",
      description: "Конференция опубликована",
      conference: "Конференция по Data Science",
      timestamp: "2024-01-27T14:22:00Z",
    },
    {
      id: "4",
      type: "deadline_reminder",
      description: "Приближается дедлайн подачи заявок",
      conference: "Блокчейн симпозиум",
      timestamp: "2024-01-27T08:00:00Z",
    },
    {
      id: "5",
      type: "reviewer_assigned",
      description: "Назначен рецензент для заявки #123",
      conference: "Конференция по ИИ 2024",
      timestamp: "2024-01-26T16:45:00Z",
    },
  ];

  const getActivityIcon = (type: ActivityType) => {
    const iconMap = {
      application_submitted: <FileText className="h-5 w-5 text-blue-500" />,
      review_completed: <CheckCircle className="h-5 w-5 text-green-500" />,
      conference_published: <Calendar className="h-5 w-5 text-purple-500" />,
      deadline_reminder: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
      conference_started: <Calendar className="h-5 w-5 text-green-500" />,
      conference_ended: <Calendar className="h-5 w-5 text-gray-500" />,
      reviewer_assigned: <UserCheck className="h-5 w-5 text-indigo-500" />,
      schedule_updated: <Settings className="h-5 w-5 text-blue-500" />,
    };

    return iconMap[type] || <Clock className="h-5 w-5 text-gray-500" />;
  };

  const getActivityColor = (type: ActivityType) => {
    const colorMap = {
      application_submitted: "border-l-blue-500 bg-blue-50",
      review_completed: "border-l-green-500 bg-green-50",
      conference_published: "border-l-purple-500 bg-purple-50",
      deadline_reminder: "border-l-yellow-500 bg-yellow-50",
      conference_started: "border-l-green-500 bg-green-50",
      conference_ended: "border-l-gray-500 bg-gray-50",
      reviewer_assigned: "border-l-indigo-500 bg-indigo-50",
      schedule_updated: "border-l-blue-500 bg-blue-50",
    };

    return colorMap[type] || "border-l-gray-500 bg-gray-50";
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} ${diffDays === 1 ? "день" : "дней"} назад`;
    } else if (diffHours > 0) {
      return `${diffHours} ${diffHours === 1 ? "час" : "часов"} назад`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} ${diffMinutes === 1 ? "минуту" : "минут"} назад`;
    }
  };

  const displayedActivities = activities.slice(0, limit);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Последние действия
        </h2>
        <button className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
          Посмотреть все
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="divide-y divide-gray-200">
          {displayedActivities.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Нет последних действий</p>
            </div>
          ) : (
            displayedActivities.map((activity) => (
              <div
                key={activity.id}
                className={`p-4 border-l-4 hover:bg-gray-50 transition-colors ${getActivityColor(
                  activity.type
                )}`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {activity.description}
                      </p>
                      <div className="text-right ml-4">
                        <span className="text-xs text-gray-500">
                          {getRelativeTime(activity.timestamp)}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-1">
                      {activity.conference}
                    </p>

                    <div className="flex items-center justify-between">
                      {activity.userName && (
                        <span className="inline-flex items-center text-xs text-gray-500">
                          <Users className="h-3 w-3 mr-1" />
                          {activity.userName}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
