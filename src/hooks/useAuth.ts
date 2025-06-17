// src/hooks/useAuth.ts - РАСШИРЕННАЯ ВЕРСИЯ с проверками прав

import { useState, useEffect, useCallback, useMemo } from "react";
import { appwriteService } from "@/services/appwriteService";
import { User, UserRole } from "@/types";
import { toast } from "react-toastify";
import { updateAuthCookie } from "@/utils/cookieSync";
import {
  canManageUsers,
  canManageConferences,
  canSubmitApplications,
  canViewAllData,
  canCreateConferences,
  canManageSystem,
  getAvailableActions,
  canAccessRoute,
  getHomeRoute,
} from "@/utils/permissions";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthPermissions {
  canManageUsers: boolean;
  canManageConferences: boolean;
  canSubmitApplications: boolean;
  canViewAllData: boolean;
  canCreateConferences: boolean;
  canManageSystem: boolean;
  availableActions: string[];
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const setError = useCallback((error: string) => {
    setState((prev) => ({ ...prev, error, loading: false }));
  }, []);

  const setUser = useCallback((user: User | null) => {
    console.log("🔐 setUser вызван с пользователем:", user);
    setState((prev) => ({ ...prev, user, loading: false, error: null }));

    // Синхронизируем cookies для middleware
    updateAuthCookie(user);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  // Проверка текущей сессии при загрузке
  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        console.log("🔍 Проверка текущего пользователя...");
        setLoading(true);
        const currentUser = await appwriteService.getCurrentUser();

        if (currentUser) {
          console.log("✅ Найден текущий пользователь:", currentUser);
          const userDoc = await appwriteService.getUserById(currentUser.$id);
          if (userDoc) {
            console.log("📝 Данные пользователя из БД:", userDoc);
            setUser(userDoc);
          } else {
            console.log("❌ Пользователь не найден в БД, выход из системы");
            await appwriteService.logout();
            setUser(null);
          }
        } else {
          console.log("❌ Текущий пользователь не найден");
          setUser(null);
        }
      } catch (error) {
        console.error("❌ Ошибка при проверке пользователя:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkCurrentUser();
  }, []);

  // Функция входа
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        console.log("🚀 Начало процесса входа для:", email);
        setLoading(true);
        clearError();

        console.log("🔑 Создание сессии...");
        const session = await appwriteService.createSession(email, password);

        if (!session) {
          throw new Error("Неверный email или пароль");
        }
        console.log("✅ Сессия создана:", session);

        console.log("👤 Получение данных пользователя...");
        const authUser = await appwriteService.getCurrentUser();

        if (!authUser) {
          throw new Error("Не удалось получить данные пользователя");
        }
        console.log("✅ Данные пользователя получены:", authUser);

        console.log("📊 Получение профиля из БД...");
        const userDoc = await appwriteService.getUserById(authUser.$id);

        if (!userDoc) {
          console.log("❌ Профиль не найден в БД, выход");
          await appwriteService.logout();
          throw new Error("Профиль пользователя не найден");
        }
        console.log("✅ Профиль получен:", userDoc);

        if (!userDoc.isActive) {
          console.log("⚠️ Аккаунт не активирован, выход");
          await appwriteService.logout();
          throw new Error("Аккаунт не активирован администратором");
        }

        console.log(
          "🎉 Успешный вход! Роль:",
          userDoc.role,
          "Активен:",
          userDoc.isActive
        );
        setUser(userDoc);

        setTimeout(() => {
          console.log("🔍 Проверка состояния через 100мс:", state.user);
        }, 100);

        return userDoc;
      } catch (error: any) {
        console.error("❌ Ошибка при входе:", error);
        const message = error?.message || "Ошибка при входе";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [clearError, setLoading, setError, setUser, state.user]
  );

  // Функция регистрации
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

        const authUser = await appwriteService.createAccount(
          name,
          email,
          password
        );

        if (!authUser) {
          throw new Error("Не удалось создать аккаунт");
        }

        const userData: Omit<User, "$id" | "$updatedAt"> = {
          name,
          email,
          role,
          isActive: role === UserRole.SUPER_ADMIN,
          organization: organization || "",
          position: "",
          bio: "",
          phone: phone || "",
          orcid: "",
          website: "",
          $createdAt: new Date().toISOString(),
        };

        const userDoc = await appwriteService.createUserDocument(
          authUser.$id,
          userData
        );

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

  // Функция выхода
  const logout = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      await appwriteService.logout();
      setUser(null);
      toast.success("Вы успешно вышли из системы");
    } catch (error: any) {
      console.error("Ошибка при выходе:", error);
      setUser(null);
    } finally {
      setIsLoggingOut(false);
    }
  }, [setUser]);

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

  // Вычисляемые разрешения пользователя
  const permissions = useMemo((): AuthPermissions => {
    if (!state.user) {
      return {
        canManageUsers: false,
        canManageConferences: false,
        canSubmitApplications: false,
        canViewAllData: false,
        canCreateConferences: false,
        canManageSystem: false,
        availableActions: [],
      };
    }

    return {
      canManageUsers: canManageUsers(state.user.role),
      canManageConferences: canManageConferences(state.user.role),
      canSubmitApplications: canSubmitApplications(state.user.role),
      canViewAllData: canViewAllData(state.user.role),
      canCreateConferences: canCreateConferences(state.user.role),
      canManageSystem: canManageSystem(state.user.role),
      availableActions: getAvailableActions(state.user.role),
    };
  }, [state.user]);

  // Функция проверки доступа к маршруту
  const checkRouteAccess = useCallback(
    (route: string): boolean => {
      if (!state.user) return false;
      return canAccessRoute(state.user.role, route);
    },
    [state.user]
  );

  // Функция получения домашнего маршрута
  const getHomePath = useCallback((): string => {
    if (!state.user) return "/login";
    return getHomeRoute(state.user.role);
  }, [state.user]);

  // Функция проверки конкретного разрешения
  const hasPermission = useCallback(
    (action: string): boolean => {
      return permissions.availableActions.includes(action);
    },
    [permissions.availableActions]
  );

  // Функция проверки роли
  const hasRole = useCallback(
    (role: UserRole | UserRole[]): boolean => {
      if (!state.user) return false;

      if (Array.isArray(role)) {
        return role.includes(state.user.role);
      }

      return state.user.role === role;
    },
    [state.user]
  );

  // Функция проверки минимальной роли
  const hasMinimumRole = useCallback(
    (minimumRole: UserRole): boolean => {
      if (!state.user) return false;

      const rolePriorities = {
        [UserRole.PARTICIPANT]: 1,
        [UserRole.ORGANIZER]: 2,
        [UserRole.SUPER_ADMIN]: 3,
      };

      return rolePriorities[state.user.role] >= rolePriorities[minimumRole];
    },
    [state.user]
  );

  // Логирование изменений состояния
  useEffect(() => {
    console.log("🔄 Состояние useAuth изменилось:", {
      user: state.user,
      loading: state.loading,
      error: state.error,
      isAuthenticated: !!state.user,
      userRole: state.user?.role,
      userActive: state.user?.isActive,
      permissions,
    });
  }, [state, permissions]);

  return {
    // Основные данные
    user: state.user,
    loading: state.loading,
    error: state.error,
    isLoggingOut,

    // Функции
    register,
    login,
    logout,
    updateProfile,
    clearError,

    // Утилиты
    isAuthenticated: !!state.user,
    isLoading: state.loading,

    // Разрешения
    ...permissions,

    // Функции проверки
    checkRouteAccess,
    getHomePath,
    hasPermission,
    hasRole,
    hasMinimumRole,

    // Дополнительные удобные функции
    canManageUsers: permissions.canManageUsers,
    canManageRequests: permissions.canManageConferences, // Алиас для совместимости
    canCreateRequests: permissions.canSubmitApplications, // Алиас для совместимости
  };
}

