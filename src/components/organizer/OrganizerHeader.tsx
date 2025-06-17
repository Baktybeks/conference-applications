// src/components/organizer/OrganizerHeader.tsx
"use client";

import React from "react";
import { Users } from "lucide-react";

interface User {
  $id: string;
  name: string;
  email: string;
  organization?: string;
}

interface OrganizerHeaderProps {
  user: User;
  className?: string;
}

export function OrganizerHeader({
  user,
  className = "",
}: OrganizerHeaderProps) {
  return (
    <div className={`bg-white shadow-sm border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          {/* Левая часть - заголовок */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Панель организатора
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Добро пожаловать, {user.name}! Управляйте конференциями и заявками
            </p>
            {user.organization && (
              <p className="text-xs text-gray-500 mt-1">{user.organization}</p>
            )}
          </div>

          {/* Правая часть - профиль */}
          <div className="flex items-center space-x-3">
            {/* Информация о пользователе */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">Организатор</p>
              </div>

              {/* Аватар */}
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
