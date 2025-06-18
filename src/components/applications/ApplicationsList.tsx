"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ConferenceApplication,
  ApplicationStatus,
  PresentationType,
  ApplicationFilters,
  Conference,
} from "@/types";
import { Button } from "@/components/ui/Button";
import {
  FileText,
  User,
  Calendar,
  Clock,
  Search,
  Eye,
  Check,
  X,
  Loader2,
  MessageSquare,
} from "lucide-react";

// ИСПРАВЛЕНИЕ: Обновленный интерфейс с поддержкой конференций
interface ApplicationsListProps {
  onApplicationClick: (application: ConferenceApplication) => void;
  onApplicationReview?: (application: ConferenceApplication) => void;
  onApplicationAccept?: (
    applicationId: string,
    comments?: string
  ) => Promise<void>;
  onApplicationReject?: (
    applicationId: string,
    comments?: string
  ) => Promise<void>;
  onApplicationWaitlist?: (
    applicationId: string,
    comments?: string
  ) => Promise<void>;
  showFilters?: boolean;
  showOrganizerActions?: boolean;
  initialFilters?: Partial<ApplicationFilters>;
  variant?: "admin" | "organizer" | "participant" | "reviewer";
  applications?: ConferenceApplication[];
  conferences?: Conference[]; // ДОБАВЛЕНО: массив конференций
  showCreateButton?: boolean;
  isLoading?: boolean;
}

