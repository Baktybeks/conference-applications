"use client";

import React from "react";
import { Shield, Clock, Settings } from "lucide-react";

export function AdminAttentionRequired() {
  const items = [
    {
      id: "1",
      type: "pending_users",
      title: "12 пользователей ожидают активации",
      description: "Новые регистрации требуют одобрения администратора",
      urgency: "high" as const,
      action: "Проверить пользователей",
      count: 12,
    },
    {
      id: "2",
      type: "review_delays",
      title: "Задержки в рецензировании",
      description: "23 заявки находятся на рассмотрении более 7 дней",
      urgency: "medium" as const,
      action: "Назначить рецензентов",
      count: 23,
    },
  ];

  const getUrgencyColor = (urgency: "high" | "medium" | "low") => {
    switch (urgency) {
      case "high":
        return "border-red-200 bg-red-50";
      case "medium":
        return "border-yellow-200 bg-yellow-50";
      case "low":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getUrgencyIcon = (urgency: "high" | "medium" | "low") => {
    switch (urgency) {
      case "high":
        return <Shield className="h-5 w-5 text-red-500" />;
      case "medium":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "low":
        return <Settings className="h-5 w-5 text-blue-500" />;
      default:
        return <Settings className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Требует внимания администратора
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={`border rounded-lg p-4 ${getUrgencyColor(item.urgency)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3 mt-1">
                  {getUrgencyIcon(item.urgency)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1 flex items-center">
                    {item.title}
                    <span className="ml-2 bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                      {item.count}
                    </span>
                  </h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
              <button className="ml-4 px-3 py-1 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {item.action}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
