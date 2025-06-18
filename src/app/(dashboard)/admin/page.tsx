"use client";

import React, { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/common/Layout";
import { QuickSystemStats } from "@/components/admin/QuickSystemStats";
import { QuickActions } from "@/components/admin/QuickActions";
import { UsersManagement } from "@/components/admin/UsersManagement";
import { ConferencesList } from "@/components/conferences/ConferencesList";
import { ApplicationsList } from "@/components/applications/ApplicationsList";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { ApplicationReviewModal } from "@/components/applications/ApplicationReviewModal";
import { Button } from "@/components/ui/Button";
import {
  useConferences,
  useDashboardStats,
  usePublishConference,
  useUnpublishConference,
} from "@/services/conferenceService";
import {
  useApplications,
  useReviewApplication,
} from "@/services/applicationService";
import {
  Conference,
  ConferenceApplication,
  ApplicationWithDetails,
  UserRole,
  ConferenceFilters,
  ApplicationStatus,
} from "@/types";
import {
  BarChart3,
  Calendar,
  FileText,
  Users,
  Shield,
  TrendingUp,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function AdminPage() {
  // ✅ ВСЕ ХУКИ В НАЧАЛЕ КОМПОНЕНТА
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

  const [conferenceFilters, setConferenceFilters] = useState<ConferenceFilters>(
    {}
  );

  // Хуки данных
  const {
    data: conferences = [],
    isLoading: conferencesLoading,
    error: conferencesError,
    refetch: refetchConferences,
  } = useConferences(conferenceFilters);

  const {
    data: dashboardStats,
    isLoading: statsLoading,
    error: statsError,
  } = useDashboardStats();

  const {
    data: applications = [],
    isLoading: applicationsLoading,
    error: applicationsError,
    refetch: refetchApplications,
  } = useApplications();

  // Хуки мутаций
  const publishConferenceMutation = usePublishConference();
  const unpublishConferenceMutation = useUnpublishConference();
  const reviewApplicationMutation = useReviewApplication();

  // Все useCallback хуки
  const handleConferenceClick = useCallback((conference: Conference) => {
    console.log("Открыть конференцию:", conference);
  }, []);

  const handleConferenceEdit = useCallback((conference: Conference) => {
    console.log("Редактировать конференцию:", conference);
  }, []);

  const handleApplicationClick = useCallback(
    (application: ConferenceApplication) => {
      setSelectedApplication(application);
      setIsReviewModalOpen(true);
    },
    []
  );

  const handleApplicationReview = useCallback(
    (application: ConferenceApplication) => {
      setSelectedApplication(application);
      setIsReviewModalOpen(true);
    },
    []
  );

  const handleReviewModalClose = useCallback(() => {
    setIsReviewModalOpen(false);
    setSelectedApplication(null);
  }, []);

  const handleApplicationUpdate = useCallback(() => {
    console.log("Заявка обновлена");
  }, []);

  const handleRefreshConferences = useCallback(async () => {
    try {
      await refetchConferences();
    } catch (error) {
      console.error("Ошибка при обновлении конференций:", error);
    }
  }, [refetchConferences]);

  const handleRefreshData = useCallback(async () => {
    try {
      await Promise.all([refetchConferences(), refetchApplications()]);
    } catch (error) {
      console.error("Ошибка при обновлении данных:", error);
    }
  }, [refetchConferences, refetchApplications]);

  const handlePublishConference = useCallback(
    async (conference: Conference) => {
      try {
        console.log("🚀 Публикация конференции:", {
          id: conference.$id,
          title: conference.title,
          currentStatus: conference.isPublished ? "опубликована" : "черновик",
          action: conference.isPublished
            ? "снять с публикации"
            : "опубликовать",
        });

        if (conference.isPublished) {
          await unpublishConferenceMutation.mutateAsync(conference.$id);
          console.log("✅ Конференция снята с публикации:", conference.title);
        } else {
          await publishConferenceMutation.mutateAsync(conference.$id);
          console.log("✅ Конференция опубликована:", conference.title);
        }
      } catch (error) {
        console.error("❌ Ошибка при изменении статуса публикации:", error);
      }
    },
    [publishConferenceMutation, unpublishConferenceMutation]
  );

  const handleAcceptApplication = useCallback(
    async (applicationId: string, comments?: string) => {
      try {
        await reviewApplicationMutation.mutateAsync({
          applicationId,
          status: ApplicationStatus.ACCEPTED as const,
          comments: comments || "Заявка принята администратором",
        });
        console.log("✅ Заявка принята:", applicationId);
      } catch (error) {
        console.error("❌ Ошибка при принятии заявки:", error);
        throw error;
      }
    },
    [reviewApplicationMutation]
  );

  const handleRejectApplication = useCallback(
    async (applicationId: string, comments?: string) => {
      try {
        await reviewApplicationMutation.mutateAsync({
          applicationId,
          status: ApplicationStatus.REJECTED as const,
          comments: comments || "Заявка отклонена администратором",
        });
        console.log("✅ Заявка отклонена:", applicationId);
      } catch (error) {
        console.error("❌ Ошибка при отклонении заявки:", error);
        throw error;
      }
    },
    [reviewApplicationMutation]
  );

  const handleWaitlistApplication = useCallback(
    async (applicationId: string, comments?: string) => {
      try {
        await reviewApplicationMutation.mutateAsync({
          applicationId,
          status: ApplicationStatus.WAITLIST as const,
          comments: comments || "Заявка добавлена в список ожидания",
        });
        console.log("✅ Заявка добавлена в список ожидания:", applicationId);
      } catch (error) {
        console.error("❌ Ошибка при добавлении в список ожидания:", error);
        throw error;
      }
    },
    [reviewApplicationMutation]
  );

  const renderError = useCallback(
    (error: any, title: string) => (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
        </div>
        <p className="text-sm text-red-700 mt-1">
          {error?.message || "Произошла ошибка при загрузке данных"}
        </p>
      </div>
    ),
    []
  );

  // ✅ УСЛОВНЫЕ ПРОВЕРКИ ПОСЛЕ ВСЕХ ХУКОВ
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
              Пожалуйста, войдите в систему для доступа к админ панели.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

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

  // ✅ ОСНОВНОЙ РЕНДЕР ПОСЛЕ ВСЕХ ПРОВЕРОК
  return (
    <Layout title="Админ панель - Система конференций">
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
              {dashboardStats && (
                <div className="mt-3 flex items-center space-x-6 text-sm text-gray-600">
                  <span>
                    Конференций:{" "}
                    <strong>{dashboardStats.totalConferences}</strong>
                  </span>
                  <span>
                    Заявок: <strong>{dashboardStats.totalApplications}</strong>
                  </span>
                  <span>
                    Пользователей:{" "}
                    <strong>{dashboardStats.totalUsers ?? "Н/Д"}</strong>
                    {dashboardStats.activeUsers !== undefined && (
                      <span className="text-green-600 ml-1">
                        ({dashboardStats.activeUsers} активных)
                      </span>
                    )}
                  </span>
                  {dashboardStats.systemHealth !== undefined && (
                    <span>
                      Система:{" "}
                      <strong
                        className={
                          dashboardStats.systemHealth >= 90
                            ? "text-green-600"
                            : "text-yellow-600"
                        }
                      >
                        {dashboardStats.systemHealth}%
                      </strong>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Быстрая статистика */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {statsError ? (
              renderError(statsError, "Ошибка загрузки статистики")
            ) : (
              <QuickSystemStats
                stats={dashboardStats}
                isLoading={statsLoading}
              />
            )}
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
                badge={conferences.length}
              />
              <TabButton
                id="applications"
                label="Все заявки"
                icon={FileText}
                isActive={activeTab === "applications"}
                onClick={() => setActiveTab("applications")}
                badge={
                  applications.filter(
                    (app) =>
                      app.status === "SUBMITTED" ||
                      app.status === "UNDER_REVIEW"
                  ).length
                }
              />
              <TabButton
                id="users"
                label="Пользователи"
                icon={Users}
                isActive={activeTab === "users"}
                onClick={() => setActiveTab("users")}
                badge={dashboardStats?.totalUsers ?? undefined}
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
                {statsError ? (
                  renderError(statsError, "Ошибка загрузки статистики")
                ) : (
                  <DashboardStats
                    stats={dashboardStats}
                    showDetailedView={true}
                    variant="admin"
                  />
                )}
              </div>
              <QuickActions />
            </div>
          )}

          {activeTab === "conferences" && (
            <div className="space-y-6">
              {conferencesError ? (
                renderError(conferencesError, "Ошибка загрузки конференций")
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Управление конференциями
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Просматривайте и управляйте всеми конференциями в
                        системе
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={RefreshCw}
                      onClick={handleRefreshConferences}
                    >
                      Обновить
                    </Button>
                  </div>

                  {conferencesLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      <span className="ml-3 text-gray-600">
                        Загрузка конференций...
                      </span>
                    </div>
                  ) : (
                    <ConferencesList
                      conferences={conferences}
                      onConferenceClick={handleConferenceClick}
                      onConferenceEdit={handleConferenceEdit}
                      onConferencePublish={handlePublishConference}
                      showFilters={true}
                      variant="admin"
                      showCreateButton={true}
                      showEditButton={true}
                      showPublishButton={true}
                      isLoading={conferencesLoading}
                    />
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "applications" && (
            <div className="space-y-6">
              {applicationsError ? (
                renderError(applicationsError, "Ошибка загрузки заявок")
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Управление заявками
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Просматривайте и управляйте всеми заявками в системе
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={RefreshCw}
                      onClick={handleRefreshData}
                    >
                      Обновить
                    </Button>
                  </div>

                  <ApplicationsList
                    applications={applications}
                    onApplicationClick={handleApplicationClick}
                    onApplicationReview={handleApplicationReview}
                    onApplicationAccept={handleAcceptApplication}
                    onApplicationReject={handleRejectApplication}
                    onApplicationWaitlist={handleWaitlistApplication}
                    showFilters={true}
                    showOrganizerActions={true}
                    variant="admin"
                    isLoading={applicationsLoading}
                  />
                </>
              )}
            </div>
          )}

          {activeTab === "users" && <UsersManagement />}
        </div>
      </div>

      {/* Модальное окно для просмотра заявки */}
      {isReviewModalOpen && selectedApplication && (
        <ApplicationReviewModal
          application={selectedApplication}
          isOpen={isReviewModalOpen}
          onClose={handleReviewModalClose}
          onUpdate={handleApplicationUpdate}
        />
      )}
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
  badge?: number | undefined;
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
      {badge !== undefined && badge !== null && badge > 0 && (
        <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}
