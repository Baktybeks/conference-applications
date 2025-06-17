"use client";

import React, { useState, useEffect } from "react";
import {
  Conference,
  ConferenceTheme,
  ParticipationType,
  ConferenceFilters,
} from "@/types";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Filter,
  Search,
  Edit,
  Eye,
  Plus,
} from "lucide-react";

// ИСПРАВЛЕНИЕ: Сделал onConferenceEdit опциональным
interface ConferencesListProps {
  onConferenceClick: (conference: Conference) => void;
  onConferenceEdit?: (conference: Conference) => void; // ИСПРАВЛЕНИЕ: Теперь опциональный
  showFilters?: boolean;
  initialFilters?: Partial<ConferenceFilters>;
  variant?: "admin" | "organizer" | "participant";
  showCreateButton?: boolean;
  showEditButton?: boolean; // ДОБАВЛЕНО: Контроль отображения кнопки редактирования
  conferences?: Conference[];
}

export function ConferencesList({
  onConferenceClick,
  onConferenceEdit, // Может быть undefined
  showFilters = false,
  initialFilters = {},
  variant = "admin",
  showCreateButton = true,
  showEditButton = true, // ДОБАВЛЕНО: По умолчанию показывать кнопку редактирования
  conferences: externalConferences,
}: ConferencesListProps) {
  const [filters, setFilters] = useState<ConferenceFilters>({
    searchQuery: "",
    theme: undefined,
    participationType: undefined,
    isPublished: undefined,
    ...initialFilters,
  });

  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || "");

  // Применяем начальные фильтры при изменении initialFilters
  useEffect(() => {
    setFilters((prev) => ({ ...prev, ...initialFilters }));
  }, [initialFilters]);

  // ИСПРАВЛЕНИЕ: Автоматически определяем настройки для участника
  const isParticipantView = variant === "participant";
  const shouldShowEditButton =
    showEditButton && !isParticipantView && onConferenceEdit;
  const shouldShowCreateButton = showCreateButton && !isParticipantView;

  // TODO: Получить реальные данные конференций с учетом фильтров
  const getAllConferences = (): Conference[] => {
    const baseConferences: Conference[] = [
      {
        $id: "1",
        $createdAt: "2024-01-01T00:00:00Z",
        $updatedAt: "2024-01-01T00:00:00Z",
        title: "AI in Healthcare 2024",
        description:
          "Международная конференция по применению искусственного интеллекта в медицине. Рассматриваются актуальные вопросы диагностики, лечения и профилактики заболеваний с использованием современных технологий машинного обучения.",
        theme: ConferenceTheme.MEDICINE,
        startDate: "2024-04-15T09:00:00Z",
        endDate: "2024-04-17T18:00:00Z",
        submissionDeadline: "2024-03-01T23:59:59Z",
        location: "Москва, Россия",
        participationType: ParticipationType.HYBRID,
        organizerId: "org1",
        contactEmail: "info@aihealthcare2024.com",
        website: "https://aihealthcare2024.com",
        maxParticipants: 500,
        registrationFee: 15000,
        isPublished: true,
        requirements: "Научная степень или опыт работы в области медицины/ИИ",
        tags: ["AI", "Healthcare", "Machine Learning"],
        createdAt: "2024-01-01T00:00:00Z",
      },
      {
        $id: "2",
        $createdAt: "2024-01-05T00:00:00Z",
        $updatedAt: "2024-01-05T00:00:00Z",
        title: "Digital Education Summit 2024",
        description:
          "Саммит по цифровому образованию, где обсуждаются новейшие методики онлайн-обучения, технологии виртуальной реальности в образовании и персонализированные подходы к обучению.",
        theme: ConferenceTheme.EDUCATION,
        startDate: "2024-05-20T10:00:00Z",
        endDate: "2024-05-22T17:00:00Z",
        submissionDeadline: "2024-04-01T23:59:59Z",
        location: "Санкт-Петербург, Россия",
        participationType: ParticipationType.OFFLINE,
        organizerId: "org2",
        contactEmail: "contact@digitaledu2024.ru",
        website: "https://digitaledu2024.ru",
        maxParticipants: 300,
        registrationFee: 8000,
        isPublished: true,
        requirements: "Опыт работы в сфере образования",
        tags: ["Education", "Digital", "Online Learning"],
        createdAt: "2024-01-05T00:00:00Z",
      },
      {
        $id: "3",
        $createdAt: "2024-01-10T00:00:00Z",
        $updatedAt: "2024-01-10T00:00:00Z",
        title: "Green Engineering Conference",
        description:
          "Конференция по экологичным технологиям в инженерии. Обсуждение возобновляемых источников энергии, устойчивого развития и экологически чистых производственных процессов.",
        theme: ConferenceTheme.ENGINEERING,
        startDate: "2024-06-10T09:00:00Z",
        endDate: "2024-06-12T18:00:00Z",
        submissionDeadline: "2024-05-01T23:59:59Z",
        location: "Онлайн",
        participationType: ParticipationType.ONLINE,
        organizerId: initialFilters.organizerId || "org3",
        contactEmail: "info@greeneng2024.org",
        website: "https://greeneng2024.org",
        registrationFee: 0,
        isPublished: true, // ИСПРАВЛЕНИЕ: Для участников показываем только опубликованные
        requirements:
          "Инженерное образование или опыт в области экологических технологий",
        tags: ["Engineering", "Ecology", "Sustainability"],
        createdAt: "2024-01-10T00:00:00Z",
      },
      {
        $id: "4",
        $createdAt: "2024-01-15T00:00:00Z",
        $updatedAt: "2024-01-15T00:00:00Z",
        title: "Blockchain Business Summit",
        description:
          "Деловой саммит, посвященный применению блокчейн-технологий в бизнесе и финансах.",
        theme: ConferenceTheme.BUSINESS,
        startDate: "2024-07-05T10:00:00Z",
        endDate: "2024-07-06T18:00:00Z",
        submissionDeadline: "2024-06-01T23:59:59Z",
        location: "Казань, Россия",
        participationType: ParticipationType.HYBRID,
        organizerId: initialFilters.organizerId || "org4",
        contactEmail: "info@blockchainbiz2024.com",
        website: "https://blockchainbiz2024.com",
        maxParticipants: 250,
        registrationFee: 12000,
        isPublished: true,
        requirements: "Опыт в IT или финансовой сфере",
        tags: ["Blockchain", "Business", "Fintech"],
        createdAt: "2024-01-15T00:00:00Z",
      },
    ];

    // ИСПРАВЛЕНИЕ: Для участников автоматически показываем только опубликованные конференции
    if (isParticipantView) {
      return baseConferences.filter((conf) => conf.isPublished);
    }

    return baseConferences;
  };

  // Функция фильтрации конференций
  const getFilteredConferences = (): Conference[] => {
    const allConferences = externalConferences || getAllConferences();

    return allConferences.filter((conference) => {
      // ИСПРАВЛЕНИЕ: Для участников автоматически фильтруем только опубликованные
      if (isParticipantView && !conference.isPublished) {
        return false;
      }

      // Фильтр по организатору
      if (
        filters.organizerId &&
        conference.organizerId !== filters.organizerId
      ) {
        return false;
      }

      // Фильтр по поисковому запросу
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        if (
          !conference.title.toLowerCase().includes(query) &&
          !conference.description.toLowerCase().includes(query) &&
          !conference.tags.some((tag) => tag.toLowerCase().includes(query))
        ) {
          return false;
        }
      }

      // Фильтр по теме
      if (filters.theme && conference.theme !== filters.theme) {
        return false;
      }

      // Фильтр по типу участия
      if (
        filters.participationType &&
        conference.participationType !== filters.participationType
      ) {
        return false;
      }

      // Фильтр по статусу публикации (только для админов и организаторов)
      if (
        !isParticipantView &&
        filters.isPublished !== undefined &&
        conference.isPublished !== filters.isPublished
      ) {
        return false;
      }

      // Фильтр по дате
      if (filters.dateFrom) {
        const conferenceDate = new Date(conference.startDate);
        const filterDate = new Date(filters.dateFrom);
        if (conferenceDate < filterDate) {
          return false;
        }
      }

      if (filters.dateTo) {
        const conferenceDate = new Date(conference.endDate);
        const filterDate = new Date(filters.dateTo);
        if (conferenceDate > filterDate) {
          return false;
        }
      }

      return true;
    });
  };

  const filteredConferences = getFilteredConferences();

  // Функции для получения текста
  const getThemeText = (theme: ConferenceTheme): string => {
    const themes: Record<ConferenceTheme, string> = {
      [ConferenceTheme.COMPUTER_SCIENCE]: "Компьютерные науки",
      [ConferenceTheme.MEDICINE]: "Медицина",
      [ConferenceTheme.EDUCATION]: "Образование",
      [ConferenceTheme.ENGINEERING]: "Инженерия",
      [ConferenceTheme.BUSINESS]: "Бизнес",
      [ConferenceTheme.SOCIAL_SCIENCES]: "Социальные науки",
      [ConferenceTheme.NATURAL_SCIENCES]: "Естественные науки",
      [ConferenceTheme.HUMANITIES]: "Гуманитарные науки",
      [ConferenceTheme.OTHER]: "Другое",
    };
    return themes[theme] || theme;
  };

  const getParticipationTypeText = (type: ParticipationType): string => {
    const types: Record<ParticipationType, string> = {
      [ParticipationType.ONLINE]: "Онлайн",
      [ParticipationType.OFFLINE]: "Очно",
      [ParticipationType.HYBRID]: "Гибридно",
    };
    return types[type] || type;
  };

  const getThemeColor = (theme: ConferenceTheme): string => {
    const colors: Record<ConferenceTheme, string> = {
      [ConferenceTheme.COMPUTER_SCIENCE]: "bg-blue-100 text-blue-800",
      [ConferenceTheme.MEDICINE]: "bg-red-100 text-red-800",
      [ConferenceTheme.EDUCATION]: "bg-green-100 text-green-800",
      [ConferenceTheme.ENGINEERING]: "bg-orange-100 text-orange-800",
      [ConferenceTheme.BUSINESS]: "bg-purple-100 text-purple-800",
      [ConferenceTheme.SOCIAL_SCIENCES]: "bg-yellow-100 text-yellow-800",
      [ConferenceTheme.NATURAL_SCIENCES]: "bg-teal-100 text-teal-800",
      [ConferenceTheme.HUMANITIES]: "bg-pink-100 text-pink-800",
      [ConferenceTheme.OTHER]: "bg-gray-100 text-gray-800",
    };
    return colors[theme] || "bg-gray-100 text-gray-800";
  };

  // Обработчики изменения фильтров
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setFilters((prev) => ({ ...prev, searchQuery: value }));
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as ConferenceTheme | "";
    setFilters((prev) => ({ ...prev, theme: value || undefined }));
  };

  const handleParticipationTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value as ParticipationType | "";
    setFilters((prev) => ({ ...prev, participationType: value || undefined }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({
      ...prev,
      isPublished: value === "" ? undefined : value === "true",
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
      case "organizer":
        return "Мои конференции";
      case "participant":
        return "Доступные конференции";
      case "admin":
      default:
        return "Управление конференциями";
    }
  };

  const getCreateButtonText = () => {
    switch (variant) {
      case "organizer":
        return "Создать конференцию";
      case "admin":
      default:
        return "Создать конференцию";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {getPageTitle()}
          </h2>
          {filteredConferences.length !== getAllConferences().length && (
            <p className="text-sm text-gray-600 mt-1">
              Показано {filteredConferences.length} из{" "}
              {getAllConferences().length} конференций
            </p>
          )}
        </div>
        {shouldShowCreateButton && (
          <button
            onClick={() => console.log("Создать конференцию")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            {getCreateButtonText()}
          </button>
        )}
      </div>

      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Поиск
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск конференций..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Тема
              </label>
              <select
                value={filters.theme || ""}
                onChange={handleThemeChange}
                className="px-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Все темы</option>
                <option value={ConferenceTheme.COMPUTER_SCIENCE}>
                  Компьютерные науки
                </option>
                <option value={ConferenceTheme.MEDICINE}>Медицина</option>
                <option value={ConferenceTheme.EDUCATION}>Образование</option>
                <option value={ConferenceTheme.ENGINEERING}>Инженерия</option>
                <option value={ConferenceTheme.BUSINESS}>Бизнес</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Формат
              </label>
              <select
                value={filters.participationType || ""}
                onChange={handleParticipationTypeChange}
                className="px-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Все форматы</option>
                <option value={ParticipationType.ONLINE}>Онлайн</option>
                <option value={ParticipationType.OFFLINE}>Очно</option>
                <option value={ParticipationType.HYBRID}>Гибридно</option>
              </select>
            </div>

            <div className="flex space-x-2">
              {/* ИСПРАВЛЕНИЕ: Фильтр статуса только для не-участников */}
              {!isParticipantView && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Статус
                  </label>
                  <select
                    value={
                      filters.isPublished === undefined
                        ? ""
                        : filters.isPublished.toString()
                    }
                    onChange={handleStatusChange}
                    className="px-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Все</option>
                    <option value="true">Опубликованы</option>
                    <option value="false">Черновики</option>
                  </select>
                </div>
              )}

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center"
                >
                  Очистить
                </button>
              </div>
            </div>
          </div>

          {/* Активные фильтры */}
          {(filters.searchQuery ||
            filters.theme ||
            filters.participationType ||
            (!isParticipantView && filters.isPublished !== undefined)) && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-500">Активные фильтры:</span>
              {filters.searchQuery && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  Поиск: {filters.searchQuery}
                </span>
              )}
              {filters.theme && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  {getThemeText(filters.theme)}
                </span>
              )}
              {filters.participationType && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                  {getParticipationTypeText(filters.participationType)}
                </span>
              )}
              {!isParticipantView && filters.isPublished !== undefined && (
                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                  {filters.isPublished ? "Опубликованы" : "Черновики"}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Список конференций */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConferences.map((conference) => (
          <div
            key={conference.$id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden cursor-pointer"
            onClick={() => onConferenceClick(conference)}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {conference.title}
                  </h3>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getThemeColor(
                      conference.theme
                    )}`}
                  >
                    {getThemeText(conference.theme)}
                  </span>
                </div>

                {/* ИСПРАВЛЕНИЕ: Кнопки действий только если нужно */}
                <div className="flex space-x-1 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onConferenceClick(conference);
                    }}
                    className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                    title={isParticipantView ? "Подать заявку" : "Просмотреть"}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {/* ИСПРАВЛЕНИЕ: Кнопка редактирования только если разрешено */}
                  {shouldShowEditButton && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onConferenceEdit!(conference); // ! потому что мы проверили shouldShowEditButton
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Редактировать"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {conference.description}
              </p>

              <div className="space-y-3 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>
                    {new Date(conference.startDate).toLocaleDateString("ru-RU")}{" "}
                    -{new Date(conference.endDate).toLocaleDateString("ru-RU")}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">
                    {conference.location} (
                    {getParticipationTypeText(conference.participationType)})
                  </span>
                </div>
                {conference.maxParticipants && (
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>до {conference.maxParticipants} участников</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>
                    Дедлайн:{" "}
                    {new Date(conference.submissionDeadline).toLocaleDateString(
                      "ru-RU"
                    )}
                  </span>
                </div>
              </div>

              {conference.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1">
                  {conference.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {conference.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{conference.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                {/* ИСПРАВЛЕНИЕ: Статус показываем только для не-участников */}
                {!isParticipantView ? (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      conference.isPublished
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {conference.isPublished ? "Опубликована" : "Черновик"}
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Доступна для подачи заявок
                  </span>
                )}
                <span className="text-sm font-medium text-gray-900">
                  {conference.registrationFee > 0
                    ? `${conference.registrationFee.toLocaleString()} ₽`
                    : "Бесплатно"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Пустое состояние */}
      {filteredConferences.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filters.searchQuery || filters.theme || filters.participationType
              ? "Конференции не найдены"
              : isParticipantView
              ? "Нет доступных конференций"
              : variant === "organizer"
              ? "У вас пока нет конференций"
              : "Конференции не найдены"}
          </h3>
          <p className="text-gray-600 mb-4">
            {filters.searchQuery || filters.theme || filters.participationType
              ? "Попробуйте изменить параметры поиска"
              : isParticipantView
              ? "В данный момент нет открытых конференций для подачи заявок"
              : variant === "organizer"
              ? "Создайте первую конференцию"
              : "Создайте первую конференцию или измените параметры поиска"}
          </p>
          {(filters.searchQuery ||
            filters.theme ||
            filters.participationType) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors mr-4"
            >
              Очистить фильтры
            </button>
          )}
          {shouldShowCreateButton && (
            <button
              onClick={() => console.log("Создать конференцию")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              {getCreateButtonText()}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
