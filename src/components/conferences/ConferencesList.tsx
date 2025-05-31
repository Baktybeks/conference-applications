// src/components/conferences/ConferencesList.tsx

"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useConferences } from "@/services/conferenceService";
import { useAuth } from "@/hooks/useAuth";
import {
  Conference,
  ConferenceFilters,
  ConferenceTheme,
  ParticipationType,
  getThemeLabel,
  getParticipationTypeLabel,
} from "@/types";
import { formatLocalDate } from "@/utils/dateUtils";
import {
  Filter,
  Search,
  Calendar,
  MapPin,
  Users,
  Globe,
  Video,
  Building,
  Eye,
  Edit,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  X,
  Plus,
  Star,
  Clock,
} from "lucide-react";

interface ConferencesListProps {
  initialFilters?: Partial<ConferenceFilters>;
  onConferenceClick?: (conference: Conference) => void;
  onConferenceEdit?: (conference: Conference) => void;
  showFilters?: boolean;
  compact?: boolean;
  maxHeight?: string;
}

interface FilterState extends ConferenceFilters {
  isFilterOpen: boolean;
}

const INITIAL_FILTER_STATE: FilterState = {
  theme: [],
  participationType: [],
  searchTerm: "",
  isFilterOpen: false,
  isPublished: true, // По умолчанию показываем только опубликованные
};

