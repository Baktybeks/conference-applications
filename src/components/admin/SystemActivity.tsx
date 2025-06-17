// src/components/admin/SystemActivity.tsx

"use client";

import React from "react";
import { Calendar, FileText, UserCheck, Award, Activity } from "lucide-react";

export function SystemActivity() {
  // TODO: Получить реальные данные о последних действиях
  const activities = [
    {
      id: "1",
      type: "conference_created",
      description: "Создана новая конференция 'AI in Healthcare 2024'",
      user: "Иванов И.И.",
      timestamp: "2024-01-28T15:30:00Z",
    },
    {
      id: "2",
      type: "application_submitted",
      description: "Подана заявка от Петрова П.П.",
      user: "Петров П.П.",
      timestamp: "2024-01-28T14:15:00Z",
    },
    {
      id: "3",
      type: "user_activated",
      description: "Активирован пользователь Сидорова С.С.",
      user: "Система",
      timestamp: "2024-01-28T13:45:00Z",
    },
    {
      id: "4",
      type: "application_reviewed",
      description: "Завершено рецензирование заявки",
      user: "Рецензент Р.Р.",
      timestamp: "2024-01-28T12:30:00Z",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "conference_created":
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case "application_submitted":
        return <FileText className="h-5 w-5 text-green-500" />;
      case "user_activated":
        return <UserCheck className="h-5 w-5 text-purple-500" />;
      case "application_reviewed":
        return <Award className="h-5 w-5 text-orange-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Последняя активность в системе
      </h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0 mr-4 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-gray-900">
                    {activity.description}
                  </p>
                  <span className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString("ru-RU")}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Пользователь: {activity.user}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            Показать всю активность
          </button>
        </div>
      </div>
    </div>
  );
}
