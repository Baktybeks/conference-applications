// src/app/(dashboard)/organizer/page.tsx
"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/common/Layout"; // ДОБАВЛЕНО: Используем Layout с Navbar
import { OrganizerHeader } from "@/components/organizer/OrganizerHeader";
import { Tabs, TabItem } from "@/components/ui/Tabs";
import { QuickStats } from "@/components/organizer/dashboard/QuickStats";
import { OrganizerConferencesView } from "@/components/organizer/conferences/OrganizerConferencesView";
import { ApplicationsList } from "@/components/applications/ApplicationsList";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { Conference, ConferenceApplication, UserRole } from "@/types";
import {
  Calendar,
  FileText,
  BarChart3,
  UserCheck,
  Clock,
  Settings,
  Eye,
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
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout showNavbar={false}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Требуется авторизация
            </h1>
            <p className="text-gray-600">
              Пожалуйста, войдите в систему для доступа к панели организатора.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (user.role !== UserRole.ORGANIZER && user.role !== UserRole.SUPER_ADMIN) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-lg shadow-lg">
            <Eye className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Доступ запрещен
            </h1>
            <p className="text-gray-600 mb-4">
              У вас нет прав для доступа к панели организатора.
            </p>
            <p className="text-sm text-gray-500">Ваша роль: {user.role}</p>
          </div>
        </div>
      </Layout>
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

  return (
    <Layout title="Панель организатора - Система конференций">
      <div className="min-h-screen bg-gray-50">
        {/* Заголовок - теперь более компактный, так как есть Navbar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Eye className="h-6 w-6 mr-3 text-indigo-600" />
                Панель организатора
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Добро пожаловать, {user.name}! Управляйте своими конференциями и
                заявками
              </p>
            </div>
          </div>
        </div>

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
                <DashboardStats
                  filters={{ organizerId: user.$id }}
                  variant="organizer"
                  showDetailedView={true}
                />
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
              showFilters={true}
              showOrganizerActions={true}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
