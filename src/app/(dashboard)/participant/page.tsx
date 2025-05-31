// src/app/(dashboard)/participant/page.tsx

"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ConferencesList } from "@/components/conferences/ConferencesList";
import { ApplicationsList } from "@/components/applications/ApplicationsList";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { Conference, ConferenceApplication } from "@/types";
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
} from "lucide-react";

export default function ParticipantPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "conferences" | "applications" | "certificates" | "profile"
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

  const handleApplicationClick = (application: ConferenceApplication) => {
    // TODO: Открыть модальное окно с деталями заявки
    console.log("Открыть заявку:", application);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Личный кабинет участника
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Добро пожаловать, {user.name}! Управляйте своими заявками на
                конференции
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
              </button>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
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
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "dashboard"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <BarChart3 className="inline h-4 w-4 mr-2" />
              Обзор
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
              Конференции
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
              Мои заявки
            </button>
            <button
              onClick={() => setActiveTab("certificates")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "certificates"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Award className="inline h-4 w-4 mr-2" />
              Сертификаты
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "profile"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Settings className="inline h-4 w-4 mr-2" />
              Профиль
            </button>
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
                description="Просмотрите доступные конференции"
                icon={Calendar}
                color="bg-blue-500"
                onClick={() => setActiveTab("conferences")}
              />
              <QuickActionCard
                title="Мои заявки"
                description="Управляйте поданными заявками"
                icon={FileText}
                color="bg-green-500"
                onClick={() => setActiveTab("applications")}
              />
              <QuickActionCard
                title="Сертификаты"
                description="Скачайте сертификаты участия"
                icon={Award}
                color="bg-purple-500"
                onClick={() => setActiveTab("certificates")}
              />
            </div>

            {/* Статистика */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Моя активность
              </h2>
              <DashboardStats filters={{ participantId: user.$id }} />
            </div>

            {/* Ближайшие дедлайны */}
            <UpcomingDeadlines userId={user.$id} />

            {/* Последние обновления */}
            <RecentUpdates userId={user.$id} />
          </div>
        )}

        {activeTab === "conferences" && (
          <div>
            <ConferencesList
              onConferenceClick={handleConferenceClick}
              showFilters={true}
            />
          </div>
        )}

        {activeTab === "applications" && (
          <div>
            <ApplicationsList
              initialFilters={{ participantId: user.$id }}
              onApplicationClick={handleApplicationClick}
              showFilters={true}
            />
          </div>
        )}

        {activeTab === "certificates" && (
          <div>
            <CertificatesSection userId={user.$id} />
          </div>
        )}

        {activeTab === "profile" && (
          <div className="max-w-2xl">
            <ProfileSection user={user} />
          </div>
        )}
      </div>
    </div>
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
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
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

// Компонент ближайших дедлайнов
function UpcomingDeadlines({ userId }: { userId: string }) {
  // TODO: Получить данные о ближайших дедлайнах
  const deadlines = [
    {
      id: "1",
      conference: "Международная конференция по ИИ",
      deadline: "2024-02-15",
      type: "submission",
      daysLeft: 5,
    },
    {
      id: "2",
      conference: "Конференция по машинному обучению",
      deadline: "2024-02-20",
      type: "registration",
      daysLeft: 10,
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Ближайшие дедлайны
      </h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        {deadlines.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Нет ближайших дедлайнов</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deadlines.map((deadline) => (
              <div
                key={deadline.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <h4 className="font-medium text-gray-900">
                    {deadline.conference}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {deadline.type === "submission"
                      ? "Дедлайн подачи заявок"
                      : "Дедлайн регистрации"}
                  </p>
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

// Компонент последних обновлений
function RecentUpdates({ userId }: { userId: string }) {
  // TODO: Получить данные о последних обновлениях заявок
  const updates = [
    {
      id: "1",
      conference: "Конференция по блокчейну",
      status: "accepted",
      date: "2024-01-25",
      message: "Ваша заявка принята! Ожидайте дальнейших инструкций.",
    },
    {
      id: "2",
      conference: "Симпозиум по кибербезопасности",
      status: "under_review",
      date: "2024-01-23",
      message: "Заявка направлена на рассмотрение рецензентам.",
    },
    {
      id: "3",
      conference: "Конференция по Data Science",
      status: "rejected",
      date: "2024-01-20",
      message: "К сожалению, ваша заявка не была принята в этом году.",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "under_review":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "accepted":
        return "Принята";
      case "rejected":
        return "Отклонена";
      case "under_review":
        return "На рассмотрении";
      default:
        return "Обновление";
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Последние обновления
      </h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        {updates.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Нет новых обновлений</p>
          </div>
        ) : (
          <div className="space-y-4">
            {updates.map((update) => (
              <div
                key={update.id}
                className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 mr-4 mt-1">
                  {getStatusIcon(update.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900">
                      {update.conference}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {new Date(update.date).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    Статус: {getStatusText(update.status)}
                  </p>
                  <p className="text-sm text-gray-500">{update.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Компонент раздела сертификатов
function CertificatesSection({ userId }: { userId: string }) {
  // TODO: Получить данные о сертификатах пользователя
  const certificates = [
    {
      id: "1",
      conference: "Международная конференция по ИИ 2023",
      issueDate: "2023-12-15",
      type: "participation",
      downloadUrl: "/certificates/ai-conf-2023.pdf",
    },
    {
      id: "2",
      conference: "Симпозиум по машинному обучению",
      issueDate: "2023-11-20",
      type: "presentation",
      downloadUrl: "/certificates/ml-symposium-2023.pdf",
    },
  ];

  const getCertificateTypeLabel = (type: string) => {
    switch (type) {
      case "participation":
        return "Участие";
      case "presentation":
        return "Доклад";
      case "poster":
        return "Постер";
      default:
        return "Сертификат";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Мои сертификаты
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Здесь вы можете скачать сертификаты за участие в конференциях
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Пока нет сертификатов
          </h3>
          <p className="text-gray-600">
            Сертификаты появятся здесь после участия в конференциях
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((certificate) => (
            <div
              key={certificate.id}
              className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">
                    {certificate.conference}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Тип: {getCertificateTypeLabel(certificate.type)}</p>
                    <p>
                      Выдан:{" "}
                      {new Date(certificate.issueDate).toLocaleDateString(
                        "ru-RU"
                      )}
                    </p>
                  </div>
                </div>
                <Award className="h-8 w-8 text-indigo-500" />
              </div>
              <button
                onClick={() => {
                  // TODO: Реализовать скачивание сертификата
                  window.open(certificate.downloadUrl, "_blank");
                }}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Скачать сертификат
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Компонент профиля пользователя
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

        {/* Настройки уведомлений */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-4">
            Настройки уведомлений
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Email уведомления
                </p>
                <p className="text-sm text-gray-500">
                  Получать уведомления о статусе заявок
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
                  Уведомления за 3 дня до дедлайна
                </p>
              </div>
              <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-indigo-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
              </button>
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

        {/* Кнопка редактирования профиля */}
        <div className="border-t border-gray-200 pt-6">
          <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
            Редактировать профиль
          </button>
        </div>
      </div>
    </div>
  );
}
