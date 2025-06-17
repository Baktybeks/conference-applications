// src/app/(dashboard)/admin/page.tsx

"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ConferencesList } from "@/components/conferences/ConferencesList";
import { ApplicationsList } from "@/components/applications/ApplicationsList";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { ApplicationReviewModal } from "@/components/applications/ApplicationReviewModal";
import {
  Conference,
  ConferenceApplication,
  ApplicationWithDetails,
} from "@/types";
import {
  BarChart3,
  Calendar,
  FileText,
  Users,
  Settings,
  Shield,
  Award,
  Plus,
  UserCheck,
  Clock,
  TrendingUp,
  Bell,
  Search,
  Filter,
  Download,
  Mail,
  Activity,
} from "lucide-react";
import { SystemAnalytics } from "@/components/analytics/SystemAnalytics";

export default function AdminPage() {
  const { user } = useAuth();
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
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Shield className="h-6 w-6 mr-3 text-red-600" />
                Панель супер администратора
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Добро пожаловать, {user.name}! Полный контроль над системой
                конференций
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
              </button>
              <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <Plus className="h-4 w-4 mr-2" />
                Быстрые действия
              </button>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">Супер администратор</p>
              </div>
              <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
            </div>
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
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "dashboard"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <BarChart3 className="inline h-4 w-4 mr-2" />
              Обзор системы
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
              Все конференции
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
              Все заявки
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "users"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Users className="inline h-4 w-4 mr-2" />
              Пользователи
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "analytics"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <TrendingUp className="inline h-4 w-4 mr-2" />
              Аналитика
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
              Системные настройки
            </button>
          </nav>
        </div>
      </div>

      {/* Контент */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Главная статистика */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Общая статистика системы
              </h2>
              <DashboardStats />
            </div>

            {/* Последние действия в системе */}
            <SystemActivity />

            {/* Требующие внимания */}
            <AdminAttentionRequired />

            {/* Быстрые действия */}
            <QuickActions />
          </div>
        )}

        {activeTab === "conferences" && (
          <div>
            <ConferencesList
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

        {activeTab === "users" && (
          <div>
            <UsersManagement />
          </div>
        )}

        {activeTab === "analytics" && (
          <div>
            <SystemAnalytics />
          </div>
        )}

        {activeTab === "settings" && (
          <div>
            <SystemSettings />
          </div>
        )}
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
  );
}

// Компонент быстрой системной статистики
function QuickSystemStats() {
  // TODO: Получить реальные данные
  const stats = {
    totalUsers: 248,
    activeUsers: 185,
    totalConferences: 42,
    activeConferences: 8,
    totalApplications: 1847,
    pendingReview: 127,
    systemHealth: 98.5,
    storageUsed: 67,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900">
          {stats.totalUsers}
        </div>
        <div className="text-sm text-gray-600">Всего пользователей</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">
          {stats.activeUsers}
        </div>
        <div className="text-sm text-gray-600">Активные</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">
          {stats.totalConferences}
        </div>
        <div className="text-sm text-gray-600">Конференции</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-600">
          {stats.activeConferences}
        </div>
        <div className="text-sm text-gray-600">Активные</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-indigo-600">
          {stats.totalApplications}
        </div>
        <div className="text-sm text-gray-600">Всего заявок</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-yellow-600">
          {stats.pendingReview}
        </div>
        <div className="text-sm text-gray-600">На рассмотрении</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">
          {stats.systemHealth}%
        </div>
        <div className="text-sm text-gray-600">Здоровье системы</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-orange-600">
          {stats.storageUsed}%
        </div>
        <div className="text-sm text-gray-600">Использ. места</div>
      </div>
    </div>
  );
}

