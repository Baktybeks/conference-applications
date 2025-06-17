// src/components/applications/CreateApplicationModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  useCreateApplication,
  CreateApplicationData,
} from "@/services/applicationService";
import { Conference, PresentationType } from "@/types";
import {
  FileText,
  User,
  Building,
  Mail,
  Phone,
  Presentation,
  Plus,
  X,
} from "lucide-react";

interface CreateApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  conference: Conference;
  participantId: string;
  userEmail?: string;
  userName?: string;
  userOrganization?: string;
}

interface FormData {
  fullName: string;
  organization: string;
  position: string;
  email: string;
  phone: string;
  hasPresentation: boolean;
  presentationType: PresentationType | "";
  presentationTitle: string;
  abstract: string;
  keywords: string[];
  dietaryRestrictions: string;
  accessibilityNeeds: string;
  accommodationNeeded: boolean;
}

const PRESENTATION_TYPE_OPTIONS = [
  { value: PresentationType.ORAL, label: "Устный доклад" },
  { value: PresentationType.POSTER, label: "Постерная презентация" },
  { value: PresentationType.WORKSHOP, label: "Мастер-класс" },
  { value: PresentationType.KEYNOTE, label: "Пленарный доклад" },
  { value: PresentationType.PANEL, label: "Панельная дискуссия" },
];