// Хук для проверки конкретных разрешений
export function usePermissions(requiredPermissions: string | string[]) {
  const { hasPermission, user, loading } = useAuth();

  const permissions = useMemo(() => {
    if (loading || !user) {
      return {
        loading,
        hasAccess: false,
        missingPermissions: Array.isArray(requiredPermissions)
          ? requiredPermissions
          : [requiredPermissions],
      };
    }

    const permissionsArray = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];
    const missingPermissions = permissionsArray.filter(
      (permission) => !hasPermission(permission)
    );

    return {
      loading: false,
      hasAccess: missingPermissions.length === 0,
      missingPermissions,
    };
  }, [hasPermission, user, loading, requiredPermissions]);

  return permissions;
}

// Хук для проверки ролей
export function useRoleCheck(requiredRoles: UserRole | UserRole[]) {
  const { hasRole, user, loading } = useAuth();

  const roleCheck = useMemo(() => {
    if (loading || !user) {
      return {
        loading,
        hasAccess: false,
        userRole: null,
        requiredRoles: Array.isArray(requiredRoles)
          ? requiredRoles
          : [requiredRoles],
      };
    }

    return {
      loading: false,
      hasAccess: hasRole(requiredRoles),
      userRole: user.role,
      requiredRoles: Array.isArray(requiredRoles)
        ? requiredRoles
        : [requiredRoles],
    };
  }, [hasRole, user, loading, requiredRoles]);

  return roleCheck;
}
