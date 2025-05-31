// src/app/(dashboard)/organizer/page.tsx

"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ConferencesList } from "@/components/conferences/ConferencesList";
import { ApplicationsList } from "@/components/applications/ApplicationsList";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { Conference, ConferenceApplication, ApplicationStatus } from "@/types";
import {
  Calendar,
  FileText,
  BarChart3,
  Users,
  Settings,
  Plus,
  Eye,
  Edit,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
  Award,
  Download,
} from "lucide-react";

export default function OrganizerPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "conferences"
    | "applications"
    | "reviews"
    | "schedule"
    | "settings"
  >("dashboard");

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

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
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Панель организатора
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Добро пожаловать, {user.name}! Управляйте конференциями и
                заявками
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <Plus className="h-4 w-4 mr-2" />
                Новая конференция
              </button>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">Организатор</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
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
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "dashboard"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <BarChart3 className="inline h-4 w-4 mr-2" />
              Аналитика
            </button>
            <button
              onClick={() => setActiveTab("conferences")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "conferences"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Calendar className="inline h-4 w-4 mr-2" />
              Мои конференции
            </button>
            <button
              onClick={() => setActiveTab("applications")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "applications"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FileText className="inline h-4 w-4 mr-2" />
              Заявки участников
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "reviews"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <UserCheck className="inline h-4 w-4 mr-2" />
              Рецензирование
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "schedule"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Clock className="inline h-4 w-4 mr-2" />
              Программа
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "settings"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Settings className="inline h-4 w-4 mr-2" />
              Настройки
            </button>
          </nav>
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

            {/* Последние действия */}
            <RecentActivities organizerId={user.$id} />

            {/* Требующие внимания */}
            <AttentionRequired organizerId={user.$id} />
          </div>
        )}

        {activeTab === "conferences" && (
          <div>
            <ConferencesList
              initialFilters={{ organizerId: user.$id }}
              onConferenceClick={handleConferenceClick}
              onConferenceEdit={handleConferenceEdit}
              showFilters={true}
            />
          </div>
        )}

        {activeTab === "applications" && (
          <div>
            <ApplicationsList
              onApplicationClick={handleApplicationClick}
              onApplicationReview={handleApplicationReview}
              showFilters={true}
              showOrganizerActions={true}
            />
          </div>
        )}

        {activeTab === "reviews" && (
          <div>
            <ReviewManagement organizerId={user.$id} />
          </div>
        )}

        {activeTab === "schedule" && (
          <div>
            <ScheduleManagement organizerId={user.$id} />
          </div>
        )}

        {activeTab === "settings" && (
          <div>
            <OrganizerSettings user={user} />
          </div>
        )}
      </div>
    </div>
  );
}

// Компонент быстрой статистики
function QuickStats({ organizerId }: { organizerId: string }) {
  // TODO: Получить реальные данные
  const stats = {
    conferences: 5,
    activeConferences: 2,
    totalApplications: 128,
    pendingApplications: 23,
    acceptedApplications: 87,
    rejectedApplications: 18,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900">
          {stats.conferences}
        </div>
        <div className="text-sm text-gray-600">Всего конференций</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">
          {stats.activeConferences}
        </div>
        <div className="text-sm text-gray-600">Активные</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">
          {stats.totalApplications}
        </div>
        <div className="text-sm text-gray-600">Всего заявок</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-yellow-600">
          {stats.pendingApplications}
        </div>
        <div className="text-sm text-gray-600">На рассмотрении</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">
          {stats.acceptedApplications}
        </div>
        <div className="text-sm text-gray-600">Принято</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-red-600">
          {stats.rejectedApplications}
        </div>
        <div className="text-sm text-gray-600">Отклонено</div>
      </div>
    </div>
  );
}

