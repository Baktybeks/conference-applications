// src/components/applications/ApplicationReviewModal.tsx

"use client";

import React, { useState, useEffect } from "react";
import {
  useUpdateApplicationStatus,
  useAssignReviewer,
  useAddComment,
} from "@/services/applicationService";
import { useActiveTechnicians } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";
import {
  ConferenceApplication,
  ApplicationWithDetails,
  ApplicationStatus,
  getStatusLabel,
  getStatusColor,
  getPresentationTypeLabel,
  UserRole,
} from "@/types";
import { formatLocalDate, formatLocalDateTime } from "@/utils/dateUtils";
import { toast } from "react-toastify";
import {
  X,
  User,
  Building,
  Mail,
  Phone,
  Calendar,
  Presentation,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  FileText,
  Award,
  Send,
  UserCheck,
} from "lucide-react";

interface ApplicationReviewModalProps {
  application: ApplicationWithDetails | ConferenceApplication;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export function ApplicationReviewModal({
  application,
  isOpen,
  onClose,
  onUpdate,
}: ApplicationReviewModalProps) {
  const { user, canReviewApplications } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>(
    application.status
  );
  const [reviewComments, setReviewComments] = useState("");
  const [selectedReviewer, setSelectedReviewer] = useState(
    application.assignedReviewerId || ""
  );
  const [commentText, setCommentText] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  const updateStatusMutation = useUpdateApplicationStatus();
  const assignReviewerMutation = useAssignReviewer();
  const addCommentMutation = useAddComment();
  const { data: reviewers = [] } = useActiveTechnicians();

  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(application.status);
      setReviewComments(application.reviewerComments || "");
      setSelectedReviewer(application.assignedReviewerId || "");
      setCommentText("");
      setIsInternal(false);
    }
  }, [isOpen, application]);

  if (!isOpen) return null;

  const handleStatusUpdate = async () => {
    if (!user) return;

    try {
      await updateStatusMutation.mutateAsync({
        id: application.$id,
        status: selectedStatus,
        userId: user.$id,
        comments: reviewComments || undefined,
      });

      toast.success("Статус заявки обновлен", {
        position: "top-right",
        autoClose: 3000,
      });

      onUpdate?.();
      onClose();
    } catch (error: any) {
      toast.error(`Ошибка: ${error.message}`, {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  const handleReviewerAssignment = async () => {
    if (!user || !selectedReviewer) return;

    try {
      await assignReviewerMutation.mutateAsync({
        applicationId: application.$id,
        reviewerId: selectedReviewer,
        userId: user.$id,
      });

      toast.success("Рецензент назначен", {
        position: "top-right",
        autoClose: 3000,
      });

      onUpdate?.();
    } catch (error: any) {
      toast.error(`Ошибка: ${error.message}`, {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  const handleAddComment = async () => {
    if (!user || !commentText.trim()) return;

    try {
      await addCommentMutation.mutateAsync({
        applicationId: application.$id,
        authorId: user.$id,
        text: commentText.trim(),
        isInternal,
      });

      toast.success("Комментарий добавлен", {
        position: "top-right",
        autoClose: 3000,
      });

      setCommentText("");
      onUpdate?.();
    } catch (error: any) {
      toast.error(`Ошибка: ${error.message}`, {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  const statusColor = getStatusColor(application.status);
  const isLoading =
    updateStatusMutation.isPending ||
    assignReviewerMutation.isPending ||
    addCommentMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Рецензирование заявки
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Заявка от {application.fullName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Основная информация */}
              <div className="lg:col-span-2 space-y-6">
                {/* Участник */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-indigo-600" />
                    Информация об участнике
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        ФИО
                      </label>
                      <p className="text-sm text-gray-900">
                        {application.fullName}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Организация
                      </label>
                      <p className="text-sm text-gray-900">
                        {application.organization}
                      </p>
                    </div>
                    {application.position && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Должность
                        </label>
                        <p className="text-sm text-gray-900">
                          {application.position}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <p className="text-sm text-gray-900">
                        {application.email}
                      </p>
                    </div>
                    {application.phone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Телефон
                        </label>
                        <p className="text-sm text-gray-900">
                          {application.phone}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Дата подачи
                      </label>
                      <p className="text-sm text-gray-900">
                        {formatLocalDateTime(application.$createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Доклад */}
                {application.hasPresentation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Presentation className="h-5 w-5 mr-2 text-blue-600" />
                      Информация о докладе
                    </h3>
                    <div className="space-y-4">
                      {application.presentationType && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Тип презентации
                          </label>
                          <p className="text-sm text-gray-900">
                            {getPresentationTypeLabel(
                              application.presentationType
                            )}
                          </p>
                        </div>
                      )}
                      {application.presentationTitle && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Название доклада
                          </label>
                          <p className="text-sm text-gray-900 font-medium">
                            {application.presentationTitle}
                          </p>
                        </div>
                      )}
                      {application.abstract && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Аннотация
                          </label>
                          <div className="bg-white border border-blue-200 rounded p-3">
                            <p className="text-sm text-gray-900 whitespace-pre-wrap">
                              {application.abstract}
                            </p>
                          </div>
                        </div>
                      )}
                      {application.keywords &&
                        application.keywords.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Ключевые слова
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {application.keywords.map((keyword, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
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
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                      Дополнительная информация
                    </h3>
                    <div className="space-y-3">
                      {application.dietaryRestrictions && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Диетические ограничения
                          </label>
                          <p className="text-sm text-gray-900">
                            {application.dietaryRestrictions}
                          </p>
                        </div>
                      )}
                      {application.accessibilityNeeds && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Особые потребности
                          </label>
                          <p className="text-sm text-gray-900">
                            {application.accessibilityNeeds}
                          </p>
                        </div>
                      )}
                      {application.accommodationNeeded && (
                        <div>
                          <p className="text-sm text-gray-900 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            Требуется помощь с размещением
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Существующие комментарии */}
                {"comments" in application &&
                  application.comments &&
                  application.comments.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <MessageSquare className="h-5 w-5 mr-2 text-indigo-600" />
                        Комментарии
                      </h3>
                      <div className="space-y-3">
                        {application.comments.map((comment: any) => (
                          <div
                            key={comment.$id}
                            className="bg-white border rounded-lg p-3"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900">
                                {comment.authorName || "Пользователь"}
                              </span>
                              <div className="flex items-center gap-2">
                                {comment.isInternal && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    Внутренний
                                  </span>
                                )}
                                <span className="text-xs text-gray-500">
                                  {formatLocalDateTime(comment.$createdAt)}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">
                              {comment.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Панель действий */}
              <div className="space-y-6">
                {/* Текущий статус */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Текущий статус
                  </h3>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusColor}`}
                  >
                    {getStatusLabel(application.status)}
                  </span>
                  {application.reviewDate && (
                    <p className="text-xs text-gray-500 mt-2">
                      Рецензия от {formatLocalDate(application.reviewDate)}
                    </p>
                  )}
                </div>

                {/* Изменение статуса */}
                {canReviewApplications && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Изменить статус
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Новый статус
                        </label>
                        <select
                          value={selectedStatus}
                          onChange={(e) =>
                            setSelectedStatus(
                              e.target.value as ApplicationStatus
                            )
                          }
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value={ApplicationStatus.SUBMITTED}>
                            {getStatusLabel(ApplicationStatus.SUBMITTED)}
                          </option>
                          <option value={ApplicationStatus.UNDER_REVIEW}>
                            {getStatusLabel(ApplicationStatus.UNDER_REVIEW)}
                          </option>
                          <option value={ApplicationStatus.ACCEPTED}>
                            {getStatusLabel(ApplicationStatus.ACCEPTED)}
                          </option>
                          <option value={ApplicationStatus.REJECTED}>
                            {getStatusLabel(ApplicationStatus.REJECTED)}
                          </option>
                          <option value={ApplicationStatus.WAITLIST}>
                            {getStatusLabel(ApplicationStatus.WAITLIST)}
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Комментарии рецензента
                        </label>
                        <textarea
                          value={reviewComments}
                          onChange={(e) => setReviewComments(e.target.value)}
                          rows={4}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Комментарии к решению..."
                        />
                      </div>

                      <button
                        onClick={handleStatusUpdate}
                        disabled={isLoading}
                        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Обновление...
                          </div>
                        ) : (
                          "Обновить статус"
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Назначение рецензента */}
                {canReviewApplications && user?.role !== UserRole.REVIEWER && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Назначить рецензента
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Рецензент
                        </label>
                        <select
                          value={selectedReviewer}
                          onChange={(e) => setSelectedReviewer(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Выберите рецензента</option>
                          {reviewers.map((reviewer) => (
                            <option key={reviewer.$id} value={reviewer.$id}>
                              {reviewer.name} (
                              {reviewer.organization || "Без организации"})
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={handleReviewerAssignment}
                        disabled={!selectedReviewer || isLoading}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
                      >
                        <UserCheck className="h-4 w-4 mr-2 inline" />
                        Назначить рецензента
                      </button>
                    </div>
                  </div>
                )}

                {/* Добавить комментарий */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Добавить комментарий
                  </h3>
                  <div className="space-y-4">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Ваш комментарий..."
                    />

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isInternal"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="isInternal"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Внутренний комментарий (только для организаторов)
                      </label>
                    </div>

                    <button
                      onClick={handleAddComment}
                      disabled={!commentText.trim() || isLoading}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="h-4 w-4 mr-2 inline" />
                      Добавить комментарий
                    </button>
                  </div>
                </div>

                {/* Информация о рецензенте */}
                {application.assignedReviewerId &&
                  "assignedReviewer" in application &&
                  application.assignedReviewer && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                        <UserCheck className="h-5 w-5 mr-2 text-green-600" />
                        Назначенный рецензент
                      </h3>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-900">
                          {application.assignedReviewer.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {application.assignedReviewer.organization ||
                            "Без организации"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {application.assignedReviewer.email}
                        </p>
                      </div>
                    </div>
                  )}

                {/* Существующие комментарии рецензента */}
                {application.reviewerComments && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2 text-yellow-600" />
                      Комментарии рецензента
                    </h3>
                    <div className="bg-white border border-yellow-200 rounded p-3">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {application.reviewerComments}
                      </p>
                      {application.reviewDate && (
                        <p className="text-xs text-gray-500 mt-2">
                          {formatLocalDateTime(application.reviewDate)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Участие и сертификаты */}
                {application.status === ApplicationStatus.ACCEPTED && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <Award className="h-5 w-5 mr-2 text-purple-600" />
                      Участие
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          Принял участие:
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            application.attended
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          {application.attended ? "Да" : "Нет"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          Сертификат выдан:
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            application.certificateIssued
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          {application.certificateIssued ? "Да" : "Нет"}
                        </span>
                      </div>
                      {application.certificateUrl && (
                        <div>
                          <a
                            href={application.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Просмотреть сертификат
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Закрыть
            </button>
            {canReviewApplications && (
              <button
                onClick={() => {
                  // TODO: Экспорт заявки в PDF
                  toast.info(
                    "Функция экспорта будет доступна в следующей версии"
                  );
                }}
                className="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 border border-transparent rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <FileText className="h-4 w-4 mr-2 inline" />
                Экспорт в PDF
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
