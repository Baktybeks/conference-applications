"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/common/Layout";
import { QuickSystemStats } from "@/components/admin/QuickSystemStats";
import { SystemActivity } from "@/components/admin/SystemActivity";
import { AdminAttentionRequired } from "@/components/admin/AdminAttentionRequired";
import { QuickActions } from "@/components/admin/QuickActions";
import { UsersManagement } from "@/components/admin/UsersManagement";
import { ConferencesList } from "@/components/conferences/ConferencesList";
import { ApplicationsList } from "@/components/applications/ApplicationsList";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { ApplicationReviewModal } from "@/components/applications/ApplicationReviewModal";
import { SystemAnalytics } from "@/components/analytics/SystemAnalytics";
import {
  Conference,
  ConferenceApplication,
  ApplicationWithDetails,
  UserRole,
} from "@/types";
import {
  BarChart3,
  Calendar,
  FileText,
  Users,
  Shield,
  TrendingUp,
} from "lucide-react";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "conferences"
    | "applications"
    | "users"
    | "analytics"
    | "settings"
  >("dashboard");

  const [selectedApplication, setSelectedApplication] = useState<
    ApplicationWithDetails | ConferenceApplication | null
  >(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Показываем загрузку
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  // Проверяем авторизацию
  if (!user) {
    return (
      <Layout showNavbar={false}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Требуется авторизация
            </h1>
            <p className="text-gray-600">
              Пожалуйста, войдите в систему для доступа к админ панели.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // Проверяем права доступа
  if (user.role !== UserRole.SUPER_ADMIN) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-lg shadow-lg">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Доступ запрещен
            </h1>
            <p className="text-gray-600 mb-4">
              У вас нет прав для доступа к админ панели.
            </p>
            <p className="text-sm text-gray-500">Ваша роль: {user.role}</p>
          </div>
        </div>
      </Layout>
    );
  }

  const handleConferenceClick = (conference: Conference) => {
    console.log("Открыть конференцию:", conference);
  };

  const handleConferenceEdit = (conference: Conference) => {
    console.log("Редактировать конференцию:", conference);
  };

  const handleApplicationClick = (application: ConferenceApplication) => {
    setSelectedApplication(application);
    setIsReviewModalOpen(true);
  };

  const handleApplicationReview = (application: ConferenceApplication) => {
    setSelectedApplication(application);
    setIsReviewModalOpen(true);
  };

  const handleReviewModalClose = () => {
    setIsReviewModalOpen(false);
    setSelectedApplication(null);
  };

  return (
    <Layout title="Админ панель - Система конференций">
      {/* Основной контент страницы */}
      <div className="bg-gray-50 min-h-screen">
        {/* Заголовок страницы */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Shield className="h-6 w-6 mr-3 text-red-600" />
                Панель супер администратора
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Добро пожаловать, {user.name}! Полный контроль над системой
                конференций
              </p>
            </div>
          </div>
        </div>

        {/* Быстрая статистика */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <QuickSystemStats />
          </div>
        </div>

        {/* Навигационные вкладки */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              <TabButton
                id="dashboard"
                label="Обзор системы"
                icon={BarChart3}
                isActive={activeTab === "dashboard"}
                onClick={() => setActiveTab("dashboard")}
              />
              <TabButton
                id="conferences"
                label="Все конференции"
                icon={Calendar}
                isActive={activeTab === "conferences"}
                onClick={() => setActiveTab("conferences")}
              />
              <TabButton
                id="applications"
                label="Все заявки"
                icon={FileText}
                isActive={activeTab === "applications"}
                onClick={() => setActiveTab("applications")}
              />
              <TabButton
                id="users"
                label="Пользователи"
                icon={Users}
                isActive={activeTab === "users"}
                onClick={() => setActiveTab("users")}
              />
              <TabButton
                id="analytics"
                label="Аналитика"
                icon={TrendingUp}
                isActive={activeTab === "analytics"}
                onClick={() => setActiveTab("analytics")}
              />
            </nav>
          </div>
        </div>

        {/* Контент вкладок */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Общая статистика системы
                </h2>
                <DashboardStats />
              </div>
              <SystemActivity />
              <AdminAttentionRequired />
              <QuickActions />
            </div>
          )}

          {activeTab === "conferences" && (
            <ConferencesList
              onConferenceClick={handleConferenceClick}
              onConferenceEdit={handleConferenceEdit}
              showFilters={true}
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

          {activeTab === "users" && <UsersManagement />}

          {activeTab === "analytics" && <SystemAnalytics />}
        </div>

        {/* Модальное окно рецензирования */}
        {selectedApplication && (
          <ApplicationReviewModal
            application={selectedApplication}
            isOpen={isReviewModalOpen}
            onClose={handleReviewModalClose}
            onUpdate={() => {
              // TODO: Обновить данные после изменений
            }}
          />
        )}
      </div>
    </Layout>
  );
}

// Компонент кнопки вкладки
interface TabButtonProps {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
  badge?: number;
}

function TabButton({
  label,
  icon: Icon,
  isActive,
  onClick,
  badge,
}: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
        isActive
          ? "border-indigo-500 text-indigo-600"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      }`}
    >
      <Icon className="h-4 w-4 mr-2" />
      {label}
      {badge && (
        <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}
