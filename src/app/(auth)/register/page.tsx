// src/app/(auth)/register/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types";
import { toast } from "react-toastify";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Users,
  UserCheck,
  User,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Building,
  Phone,
  Globe,
  FileText,
  Award,
  UserPlus,
} from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: UserRole.PARTICIPANT,
    organization: "",
    position: "",
    phone: "",
    bio: "",
    orcid: "",
    website: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredRole, setRegisteredRole] = useState<UserRole | null>(null);

  const { register, error, clearError, loading } = useAuth();
  const router = useRouter();

  // Проверяем, есть ли администраторы в системе
  useEffect(() => {
    const checkFirstUser = async () => {
      try {
        const response = await fetch("/api/check-admins");
        const data = await response.json();
        setIsFirstUser(data.isFirstUser);

        // Если первый пользователь, сразу устанавливаем роль SUPER_ADMIN
        if (data.isFirstUser) {
          setFormData((prev) => ({ ...prev, role: UserRole.SUPER_ADMIN }));
        }
      } catch (error) {
        console.error("Ошибка при проверке администраторов:", error);
      }
    };

    checkFirstUser();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Валидация имени
    if (!formData.name.trim()) {
      newErrors.name = "Имя обязательно";
    } else if (formData.name.length < 2) {
      newErrors.name = "Имя должно содержать минимум 2 символа";
    }

    // Валидация email
    if (!formData.email.trim()) {
      newErrors.email = "Email обязателен";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Некорректный формат email";
    }

    // Валидация пароля
    if (!formData.password) {
      newErrors.password = "Пароль обязателен";
    } else if (formData.password.length < 8) {
      newErrors.password = "Пароль должен содержать минимум 8 символов";
    }

    // Валидация подтверждения пароля
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают";
    }

    // Валидация организации для не-участников
    if (
      formData.role !== UserRole.PARTICIPANT &&
      !formData.organization.trim()
    ) {
      newErrors.organization = "Организация обязательна для данной роли";
    }

    // Валидация ORCID если указан
    if (
      formData.orcid &&
      !/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(formData.orcid)
    ) {
      newErrors.orcid = "Некорректный формат ORCID (0000-0000-0000-0000)";
    }

    // Валидация website если указан
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website =
        "Некорректный формат веб-сайта (должен начинаться с http:// или https://)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Очищаем ошибку для поля при изменении
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    clearError();

    if (!validateForm()) {
      toast.warning("⚠️ Проверьте правильность заполнения формы");
      return;
    }

    try {
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        organization: formData.organization || undefined,
        position: formData.position || undefined,
        phone: formData.phone || undefined,
        bio: formData.bio || undefined,
        orcid: formData.orcid || undefined,
        website: formData.website || undefined,
      };

      await register(
        registrationData.name,
        registrationData.email,
        registrationData.password,
        registrationData.role,
        registrationData.organization,
        registrationData.phone
      );

      // Устанавливаем состояние успешной регистрации
      setRegistrationSuccess(true);
      setRegisteredRole(formData.role);

      // Показываем соответствующее уведомление
      if (isFirstUser || formData.role === UserRole.SUPER_ADMIN) {
        toast.success("🎉 Регистрация завершена! Вы можете войти в систему.", {
          position: "top-center",
          autoClose: 5000,
        });

        // Перенаправляем на страницу входа через 3 секунды
        setTimeout(() => {
          router.push("/login?registered=true&activated=true");
        }, 3000);
      } else {
        toast.info("✅ Регистрация завершена! Ожидайте активации аккаунта.", {
          position: "top-center",
          autoClose: 7000,
        });

        // Перенаправляем на страницу входа через 5 секунд
        setTimeout(() => {
          router.push("/login?registered=true&activation=pending");
        }, 5000);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ошибка при регистрации";

      if (
        message.includes("уже существует") ||
        message.includes("already exists")
      ) {
        setErrors({ email: "Пользователь с таким email уже зарегистрирован" });
      } else {
        toast.error(`❌ Ошибка регистрации: ${message}`);
      }
    }
  };

  // Если регистрация прошла успешно, показываем сообщение
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
            {isFirstUser || registeredRole === UserRole.SUPER_ADMIN ? (
              // Сообщение для супер-администратора (автоактивация)
              <>
                <div className="flex justify-center mb-6">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Добро пожаловать!
                </h1>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Ваш аккаунт супер-администратора успешно создан и
                    автоматически активирован.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-sm text-green-800 space-y-1">
                      <div>
                        <strong>Имя:</strong> {formData.name}
                      </div>
                      <div>
                        <strong>Email:</strong> {formData.email}
                      </div>
                      <div>
                        <strong>Роль:</strong> Супер администратор
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Перенаправление на страницу входа...
                  </p>
                </div>
              </>
            ) : (
              // Сообщение для обычных пользователей (нужна активация)
              <>
                <div className="flex justify-center mb-6">
                  <Clock className="h-16 w-16 text-amber-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Регистрация завершена!
                </h1>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Ваш аккаунт успешно создан, но требует активации
                    администратором или организатором.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-800">
                        Что дальше?
                      </span>
                    </div>
                    <ul className="text-sm text-amber-700 space-y-1 text-left">
                      <li>
                        • Администратор получит уведомление о вашей регистрации
                      </li>
                      <li>• После активации вы получите доступ к системе</li>
                      <li>• Попробуйте войти через несколько минут</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>
                        <strong>Имя:</strong> {formData.name}
                      </div>
                      <div>
                        <strong>Email:</strong> {formData.email}
                      </div>
                      <div>
                        <strong>Роль:</strong>{" "}
                        {getRoleDisplayName(registeredRole!)}
                      </div>
                      {formData.organization && (
                        <div>
                          <strong>Организация:</strong> {formData.organization}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Перенаправление на страницу входа...
                  </p>
                </div>
              </>
            )}

            <div className="pt-6">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Перейти ко входу
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Регистрация в системе
          </h1>
          <p className="text-gray-600">
            Создайте аккаунт для участия в конференциях
          </p>
        </div>

        {/* Предупреждение о первом пользователе */}
        {isFirstUser && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                <strong>Важно:</strong> Вы будете зарегистрированы как
                супер-администратор и автоматически активированы (первый
                пользователь системы).
              </p>
            </div>
          </div>
        )}

        {/* Предупреждение об активации */}
        {!isFirstUser && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                <strong>Важно:</strong> После регистрации ваш аккаунт должен
                быть активирован администратором перед первым входом в систему.
              </p>
            </div>
          </div>
        )}

        {/* Форма регистрации */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Общая ошибка */}
            {error && (
              <div className="p-4 text-red-700 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            {/* Основная информация */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-indigo-600" />
                Основная информация
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Полное имя */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Полное имя *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.name
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-300 focus:border-indigo-500"
                    }`}
                    placeholder="Иванов Иван Иванович"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email адрес *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.email
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-300 focus:border-indigo-500"
                      }`}
                      placeholder="participant@university.edu"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Телефон */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Телефон
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>
                </div>

                {/* Пароль */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Пароль *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-10 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.password
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-300 focus:border-indigo-500"
                      }`}
                      placeholder="Минимум 8 символов"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Подтверждение пароля */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Подтверждение пароля *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-10 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.confirmPassword
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-300 focus:border-indigo-500"
                      }`}
                      placeholder="Повторите пароль"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Роль в системе */}
            {!isFirstUser && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <UserCheck className="h-5 w-5 mr-2 text-indigo-600" />
                  Роль в системе
                </h3>

                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Выберите роль
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={UserRole.PARTICIPANT}>
                      Участник (подача заявок на конференции)
                    </option>
                    <option value={UserRole.ORGANIZER}>
                      Организатор (создание и управление конференциями)
                    </option>
                    <option value={UserRole.REVIEWER}>
                      Рецензент (оценка заявок участников)
                    </option>
                  </select>
                  <div className="mt-2">
                    <RoleDescription role={formData.role} />
                  </div>
                </div>
              </div>
            )}

            {/* Профессиональная информация */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Building className="h-5 w-5 mr-2 text-indigo-600" />
                Профессиональная информация
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Организация */}
                <div>
                  <label
                    htmlFor="organization"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Организация {formData.role !== UserRole.PARTICIPANT && "*"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="organization"
                      name="organization"
                      type="text"
                      value={formData.organization}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.organization
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-300 focus:border-indigo-500"
                      }`}
                      placeholder="Университет, институт, компания"
                    />
                  </div>
                  {errors.organization && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.organization}
                    </p>
                  )}
                </div>

                {/* Должность */}
                <div>
                  <label
                    htmlFor="position"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Должность
                  </label>
                  <input
                    id="position"
                    name="position"
                    type="text"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Профессор, исследователь, студент"
                  />
                </div>

                {/* ORCID */}
                <div>
                  <label
                    htmlFor="orcid"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    ORCID ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Award className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="orcid"
                      name="orcid"
                      type="text"
                      value={formData.orcid}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.orcid
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-300 focus:border-indigo-500"
                      }`}
                      placeholder="0000-0000-0000-0000"
                    />
                  </div>
                  {errors.orcid && (
                    <p className="mt-1 text-sm text-red-600">{errors.orcid}</p>
                  )}
                </div>

                {/* Веб-сайт */}
                <div>
                  <label
                    htmlFor="website"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Веб-сайт
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.website
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-300 focus:border-indigo-500"
                      }`}
                      placeholder="https://example.com"
                    />
                  </div>
                  {errors.website && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.website}
                    </p>
                  )}
                </div>
              </div>

              {/* Биография */}
              <div className="mt-4">
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Краткая биография
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Расскажите о себе, области исследований, интересах..."
                />
              </div>
            </div>

            {/* Кнопка регистрации */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Регистрация...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Зарегистрироваться
                  </div>
                )}
              </button>
            </div>

            {/* Ссылка на вход */}
            <div className="text-center">
              <span className="text-sm text-gray-500">
                Уже есть аккаунт?{" "}
                <Link
                  href="/login"
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  Войти
                </Link>
              </span>
            </div>
          </form>
        </div>

        {/* Информация о системе */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-4 text-center">
            О системе управления конференциями
          </h3>
          <div className="text-xs text-gray-600 space-y-2">
            <p>
              • <strong>Участники</strong> могут подавать заявки на участие в
              конференциях, отслеживать статус своих заявок и получать
              сертификаты
            </p>
            <p>
              • <strong>Организаторы</strong> создают и управляют конференциями,
              модерируют заявки участников
            </p>
            <p>
              • <strong>Рецензенты</strong> оценивают научные заявки и
              предоставляют экспертные отзывы
            </p>
            <p>
              • <strong>Администраторы</strong> управляют всей системой и
              активируют новых пользователей
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент описания роли
function RoleDescription({ role }: { role: UserRole }) {
  const descriptions = {
    [UserRole.PARTICIPANT]: {
      text: "Может подавать заявки на участие в конференциях, отслеживать их статус, получать сертификаты участия",
      icon: User,
      color: "text-purple-600",
    },
    [UserRole.ORGANIZER]: {
      text: "Создаёт и управляет конференциями, модерирует заявки участников, формирует программу мероприятий",
      icon: Calendar,
      color: "text-blue-600",
    },
    [UserRole.REVIEWER]: {
      text: "Рецензирует научные заявки участников, предоставляет экспертные отзывы и рекомендации",
      icon: UserCheck,
      color: "text-green-600",
    },
    [UserRole.SUPER_ADMIN]: {
      text: "Полный доступ ко всем функциям системы, управление пользователями и конференциями",
      icon: Users,
      color: "text-red-600",
    },
  };

  const config = descriptions[role];
  const Icon = config.icon;

  return (
    <div className={`flex items-start gap-2 text-xs ${config.color}`}>
      <Icon className="h-3 w-3 mt-0.5 flex-shrink-0" />
      <span>{config.text}</span>
    </div>
  );
}

// Функция для отображения названий ролей
function getRoleDisplayName(role: UserRole): string {
  const names = {
    [UserRole.PARTICIPANT]: "Участник",
    [UserRole.ORGANIZER]: "Организатор",
    [UserRole.REVIEWER]: "Рецензент",
    [UserRole.SUPER_ADMIN]: "Супер администратор",
  };
  return names[role];
}
