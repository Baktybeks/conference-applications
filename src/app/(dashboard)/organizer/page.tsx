// src/app/(dashboard)/organizer/page.tsx
"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { OrganizerHeader } from "@/components/organizer/OrganizerHeader";
import { Tabs, TabItem } from "@/components/ui/Tabs";
import { QuickStats } from "@/components/organizer/dashboard/QuickStats";
import { OrganizerConferencesView } from "@/components/organizer/conferences/OrganizerConferencesView";
import { ApplicationsList } from "@/components/applications/ApplicationsList";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { Conference, ConferenceApplication } from "@/types";
import {
  Calendar,
  FileText,
  BarChart3,
  UserCheck,
  Clock,
  Settings,
} from "lucide-react";

// Импорты для компонентов, которые еще не созданы
// import { DashboardView } from "@/components/organizer/dashboard/DashboardView";
// import { ReviewManagement } from "@/components/organizer/reviews/ReviewManagement";
// import { ScheduleManagement } from "@/components/organizer/schedule/ScheduleManagement";
// import { OrganizerSettings } from "@/components/organizer/settings/OrganizerSettings";

type ActiveTab =
  | "dashboard"
  | "conferences"
  | "applications"
  | "reviews"
  | "schedule"
  | "settings";

export default function OrganizerPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");

  // Загрузка
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Конфигурация вкладок
  const tabItems: TabItem[] = [
    {
      id: "dashboard",
      label: "Аналитика",
      icon: BarChart3,
    },
    {
      id: "conferences",
      label: "Мои конференции",
      icon: Calendar,
      badge: 5, // TODO: Получать из API
    },
    {
      id: "applications",
      label: "Заявки участников",
      icon: FileText,
      badge: 23, // TODO: Получать из API
    },
    {
      id: "reviews",
      label: "Рецензирование",
      icon: UserCheck,
      badge: 15, // TODO: Получать из API
    },
    {
      id: "schedule",
      label: "Программа",
      icon: Clock,
    },
    {
      id: "settings",
      label: "Настройки",
      icon: Settings,
    },
  ];

  // Обработчики событий
  const handleConferenceClick = (conference: Conference) => {
    // TODO: Открыть модальное окно с деталями конференции
    console.log("Открыть конференцию:", conference);
  };

  const handleConferenceEdit = (conference: Conference) => {
    // TODO: Открыть форму редактирования конференции
    console.log("Редактировать конференцию:", conference);
  };

  const handleApplicationClick = (application: ConferenceApplication) => {
    // TODO: Открыть модальное окно с деталями заявки
    console.log("Открыть заявку:", application);
  };

  const handleApplicationReview = (application: ConferenceApplication) => {
    // TODO: Открыть форму рецензирования заявки
    console.log("Рецензировать заявку:", application);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <OrganizerHeader user={user} />

      {/* Быстрая статистика */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <QuickStats organizerId={user.$id} />
        </div>
      </div>

      {/* Навигационные вкладки */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs
            items={tabItems}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as ActiveTab)}
            variant="underline"
          />
        </div>
      </div>

      {/* Контент */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Основная статистика */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Общая статистика
              </h2>
              <DashboardStats filters={{ organizerId: user.$id }} />
            </div>

            {/* TODO: Заменить на DashboardView компонент */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Аналитика (в разработке)
              </h3>
              <p className="text-gray-600">
                Здесь будет детальная аналитика по конференциям и заявкам
              </p>
            </div>
          </div>
        )}

        {activeTab === "conferences" && (
          <OrganizerConferencesView
            organizerId={user.$id}
            onConferenceClick={handleConferenceClick}
            onConferenceEdit={handleConferenceEdit}
          />
        )}

        {activeTab === "applications" && (
          <ApplicationsList
            onApplicationClick={handleApplicationClick}
            onApplicationReview={handleApplicationReview}
            showFilters={true}
            showOrganizerActions={true}
          />
        )}

        {activeTab === "reviews" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Управление рецензированием
            </h3>
            <p className="text-gray-600">
              Компонент ReviewManagement будет здесь
            </p>
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Управление программой конференций
            </h3>
            <p className="text-gray-600">
              Компонент ScheduleManagement будет здесь
            </p>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Настройки организатора
            </h3>
            <p className="text-gray-600">
              Компонент OrganizerSettings будет здесь
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
