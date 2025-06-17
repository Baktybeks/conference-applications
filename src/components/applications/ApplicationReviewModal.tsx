// src/components/applications/ApplicationReviewModal.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ

"use client";

import React, { useState } from "react";
import { ConferenceApplication, ApplicationStatus } from "@/types";
import { useReviewApplication } from "@/services/applicationService"; // ДОБАВЛЕНО: импорт хука
import { Button } from "@/components/ui/Button";
import {
  X,
  FileText,
  User,
  Mail,
  Phone,
  Building,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

interface ApplicationReviewModalProps {
  application: ConferenceApplication;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function ApplicationReviewModal({
  application,
  isOpen,
  onClose,
  onUpdate,
}: ApplicationReviewModalProps) {
  const [newStatus, setNewStatus] = useState<ApplicationStatus>(
    application.status
  );
  const [comments, setComments] = useState<string>(""); // ДОБАВЛЕНО: состояние для комментариев

  // ДОБАВЛЕНО: Используем хук для рецензирования заявок
  const reviewApplicationMutation = useReviewApplication();

  if (!isOpen) return null;

  // ИСПРАВЛЕНИЕ: Обновленная функция для отправки рецензии
  const handleSubmitReview = async () => {
    try {
      // Проверяем, изменился ли статус
      if (newStatus === application.status && !comments.trim()) {
        onClose();
        return;
      }

      // Отправляем запрос на обновление статуса
      await reviewApplicationMutation.mutateAsync({
        applicationId: application.$id,
        status: newStatus as
          | ApplicationStatus.ACCEPTED
          | ApplicationStatus.REJECTED
          | ApplicationStatus.WAITLIST
          | ApplicationStatus.UNDER_REVIEW,
        comments: comments.trim() || undefined,
      });

      // Вызываем колбэки для обновления UI
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Ошибка при отправке рецензии:", error);
      // Ошибка уже обработана в хуке через toast
    }
  };

  const getStatusOptions = (): Array<{
    value: ApplicationStatus;
    label: string;
    color: string;
    icon: React.ComponentType<{ className?: string }>;
  }> => [
    {
      value: ApplicationStatus.SUBMITTED,
      label: "Подана",
      color: "text-blue-600",
      icon: FileText,
    },
    {
      value: ApplicationStatus.UNDER_REVIEW,
      label: "На рассмотрении",
      color: "text-yellow-600",
      icon: Clock,
    },
    {
      value: ApplicationStatus.ACCEPTED,
      label: "Принята",
      color: "text-green-600",
      icon: CheckCircle,
    },
    {
      value: ApplicationStatus.REJECTED,
      label: "Отклонена",
      color: "text-red-600",
      icon: XCircle,
    },
    {
      value: ApplicationStatus.WAITLIST,
      label: "Список ожидания",
      color: "text-orange-600",
      icon: AlertCircle,
    },
  ];

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewStatus(e.target.value as ApplicationStatus);
  };

  // ДОБАВЛЕНО: Обработчик изменения комментариев
  const handleCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComments(e.target.value);
  };

  const currentStatusOption = getStatusOptions().find(
    (opt) => opt.value === application.status
  );
  const newStatusOption = getStatusOptions().find(
    (opt) => opt.value === newStatus
  );

  // ДОБАВЛЕНО: Проверка, есть ли изменения
  const hasChanges = newStatus !== application.status || comments.trim() !== "";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-indigo-600" />
              Рецензирование заявки
            </h2>
            {currentStatusOption && (
              <div
                className={`ml-4 flex items-center ${currentStatusOption.color}`}
              >
                <currentStatusOption.icon className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">
                  {currentStatusOption.label}
                </span>
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm" icon={X} onClick={onClose}>
            {""}
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Изменение статуса */}
          <div className="bg-indigo-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Статус заявки
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Текущий статус
                </label>
                {currentStatusOption && (
                  <div
                    className={`flex items-center ${currentStatusOption.color}`}
                  >
                    <currentStatusOption.icon className="h-5 w-5 mr-2" />
                    <span className="font-medium">
                      {currentStatusOption.label}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Новый статус
                </label>
                <select
                  value={newStatus}
                  onChange={handleStatusChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={reviewApplicationMutation.isPending} // ДОБАВЛЕНО: отключение при отправке
                >
                  {getStatusOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {newStatusOption && newStatus !== application.status && (
                  <div
                    className={`mt-2 flex items-center ${newStatusOption.color}`}
                  >
                    <newStatusOption.icon className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      Будет изменен на: {newStatusOption.label}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ДОБАВЛЕНО: Поле для комментариев */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Комментарии рецензента
              </label>
              <textarea
                value={comments}
                onChange={handleCommentsChange}
                placeholder="Добавьте комментарии по поводу изменения статуса заявки..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-vertical"
                rows={4}
                disabled={reviewApplicationMutation.isPending}
              />
              <p className="text-xs text-gray-500 mt-1">
                Комментарии будут видны участнику и организаторам
              </p>
            </div>
          </div>

          {/* Информация об участнике */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Информация об участнике
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Полное имя
                </label>
                <p className="text-gray-900 font-medium">
                  {application.fullName}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Должность
                </label>
                <p className="text-gray-900">
                  {application.position || "Не указано"}
                </p>
              </div>
              <div className="flex items-center">
                <Building className="h-4 w-4 mr-2 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Организация
                  </label>
                  <p className="text-gray-900">{application.organization}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Email
                  </label>
                  <p className="text-gray-900">{application.email}</p>
                </div>
              </div>
              {application.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Телефон
                    </label>
                    <p className="text-gray-900">{application.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Информация о презентации */}
          {application.hasPresentation && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Информация о презентации
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Тип презентации
                  </label>
                  <p className="text-gray-900">
                    {application.presentationType}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Название
                  </label>
                  <p className="text-gray-900 font-medium">
                    {application.presentationTitle}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Аннотация
                  </label>
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {application.abstract}
                  </p>
                </div>
                {application.keywords.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Ключевые слова
                    </label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {application.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Дополнительная информация */}
          {(application.dietaryRestrictions ||
            application.accessibilityNeeds ||
            application.accommodationNeeded) && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Дополнительные требования
              </h3>
              <div className="space-y-3">
                {application.dietaryRestrictions && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Пищевые ограничения
                    </label>
                    <p className="text-gray-900">
                      {application.dietaryRestrictions}
                    </p>
                  </div>
                )}
                {application.accessibilityNeeds && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Потребности доступности
                    </label>
                    <p className="text-gray-900">
                      {application.accessibilityNeeds}
                    </p>
                  </div>
                )}
                {application.accommodationNeeded && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Размещение
                    </label>
                    <p className="text-gray-900">
                      Требуется помощь с размещением
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={reviewApplicationMutation.isPending} // ДОБАВЛЕНО: отключение при отправке
          >
            Отмена
          </Button>
          <Button
            variant="primary"
            loading={reviewApplicationMutation.isPending} // ИСПРАВЛЕНИЕ: используем состояние из мутации
            onClick={handleSubmitReview}
            disabled={!hasChanges} // ДОБАВЛЕНО: отключение, если нет изменений
          >
            {reviewApplicationMutation.isPending
              ? "Сохранение..."
              : "Сохранить изменения"}
          </Button>
        </div>
      </div>
    </div>
  );
}
