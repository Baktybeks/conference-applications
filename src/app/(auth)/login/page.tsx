// src/app/(auth)/login/page.tsx

"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/common/Layout";
import { toast } from "react-toastify";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Info,
  Calendar,
  Users,
  UserCheck,
  User,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
} from "lucide-react";
import { UserRole } from "@/types";

// Компонент для обработки URL параметров
function LoginNotifications() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const registered = searchParams.get("registered");
    const activated = searchParams.get("activated");
    const activation = searchParams.get("activation");

    if (registered === "true") {
      if (activated === "true") {
        // Супер-администратор - автоактивирован
        toast.success(
          "🎉 Регистрация завершена! Аккаунт активирован, можете войти в систему.",
          {
            position: "top-center",
            autoClose: 6000,
          }
        );
      } else if (activation === "pending") {
        // Обычный пользователь - ожидает активации
        toast.info(
          "⏳ Регистрация завершена! Ваш аккаунт ожидает активации администратором.",
          {
            position: "top-center",
            autoClose: 8000,
          }
        );
      } else {
        // Общее сообщение о регистрации
        toast.success("✅ Регистрация завершена успешно!", {
          position: "top-center",
          autoClose: 5000,
        });
      }
    }
  }, [searchParams]);

  return null;
}

// Основной компонент логина
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, error, clearError, loading, user } = useAuth();
  const router = useRouter();

  // Перенаправление после успешного входа
  useEffect(() => {
    if (user && user.isActive) {
      console.log(
        user,
        "user+++++++++++++++++++++++++++++++++++++++++++++++++++++++"
      );

      toast.success(`Добро пожаловать, ${user.name}!`, {
        position: "top-right",
        autoClose: 3000,
      });
      redirectByRole(user.role);
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    clearError();
    setIsSubmitting(true);

    try {
      await login(email, password);
      // Перенаправление теперь будет происходить в useEffect
    } catch (error: any) {
      const message = error?.message || "Ошибка при входе";

      // Показываем специфичные сообщения в блоке ошибок формы
      if (
        message.includes("не активирован") ||
        message.includes("not activated")
      ) {
        setErrorMessage(
          "⚠️ Ваш аккаунт еще не активирован администратором. Попробуйте позже или обратитесь к администратору."
        );
      } else if (message.includes("Неверный") || message.includes("Invalid")) {
        setErrorMessage(
          "❌ Неверный email или пароль. Проверьте правильность введенных данных."
        );
      } else if (
        message.includes("заблокирован") ||
        message.includes("blocked")
      ) {
        setErrorMessage(
          "🚫 Ваш аккаунт заблокирован. Обратитесь к администратору системы."
        );
      } else if (
        message.includes("не найден") ||
        message.includes("not found")
      ) {
        setErrorMessage(
          "📧 Пользователь с таким email не найден. Проверьте email или зарегистрируйтесь."
        );
      } else {
        setErrorMessage(`Ошибка входа: ${message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Функция перенаправления на основе роли пользователя
  const redirectByRole = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        console.log(
          "SUPER_ADMINSUPER_ADMINSUPER_ADMINSUPER_ADMINSUPER_ADMINSUPER_ADMINSUPER_ADMINSUPER_ADMINSUPER_ADMIN"
        );

        router.push("/admin");
        break;
      case UserRole.ORGANIZER:
        router.push("/organizer");
        break;
      case UserRole.REVIEWER:
        router.push("/reviewer");
        break;
      case UserRole.PARTICIPANT:
        router.push("/participant");
        break;
      default:
        router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Вход в систему
          </h1>
          <p className="text-gray-600">Система управления конференциями</p>
        </div>

        {/* Форма входа */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Сообщение об ошибке */}
            {(error || errorMessage) && (
              <div
                className={`p-4 border rounded-lg ${
                  (errorMessage || error)?.includes("не активирован") ||
                  (errorMessage || error)?.includes("not activated")
                    ? "text-amber-700 bg-amber-50 border-amber-200"
                    : (errorMessage || error)?.includes("заблокирован") ||
                      (errorMessage || error)?.includes("blocked")
                    ? "text-red-700 bg-red-50 border-red-200"
                    : (errorMessage || error)?.includes("не найден") ||
                      (errorMessage || error)?.includes("not found")
                    ? "text-blue-700 bg-blue-50 border-blue-200"
                    : "text-red-700 bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  {(errorMessage || error)?.includes("не активирован") ||
                  (errorMessage || error)?.includes("not activated") ? (
                    <Clock className="h-4 w-4 flex-shrink-0" />
                  ) : (errorMessage || error)?.includes("заблокирован") ||
                    (errorMessage || error)?.includes("blocked") ? (
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  ) : (errorMessage || error)?.includes("не найден") ||
                    (errorMessage || error)?.includes("not found") ? (
                    <Info className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span className="text-sm">{errorMessage || error}</span>
                </div>
              </div>
            )}

            {/* Email поле */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email адрес
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="participant@university.edu"
                />
              </div>
            </div>

            {/* Пароль поле */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Пароль
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Введите ваш пароль"
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
            </div>

            {/* Кнопка входа */}
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading || isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Вход...
                </div>
              ) : (
                <div className="flex items-center">
                  Войти
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              )}
            </button>

            {/* Разделитель */}
            <div className="text-center">
              <span className="text-sm text-gray-500">
                Нет аккаунта?{" "}
                <Link
                  href="/register"
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  Зарегистрироваться
                </Link>
              </span>
            </div>
          </form>
        </div>

        {/* Информация о ролях системы */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-4 text-center">
            Роли в системе конференций:
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
              <div>
                <div className="font-medium text-gray-900">Супер админ</div>
                <div className="text-gray-500">Полный доступ к системе</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
              <div>
                <div className="font-medium text-gray-900">Организатор</div>
                <div className="text-gray-500">Управление конференциями</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
              <div>
                <div className="font-medium text-gray-900">Рецензент</div>
                <div className="text-gray-500">Оценка заявок</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0"></div>
              <div>
                <div className="font-medium text-gray-900">Участник</div>
                <div className="text-gray-500">Подача заявок</div>
              </div>
            </div>
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Если ваш аккаунт не активирован, обратитесь к администратору системы
          </p>
        </div>
      </div>
    </div>
  );
}

// Fallback компонент для загрузки
function LoginPageFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Вход в систему
          </h1>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Layout title="Вход в систему">
      <Suspense fallback={<LoginPageFallback />}>
        <LoginNotifications />
        <LoginForm />
      </Suspense>
    </Layout>
  );
}
