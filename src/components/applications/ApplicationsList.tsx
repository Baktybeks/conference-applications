// src/components/applications/ApplicationsList.tsx

"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useApplications } from "@/services/applicationService";
import { useAuth } from "@/hooks/useAuth";
import {
  ConferenceApplication,
  ApplicationFilters,
  ApplicationStatus,
  PresentationType,
  getStatusLabel,
  getStatusColor,
  getPresentationTypeLabel,
} from "@/types";
import { formatLocalDate } from "@/utils/dateUtils";
import {
  Filter,
  Search,
  Eye,
  Edit,
  MessageSquare,
  Clock,
  User,
  Building,
  FileText,
  Presentation,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  X,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Mail,
  Phone,
} from "lucide-react";

interface ApplicationsListProps {
  initialFilters?: Partial<ApplicationFilters>;
  onApplicationClick?: (application: ConferenceApplication) => void;
  onApplicationReview?: (application: ConferenceApplication) => void;
  showFilters?: boolean;
  showOrganizerActions?: boolean;
  compact?: boolean;
  maxHeight?: string;
}

interface FilterState extends ApplicationFilters {
  isFilterOpen: boolean;
}

const INITIAL_FILTER_STATE: FilterState = {
  status: [],
  hasPresentation: undefined,
  presentationType: [],
  searchTerm: "",
  isFilterOpen: false,
};

