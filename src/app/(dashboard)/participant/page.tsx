// src/app/(dashboard)/participant/page.tsx

"use client";

import React, { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/common/Layout";
import { ConferencesList } from "@/components/conferences/ConferencesList";
import { ApplicationsList } from "@/components/applications/ApplicationsList";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { CreateApplicationModal } from "@/components/applications/CreateApplicationModal";
import { useConferences } from "@/services/conferenceService";
import { useParticipantApplications } from "@/services/applicationService";
import { Conference, ConferenceApplication, UserRole } from "@/types";
import {
  Calendar,
  FileText,
  BarChart3,
  User,
  Settings,
  Bell,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle,
  Mail,
  Phone,
  Building,
  RefreshCw,
  Plus,
} from "lucide-react";

export default function ParticipantPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "conferences" | "applications" | "certificates" | "profile"
  >("dashboard");

  // Состояние для модального окна подачи заявки
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [selectedConference, setSelectedConference] =
    useState<Conference | null>(null);

  // Загружаем реальные данные конференций (только опубликованные для участников)
  const {
    data: conferences = [],
    isLoading: conferencesLoading,
    error: conferencesError,
    refetch: refetchConferences,
  } = useConferences({ isPublished: true });

  // Загружаем заявки участника
  const {
    data: userApplications = [],
    isLoading: applicationsLoading,
    refetch: refetchApplications,
  } = useParticipantApplications(user?.$id || "");

  // ВСЕ КОЛБЭКИ ПЕРЕМЕЩЕНЫ В НАЧАЛО, ДО УСЛОВНЫХ ПРОВЕРОК
  const handleConferenceClick = useCallback(
    (conference: Conference) => {
      // Проверяем, есть ли уже заявка на эту конференцию
      const existingApplication = userApplications.find(
        (app) => app.conferenceId === conference.$id
      );

      if (existingApplication) {
        // Если заявка уже есть, показываем информацию
        console.log(
          "У вас уже есть заявку на эту конференцию:",
          existingApplication
        );
        // TODO: Можно показать модальное окно с информацией о существующей заявке
        setActiveTab("applications");
      } else {
        // Открываем модальное окно для подачи заявки
        setSelectedConference(conference);
        setIsApplicationModalOpen(true);
      }
    },
    [
      userApplications,
      setActiveTab,
      setSelectedConference,
      setIsApplicationModalOpen,
    ]
  );

  const handleApplicationClick = useCallback(
    (application: ConferenceApplication) => {
      // TODO: Открыть модальное окно с деталями заявки
      console.log("Открыть заявку:", application);
    },
    []
  );

  const handleRefreshData = useCallback(async () => {
    try {
      await Promise.all([refetchConferences(), refetchApplications()]);
    } catch (error) {
      console.error("Ошибка при обновлении данных:", error);
    }
  }, [refetchConferences, refetchApplications]);

  const handleApplicationModalClose = useCallback(() => {
    setIsApplicationModalOpen(false);
    setSelectedConference(null);
    // Обновляем данные после создания заявки
    refetchApplications();
  }, [refetchApplications]);

  // УСЛОВНЫЕ ПРОВЕРКИ ПОСЛЕ ВСЕХ ХУКОВ
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
              Пожалуйста, войдите в систему для доступа к личному кабинету.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (
    user.role !== UserRole.PARTICIPANT &&
    user.role !== UserRole.SUPER_ADMIN
  ) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-lg shadow-lg">
            <User className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Доступ запрещен
            </h1>
            <p className="text-gray-600 mb-4">
              У вас нет прав для доступа к кабинету участника.
            </p>
            <p className="text-sm text-gray-500">Ваша роль: {user.role}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Личный кабинет участника">
      <div className="min-h-screen bg-gray-50">
        {/* Заголовок - более компактный, так как основная навигация в Navbar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <User className="h-6 w-6 mr-3 text-purple-600" />
                  Личный кабинет участника
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Добро пожаловать, {user.name}! Управляйте своими заявками на
                  конференции
                </p>
                {/* Показываем краткую статистику */}
                <div className="flex items-center space-x-6 mt-3 text-sm text-gray-600">
                  <span>
                    Конференций:{" "}
                    <strong className="text-indigo-600">
                      {conferences.length}
                    </strong>
                  </span>
                  <span>
                    Заявок:{" "}
                    <strong className="text-green-600">
                      {userApplications.length}
                    </strong>
                  </span>
                  <span>
                    Принято:{" "}
                    <strong className="text-blue-600">
                      {
                        userApplications.filter(
                          (app) => app.status === "ACCEPTED"
                        ).length
                      }
                    </strong>
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRefreshData}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                  title="Обновить данные"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>

                {/* Быстрая кнопка для подачи заявки */}
                <button
                  onClick={() => setActiveTab("conferences")}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Найти конференции
                </button>

                <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                  <Bell className="h-5 w-5" />
                  {userApplications.filter(
                    (app) => app.status === "UNDER_REVIEW"
                  ).length > 0 && (
                    <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                  )}
                </button>

                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Навигационные вкладки */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              <TabButton
                id="dashboard"
                label="Обзор"
                icon={BarChart3}
                isActive={activeTab === "dashboard"}
                onClick={() => setActiveTab("dashboard")}
              />
              <TabButton
                id="conferences"
                label="Конференции"
                icon={Calendar}
                isActive={activeTab === "conferences"}
                onClick={() => setActiveTab("conferences")}
                badge={conferences.length}
              />
              <TabButton
                id="applications"
                label="Мои заявки"
                icon={FileText}
                isActive={activeTab === "applications"}
                onClick={() => setActiveTab("applications")}
                badge={userApplications.length}
              />
              <TabButton
                id="profile"
                label="Профиль"
                icon={Settings}
                isActive={activeTab === "profile"}
                onClick={() => setActiveTab("profile")}
              />
            </nav>
          </div>
        </div>

        {/* Контент */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              {/* Быстрые действия */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <QuickActionCard
                  title="Найти конференции"
                  description={`${conferences.length} доступных конференций`}
                  icon={Calendar}
                  color="bg-blue-500"
                  onClick={() => setActiveTab("conferences")}
                />
                <QuickActionCard
                  title="Мои заявки"
                  description={`${userApplications.length} поданных заявок`}
                  icon={FileText}
                  color="bg-green-500"
                  onClick={() => setActiveTab("applications")}
                />
                <QuickActionCard
                  title="Профиль"
                  description="Управление настройками"
                  icon={User}
                  color="bg-purple-500"
                  onClick={() => setActiveTab("profile")}
                />
              </div>

              {/* Ближайшие дедлайны */}
              <UpcomingDeadlines
                userId={user.$id}
                conferences={conferences}
                applications={userApplications}
              />
            </div>
          )}

          {activeTab === "conferences" && (
            <div className="space-y-6">
              {conferencesError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">Ошибка загрузки конференций</p>
                </div>
              )}

              <ConferencesList
                conferences={conferences}
                onConferenceClick={handleConferenceClick}
                showFilters={true}
                variant="participant"
                showCreateButton={false}
                showEditButton={false}
                isLoading={conferencesLoading}
              />
            </div>
          )}

          {activeTab === "applications" && (
            <div className="space-y-6">
              {applicationsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
                  <span className="text-gray-600">Загрузка заявок...</span>
                </div>
              ) : (
                <ApplicationsList
                  applications={userApplications}
                  initialFilters={{ participantId: user.$id }}
                  onApplicationClick={handleApplicationClick}
                  showFilters={true}
                  variant="participant"
                />
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <div className="max-w-2xl">
              <ProfileSection user={user} />
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно подачи заявки */}
      {isApplicationModalOpen && selectedConference && (
        <CreateApplicationModal
          isOpen={isApplicationModalOpen}
          onClose={handleApplicationModalClose}
          conference={selectedConference}
          participantId={user.$id}
          userEmail={user.email}
          userName={user.name}
          userOrganization={user.organization}
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
      {badge !== undefined && badge > 0 && (
        <span className="ml-2 bg-indigo-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}

// Компонент карточки быстрого действия
interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  onClick: () => void;
}

function QuickActionCard({
  title,
  description,
  icon: Icon,
  color,
  onClick,
}: QuickActionCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
    >
      <div className="flex items-center mb-4">
        <div className={`${color} rounded-lg p-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

// Компонент ближайших дедлайнов с реальными данными
interface UpcomingDeadlinesProps {
  userId: string;
  conferences: Conference[];
  applications: ConferenceApplication[];
}

function UpcomingDeadlines({
  userId,
  conferences,
  applications,
}: UpcomingDeadlinesProps) {
  const now = new Date();

  // Получаем дедлайны для конференций, на которые участник может подать заявку
  const upcomingDeadlines = conferences
    .filter((conf) => {
      const deadline = new Date(conf.submissionDeadline);
      const hasApplication = applications.some(
        (app) => app.conferenceId === conf.$id
      );
      return deadline > now && !hasApplication; // Показываем только если нет заявки
    })
    .map((conf) => {
      const deadline = new Date(conf.submissionDeadline);
      const daysLeft = Math.ceil(
        (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        id: conf.$id,
        conference: conf.title,
        deadline: conf.submissionDeadline,
        type: "submission" as const,
        daysLeft,
      };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5); // Показываем только первые 5

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Ближайшие дедлайны
      </h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        {upcomingDeadlines.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Нет ближайших дедлайнов</p>
            <p className="text-sm text-gray-500 mt-1">
              Все заявки поданы или дедлайны истекли
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingDeadlines.map((deadline) => (
              <div
                key={deadline.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h4 className="font-medium text-gray-900">
                    {deadline.conference}
                  </h4>
                  <p className="text-sm text-gray-600">Дедлайн подачи заявок</p>
                  <p className="text-sm text-gray-500">
                    {new Date(deadline.deadline).toLocaleDateString("ru-RU")}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      deadline.daysLeft <= 3
                        ? "bg-red-100 text-red-800"
                        : deadline.daysLeft <= 7
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {deadline.daysLeft} дней
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileSection({ user }: { user: any }) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Информация профиля
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Основная информация о вашем аккаунте
        </p>
      </div>

      <div className="px-6 py-4 space-y-6">
        {/* Основная информация */}
        <div className="grid grid-cols-1 gap-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900">{user.name}</h4>
              <p className="text-sm text-gray-600">Участник конференций</p>
              <div className="flex items-center mt-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {user.isActive ? "Активный" : "Неактивный"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Контактная информация */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-4">
            Контактная информация
          </h4>
          <div className="space-y-3">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm text-gray-900">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm text-gray-900">{user.phone}</span>
              </div>
            )}
            {user.organization && (
              <div className="flex items-center">
                <Building className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm text-gray-900">
                  {user.organization}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Профессиональная информация */}
        {(user.position || user.bio || user.orcid || user.website) && (
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4">
              Профессиональная информация
            </h4>
            <div className="space-y-3">
              {user.position && (
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Должность:
                  </span>
                  <span className="ml-2 text-sm text-gray-900">
                    {user.position}
                  </span>
                </div>
              )}
              {user.bio && (
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    О себе:
                  </span>
                  <p className="mt-1 text-sm text-gray-900">{user.bio}</p>
                </div>
              )}
              {user.orcid && (
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    ORCID ID:
                  </span>
                  <a
                    href={`https://orcid.org/${user.orcid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    {user.orcid}
                  </a>
                </div>
              )}
              {user.website && (
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Веб-сайт:
                  </span>
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    {user.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Информация об аккаунте */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-4">
            Информация об аккаунте
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">ID пользователя:</span>
              <span className="text-gray-900 font-mono text-xs">
                {user.$id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Дата регистрации:</span>
              <span className="text-gray-900">
                {new Date(user.$createdAt).toLocaleDateString("ru-RU")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Последнее обновление:</span>
              <span className="text-gray-900">
                {new Date(user.$updatedAt).toLocaleDateString("ru-RU")}
              </span>
            </div>
          </div>
        </div>

        {/* Инструкции */}
        <div className="border-t border-gray-200 pt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              Как подать заявку на конференцию?
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                1. Найдите интересующую конференцию во вкладке "Конференции"
              </li>
              <li>2. Ознакомьтесь с требованиями и дедлайнами</li>
              <li>3. Заполните форму заявки со всеми необходимыми данными</li>
              <li>4. Отслеживайте статус заявки в разделе "Мои заявки"</li>
              <li>
                5. После принятия заявки следуйте инструкциям организаторов
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
