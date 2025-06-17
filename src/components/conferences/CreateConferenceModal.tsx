// src/components/conferences/CreateConferenceModal.tsx
"use client";

import React, { useState } from "react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { useCreateConference } from "@/services/conferenceService";
import { useAuth } from "@/hooks/useAuth";
import {
  CreateConferenceDto,
  ConferenceTheme,
  ParticipationType,
  getConferenceThemeLabel,
} from "@/types";
import { Plus, Calendar, MapPin, Users, Clock } from "lucide-react";

interface CreateConferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Опции для выбора тематики
const CONFERENCE_THEMES = Object.values(ConferenceTheme).map((theme) => ({
  value: theme,
  label: getConferenceThemeLabel(theme),
}));

// Опции для выбора типа участия
const PARTICIPATION_TYPES = [
  { value: ParticipationType.OFFLINE, label: "Очно" },
  { value: ParticipationType.ONLINE, label: "Онлайн" },
  { value: ParticipationType.HYBRID, label: "Гибридный формат" },
];

export function CreateConferenceModal({
  isOpen,
  onClose,
}: CreateConferenceModalProps) {
  const { user } = useAuth();
  const createConferenceMutation = useCreateConference();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<CreateConferenceDto>({
    title: "",
    description: "",
    theme: "" as ConferenceTheme,
    participationType: "" as ParticipationType,
    startDate: "",
    endDate: "",
    location: "",
    submissionDeadline: "",
    maxParticipants: undefined,
    registrationFee: undefined,
    requirements: "",
    contactEmail: user?.email || "",
    website: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    field: keyof CreateConferenceDto,
    value: string | number | ConferenceTheme | ParticipationType
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Название конференции обязательно";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Описание обязательно";
    }

    if (!formData.theme) {
      newErrors.theme = "Выберите тематику";
    }

    if (!formData.participationType) {
      newErrors.participationType = "Выберите тип участия";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Дата начала обязательна";
    }

    if (!formData.endDate) {
      newErrors.endDate = "Дата окончания обязательна";
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        newErrors.endDate = "Дата окончания должна быть позже даты начала";
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = "Местоположение обязательно";
    }

    if (!formData.submissionDeadline) {
      newErrors.submissionDeadline = "Дедлайн подачи заявок обязателен";
    }

    if (formData.submissionDeadline && formData.startDate) {
      if (
        new Date(formData.submissionDeadline) >= new Date(formData.startDate)
      ) {
        newErrors.submissionDeadline =
          "Дедлайн должен быть раньше даты начала конференции";
      }
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = "Контактный email обязателен";
    }

    if (formData.maxParticipants && formData.maxParticipants < 1) {
      newErrors.maxParticipants = "Количество участников должно быть больше 0";
    }

    if (formData.registrationFee && formData.registrationFee < 0) {
      newErrors.registrationFee = "Стоимость не может быть отрицательной";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) return;

    try {
      await createConferenceMutation.mutateAsync({
        data: formData,
        organizerId: user.$id,
      });

      // Показываем уведомление об успехе
      showToast({
        type: "success",
        title: "Конференция создана!",
        message:
          "Ваша конференция успешно создана. Вы можете опубликовать её после настройки всех деталей.",
      });

      // Закрываем модалку и сбрасываем форму
      onClose();
      setFormData({
        title: "",
        description: "",
        theme: "" as ConferenceTheme,
        participationType: "" as ParticipationType,
        startDate: "",
        endDate: "",
        location: "",
        submissionDeadline: "",
        maxParticipants: undefined,
        registrationFee: undefined,
        requirements: "",
        contactEmail: user?.email || "",
        website: "",
      });
      setErrors({});
    } catch (error) {
      console.error("Ошибка при создании конференции:", error);

      showToast({
        type: "error",
        title: "Ошибка создания",
        message:
          "Не удалось создать конференцию. Пожалуйста, попробуйте ещё раз.",
      });
    }
  };

  const handleClose = () => {
    if (!createConferenceMutation.isPending) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Создать новую конференцию"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Основная информация */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Основная информация
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Название конференции *"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              error={errors.title}
              placeholder="Введите название конференции"
            />

            <Select
              label="Тематика *"
              value={formData.theme}
              onChange={(e) =>
                handleChange("theme", e.target.value as ConferenceTheme)
              }
              options={CONFERENCE_THEMES}
              error={errors.theme}
              placeholder="Выберите тематику"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Описание *
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Опишите вашу конференцию..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>
        </div>

        {/* Даты и место проведения */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Даты и место проведения
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Дата начала *"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
              error={errors.startDate}
            />

            <Input
              label="Дата окончания *"
              type="date"
              value={formData.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
              error={errors.endDate}
            />

            <Select
              label="Тип участия *"
              value={formData.participationType}
              onChange={(e) =>
                handleChange(
                  "participationType",
                  e.target.value as ParticipationType
                )
              }
              options={PARTICIPATION_TYPES}
              error={errors.participationType}
              placeholder="Выберите тип участия"
            />

            <Input
              label="Местоположение *"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              error={errors.location}
              placeholder="Город, адрес или ссылка для онлайн"
            />
          </div>
        </div>

        {/* Заявки и участие */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Заявки и участие
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Дедлайн подачи заявок *"
              type="datetime-local"
              value={formData.submissionDeadline}
              onChange={(e) =>
                handleChange("submissionDeadline", e.target.value)
              }
              error={errors.submissionDeadline}
            />

            <Input
              label="Максимальное количество участников"
              type="number"
              value={formData.maxParticipants || ""}
              onChange={(e) =>
                handleChange(
                  "maxParticipants",
                  parseInt(e.target.value) || undefined
                )
              }
              error={errors.maxParticipants}
              placeholder="Не ограничено"
            />

            <Input
              label="Стоимость участия (₽)"
              type="number"
              value={formData.registrationFee || ""}
              onChange={(e) =>
                handleChange(
                  "registrationFee",
                  parseInt(e.target.value) || undefined
                )
              }
              error={errors.registrationFee}
              placeholder="Бесплатно"
            />

            <Input
              label="Контактный email *"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleChange("contactEmail", e.target.value)}
              error={errors.contactEmail}
              placeholder="contact@conference.org"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Веб-сайт конференции"
              type="url"
              value={formData.website || ""}
              onChange={(e) => handleChange("website", e.target.value)}
              placeholder="https://conference.org"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Требования к заявкам
            </label>
            <textarea
              rows={3}
              value={formData.requirements || ""}
              onChange={(e) => handleChange("requirements", e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Опишите требования к докладам и заявкам..."
            />
          </div>
        </div>
      </form>

      <ModalFooter>
        <Button
          variant="outline"
          onClick={handleClose}
          disabled={createConferenceMutation.isPending}
        >
          Отмена
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          loading={createConferenceMutation.isPending}
          icon={Plus}
        >
          Создать конференцию
        </Button>
      </ModalFooter>
    </Modal>
  );
}