export function ApplicationsList({
  onApplicationClick,
  onApplicationReview,
  onApplicationAccept,
  onApplicationReject,
  onApplicationWaitlist,
  showFilters = false,
  showOrganizerActions = false,
  initialFilters = {},
  variant = "admin",
  applications = [],
  conferences = [], // ДОБАВЛЕНО: по умолчанию пустой массив
  showCreateButton = false,
  isLoading = false,
}: ApplicationsListProps) {
  // ДОБАВЛЕНО: Создаем lookup карту конференций
  const conferencesMap = useMemo(() => {
    const map = new Map<string, Conference>();
    conferences.forEach((conference) => {
      map.set(conference.$id, conference);
    });
    return map;
  }, [conferences]);
  console.log(
    conferencesMap,
    "conferencesMap************************************"
  );

  // ДОБАВЛЕНО: Функция для получения названия конференции
  const getConferenceTitle = (conferenceId: string): string => {
    const conference = conferencesMap.get(conferenceId);
    console.log(
      conference,
      "9999999999999999999999999999999999999999999999++++++++++++++++++++++++++++++++++++++++"
    );

    return conference?.title || `Конференция #${conferenceId.slice(-6)}`;
  };

  // Мемоизируем initialFilters для избежания бесконечного цикла
  const memoizedInitialFilters = useMemo(
    () => initialFilters,
    [
      initialFilters.participantId,
      initialFilters.conferenceId,
      initialFilters.status,
      initialFilters.searchQuery,
      initialFilters.hasPresentation,
      initialFilters.presentationType,
      initialFilters.dateFrom,
      initialFilters.dateTo,
    ]
  );

  // Состояние для фильтров
  const [filters, setFilters] = useState<ApplicationFilters>({
    searchQuery: "",
    status: undefined,
    hasPresentation: undefined,
    presentationType: undefined,
    ...memoizedInitialFilters,
  });

  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || "");
  const [processingApplications, setProcessingApplications] = useState<
    Record<string, string>
  >({});

  // Применяем начальные фильтры при изменении initialFilters
  useEffect(() => {
    setFilters((prev) => ({ ...prev, ...memoizedInitialFilters }));
  }, [memoizedInitialFilters]);

  // Автоматические настройки для разных ролей
  const isParticipantView = variant === "participant";
  const isReviewerView = variant === "reviewer";
  const shouldShowReviewActions =
    (onApplicationAccept || onApplicationReject) && !isParticipantView;

  // ИСПРАВЛЕНИЕ: Функция фильтрации заявок с поиском по названию конференции
  const getFilteredApplications = (): ConferenceApplication[] => {
    return applications.filter((application) => {
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

      // ИСПРАВЛЕНИЕ: Фильтр по поисковому запросу включает название конференции
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const conferenceTitle = getConferenceTitle(
          application.conferenceId
        ).toLowerCase();

        if (
          !application.fullName.toLowerCase().includes(query) &&
          !application.organization.toLowerCase().includes(query) &&
          !application.presentationTitle.toLowerCase().includes(query) &&
          !conferenceTitle.includes(query) &&
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
        const applicationDate = new Date(application.$createdAt);
        const filterDate = new Date(filters.dateFrom);
        if (applicationDate < filterDate) {
          return false;
        }
      }

      if (filters.dateTo) {
        const applicationDate = new Date(application.$createdAt);
        const filterDate = new Date(filters.dateTo);
        if (applicationDate > filterDate) {
          return false;
        }
      }

      return true;
    });
  };

  const filteredApplications = getFilteredApplications();

  // Обработчики действий с заявками
  const handleAcceptApplication = async (applicationId: string) => {
    if (!onApplicationAccept) return;

    setProcessingApplications((prev) => ({
      ...prev,
      [applicationId]: "accepting",
    }));
    try {
      await onApplicationAccept(applicationId);
    } catch (error) {
      console.error("Ошибка при принятии заявки:", error);
    } finally {
      setProcessingApplications((prev) => {
        const newState = { ...prev };
        delete newState[applicationId];
        return newState;
      });
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    if (!onApplicationReject) return;

    setProcessingApplications((prev) => ({
      ...prev,
      [applicationId]: "rejecting",
    }));
    try {
      await onApplicationReject(applicationId);
    } catch (error) {
      console.error("Ошибка при отклонении заявки:", error);
    } finally {
      setProcessingApplications((prev) => {
        const newState = { ...prev };
        delete newState[applicationId];
        return newState;
      });
    }
  };

  const handleWaitlistApplication = async (applicationId: string) => {
    if (!onApplicationWaitlist) return;

    setProcessingApplications((prev) => ({
      ...prev,
      [applicationId]: "waitlisting",
    }));
    try {
      await onApplicationWaitlist(applicationId);
    } catch (error) {
      console.error("Ошибка при добавлении в лист ожидания:", error);
    } finally {
      setProcessingApplications((prev) => {
        const newState = { ...prev };
        delete newState[applicationId];
        return newState;
      });
    }
  };

  // Функция для определения доступных действий
  const getAvailableActions = (application: ConferenceApplication) => {
    const canAccept =
      application.status === ApplicationStatus.SUBMITTED ||
      application.status === ApplicationStatus.UNDER_REVIEW;
    const canReject =
      application.status === ApplicationStatus.SUBMITTED ||
      application.status === ApplicationStatus.UNDER_REVIEW;
    const canWaitlist =
      application.status === ApplicationStatus.SUBMITTED ||
      application.status === ApplicationStatus.UNDER_REVIEW;

    return { canAccept, canReject, canWaitlist };
  };

  // Функции для правильной типизации
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

  // Обработчики изменения фильтров
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
    const clearedFilters = { ...memoizedInitialFilters, searchQuery: "" };
    setFilters(clearedFilters);
    setSearchQuery("");
  };

  // Адаптированные заголовки для разных ролей
  const getPageTitle = () => {
    switch (variant) {
      case "participant":
        return "Мои заявки";
      case "organizer":
        return "Заявки в моих конференциях";
      case "admin":
      default:
        return "Управление заявками";
    }
  };

  // Показ состояния загрузки
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mr-3" />
        <span className="text-gray-600">Загрузка заявок...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {getPageTitle()}
          </h2>
          {filteredApplications.length !== applications.length && (
            <p className="text-sm text-gray-600 mt-1">
              Показано {filteredApplications.length} из {applications.length}{" "}
              заявок
            </p>
          )}
        </div>
        <div className="text-sm text-gray-500">
          Всего заявок: {applications.length}
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
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Очистить
              </Button>
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
              {filteredApplications.map((application) => {
                const actions = getAvailableActions(application);
                const isProcessing = !!processingApplications[application.$id];
                const processingAction =
                  processingApplications[application.$id];

                return (
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
                            {/* ИСПРАВЛЕНИЕ: Показываем реальное название конференции */}
                            <div
                              className="font-medium"
                              title={getConferenceTitle(
                                application.conferenceId
                              )}
                            >
                              {getConferenceTitle(application.conferenceId)}
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
                        {new Date(application.$createdAt).toLocaleDateString(
                          "ru-RU"
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onApplicationClick(application);
                          }}
                          icon={Eye}
                        >
                          {isParticipantView ? "Просмотр" : "Детали"}
                        </Button>

                        {/* Кнопки действий только для админов и организаторов */}
                        {shouldShowReviewActions && (
                          <>
                            {actions.canAccept && (
                              <Button
                                variant="success"
                                size="sm"
                                loading={
                                  isProcessing &&
                                  processingAction === "accepting"
                                }
                                disabled={isProcessing}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAcceptApplication(application.$id);
                                }}
                                icon={Check}
                              >
                                Принять
                              </Button>
                            )}

                            {actions.canReject && (
                              <Button
                                variant="danger"
                                size="sm"
                                loading={
                                  isProcessing &&
                                  processingAction === "rejecting"
                                }
                                disabled={isProcessing}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRejectApplication(application.$id);
                                }}
                                icon={X}
                              >
                                Отклонить
                              </Button>
                            )}

                            {actions.canWaitlist && onApplicationWaitlist && (
                              <Button
                                variant="secondary"
                                size="sm"
                                loading={
                                  isProcessing &&
                                  processingAction === "waitlisting"
                                }
                                disabled={isProcessing}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleWaitlistApplication(application.$id);
                                }}
                                icon={Clock}
                              >
                                В очередь
                              </Button>
                            )}

                            {onApplicationReview && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onApplicationReview(application);
                                }}
                                icon={MessageSquare}
                              >
                                Рецензия
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Пустое состояние */}
      {applications.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isParticipantView ? "У вас пока нет заявок" : "Заявки не найдены"}
          </h3>
          <p className="text-gray-600 mb-4">
            {isParticipantView
              ? "Подайте заявку на участие в конференции"
              : "Заявки появятся здесь после их подачи участниками"}
          </p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Заявки не найдены
          </h3>
          <p className="text-gray-600 mb-4">
            Попробуйте изменить параметры поиска
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Очистить фильтры
          </Button>
        </div>
      ) : null}
    </div>
  );
}