// Компонент активности системы
function SystemActivity() {
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

// Компонент элементов, требующих внимания администратора
function AdminAttentionRequired() {
  // TODO: Получить реальные данные
  const items = [
    {
      id: "1",
      type: "pending_users",
      title: "12 пользователей ожидают активации",
      description: "Новые регистрации требуют одобрения администратора",
      urgency: "high",
      action: "Проверить пользователей",
      count: 12,
    },
    {
      id: "2",
      type: "review_delays",
      title: "Задержки в рецензировании",
      description: "23 заявки находятся на рассмотрении более 7 дней",
      urgency: "medium",
      action: "Назначить рецензентов",
      count: 23,
    },
    {
      id: "3",
      type: "storage_warning",
      title: "Место на диске заканчивается",
      description: "Использовано 85% доступного места для файлов",
      urgency: "medium",
      action: "Очистить место",
      count: 85,
    },
    {
      id: "4",
      type: "system_updates",
      title: "Доступны обновления системы",
      description: "Рекомендуется обновить компоненты безопасности",
      urgency: "low",
      action: "Обновить систему",
      count: 3,
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

// Компонент быстрых действий
function QuickActions() {
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

// Заглушки для других компонентов
function UsersManagement() {
  return (
    <div className="text-center py-12">
      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Управление пользователями
      </h3>
      <p className="text-gray-600">
        Расширенная аналитика и отчеты будут доступны в следующей версии
      </p>
    </div>
  );
}

function SystemSettings() {
  return (
    <div className="max-w-4xl space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Системные настройки
      </h2>

      {/* Общие настройки */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Общие настройки системы
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название системы
            </label>
            <input
              type="text"
              defaultValue="Система управления конференциями"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email администратора
            </label>
            <input
              type="email"
              defaultValue="admin@conference-system.com"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Часовой пояс
            </label>
            <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="Europe/Moscow">Europe/Moscow (GMT+3)</option>
              <option value="Europe/Kiev">Europe/Kiev (GMT+2)</option>
              <option value="Asia/Almaty">Asia/Almaty (GMT+6)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Язык системы
            </label>
            <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="ru">Русский</option>
              <option value="en">English</option>
              <option value="kk">Қазақша</option>
            </select>
          </div>
        </div>
      </div>

      {/* Настройки регистрации */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Настройки регистрации
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Автоматическая активация пользователей
              </p>
              <p className="text-sm text-gray-500">
                Новые пользователи активируются без одобрения администратора
              </p>
            </div>
            <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Требовать подтверждение email
              </p>
              <p className="text-sm text-gray-500">
                Пользователи должны подтвердить email при регистрации
              </p>
            </div>
            <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-indigo-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Открытая регистрация
              </p>
              <p className="text-sm text-gray-500">
                Любой может зарегистрироваться в системе
              </p>
            </div>
            <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-indigo-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
            </button>
          </div>
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
              <p className="text-sm font-medium text-gray-900">
                Email уведомления о новых заявках
              </p>
              <p className="text-sm text-gray-500">
                Отправлять организаторам уведомления о новых заявках
              </p>
            </div>
            <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-indigo-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Напоминания о дедлайнах
              </p>
              <p className="text-sm text-gray-500">
                Напоминать участникам о приближающихся дедлайнах
              </p>
            </div>
            <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-indigo-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Дайджест активности
              </p>
              <p className="text-sm text-gray-500">
                Еженедельный отчет о системной активности
              </p>
            </div>
            <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Настройки безопасности */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Настройки безопасности
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Время сессии (минуты)
            </label>
            <input
              type="number"
              defaultValue="480"
              min="30"
              max="1440"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Максимальные попытки входа
            </label>
            <input
              type="number"
              defaultValue="5"
              min="3"
              max="10"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Минимальная длина пароля
            </label>
            <input
              type="number"
              defaultValue="8"
              min="6"
              max="20"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Время блокировки аккаунта (минуты)
            </label>
            <input
              type="number"
              defaultValue="15"
              min="5"
              max="60"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Настройки файлов */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Настройки файлов
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Максимальный размер файла (МБ)
            </label>
            <input
              type="number"
              defaultValue="10"
              min="1"
              max="100"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Разрешенные типы файлов
            </label>
            <input
              type="text"
              defaultValue="pdf,doc,docx,txt,jpg,png"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="flex justify-end space-x-4">
        <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Отменить
        </button>
        <button className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Сохранить настройки
        </button>
      </div>
    </div>
  );
}