export function ApplicationsList({
  initialFilters = {},
  onApplicationClick,
  onApplicationReview,
  showFilters = false,
  showOrganizerActions = false,
  compact = false,
  maxHeight = "none",
}: ApplicationsListProps) {
  const { user, canViewAllApplications, canReviewApplications } = useAuth();

  // Локальное состояние фильтров
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...INITIAL_FILTER_STATE,
    ...initialFilters,
  }));

  const {
    data: applications = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useApplications(filters);

  // Обработчики фильтров
  const updateFilter = useCallback(
    <K extends keyof ApplicationFilters>(
      key: K,
      value: ApplicationFilters[K]
    ) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const toggleFilterValue = useCallback(
    <K extends keyof ApplicationFilters>(
      key: K,
      value: NonNullable<ApplicationFilters[K]>[0]
    ) => {
      setFilters((prev) => {
        const currentArray = (prev[key] as any[]) || [];
        const newArray = currentArray.includes(value)
          ? currentArray.filter((item) => item !== value)
          : [...currentArray, value];
        return { ...prev, [key]: newArray };
      });
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters((prev) => ({
      ...INITIAL_FILTER_STATE,
      isFilterOpen: prev.isFilterOpen,
    }));
  }, []);

  const toggleFilters = useCallback(() => {
    setFilters((prev) => ({ ...prev, isFilterOpen: !prev.isFilterOpen }));
  }, []);

  // Статистика по текущим фильтрам
  const stats = useMemo(() => {
    return {
      total: applications.length,
      draft: applications.filter((a) => a.status === ApplicationStatus.DRAFT)
        .length,
      submitted: applications.filter(
        (a) => a.status === ApplicationStatus.SUBMITTED
      ).length,
      underReview: applications.filter(
        (a) => a.status === ApplicationStatus.UNDER_REVIEW
      ).length,
      accepted: applications.filter(
        (a) => a.status === ApplicationStatus.ACCEPTED
      ).length,
      rejected: applications.filter(
        (a) => a.status === ApplicationStatus.REJECTED
      ).length,
      withPresentation: applications.filter((a) => a.hasPresentation).length,
    };
  }, [applications]);

  // Проверка наличия активных фильтров
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.searchTerm ||
      filters.status?.length ||
      filters.presentationType?.length ||
      filters.hasPresentation !== undefined ||
      filters.dateFrom ||
      filters.dateTo
    );
  }, [filters]);

  if (error) {
    return <ErrorState onRetry={refetch} />;
  }

  return (
    <div className="space-y-4">
      {/* Заголовок с действиями */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-indigo-600" />
            Заявки на участие
            {!isLoading && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({stats.total})
              </span>
            )}
          </h2>
          {stats.total > 0 && (
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                На рассмотрении: {stats.submitted + stats.underReview}
              </span>
              <span className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Принято: {stats.accepted}
              </span>
              <span>С докладами: {stats.withPresentation}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showFilters && (
            <button
              onClick={toggleFilters}
              className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                filters.isFilterOpen || hasActiveFilters
                  ? "border-indigo-500 text-indigo-700 bg-indigo-50"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Фильтры
              {hasActiveFilters && (
                <span className="ml-1 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  !
                </span>
              )}
              {filters.isFilterOpen ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </button>
          )}

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
            />
            Обновить
          </button>
        </div>
      </div>

      {/* Панель фильтров */}
      {showFilters && filters.isFilterOpen && (
        <FiltersPanel
          filters={filters}
          onUpdateFilter={updateFilter}
          onToggleFilterValue={toggleFilterValue}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      {/* Список заявок */}
      <div
        className="space-y-4"
        style={{
          maxHeight,
          overflowY: maxHeight !== "none" ? "auto" : "visible",
        }}
      >
        {isLoading ? (
          <LoadingState compact={compact} />
        ) : applications.length === 0 ? (
          <EmptyState
            hasFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        ) : (
          applications.map((application) => (
            <ApplicationCard
              key={application.$id}
              application={application}
              onClick={onApplicationClick}
              onReview={onApplicationReview}
              showOrganizerActions={showOrganizerActions}
              compact={compact}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Компонент панели фильтров
interface FiltersPanelProps {
  filters: FilterState;
  onUpdateFilter: <K extends keyof ApplicationFilters>(
    key: K,
    value: ApplicationFilters[K]
  ) => void;
  onToggleFilterValue: <K extends keyof ApplicationFilters>(
    key: K,
    value: NonNullable<ApplicationFilters[K]>[0]
  ) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

function FiltersPanel({
  filters,
  onUpdateFilter,
  onToggleFilterValue,
  onClearFilters,
  hasActiveFilters,
}: FiltersPanelProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Фильтры</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center"
          >
            <X className="h-3 w-3 mr-1" />
            Очистить
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Поиск */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Поиск
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={filters.searchTerm || ""}
              onChange={(e) => onUpdateFilter("searchTerm", e.target.value)}
              placeholder="Имя, организация, тема..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Статус */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Статус заявки
          </label>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {Object.values(ApplicationStatus).map((status) => (
              <label key={status} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.status?.includes(status) || false}
                  onChange={() => onToggleFilterValue("status", status)}
                  className="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-xs text-gray-700">
                  {getStatusLabel(status)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Тип презентации */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Тип презентации
          </label>
          <div className="space-y-1">
            {Object.values(PresentationType).map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.presentationType?.includes(type) || false}
                  onChange={() => onToggleFilterValue("presentationType", type)}
                  className="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-xs text-gray-700">
                  {getPresentationTypeLabel(type)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Наличие доклада */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Доклад
          </label>
          <div className="space-y-1">
            <label className="flex items-center">
              <input
                type="radio"
                name="hasPresentation"
                checked={filters.hasPresentation === undefined}
                onChange={() => onUpdateFilter("hasPresentation", undefined)}
                className="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              />
              <span className="ml-2 text-xs text-gray-700">Все</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasPresentation"
                checked={filters.hasPresentation === true}
                onChange={() => onUpdateFilter("hasPresentation", true)}
                className="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              />
              <span className="ml-2 text-xs text-gray-700">С докладом</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasPresentation"
                checked={filters.hasPresentation === false}
                onChange={() => onUpdateFilter("hasPresentation", false)}
                className="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              />
              <span className="ml-2 text-xs text-gray-700">Без доклада</span>
            </label>
          </div>
        </div>
      </div>

      {/* Фильтры по дате */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Дата подачи от
          </label>
          <input
            type="date"
            value={filters.dateFrom || ""}
            onChange={(e) => onUpdateFilter("dateFrom", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Дата подачи до
          </label>
          <input
            type="date"
            value={filters.dateTo || ""}
            onChange={(e) => onUpdateFilter("dateTo", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}

// Компонент карточки заявки
interface ApplicationCardProps {
  application: ConferenceApplication;
  onClick?: (application: ConferenceApplication) => void;
  onReview?: (application: ConferenceApplication) => void;
  showOrganizerActions?: boolean;
  compact?: boolean;
}

function ApplicationCard({
  application,
  onClick,
  onReview,
  showOrganizerActions,
  compact,
}: ApplicationCardProps) {
  const { canReviewApplications } = useAuth();

  const handleCardClick = useCallback(() => {
    onClick?.(application);
  }, [onClick, application]);

  const handleReviewClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onReview?.(application);
    },
    [onReview, application]
  );

  // Получаем цвет статуса
  const statusColor = getStatusColor(application.status);

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${
        onClick ? "cursor-pointer" : ""
      } ${compact ? "p-3" : "p-4"}`}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Заголовок и статус */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3
                className={`font-medium text-gray-900 pr-4 ${
                  compact ? "text-sm" : "text-base"
                }`}
              >
                {application.fullName}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {application.organization}
                {application.position && ` • ${application.position}`}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor}`}
              >
                {getStatusLabel(application.status)}
              </span>
              {application.hasPresentation && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Presentation className="h-3 w-3 mr-1" />
                  Доклад
                </span>
              )}
            </div>
          </div>

          {/* Информация о докладе */}
          {application.hasPresentation && application.presentationTitle && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <Presentation className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    {application.presentationTitle}
                  </p>
                  {application.presentationType && (
                    <p className="text-xs text-blue-700">
                      {getPresentationTypeLabel(application.presentationType)}
                    </p>
                  )}
                  {application.abstract && !compact && (
                    <p className="text-xs text-blue-600 mt-2 line-clamp-2">
                      {application.abstract}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Контактная информация */}
          <div
            className={`flex flex-wrap items-center gap-4 text-gray-500 mb-3 ${
              compact ? "text-xs" : "text-sm"
            }`}
          >
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-1" />
              <span className="truncate max-w-48">{application.email}</span>
            </div>
            {application.phone && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                <span>{application.phone}</span>
              </div>
            )}
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Подана: {formatLocalDate(application.$createdAt)}</span>
            </div>
          </div>

          {/* Ключевые слова */}
          {application.keywords && application.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {application.keywords
                .slice(0, compact ? 3 : 5)
                .map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700"
                  >
                    {keyword}
                  </span>
                ))}
              {application.keywords.length > (compact ? 3 : 5) && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                  +{application.keywords.length - (compact ? 3 : 5)}
                </span>
              )}
            </div>
          )}

          {/* Рецензирование */}
          {application.assignedReviewerId && (
            <div className="mb-2 text-sm text-gray-600">
              <User className="h-4 w-4 mr-1 inline" />
              Назначен рецензент
              {application.reviewDate && (
                <span className="ml-1">
                  • Рецензия от {formatLocalDate(application.reviewDate)}
                </span>
              )}
            </div>
          )}

          {/* Комментарии рецензента */}
          {application.reviewerComments && (
            <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <MessageSquare className="h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-900 mb-1">
                    Комментарии рецензента:
                  </p>
                  <p className="text-sm text-yellow-800">
                    {application.reviewerComments}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Дополнительная информация */}
          {!compact && (
            <div className="text-xs text-gray-500 space-y-1">
              {application.dietaryRestrictions && (
                <p>
                  Диетические ограничения: {application.dietaryRestrictions}
                </p>
              )}
              {application.accessibilityNeeds && (
                <p>Особые потребности: {application.accessibilityNeeds}</p>
              )}
              {application.accommodationNeeded && (
                <p>Требуется помощь с размещением</p>
              )}
            </div>
          )}
        </div>

        {/* Действия */}
        <div className="ml-4 flex flex-col gap-2">
          {onClick && (
            <button
              onClick={handleCardClick}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Просмотр"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
          {onReview && canReviewApplications && (
            <button
              onClick={handleReviewClick}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Рецензировать"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          {showOrganizerActions && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Экспорт заявки
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Экспорт"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Добавить комментарий
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Добавить комментарий"
              >
                <MessageSquare className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Состояние загрузки
function LoadingState({ compact }: { compact: boolean }) {
  return (
    <div className="space-y-4">
      {[...Array(compact ? 3 : 5)].map((_, i) => (
        <div
          key={i}
          className={`bg-white border border-gray-200 rounded-lg animate-pulse ${
            compact ? "p-3" : "p-4"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`bg-gray-300 rounded ${
                    compact ? "h-4 w-48" : "h-5 w-64"
                  }`}
                ></div>
                <div className="flex gap-2">
                  <div className="bg-gray-300 rounded-full h-5 w-20"></div>
                </div>
              </div>
              <div className="bg-gray-300 rounded h-3 w-32 mb-2"></div>
              {!compact && (
                <div className="bg-gray-300 rounded h-4 w-full mb-3"></div>
              )}
              <div className="flex gap-4 mb-2">
                <div className="bg-gray-300 rounded h-3 w-24"></div>
                <div className="bg-gray-300 rounded h-3 w-20"></div>
                <div className="bg-gray-300 rounded h-3 w-16"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Пустое состояние
function EmptyState({
  hasFilters,
  onClearFilters,
}: {
  hasFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="text-center py-12">
      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {hasFilters ? "Заявки не найдены" : "Пока нет заявок"}
      </h3>
      <p className="text-gray-600 mb-4">
        {hasFilters
          ? "Попробуйте изменить фильтры поиска"
          : "Заявки появятся здесь после их подачи участниками"}
      </p>
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors"
        >
          Очистить фильтры
        </button>
      )}
    </div>
  );
}

// Состояние ошибки
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="text-center py-12">
      <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Ошибка загрузки заявок
      </h3>
      <p className="text-gray-600 mb-4">
        Не удалось загрузить список заявок. Проверьте соединение с интернетом.
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Повторить
      </button>
    </div>
  );
}
