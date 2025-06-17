// src/components/applications/ApplicationReviewModal.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ

"use client";

import React, { useState } from "react";
import { ConferenceApplication, ApplicationStatus } from "@/types";
import { X, FileText, User, Mail, Phone, Building } from "lucide-react";

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
  const [reviewComments, setReviewComments] = useState(
    application.reviewerComments || ""
  );
  const [newStatus, setNewStatus] = useState<ApplicationStatus>(
    application.status
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmitReview = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Отправить данные рецензирования на сервер
      console.log("Отправка рецензии:", {
        applicationId: application.$id,
        status: newStatus,
        comments: reviewComments,
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error("Ошибка при отправке рецензии:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ИСПРАВЛЕНИЕ: Добавлена правильная типизация для опций статуса
  const getStatusOptions = (): Array<{
    value: ApplicationStatus;
    label: string;
  }> => [
    { value: ApplicationStatus.SUBMITTED, label: "Подана" },
    { value: ApplicationStatus.UNDER_REVIEW, label: "На рассмотрении" },
    { value: ApplicationStatus.ACCEPTED, label: "Принята" },
    { value: ApplicationStatus.REJECTED, label: "Отклонена" },
    { value: ApplicationStatus.WAITLIST, label: "Список ожидания" },
  ];

  // ИСПРАВЛЕНИЕ: Добавлен обработчик с правильной типизацией
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewStatus(e.target.value as ApplicationStatus);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-indigo-600" />
            Рецензирование заявки
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
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
                <p className="text-gray-900">{application.fullName}</p>
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

          {/* Форма рецензирования */}
          <div className="bg-white border-2 border-indigo-100 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Рецензирование
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Статус заявки
                </label>
                {/* ИСПРАВЛЕНИЕ: Использован новый обработчик с правильной типизацией */}
                <select
                  value={newStatus}
                  onChange={handleStatusChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {getStatusOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Комментарии рецензента
                </label>
                <textarea
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  rows={6}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Введите ваши комментарии и рекомендации..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmitReview}
            disabled={isSubmitting}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Сохранение..." : "Сохранить рецензию"}
          </button>
        </div>
      </div>
    </div>
  );
}
