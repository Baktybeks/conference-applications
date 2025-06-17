"use client";

import React, { useState, useEffect } from "react";
import {
  ConferenceApplication,
  ApplicationStatus,
  PresentationType,
  ApplicationFilters,
} from "@/types";
import {
  FileText,
  User,
  Calendar,
  Clock,
  Filter,
  Search,
  Edit,
  Eye,
  Plus,
} from "lucide-react";

// ИСПРАВЛЕНИЕ: Обновленный интерфейс с поддержкой фильтров
interface ApplicationsListProps {
  onApplicationClick: (application: ConferenceApplication) => void;
  onApplicationReview?: (application: ConferenceApplication) => void; // ИСПРАВЛЕНИЕ: Сделан опциональным
  showFilters?: boolean;
  showOrganizerActions?: boolean;
  initialFilters?: Partial<ApplicationFilters>; // ИСПРАВЛЕНИЕ: Добавлен пропс initialFilters
  variant?: "admin" | "organizer" | "participant" | "reviewer";
  applications?: ConferenceApplication[]; // Опциональный пропс для передачи данных извне
  showCreateButton?: boolean;
}

export function ApplicationsList({
  onApplicationClick,
  onApplicationReview,
  showFilters = false,
  showOrganizerActions = false,
  initialFilters = {},
  variant = "admin",
  applications: externalApplications,
  showCreateButton = false,
}: ApplicationsListProps) {
  // ИСПРАВЛЕНИЕ: Состояние для фильтров
  const [filters, setFilters] = useState<ApplicationFilters>({
    searchQuery: "",
    status: undefined,
    hasPresentation: undefined,
    presentationType: undefined,
    ...initialFilters,
  });

  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || "");

  // Применяем начальные фильтры при изменении initialFilters
  useEffect(() => {
    setFilters((prev) => ({ ...prev, ...initialFilters }));
  }, [initialFilters]);

  // ИСПРАВЛЕНИЕ: Автоматические настройки для разных ролей
  const isParticipantView = variant === "participant";
  const isReviewerView = variant === "reviewer";
  const shouldShowReviewActions = onApplicationReview && !isParticipantView;

  // TODO: Получить реальные данные заявок с учетом фильтров
  const getAllApplications = (): ConferenceApplication[] => {
    const baseApplications: ConferenceApplication[] = [
      {
        $id: "1",
        $createdAt: "2024-01-01T00:00:00Z",
        $updatedAt: "2024-01-01T00:00:00Z",
        conferenceId: "1",
        participantId: initialFilters.participantId || "user1",
        status: ApplicationStatus.UNDER_REVIEW,
        fullName: "Иван Иванов",
        organization: "МГУ",
        position: "Профессор",
        email: "ivanov@mgu.ru",
        phone: "+7 999 123 45 67",
        hasPresentation: true,
        presentationType: PresentationType.ORAL,
        presentationTitle: "Применение машинного обучения в диагностике",
        abstract:
          "В данной работе рассматривается применение современных методов машинного обучения для улучшения точности медицинской диагностики. Исследование включает анализ различных алгоритмов и их эффективности.",
        keywords: ["ML", "Диагностика", "Медицина"],
        dietaryRestrictions: "",
        accessibilityNeeds: "",
        accommodationNeeded: false,
        assignedReviewerId: "reviewer1",
        reviewerComments: "",
        attended: false,
        certificateIssued: false,
        certificateUrl: "",
        createdAt: "2024-01-01T00:00:00Z",
      },
      {
        $id: "2",
        $createdAt: "2024-01-02T00:00:00Z",
        $updatedAt: "2024-01-02T00:00:00Z",
        conferenceId: "2",
        participantId: initialFilters.participantId || "user2",
        status: ApplicationStatus.ACCEPTED,
        fullName: "Мария Петрова",
        organization: "СПбГУ",
        position: "Доцент",
        email: "petrova@spbu.ru",
        phone: "+7 999 876 54 32",
        hasPresentation: true,
        presentationType: PresentationType.POSTER,
        presentationTitle: "Анализ данных в нейронаучных исследованиях",
        abstract:
          "Представленное исследование посвящено разработке новых методов анализа нейронных данных с использованием современных статистических подходов.",
        keywords: ["Нейронаука", "Анализ данных", "Статистика"],
        dietaryRestrictions: "Вегетарианская диета",
        accessibilityNeeds: "",
        accommodationNeeded: true,
        reviewerComments: "Отличная работа, принимаем с удовольствием",
        reviewDate: "2024-01-15T10:30:00Z",
        attended: false,
        certificateIssued: false,
        certificateUrl: "",
        createdAt: "2024-01-02T00:00:00Z",
      },
      {
        $id: "3",
        $createdAt: "2024-01-03T00:00:00Z",
        $updatedAt: "2024-01-03T00:00:00Z",
        conferenceId: "1",
        participantId: initialFilters.participantId || "user3",
        status: ApplicationStatus.SUBMITTED,
        fullName: "Александр Сидоров",
        organization: "ИТМО",
        position: "Аспирант",
        email: "sidorov@itmo.ru",
        phone: "",
        hasPresentation: false,
        presentationTitle: "",
        abstract: "",
        keywords: [],
        dietaryRestrictions: "",
        accessibilityNeeds: "",
        accommodationNeeded: false,
        reviewerComments: "",
        attended: false,
        certificateIssued: false,
        certificateUrl: "",
        createdAt: "2024-01-03T00:00:00Z",
      },
      {
        $id: "4",
        $createdAt: "2024-01-04T00:00:00Z",
        $updatedAt: "2024-01-04T00:00:00Z",
        conferenceId: "3",
        participantId: initialFilters.participantId || "user1",
        status: ApplicationStatus.REJECTED,
        fullName: "Иван Иванов",
        organization: "МГУ",
        position: "Профессор",
        email: "ivanov@mgu.ru",
        phone: "+7 999 123 45 67",
        hasPresentation: true,
        presentationType: PresentationType.WORKSHOP,
        presentationTitle: "Интерактивные методы обучения ИИ",
        abstract:
          "Мастер-класс по современным интерактивным подходам к обучению искусственного интеллекта.",
        keywords: ["ИИ", "Обучение", "Интерактив"],
        dietaryRestrictions: "",
        accessibilityNeeds: "",
        accommodationNeeded: false,
        reviewerComments:
          "К сожалению, тема не соответствует направлению конференции",
        reviewDate: "2024-01-20T14:15:00Z",
        attended: false,
        certificateIssued: false,
        certificateUrl: "",
        createdAt: "2024-01-04T00:00:00Z",
      },
    ];

    return baseApplications;
  };

  // ИСПРАВЛЕНИЕ: Функция фильтрации заявок
  const getFilteredApplications = (): ConferenceApplication[] => {
    const allApplications = externalApplications || getAllApplications();

    return allApplications.filter((application) => {
      // Фильтр по участнику
      if (
        filters.participantId &&
        application.participantId !== filters.participantId
      ) {
        return false;
      }

      // Фильтр по конференции
      if (
        filters.conferenceId &&
        application.conferenceId !== filters.conferenceId
      ) {
        return false;
      }

      // Фильтр по рецензенту
      if (
        filters.assignedReviewerId &&
        application.assignedReviewerId !== filters.assignedReviewerId
      ) {
        return false;
      }

      // Фильтр по поисковому запросу
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        if (
          !application.fullName.toLowerCase().includes(query) &&
          !application.organization.toLowerCase().includes(query) &&
          !application.presentationTitle.toLowerCase().includes(query) &&
          !application.keywords.some((keyword) =>
            keyword.toLowerCase().includes(query)
          )
        ) {
          return false;
        }
      }

      // Фильтр по статусу
      if (filters.status && application.status !== filters.status) {
        return false;
      }

      // Фильтр по наличию презентации
      if (
        filters.hasPresentation !== undefined &&
        application.hasPresentation !== filters.hasPresentation
      ) {
        return false;
      }

      // Фильтр по типу презентации
      if (
        filters.presentationType &&
        application.presentationType !== filters.presentationType
      ) {
        return false;
      }

      // Фильтр по дате (если указан)
      if (filters.dateFrom) {
        const applicationDate = new Date(application.createdAt);
        const filterDate = new Date(filters.dateFrom);
        if (applicationDate < filterDate) {
          return false;
        }
      }

      if (filters.dateTo) {
        const applicationDate = new Date(application.createdAt);
        const filterDate = new Date(filters.dateTo);
        if (applicationDate > filterDate) {
          return false;
        }
      }

      return true;
    });
  };

  const filteredApplications = getFilteredApplications();

  // ИСПРАВЛЕНИЕ: Функции для правильной типизации
  const getStatusColor = (status: ApplicationStatus): string => {
    const colors: Record<ApplicationStatus, string> = {
      [ApplicationStatus.DRAFT]: "bg-gray-100 text-gray-800",
      [ApplicationStatus.SUBMITTED]: "bg-blue-100 text-blue-800",
      [ApplicationStatus.UNDER_REVIEW]: "bg-yellow-100 text-yellow-800",
      [ApplicationStatus.ACCEPTED]: "bg-green-100 text-green-800",
      [ApplicationStatus.REJECTED]: "bg-red-100 text-red-800",
      [ApplicationStatus.WAITLIST]: "bg-purple-100 text-purple-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status: ApplicationStatus): string => {
    const texts: Record<ApplicationStatus, string> = {
      [ApplicationStatus.DRAFT]: "Черновик",
      [ApplicationStatus.SUBMITTED]: "Подана",
      [ApplicationStatus.UNDER_REVIEW]: "На рассмотрении",
      [ApplicationStatus.ACCEPTED]: "Принята",
      [ApplicationStatus.REJECTED]: "Отклонена",
      [ApplicationStatus.WAITLIST]: "В списке ожидания",
    };
    return texts[status] || status;
  };

  const getPresentationTypeText = (type?: PresentationType): string => {
    if (!type) return "";

    const texts: Record<PresentationType, string> = {
      [PresentationType.ORAL]: "Устный доклад",
      [PresentationType.POSTER]: "Постер",
      [PresentationType.WORKSHOP]: "Мастер-класс",
      [PresentationType.KEYNOTE]: "Пленарный доклад",
      [PresentationType.PANEL]: "Панельная дискуссия",
    };
    return texts[type] || type;
  };

  // ИСПРАВЛЕНИЕ: Обработчики изменения фильтров
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setFilters((prev) => ({ ...prev, searchQuery: value }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as ApplicationStatus | "";
    setFilters((prev) => ({ ...prev, status: value || undefined }));
  };

  const handlePresentationFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setFilters((prev) => ({
      ...prev,
      hasPresentation: value === "" ? undefined : value === "true",
    }));
  };

  const clearFilters = () => {
    const clearedFilters = { ...initialFilters, searchQuery: "" };
    setFilters(clearedFilters);
    setSearchQuery("");
  };

  // ИСПРАВЛЕНИЕ: Адаптированные заголовки для разных ролей
  const getPageTitle = () => {
    switch (variant) {
      case "participant":
        return "Мои заявки";
      case "reviewer":
        return "Заявки на рецензирование";
      case "organizer":
        return "Заявки в моих конференциях";
      case "admin":
      default:
        return "Управление заявками";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {getPageTitle()}
          </h2>
          {filteredApplications.length !== getAllApplications().length && (
            <p className="text-sm text-gray-600 mt-1">
              Показано {filteredApplications.length} из{" "}
              {getAllApplications().length} заявок
            </p>
          )}
        </div>
        <div className="text-sm text-gray-500">
          Всего заявок: {filteredApplications.length}
        </div>
      </div>

      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Поиск
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск заявок..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Статус
              </label>
              <select
                value={filters.status || ""}
                onChange={handleStatusChange}
                className="px-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Все статусы</option>
                <option value={ApplicationStatus.DRAFT}>Черновик</option>
                <option value={ApplicationStatus.SUBMITTED}>Подана</option>
                <option value={ApplicationStatus.UNDER_REVIEW}>
                  На рассмотрении
                </option>
                <option value={ApplicationStatus.ACCEPTED}>Принята</option>
                <option value={ApplicationStatus.REJECTED}>Отклонена</option>
                <option value={ApplicationStatus.WAITLIST}>
                  Список ожидания
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Презентация
              </label>
              <select
                value={
                  filters.hasPresentation === undefined
                    ? ""
                    : filters.hasPresentation.toString()
                }
                onChange={handlePresentationFilterChange}
                className="px-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Все</option>
                <option value="true">С презентацией</option>
                <option value="false">Без презентации</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center"
              >
                Очистить
              </button>
            </div>
          </div>

          {/* Активные фильтры */}
          {(filters.searchQuery ||
            filters.status ||
            filters.hasPresentation !== undefined) && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-500">Активные фильтры:</span>
              {filters.searchQuery && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  Поиск: {filters.searchQuery}
                </span>
              )}
              {filters.status && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  {getStatusText(filters.status)}
                </span>
              )}
              {filters.hasPresentation !== undefined && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                  {filters.hasPresentation
                    ? "С презентацией"
                    : "Без презентации"}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {!isParticipantView && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Участник
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {isParticipantView ? "Конференция" : "Презентация"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата подачи
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map((application) => (
                <tr
                  key={application.$id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onApplicationClick(application)}
                >
                  {!isParticipantView && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-8 w-8 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {application.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.organization}
                          </div>
                          {application.position && (
                            <div className="text-xs text-gray-400">
                              {application.position}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {isParticipantView ? (
                        <>
                          <div className="font-medium">
                            Конференция #{application.conferenceId}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {application.hasPresentation
                              ? `${getPresentationTypeText(
                                  application.presentationType
                                )}`
                              : "Участие без доклада"}
                          </div>
                        </>
                      ) : application.hasPresentation ? (
                        <>
                          <div
                            className="font-medium line-clamp-1"
                            title={application.presentationTitle}
                          >
                            {application.presentationTitle}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {getPresentationTypeText(
                              application.presentationType
                            )}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-500 italic">
                          Без презентации
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        application.status
                      )}`}
                    >
                      {getStatusText(application.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(application.createdAt).toLocaleDateString(
                        "ru-RU"
                      )}
                    </div>
                    {application.reviewDate && (
                      <div className="flex items-center text-xs text-gray-400 mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        Рецензия:{" "}
                        {new Date(application.reviewDate).toLocaleDateString(
                          "ru-RU"
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onApplicationClick(application);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        title={
                          isParticipantView
                            ? "Просмотреть заявку"
                            : "Детали заявки"
                        }
                      >
                        {isParticipantView ? "Просмотреть" : "Детали"}
                      </button>

                      {shouldShowReviewActions && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onApplicationReview!(application);
                          }}
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title="Рецензировать заявку"
                        >
                          Рецензировать
                        </button>
                      )}

                      {showOrganizerActions && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("Принять заявку:", application.$id);
                            }}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Принять заявку"
                          >
                            Принять
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("Отклонить заявку:", application.$id);
                            }}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Отклонить заявку"
                          >
                            Отклонить
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Пагинация (заглушка) */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Предыдущая
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Следующая
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Показано <span className="font-medium">1</span> до{" "}
                <span className="font-medium">
                  {filteredApplications.length}
                </span>{" "}
                из{" "}
                <span className="font-medium">
                  {filteredApplications.length}
                </span>{" "}
                результатов
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Предыдущая
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-indigo-50 text-sm font-medium text-indigo-600">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Следующая
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Пустое состояние */}
      {filteredApplications.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filters.searchQuery || filters.status
              ? "Заявки не найдены"
              : isParticipantView
              ? "У вас пока нет заявок"
              : "Заявки не найдены"}
          </h3>
          <p className="text-gray-600 mb-4">
            {filters.searchQuery || filters.status
              ? "Попробуйте изменить параметры поиска"
              : isParticipantView
              ? "Подайте заявку на участие в конференции"
              : "Заявки появятся здесь после их подачи участниками"}
          </p>
          {(filters.searchQuery || filters.status) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Очистить фильтры
            </button>
          )}
        </div>
      )}
    </div>
  );
}