export function ConferencesList({
  initialFilters = {},
  onConferenceClick,
  onConferenceEdit,
  showFilters = false,
  compact = false,
  maxHeight = "none",
}: ConferencesListProps) {
  const { user, canManageConferences } = useAuth();

  // Локальное состояние фильтров
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...INITIAL_FILTER_STATE,
    ...initialFilters,
  }));

  const {
    data: conferences = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useConferences(filters);

  // Обработчики фильтров
  const updateFilter = useCallback(
    <K extends keyof ConferenceFilters>(
      key: K,
      value: ConferenceFilters[K]
    ) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const toggleFilterValue = useCallback(
    <K extends keyof ConferenceFilters>(
      key: K,
      value: NonNullable<ConferenceFilters[K]>[0]
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
    const now = new Date();
    return {
      total: conferences.length,
      upcoming: conferences.filter((c) => new Date(c.startDate) > now).length,
      ongoing: conferences.filter(
        (c) => new Date(c.startDate) <= now && new Date(c.endDate) >= now
      ).length,
      past: conferences.filter((c) => new Date(c.endDate) < now).length,
    };
  }, [conferences]);

  // Проверка наличия активных фильтров
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.searchTerm ||
      filters.theme?.length ||
      filters.participationType?.length ||
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
            <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
            Конференции
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
                Предстоящие: {stats.upcoming}
              </span>
              <span className="flex items-center">
                <Star className="h-3 w-3 mr-1" />
                Активные: {stats.ongoing}
              </span>
              <span>Завершённые: {stats.past}</span>
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

          {canManageConferences && (
            <button
              onClick={() => {
                /* TODO: Открыть форму создания */
              }}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Создать конференцию
            </button>
          )}
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

      {/* Список конференций */}
      <div
        className="space-y-4"
        style={{
          maxHeight,
          overflowY: maxHeight !== "none" ? "auto" : "visible",
        }}
      >
        {isLoading ? (
          <LoadingState compact={compact} />
        ) : conferences.length === 0 ? (
          <EmptyState
            hasFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        ) : (
          conferences.map((conference) => (
            <ConferenceCard
              key={conference.$id}
              conference={conference}
              onClick={onConferenceClick}
              onEdit={onConferenceEdit}
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
  onUpdateFilter: <K extends keyof ConferenceFilters>(
    key: K,
    value: ConferenceFilters[K]
  ) => void;
  onToggleFilterValue: <K extends keyof ConferenceFilters>(
    key: K,
    value: NonNullable<ConferenceFilters[K]>[0]
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
              placeholder="Название, организатор..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Тематика */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Тематика
          </label>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {Object.values(ConferenceTheme).map((theme) => (
              <label key={theme} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.theme?.includes(theme) || false}
                  onChange={() => onToggleFilterValue("theme", theme)}
                  className="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-xs text-gray-700">
                  {getThemeLabel(theme)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Формат участия */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Формат участия
          </label>
          <div className="space-y-1">
            {Object.values(ParticipationType).map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.participationType?.includes(type) || false}
                  onChange={() =>
                    onToggleFilterValue("participationType", type)
                  }
                  className="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-xs text-gray-700">
                  {getParticipationTypeLabel(type)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Статус */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Статус
          </label>
          <div className="space-y-1">
            <label className="flex items-center">
              <input
                type="radio"
                name="conferenceStatus"
                checked={filters.isPublished !== false}
                onChange={() => onUpdateFilter("isPublished", true)}
                className="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              />
              <span className="ml-2 text-xs text-gray-700">Опубликованные</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="conferenceStatus"
                checked={filters.isPublished === false}
                onChange={() => onUpdateFilter("isPublished", false)}
                className="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              />
              <span className="ml-2 text-xs text-gray-700">Черновики</span>
            </label>
          </div>
        </div>
      </div>

      {/* Фильтры по дате */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Дата начала от
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
            Дата начала до
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

// Компонент карточки конференции
interface ConferenceCardProps {
  conference: Conference;
  onClick?: (conference: Conference) => void;
  onEdit?: (conference: Conference) => void;
  compact?: boolean;
}

function ConferenceCard({
  conference,
  onClick,
  onEdit,
  compact,
}: ConferenceCardProps) {
  const { canManageConferences } = useAuth();

  const handleCardClick = useCallback(() => {
    onClick?.(conference);
  }, [onClick, conference]);

  const handleEditClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit?.(conference);
    },
    [onEdit, conference]
  );

  // Определяем статус конференции
  const now = new Date();
  const startDate = new Date(conference.startDate);
  const endDate = new Date(conference.endDate);
  const submissionDeadline = new Date(conference.submissionDeadline);

  let status:
    | "upcoming"
    | "ongoing"
    | "past"
    | "submissions-open"
    | "submissions-closed";
  let statusColor: string;

  if (endDate < now) {
    status = "past";
    statusColor = "bg-gray-100 text-gray-800";
  } else if (startDate <= now && endDate >= now) {
    status = "ongoing";
    statusColor = "bg-green-100 text-green-800";
  } else if (submissionDeadline >= now) {
    status = "submissions-open";
    statusColor = "bg-blue-100 text-blue-800";
  } else {
    status = "submissions-closed";
    statusColor = "bg-yellow-100 text-yellow-800";
  }

  const getStatusText = () => {
    switch (status) {
      case "past":
        return "Завершена";
      case "ongoing":
        return "Идёт сейчас";
      case "submissions-open":
        return "Приём заявок открыт";
      case "submissions-closed":
        return "Приём заявок закрыт";
      default:
        return "Предстоящая";
    }
  };

  const getParticipationIcon = () => {
    switch (conference.participationType) {
      case ParticipationType.ONLINE:
        return <Globe className="h-4 w-4" />;
      case ParticipationType.OFFLINE:
        return <Building className="h-4 w-4" />;
      case ParticipationType.HYBRID:
        return <Video className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

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
            <h3
              className={`font-medium text-gray-900 pr-4 ${
                compact ? "text-sm" : "text-base"
              }`}
            >
              {conference.title}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
              >
                {getStatusText()}
              </span>
              {!conference.isPublished && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Черновик
                </span>
              )}
            </div>
          </div>

          {/* Описание */}
          {!compact && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {conference.description}
            </p>
          )}

          {/* Мета-информация */}
          <div
            className={`flex flex-wrap items-center gap-4 text-gray-500 mb-3 ${
              compact ? "text-xs" : "text-sm"
            }`}
          >
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>
                {formatLocalDate(conference.startDate)}
                {conference.startDate !== conference.endDate &&
                  ` - ${formatLocalDate(conference.endDate)}`}
              </span>
            </div>
            <div className="flex items-center">
              {getParticipationIcon()}
              <span className="ml-1 truncate max-w-32">
                {conference.location}
              </span>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-800">
                {getThemeLabel(conference.theme)}
              </span>
            </div>
          </div>

          {/* Дедлайн подачи заявок */}
          {status === "submissions-open" && (
            <div className="flex items-center text-blue-600 text-sm">
              <Clock className="h-4 w-4 mr-1" />
              Подача заявок до: {formatLocalDate(conference.submissionDeadline)}
            </div>
          )}

          {/* Дополнительная информация */}
          {!compact && (
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
              {conference.maxParticipants && (
                <div className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  Макс. участников: {conference.maxParticipants}
                </div>
              )}
              {conference.registrationFee && (
                <div className="flex items-center">
                  Взнос: {conference.registrationFee} ₽
                </div>
              )}
              {conference.website && (
                <div className="flex items-center">
                  <Globe className="h-3 w-3 mr-1" />
                  <a
                    href={conference.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Сайт конференции
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Действия */}
        {(onClick || (onEdit && canManageConferences)) && (
          <div className="ml-4 flex items-center gap-2">
            {onClick && (
              <button
                onClick={handleCardClick}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Просмотр"
              >
                <Eye className="h-4 w-4" />
              </button>
            )}
            {onEdit && canManageConferences && (
              <button
                onClick={handleEditClick}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Редактировать"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
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
      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {hasFilters ? "Конференции не найдены" : "Пока нет конференций"}
      </h3>
      <p className="text-gray-600 mb-4">
        {hasFilters
          ? "Попробуйте изменить фильтры поиска"
          : "Конференции появятся здесь после их создания"}
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
      <Calendar className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Ошибка загрузки конференций
      </h3>
      <p className="text-gray-600 mb-4">
        Не удалось загрузить список конференций. Проверьте соединение с
        интернетом.
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
