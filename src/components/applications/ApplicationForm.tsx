// src/components/applications/ApplicationForm.tsx

"use client";

import React, { useState, useEffect } from "react";
import {
  useCreateApplication,
  useUpdateApplication,
} from "@/services/applicationService";
import { useAuth } from "@/hooks/useAuth";
import {
  CreateApplicationDto,
  UpdateApplicationDto,
  ConferenceApplication,
  Conference,
  PresentationType,
  getPresentationTypeLabel,
} from "@/types";
import { toast } from "react-toastify";
import {
  User,
  Building,
  Mail,
  Phone,
  FileText,
  Presentation,
  Tag,
  Info,
  Calendar,
  MapPin,
  AlertCircle,
  Save,
  Send,
  X,
} from "lucide-react";

interface ApplicationFormProps {
  conference: Conference;
  existingApplication?: ConferenceApplication;
  onSuccess?: () => void;
  onCancel?: () => void;
  mode?: "create" | "edit" | "view";
}

export function ApplicationForm({
  conference,
  existingApplication,
  onSuccess,
  onCancel,
  mode = "create",
}: ApplicationFormProps) {
  const { user } = useAuth();
  const createApplicationMutation = useCreateApplication();
  const updateApplicationMutation = useUpdateApplication();

  const [formData, setFormData] = useState<CreateApplicationDto>(() => ({
    conferenceId: conference.$id,
    fullName: existingApplication?.fullName || user?.name || "",
    organization: existingApplication?.organization || user?.organization || "",
    position: existingApplication?.position || user?.position || "",
    email: existingApplication?.email || user?.email || "",
    phone: existingApplication?.phone || user?.phone || "",
    hasPresentation: existingApplication?.hasPresentation || false,
    presentationType: existingApplication?.presentationType,
    presentationTitle: existingApplication?.presentationTitle || "",
    abstract: existingApplication?.abstract || "",
    keywords: existingApplication?.keywords || [],
    dietaryRestrictions: existingApplication?.dietaryRestrictions || "",
    accessibilityNeeds: existingApplication?.accessibilityNeeds || "",
    accommodationNeeded: existingApplication?.accommodationNeeded || false,
  }));

  const [keywordInput, setKeywordInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDraft, setIsDraft] = useState(false);

  // Проверяем, можно ли редактировать заявку
  const canEdit =
    mode !== "view" &&
    (!existingApplication ||
      existingApplication.status === "DRAFT" ||
      existingApplication.status === "SUBMITTED");

  // Проверяем дедлайн подачи заявок
  const isAfterDeadline = new Date() > new Date(conference.submissionDeadline);

  useEffect(() => {
    if (isAfterDeadline && mode === "create") {
      toast.warning("⚠️ Срок подачи заявок истёк", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  }, [isAfterDeadline, mode]);

  const validateForm = (checkRequired = true): boolean => {
    const newErrors: Record<string, string> = {};

    if (checkRequired) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = "ФИО обязательно";
      }

      if (!formData.organization.trim()) {
        newErrors.organization = "Организация обязательна";
      }

      if (!formData.email.trim()) {
        newErrors.email = "Email обязателен";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Некорректный формат email";
      }

      if (formData.hasPresentation) {
        if (!formData.presentationType) {
          newErrors.presentationType = "Выберите тип презентации";
        }
        if (!formData.presentationTitle?.trim()) {
          newErrors.presentationTitle = "Название доклада обязательно";
        }
        if (!formData.abstract?.trim()) {
          newErrors.abstract = "Аннотация обязательна";
        } else if (formData.abstract.length < 100) {
          newErrors.abstract =
            "Аннотация должна содержать минимум 100 символов";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Очищаем ошибку для поля при изменении
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Сброс полей презентации при отключении доклада
    if (name === "hasPresentation" && !newValue) {
      setFormData((prev) => ({
        ...prev,
        presentationType: undefined,
        presentationTitle: "",
        abstract: "",
        keywords: [],
      }));
    }
  };

  const handleKeywordAdd = () => {
    if (
      keywordInput.trim() &&
      !formData.keywords?.includes(keywordInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        keywords: [...(prev.keywords || []), keywordInput.trim()],
      }));
      setKeywordInput("");
    }
  };

  const handleKeywordRemove = (keyword: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: (prev.keywords || []).filter((k) => k !== keyword),
    }));
  };

  const handleSubmit = async (e: React.FormEvent, saveAsDraft = false) => {
    e.preventDefault();

    if (!user) {
      toast.error("❌ Ошибка: пользователь не авторизован");
      return;
    }

    if (!saveAsDraft && !validateForm()) {
      toast.warning("⚠️ Проверьте правильность заполнения формы");
      return;
    }

    if (!saveAsDraft && isAfterDeadline) {
      toast.error("❌ Срок подачи заявок истёк");
      return;
    }

    try {
      if (existingApplication) {
        // Обновление существующей заявки
        const updateData: UpdateApplicationDto = {
          ...formData,
          status: saveAsDraft ? "DRAFT" : "SUBMITTED",
        };

        await updateApplicationMutation.mutateAsync({
          id: existingApplication.$id,
          data: updateData,
          userId: user.$id,
        });

        toast.success(
          saveAsDraft
            ? "✅ Заявка сохранена как черновик"
            : "✅ Заявка успешно обновлена!",
          {
            position: "top-right",
            autoClose: 3000,
          }
        );
      } else {
        // Создание новой заявки
        await createApplicationMutation.mutateAsync({
          data: formData,
          participantId: user.$id,
          isDraft: saveAsDraft,
        });

        toast.success(
          saveAsDraft
            ? "✅ Заявка сохранена как черновик"
            : "✅ Заявка успешно подана!",
          {
            position: "top-right",
            autoClose: 3000,
          }
        );
      }

      onSuccess?.();
    } catch (error: any) {
      const errorMessage =
        error?.message || "Произошла ошибка при обработке заявки";
      toast.error(`❌ ${errorMessage}`, {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  if (!canEdit && mode !== "view") {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Заявка не может быть изменена
          </h3>
          <p className="text-gray-600">
            Заявка уже рассмотрена или находится на рассмотрении и не может быть
            изменена.
          </p>
        </div>
      </div>
    );
  }

  const isReadOnly = mode === "view" || !canEdit;
  const isSubmitting =
    createApplicationMutation.isPending || updateApplicationMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      {/* Заголовок */}
      <div className="bg-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {mode === "view"
                ? "Просмотр заявки"
                : existingApplication
                ? "Редактирование заявки"
                : "Подача заявки на участие"}
            </h2>
            <p className="text-indigo-100 text-sm mt-1">{conference.title}</p>
          </div>
          {isAfterDeadline && mode === "create" && (
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
              Срок подачи истёк
            </div>
          )}
        </div>
      </div>

      {/* Информация о конференции */}
      <div className="px-6 py-4 bg-gray-50 border-b">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            {new Date(conference.startDate).toLocaleDateString("ru-RU")} -{" "}
            {new Date(conference.endDate).toLocaleDateString("ru-RU")}
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            {conference.location}
          </div>
          <div className="flex items-center text-gray-600">
            <AlertCircle className="h-4 w-4 mr-2" />
            Дедлайн:{" "}
            {new Date(conference.submissionDeadline).toLocaleDateString(
              "ru-RU"
            )}
          </div>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 space-y-6">
        {/* Личная информация */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-indigo-600" />
            Личная информация
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                ФИО *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.fullName
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-300 focus:border-indigo-500"
                } ${isReadOnly ? "bg-gray-100" : ""}`}
                placeholder="Иванов Иван Иванович"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.email
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-300 focus:border-indigo-500"
                  } ${isReadOnly ? "bg-gray-100" : ""}`}
                  placeholder="ivan@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="organization"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Организация *
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.organization
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-300 focus:border-indigo-500"
                  } ${isReadOnly ? "bg-gray-100" : ""}`}
                  placeholder="Название организации/университета"
                />
              </div>
              {errors.organization && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.organization}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="position"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Должность
              </label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position || ""}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  isReadOnly ? "bg-gray-100" : ""
                }`}
                placeholder="Должность, звание"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Телефон
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    isReadOnly ? "bg-gray-100" : ""
                  }`}
                  placeholder="+7 (999) 123-45-67"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Информация о докладе */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Presentation className="h-5 w-5 mr-2 text-indigo-600" />
            Информация о докладе
          </h3>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasPresentation"
                name="hasPresentation"
                checked={formData.hasPresentation}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor="hasPresentation"
                className="ml-2 text-sm text-gray-900"
              >
                У меня есть доклад для презентации
              </label>
            </div>

            {formData.hasPresentation && (
              <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <label
                    htmlFor="presentationType"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Тип презентации *
                  </label>
                  <select
                    id="presentationType"
                    name="presentationType"
                    value={formData.presentationType || ""}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.presentationType
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-300 focus:border-indigo-500"
                    } ${isReadOnly ? "bg-gray-100" : ""}`}
                  >
                    <option value="">Выберите тип презентации</option>
                    {Object.values(PresentationType).map((type) => (
                      <option key={type} value={type}>
                        {getPresentationTypeLabel(type)}
                      </option>
                    ))}
                  </select>
                  {errors.presentationType && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.presentationType}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="presentationTitle"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Название доклада *
                  </label>
                  <input
                    type="text"
                    id="presentationTitle"
                    name="presentationTitle"
                    value={formData.presentationTitle || ""}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.presentationTitle
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-300 focus:border-indigo-500"
                    } ${isReadOnly ? "bg-gray-100" : ""}`}
                    placeholder="Название вашего доклада"
                  />
                  {errors.presentationTitle && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.presentationTitle}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="abstract"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Аннотация доклада *
                  </label>
                  <textarea
                    id="abstract"
                    name="abstract"
                    value={formData.abstract || ""}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                    rows={6}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.abstract
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-300 focus:border-indigo-500"
                    } ${isReadOnly ? "bg-gray-100" : ""}`}
                    placeholder="Краткое описание доклада, основные идеи и результаты..."
                  />
                  <div className="mt-1 flex justify-between items-center">
                    {errors.abstract ? (
                      <p className="text-sm text-red-600">{errors.abstract}</p>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Минимум 100 символов
                      </p>
                    )}
                    <p className="text-sm text-gray-400">
                      {(formData.abstract || "").length}/2000
                    </p>
                  </div>
                </div>

                {/* Ключевые слова */}
                <div>
                  <label
                    htmlFor="keywords"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Ключевые слова
                  </label>
                  <div className="space-y-2">
                    {!isReadOnly && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={keywordInput}
                          onChange={(e) => setKeywordInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleKeywordAdd();
                            }
                          }}
                          placeholder="Добавить ключевое слово"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={handleKeywordAdd}
                          className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-md text-sm hover:bg-indigo-200 transition-colors"
                        >
                          Добавить
                        </button>
                      </div>
                    )}

                    {formData.keywords && formData.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.keywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {keyword}
                            {!isReadOnly && (
                              <button
                                type="button"
                                onClick={() => handleKeywordRemove(keyword)}
                                className="ml-1 text-indigo-600 hover:text-indigo-800"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Дополнительная информация */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Info className="h-5 w-5 mr-2 text-indigo-600" />
            Дополнительная информация
          </h3>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="dietaryRestrictions"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Диетические ограничения
              </label>
              <textarea
                id="dietaryRestrictions"
                name="dietaryRestrictions"
                value={formData.dietaryRestrictions || ""}
                onChange={handleInputChange}
                disabled={isReadOnly}
                rows={2}
                className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  isReadOnly ? "bg-gray-100" : ""
                }`}
                placeholder="Укажите особенности питания, аллергии..."
              />
            </div>

            <div>
              <label
                htmlFor="accessibilityNeeds"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Особые потребности доступности
              </label>
              <textarea
                id="accessibilityNeeds"
                name="accessibilityNeeds"
                value={formData.accessibilityNeeds || ""}
                onChange={handleInputChange}
                disabled={isReadOnly}
                rows={2}
                className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  isReadOnly ? "bg-gray-100" : ""
                }`}
                placeholder="Нужна ли помощь с мобильностью, переводом и т.д."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="accommodationNeeded"
                name="accommodationNeeded"
                checked={formData.accommodationNeeded}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor="accommodationNeeded"
                className="ml-2 text-sm text-gray-900"
              >
                Требуется помощь с размещением
              </label>
            </div>
          </div>
        </div>

        {/* Важная информация */}
        {conference.requirements && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">
              Требования к участникам
            </h4>
            <p className="text-sm text-yellow-700">{conference.requirements}</p>
          </div>
        )}

        {/* Кнопки действий */}
        {!isReadOnly && (
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting || isAfterDeadline}
              className="flex-1 sm:flex-none px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {existingApplication ? "Обновление..." : "Подача..."}
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Send className="h-4 w-4 mr-2" />
                  {existingApplication ? "Обновить заявку" : "Подать заявку"}
                </div>
              )}
            </button>

            {!isAfterDeadline && (
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <div className="flex items-center justify-center">
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить как черновик
                </div>
              </button>
            )}

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Отмена
              </button>
            )}
          </div>
        )}

        {mode === "view" && onCancel && (
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Закрыть
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
