// src/hooks/useAuth.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ

import { useState, useEffect, useCallback } from "react";
import { appwriteService } from "@/services/appwriteService";
import { User, UserRole } from "@/types";
import { toast } from "react-toastify";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const setError = useCallback((error: string) => {
    setState((prev) => ({ ...prev, error, loading: false }));
  }, []);

  const setUser = useCallback((user: User | null) => {
    setState((prev) => ({ ...prev, user, loading: false, error: null }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  // Проверка текущей сессии при загрузке
  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        setLoading(true);
        const currentUser = await appwriteService.getCurrentUser();

        if (currentUser) {
          // Получаем полную информацию о пользователе из базы данных
          const userDoc = await appwriteService.getUserById(currentUser.$id);
          if (userDoc) {
            setUser(userDoc);
          } else {
            // Пользователь есть в системе аутентификации, но нет в базе данных
            await appwriteService.logout();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Ошибка при проверке пользователя:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkCurrentUser();
  }, []);

  // ИСПРАВЛЕННАЯ функция регистрации
  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      role: UserRole,
      organization?: string,
      phone?: string
    ) => {
      try {
        setLoading(true);
        clearError();

        // Создаем аккаунт в Appwrite Auth
        const authUser = await appwriteService.createAccount(
          name,
          email,
          password
        );

        if (!authUser) {
          throw new Error("Не удалось создать аккаунт");
        }

        // ИСПРАВЛЕНИЕ: Добавляем поле createdAt при создании документа пользователя
        const userData: Omit<User, "$id" | "$createdAt" | "$updatedAt"> = {
          name,
          email,
          role,
          isActive: role === UserRole.SUPER_ADMIN, // Супер-админ активируется автоматически
          organization: organization || "",
          position: "",
          bio: "",
          phone: phone || "",
          orcid: "",
          website: "",
          createdAt: new Date().toISOString(), // ИСПРАВЛЕНИЕ: Явно указываем createdAt
        };

        // Создаем документ пользователя в базе данных
        const userDoc = await appwriteService.createUserDocument(
          authUser.$id,
          userData
        );

        // Выход из системы для обычных пользователей (они должны быть активированы)
        if (role !== UserRole.SUPER_ADMIN) {
          await appwriteService.logout();
        }

        return userDoc;
      } catch (error: any) {
        const message = error?.message || "Ошибка при регистрации";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [clearError, setLoading, setError]
  );

  // ИСПРАВЛЕННАЯ функция входа
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        clearError();

        // Авторизация в Appwrite
        const session = await appwriteService.createSession(email, password);

        if (!session) {
          throw new Error("Неверный email или пароль");
        }

        // Получаем текущего пользователя
        const authUser = await appwriteService.getCurrentUser();

        if (!authUser) {
          throw new Error("Не удалось получить данные пользователя");
        }

        // Получаем документ пользователя из базы данных
        const userDoc = await appwriteService.getUserById(authUser.$id);

        if (!userDoc) {
          await appwriteService.logout();
          throw new Error("Профиль пользователя не найден");
        }

        // Проверяем, активирован ли аккаунт
        if (!userDoc.isActive) {
          await appwriteService.logout();
          throw new Error("Аккаунт не активирован администратором");
        }

        setUser(userDoc);
        return userDoc;
      } catch (error: any) {
        const message = error?.message || "Ошибка при входе";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [clearError, setLoading, setError, setUser]
  );

  // Функция выхода
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await appwriteService.logout();
      setUser(null);
      toast.success("Вы успешно вышли из системы");
    } catch (error: any) {
      console.error("Ошибка при выходе:", error);
      // Даже если есть ошибка, очищаем локальное состояние
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setUser]);

  // Функция обновления профиля
  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      if (!state.user) {
        throw new Error("Пользователь не авторизован");
      }

      try {
        setLoading(true);

        const updatedUser = await appwriteService.updateUserDocument(
          state.user.$id,
          updates
        );

        if (updatedUser) {
          setUser(updatedUser);
          toast.success("Профиль успешно обновлен");
          return updatedUser;
        } else {
          throw new Error("Не удалось обновить профиль");
        }
      } catch (error: any) {
        const message = error?.message || "Ошибка при обновлении профиля";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [state.user, setLoading, setUser, setError]
  );

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    register,
    login,
    logout,
    updateProfile,
    clearError,
    isAuthenticated: !!state.user,
    isLoading: state.loading,
  };
}