export function CreateApplicationModal({
  isOpen,
  onClose,
  conference,
  participantId,
  userEmail = "",
  userName = "",
  userOrganization = "",
}: CreateApplicationModalProps) {
  const createApplicationMutation = useCreateApplication();

  const [formData, setFormData] = useState<FormData>({
    fullName: userName,
    organization: userOrganization,
    position: "",
    email: userEmail,
    phone: "",
    hasPresentation: false,
    presentationType: "",
    presentationTitle: "",
    abstract: "",
    keywords: [],
    dietaryRestrictions: "",
    accessibilityNeeds: "",
    accommodationNeeded: false,
  });

  const [keywordInput, setKeywordInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Сброс формы при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      setFormData({
        fullName: userName,
        organization: userOrganization,
        position: "",
        email: userEmail,
        phone: "",
        hasPresentation: false,
        presentationType: "",
        presentationTitle: "",
        abstract: "",
        keywords: [],
        dietaryRestrictions: "",
        accessibilityNeeds: "",
        accommodationNeeded: false,
      });
      setKeywordInput("");
      setErrors({});
    }
  }, [isOpen, userName, userEmail, userOrganization]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Очищаем ошибку для поля при изменении
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddKeyword = () => {
    if (
      keywordInput.trim() &&
      !formData.keywords.includes(keywordInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()],
      }));
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== keyword),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Полное имя обязательно";
    }

    if (!formData.organization.trim()) {
      newErrors.organization = "Организация обязательна";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email обязателен";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Неверный формат email";
    }

    if (formData.hasPresentation) {
      if (!formData.presentationType) {
        newErrors.presentationType = "Выберите тип презентации";
      }
      if (!formData.presentationTitle.trim()) {
        newErrors.presentationTitle = "Название презентации обязательно";
      }
      if (!formData.abstract.trim()) {
        newErrors.abstract = "Аннотация обязательна";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const applicationData: CreateApplicationData = {
      conferenceId: conference.$id,
      participantId,
      fullName: formData.fullName,
      organization: formData.organization,
      position: formData.position || undefined,
      email: formData.email,
      phone: formData.phone || undefined,
      hasPresentation: formData.hasPresentation,
      presentationType: formData.presentationType || undefined,
      presentationTitle: formData.presentationTitle || undefined,
      abstract: formData.abstract || undefined,
      keywords: formData.keywords.length > 0 ? formData.keywords : undefined,
      dietaryRestrictions: formData.dietaryRestrictions || undefined,
      accessibilityNeeds: formData.accessibilityNeeds || undefined,
      accommodationNeeded: formData.accommodationNeeded,
      $createdAt: new Date().toISOString(),
    };

    try {
      await createApplicationMutation.mutateAsync(applicationData);
      onClose();
    } catch (error) {
      console.error("Ошибка создания заявки:", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Подача заявки на "${conference.title}"`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Информация о конференции */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Информация о конференции
          </h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>
              <strong>Место:</strong> {conference.location}
            </p>
            <p>
              <strong>Даты:</strong>{" "}
              {new Date(conference.startDate).toLocaleDateString("ru-RU")} -{" "}
              {new Date(conference.endDate).toLocaleDateString("ru-RU")}
            </p>
            <p>
              <strong>Дедлайн подачи заявок:</strong>{" "}
              {new Date(conference.submissionDeadline).toLocaleDateString(
                "ru-RU"
              )}
            </p>
            {conference.registrationFee > 0 && (
              <p>
                <strong>Регистрационный взнос:</strong>{" "}
                {conference.registrationFee.toLocaleString()} сом
              </p>
            )}
          </div>
        </div>

        {/* Основная информация */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Личная информация
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Полное имя *"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              error={errors.fullName}
              icon={User}
            />

            <Input
              label="Email *"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              error={errors.email}
              icon={Mail}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Организация *"
              value={formData.organization}
              onChange={(e) =>
                handleInputChange("organization", e.target.value)
              }
              error={errors.organization}
              icon={Building}
            />

            <Input
              label="Должность"
              value={formData.position}
              onChange={(e) => handleInputChange("position", e.target.value)}
            />
          </div>

          <Input
            label="Телефон"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            icon={Phone}
          />
        </div>

        {/* Информация о презентации */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 flex items-center">
            <Presentation className="h-5 w-5 mr-2" />
            Презентация
          </h4>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="hasPresentation"
              checked={formData.hasPresentation}
              onChange={(e) =>
                handleInputChange("hasPresentation", e.target.checked)
              }
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label
              htmlFor="hasPresentation"
              className="ml-2 text-sm text-gray-900"
            >
              Я планирую выступить с презентацией
            </label>
          </div>

          {formData.hasPresentation && (
            <div className="space-y-4 ml-6 pl-4 border-l-2 border-indigo-200">
              <Select
                label="Тип презентации *"
                value={formData.presentationType}
                onChange={(e) =>
                  handleInputChange("presentationType", e.target.value)
                }
                options={PRESENTATION_TYPE_OPTIONS}
                placeholder="Выберите тип презентации"
                error={errors.presentationType}
              />

              <Input
                label="Название презентации *"
                value={formData.presentationTitle}
                onChange={(e) =>
                  handleInputChange("presentationTitle", e.target.value)
                }
                error={errors.presentationTitle}
              />

              <Textarea
                label="Аннотация *"
                value={formData.abstract}
                onChange={(e) => handleInputChange("abstract", e.target.value)}
                error={errors.abstract}
                rows={4}
                placeholder="Краткое описание вашей презентации..."
              />

              {/* Ключевые слова */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ключевые слова
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    placeholder="Введите ключевое слово"
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddKeyword();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddKeyword}
                    icon={Plus}
                  >
                    Добавить
                  </Button>
                </div>
                {formData.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {keyword}
                        <button
                          onClick={() => handleRemoveKeyword(keyword)}
                          className="ml-1 text-indigo-600 hover:text-indigo-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Дополнительные требования */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">
            Дополнительные требования
          </h4>

          <Textarea
            label="Пищевые ограничения"
            value={formData.dietaryRestrictions}
            onChange={(e) =>
              handleInputChange("dietaryRestrictions", e.target.value)
            }
            rows={2}
            placeholder="Укажите любые пищевые аллергии или ограничения..."
          />

          <Textarea
            label="Потребности в доступности"
            value={formData.accessibilityNeeds}
            onChange={(e) =>
              handleInputChange("accessibilityNeeds", e.target.value)
            }
            rows={2}
            placeholder="Укажите любые потребности в доступности..."
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="accommodationNeeded"
              checked={formData.accommodationNeeded}
              onChange={(e) =>
                handleInputChange("accommodationNeeded", e.target.checked)
              }
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label
              htmlFor="accommodationNeeded"
              className="ml-2 text-sm text-gray-900"
            >
              Мне нужна помощь с размещением
            </label>
          </div>
        </div>
      </div>

      <ModalFooter>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={createApplicationMutation.isPending}
        >
          Отмена
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          loading={createApplicationMutation.isPending}
          icon={FileText}
        >
          Подать заявку
        </Button>
      </ModalFooter>
    </Modal>
  );
}
