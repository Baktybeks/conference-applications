// src/components/applications/CreateApplicationModal.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ

"use client";

import React, { useState } from "react";
import { ApplicationForm } from "./ApplicationForm";
import { useAuth } from "@/hooks/useAuth";
import {
  useCreateApplication,
  // ИСПРАВЛЕНИЕ: Убираем импорт CreateApplicationData
} from "@/services/applicationService";
import {
  Conference,
  PresentationType,
  CreateApplicationDto, // ДОБАВЛЕНО: правильный тип из @/types
} from "@/types";
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

interface CreateApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  conference: Conference;
  onSuccess?: () => void;
}

export function CreateApplicationModal({
  isOpen,
  onClose,
  conference,
  onSuccess,
}: CreateApplicationModalProps) {
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Заголовок модального окна */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Подача заявки на участие
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Содержимое */}
        <div className="p-6">
          {user ? (
            <ApplicationForm
              conference={conference}
              mode="create"
              onSuccess={handleSuccess}
              onCancel={onClose}
            />
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Необходима авторизация
              </h3>
              <p className="text-gray-600">
                Для подачи заявки необходимо войти в систему
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
