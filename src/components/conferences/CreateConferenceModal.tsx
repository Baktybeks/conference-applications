// src/components/conferences/CreateConferenceModal.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ
"use client";

import React, { useState } from "react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useCreateConference } from "@/services/conferenceService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-toastify";
import {
  CreateConferenceDto,
  ConferenceTheme,
  ParticipationType,
  getConferenceThemeLabel,
} from "@/types";
import { Plus, Calendar, MapPin, Users, Clock, FileText } from "lucide-react";

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

  // ИСПРАВЛЕНО: Улучшенная типизация для handleChange
  const handleChange = (
    field: keyof CreateConferenceDto,
    value: string | number | ConferenceTheme | ParticipationType | undefined
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

  // ИСПРАВЛЕНО: Отдельная функция для обработки числовых значений
  const handleNumberChange = (
    field: "maxParticipants" | "registrationFee",
    value: string
  ) => {
    const numValue = value === "" ? undefined : parseInt(value, 10);
    handleChange(field, isNaN(numValue || 0) ? undefined : numValue);
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
      toast.success("🎉 Конференция создана!", {
        position: "top-center",
        autoClose: 6000,
      });

      // Закрываем модалку и сбрасываем форму
      onClose();
      resetForm();
    } catch (error) {
      console.error("Ошибка при создании конференции:", error);
      toast.error("Ошибка создания", {
        position: "top-center",
        autoClose: 6000,
      });
    }
  };

  const handleButtonSubmit = async () => {
    if (!validateForm() || !user) return;

    try {
      await createConferenceMutation.mutateAsync({
        data: formData,
        organizerId: user.$id,
      });

      // Показываем уведомление об успехе
      toast.success("🎉 Конференция создана!", {
        position: "top-center",
        autoClose: 6000,
      });

      // Закрываем модалку и сбрасываем форму
      onClose();
      resetForm();
    } catch (error) {
      console.error("Ошибка при создании конференции:", error);
      toast.error("Ошибка создания", {
        position: "top-center",
        autoClose: 6000,
      });
    }
  };

  const resetForm = () => {
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
  };

  const handleClose = () => {
    if (!createConferenceMutation.isPending) {
      resetForm();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="🎯 Создать новую конференцию"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Основная информация */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
            <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full">
              <FileText className="h-4 w-4 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Основная информация
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Название конференции *"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                error={errors.title}
                placeholder="Введите название конференции"
                className="text-lg"
              />
            </div>

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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание *
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 resize-none"
              placeholder="Опишите цели, темы и особенности вашей конференции..."
            />
            {errors.description && (
              <p className="mt-2 text-sm text-red-600">{errors.description}</p>
            )}
          </div>
        </div>

        {/* Даты и место проведения */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
              <Calendar className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Даты и место проведения
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              label="Местоположение *"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              error={errors.location}
              placeholder="Город, адрес или ссылка для онлайн"
              icon={MapPin}
            />
          </div>
        </div>

        {/* Заявки и участие */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Заявки и участие
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Максимальное количество участников"
              type="number"
              value={formData.maxParticipants?.toString() || ""}
              onChange={(e) =>
                handleNumberChange("maxParticipants", e.target.value)
              }
              error={errors.maxParticipants}
              placeholder="Не ограничено"
              min="1"
            />

            <Input
              label="Стоимость участия (сом)"
              type="number"
              value={formData.registrationFee?.toString() || ""}
              onChange={(e) =>
                handleNumberChange("registrationFee", e.target.value)
              }
              error={errors.registrationFee}
              placeholder="Бесплатно"
              min="0"
            />

            <Input
              label="Контактный email *"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleChange("contactEmail", e.target.value)}
              error={errors.contactEmail}
              placeholder="contact@conference.org"
            />

            <Input
              label="Веб-сайт конференции"
              type="url"
              value={formData.website || ""}
              onChange={(e) => handleChange("website", e.target.value)}
              placeholder="https://conference.org"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Требования к заявкам
            </label>
            <textarea
              rows={3}
              value={formData.requirements || ""}
              onChange={(e) => handleChange("requirements", e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 resize-none"
              placeholder="Опишите требования к докладам, оформлению заявок, языку и другие важные условия..."
            />
          </div>
        </div>
      </form>

      <ModalFooter>
        <Button
          variant="outline"
          onClick={handleClose}
          disabled={createConferenceMutation.isPending}
          className="w-full sm:w-auto"
        >
          Отмена
        </Button>
        <Button
          type="submit"
          onClick={handleButtonSubmit}
          loading={createConferenceMutation.isPending}
          icon={Plus}
          className="w-full sm:w-auto sm:ml-3"
        >
          Создать конференцию
        </Button>
      </ModalFooter>
    </Modal>
  );
}
