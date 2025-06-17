// src/components/organizer/conferences/OrganizerConferencesView.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { CreateConferenceModal } from "@/components/conferences/CreateConferenceModal";
import { useConferences } from "@/services/conferenceService";
import {
  Conference,
  ConferenceTheme,
  ParticipationType,
  getConferenceThemeLabel,
} from "@/types";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  Users,
  Clock,
  Edit,
  Eye,
  MoreVertical,
  Settings,
} from "lucide-react";

interface OrganizerConferencesViewProps {
  organizerId: string;
  onConferenceClick?: (conference: Conference) => void;
  onConferenceEdit?: (conference: Conference) => void;
}

const PARTICIPATION_LABELS: Record<ParticipationType, string> = {
  [ParticipationType.OFFLINE]: "Очно",
  [ParticipationType.ONLINE]: "Онлайн",
  [ParticipationType.HYBRID]: "Гибридный",
};

export function OrganizerConferencesView({
  organizerId,
  onConferenceClick,
  onConferenceEdit,
}: OrganizerConferencesViewProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [themeFilter, setThemeFilter] = useState("");

  // Получаем конференции
  const {
    data: conferences = [],
    isLoading,
    refetch,
  } = useConferences({
    organizerId,
    searchQuery: searchTerm || undefined,
    theme: themeFilter ? (themeFilter as ConferenceTheme) : undefined,
    isPublished:
      statusFilter === "published"
        ? true
        : statusFilter === "draft"
        ? false
        : undefined,
  });

  const getConferenceStatus = (conference: Conference) => {
    const now = new Date();
    const startDate = new Date(conference.startDate);
    const endDate = new Date(conference.endDate);
    const submissionDeadline = new Date(conference.submissionDeadline);

    if (!conference.isPublished) {
      return {
        status: "draft",
        label: "Черновик",
        variant: "secondary" as const,
      };
    }

    if (endDate < now) {
      return {
        status: "ended",
        label: "Завершена",
        variant: "default" as const,
      };
    }

    if (startDate <= now && endDate >= now) {
      return { status: "active", label: "Идет", variant: "success" as const };
    }

    if (submissionDeadline < now && startDate > now) {
      return {
        status: "closed",
        label: "Прием закрыт",
        variant: "warning" as const,
      };
    }

    if (startDate > now) {
      return {
        status: "upcoming",
        label: "Предстоящая",
        variant: "info" as const,
      };
    }

    return {
      status: "unknown",
      label: "Неизвестно",
      variant: "default" as const,
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const filteredConferences = conferences.filter((conference) => {
    return (
      searchTerm === "" ||
      conference.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conference.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conference.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и действия */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Мои конференции
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Управляйте своими конференциями и следите за заявками
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          icon={Plus}
          variant="primary"
        >
          Создать конференцию
        </Button>
      </div>

      {/* Фильтры и поиск */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Поиск по названию, описанию или местоположению..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
              iconPosition="left"
            />
          </div>

          <div className="flex gap-3">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "", label: "Все статусы" },
                { value: "draft", label: "Черновики" },
                { value: "published", label: "Опубликованные" },
              ]}
              className="min-w-[150px]"
            />

            <Select
              value={themeFilter}
              onChange={(e) => setThemeFilter(e.target.value)}
              options={[
                { value: "", label: "Все тематики" },
                ...Object.values(ConferenceTheme).map((theme) => ({
                  value: theme,
                  label: getConferenceThemeLabel(theme),
                })),
              ]}
              className="min-w-[180px]"
            />
          </div>
        </div>
      </div>

      {/* Список конференций */}
      {filteredConferences.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {conferences.length === 0
              ? "Пока нет конференций"
              : "Ничего не найдено"}
          </h3>
          <p className="text-gray-600 mb-4">
            {conferences.length === 0
              ? "Создайте свою первую конференцию, чтобы начать работу"
              : "Попробуйте изменить параметры поиска"}
          </p>
          {conferences.length === 0 && (
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              icon={Plus}
              variant="primary"
            >
              Создать конференцию
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredConferences.map((conference) => {
            const status = getConferenceStatus(conference);

            return (
              <div
                key={conference.$id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                {/* Заголовок карточки */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {conference.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        <Badge variant="secondary">
                          {getConferenceThemeLabel(conference.theme)}
                        </Badge>
                      </div>
                    </div>

                    {/* Меню действий */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                        onClick={() => onConferenceClick?.(conference)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Edit}
                        onClick={() => onConferenceEdit?.(conference)}
                      />
                      <Button variant="ghost" size="sm" icon={MoreVertical} />
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {conference.description}
                  </p>
                </div>

                {/* Информация о конференции */}
                <div className="px-6 pb-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {formatDate(conference.startDate)} -{" "}
                    {formatDate(conference.endDate)}
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    {conference.location} •{" "}
                    {PARTICIPATION_LABELS[conference.participationType]}
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    Дедлайн заявок: {formatDate(conference.submissionDeadline)}
                  </div>

                  {conference.maxParticipants && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      До {conference.maxParticipants} участников
                    </div>
                  )}
                </div>

                {/* Действия */}
                <div className="px-6 py-3 bg-gray-50 rounded-b-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Создана {formatDate(conference.$createdAt)}
                    </span>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onConferenceClick?.(conference)}
                      >
                        Подробнее
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Settings}
                        onClick={() => onConferenceEdit?.(conference)}
                      >
                        Управление
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Модальное окно создания конференции */}
      <CreateConferenceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