// Компонент последних действий
function RecentActivities({ organizerId }: { organizerId: string }) {
  // TODO: Получить реальные данные о последних действиях
  const activities = [
    {
      id: "1",
      type: "application_submitted",
      description: "Новая заявка от Иванова И.И.",
      conference: "Конференция по ИИ 2024",
      timestamp: "2024-01-28T10:30:00Z",
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
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "application_submitted":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "review_completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "conference_published":
        return <Calendar className="h-5 w-5 text-purple-500" />;
      case "deadline_reminder":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Последние действия
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
                <p className="text-sm text-gray-600">{activity.conference}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Компонент элементов, требующих внимания
function AttentionRequired({ organizerId }: { organizerId: string }) {
  // TODO: Получить реальные данные
  const items = [
    {
      id: "1",
      type: "pending_reviews",
      title: "15 заявок ожидают рецензирования",
      description: "Заявки на конференцию по ИИ требуют назначения рецензентов",
      urgency: "high",
      action: "Назначить рецензентов",
    },
    {
      id: "2",
      type: "deadline_approaching",
      title: "Дедлайн через 3 дня",
      description: "Приём заявок на Блокчейн симпозиум завершается 1 февраля",
      urgency: "medium",
      action: "Проверить настройки",
    },
    {
      id: "3",
      type: "incomplete_schedule",
      title: "Не заполнена программа",
      description: "Конференция по Data Science требует составления расписания",
      urgency: "low",
      action: "Создать расписание",
    },
  ];

  const getUrgencyColor = (urgency: string) => {
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

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "high":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "medium":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "low":
        return <FileText className="h-5 w-5 text-blue-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Требует внимания
      </h2>
      <div className="space-y-4">
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
                  <h3 className="font-medium text-gray-900 mb-1">
                    {item.title}
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

// Компонент управления рецензированием
function ReviewManagement({ organizerId }: { organizerId: string }) {
  const [selectedConference, setSelectedConference] = useState<string>("");

  // TODO: Получить реальные данные
  const conferences = [
    { id: "1", title: "Конференция по ИИ 2024" },
    { id: "2", title: "Симпозиум по ML" },
    { id: "3", title: "Конференция по Data Science" },
  ];

  const reviewStats = {
    totalApplications: 45,
    needsReviewers: 15,
    inReview: 20,
    completed: 10,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Управление рецензированием
        </h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedConference}
            onChange={(e) => setSelectedConference(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Все конференции</option>
            {conferences.map((conf) => (
              <option key={conf.id} value={conf.id}>
                {conf.title}
              </option>
            ))}
          </select>
          <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <UserCheck className="h-4 w-4 mr-2" />
            Назначить рецензентов
          </button>
        </div>
      </div>

      {/* Статистика рецензирования */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-gray-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Всего заявок</p>
              <p className="text-2xl font-semibold text-gray-900">
                {reviewStats.totalApplications}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserCheck className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Нужен рецензент
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {reviewStats.needsReviewers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                На рассмотрении
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {reviewStats.inReview}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Завершено</p>
              <p className="text-2xl font-semibold text-gray-900">
                {reviewStats.completed}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Список заявок для рецензирования */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Заявки, требующие рецензирования
          </h3>
        </div>
        <div className="p-6">
          {/* Здесь будет список заявок */}
          <div className="text-center py-8">
            <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Выберите конференцию для просмотра заявок
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент управления программой конференции
function ScheduleManagement({ organizerId }: { organizerId: string }) {
  const [selectedConference, setSelectedConference] = useState<string>("");

  // TODO: Получить реальные данные
  const conferences = [
    { id: "1", title: "Конференция по ИИ 2024", hasSchedule: true },
    { id: "2", title: "Симпозиум по ML", hasSchedule: false },
    { id: "3", title: "Конференция по Data Science", hasSchedule: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Управление программой конференций
        </h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedConference}
            onChange={(e) => setSelectedConference(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Выберите конференцию</option>
            {conferences.map((conf) => (
              <option key={conf.id} value={conf.id}>
                {conf.title}
              </option>
            ))}
          </select>
          <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <Plus className="h-4 w-4 mr-2" />
            Создать расписание
          </button>
        </div>
      </div>

      {/* Список конференций */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {conferences.map((conference) => (
          <div
            key={conference.id}
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-medium text-gray-900">{conference.title}</h3>
              {conference.hasSchedule ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Clock className="h-5 w-5 text-yellow-500" />
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {conference.hasSchedule
                ? "Программа создана"
                : "Программа не создана"}
            </p>
            <div className="flex space-x-2">
              <button className="flex-1 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-md text-sm hover:bg-indigo-200 transition-colors">
                {conference.hasSchedule ? "Редактировать" : "Создать"}
              </button>
              {conference.hasSchedule && (
                <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors">
                  <Download className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Предварительный просмотр расписания */}
      {selectedConference && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Программа конференции
          </h3>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Функция управления программой будет доступна в следующей версии
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Компонент настроек организатора
function OrganizerSettings({ user }: { user: any }) {
  return (
    <div className="max-w-4xl space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Настройки организатора
      </h2>

      {/* Профиль организатора */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Профиль организатора
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Имя организации
            </label>
            <input
              type="text"
              value={user.organization || ""}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Контактный email
            </label>
            <input
              type="email"
              value={user.email}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Телефон
            </label>
            <input
              type="tel"
              value={user.phone || ""}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Веб-сайт
            </label>
            <input
              type="url"
              value={user.website || ""}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        <div className="mt-6">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Сохранить изменения
          </button>
        </div>
      </div>

      {/* Настройки уведомлений */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Настройки уведомлений
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Новые заявки</p>
              <p className="text-sm text-gray-500">
                Уведомления о новых заявках на ваши конференции
              </p>
            </div>
            <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-indigo-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Завершённые рецензии
              </p>
              <p className="text-sm text-gray-500">
                Уведомления о завершении рецензирования
              </p>
            </div>
            <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-indigo-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Дедлайны</p>
              <p className="text-sm text-gray-500">
                Напоминания о приближающихся дедлайнах
              </p>
            </div>
            <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Шаблоны сообщений */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Шаблоны сообщений
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Подтверждение принятия заявки
            </label>
            <textarea
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Шаблон сообщения о принятии заявки..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Отклонение заявки
            </label>
            <textarea
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Шаблон сообщения об отклонении заявки..."
            />
          </div>
        </div>
        <div className="mt-6">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Сохранить шаблоны
          </button>
        </div>
      </div>
    </div>
  );
}
