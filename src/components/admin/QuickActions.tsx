// src/components/admin/QuickActions.tsx

"use client";

import React from "react";
import { Calendar, Users, Mail, Download } from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      title: "Создать конференцию",
      description: "Добавить новую конференцию",
      icon: Calendar,
      action: () => console.log("Создать конференцию"),
      color: "bg-blue-500",
    },
    {
      title: "Добавить пользователя",
      description: "Создать нового пользователя",
      icon: Users,
      action: () => console.log("Добавить пользователя"),
      color: "bg-green-500",
    },
    {
      title: "Отправить уведомления",
      description: "Массовая рассылка",
      icon: Mail,
      action: () => console.log("Отправить уведомления"),
      color: "bg-purple-500",
    },
    {
      title: "Экспорт данных",
      description: "Скачать отчеты",
      icon: Download,
      action: () => console.log("Экспорт данных"),
      color: "bg-orange-500",
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Быстрые действия
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow text-left"
          >
            <div className={`${action.color} rounded-lg p-3 w-fit mb-4`}>
              <action.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">{action.title}</h3>
            <p className="text-sm text-gray-600">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
