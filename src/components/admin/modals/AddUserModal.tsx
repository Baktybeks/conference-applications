// src/components/admin/modals/AddUserModal.tsx
"use client";

import React, { useState } from "react";
import { useCreateUser } from "@/services/authService";
import { UserRole } from "@/types";
import { toast } from "react-toastify";
import {
  Mail,
  User,
  Lock,
  Building,
  Phone,
  Award,
  Globe,
  FileText,
  UserCheck,
  X,
} from "lucide-react";

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddUserModal({ open, onClose }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "098098098", // Можно генерировать или требовать смены при первом входе
    role: UserRole.PARTICIPANT,
    organization: "",
    phone: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { mutate: createUser, isPending } = useCreateUser();

  // Закрытие модального окна при нажатии Escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, onClose]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Имя обязательно";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email обязателен";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Некорректный формат email";
    }

    if (
      formData.role !== UserRole.PARTICIPANT &&
      !formData.organization.trim()
    ) {
      newErrors.organization = "Организация обязательна для данной роли";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.warning("Проверьте правильность заполнения формы");
      return;
    }

    try {
      await createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        organization: formData.organization,
        phone: formData.phone,
      });

      toast.success("Пользователь успешно создан");

      // Сброс формы
      setFormData({
        name: "",
        email: "",
        password: "defaultPassword",
        role: UserRole.PARTICIPANT,
        organization: "",
        phone: "",
      });
      setErrors({});

      onClose();
    } catch (error: any) {
      toast.error(`Ошибка при создании пользователя: ${error.message}`);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />

      {/* Modal */}
      <div
        className="relative z-10 bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Добавить нового пользователя
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Имя */}
              <div>
                <label className="block text-sm font-medium mb-2">Имя *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                      errors.name ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Полное имя"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="user@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Роль */}
              <div>
                <label className="block text-sm font-medium mb-2">Роль *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                >
                  <option value={UserRole.PARTICIPANT}>Участник</option>
                  <option value={UserRole.ORGANIZER}>Организатор</option>
                  <option value={UserRole.SUPER_ADMIN}>Администратор</option>
                </select>
              </div>

              {/* Телефон */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Телефон
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
              </div>

              {/* Организация */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Организация {formData.role !== UserRole.PARTICIPANT && "*"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                      errors.organization ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Университет или компания"
                  />
                </div>
                {errors.organization && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.organization}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? "Создание..." : "Создать пользователя"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
