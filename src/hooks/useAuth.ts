// src/hooks/useAuth.ts - ПОЛНОСТЬЮ ЗАМЕНИТЬ ФАЙЛ

import { useAuthStore } from "@/store/authStore";
import {
  useCurrentUser,
  useLogin,
  useLogout,
  useRegister,
} from "@/services/authService";
import { useEffect, useCallback, useMemo } from "react";
import { UserRole, User } from "@/types";

interface AuthHookReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isActive: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    organization?: string,
    phone?: string
  ) => Promise<{ user: User; isFirstUser: boolean }>;
  clearError: () => void;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  isRegistering: boolean;
  isCheckingAuth: boolean;
  isSuper: boolean;
  isOrganizer: boolean;
  isReviewer: boolean;
  isParticipant: boolean;
  canManageUsers: boolean;
  canManageConferences: boolean;
  canReviewApplications: boolean;
  canViewAllApplications: boolean;
  canSubmitApplications: boolean;
}

const isValidUser = (user: any): user is User => {
  return (
    user !== null &&
    user !== undefined &&
    typeof user === "object" &&
    user.$id &&
    user.email &&
    user.role
  );
};

export function useAuth(): AuthHookReturn {
  const { user, setUser, clearUser } = useAuthStore();

  const {
    data: currentUser,
    isLoading: isCheckingAuth,
    error: authError,
  } = useCurrentUser();

  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const registerMutation = useRegister();

  // Синхронизация с React Query
  useEffect(() => {
    if (isValidUser(currentUser)) {
      if (JSON.stringify(currentUser) !== JSON.stringify(user)) {
        setUser(currentUser);
      }
    } else if (currentUser === null && user !== null) {
      clearUser();
    }
  }, [currentUser, setUser, clearUser, user]);

  // Проверяем права доступа на основе роли
  const permissions = useMemo(() => {
    if (!user || !user.isActive) {
      return {
        canManageUsers: false,
        canManageConferences: false,
        canReviewApplications: false,
        canViewAllApplications: false,
        canSubmitApplications: false,
      };
    }

    const isSuper = user.role === UserRole.SUPER_ADMIN;
    const isOrganizer = user.role === UserRole.ORGANIZER;
    const isReviewer = user.role === UserRole.REVIEWER;
    const isParticipant = user.role === UserRole.PARTICIPANT;

    return {
      canManageUsers: isSuper,
      canManageConferences: isSuper || isOrganizer,
      canReviewApplications: isSuper || isOrganizer || isReviewer,
      canViewAllApplications: isSuper || isOrganizer,
      canSubmitApplications: isSuper || isOrganizer || isParticipant,
    };
  }, [user]);

  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      try {
        const user = await loginMutation.mutateAsync({ email, password });
        setUser(user);
        return user;
      } catch (error: any) {
        clearUser();
        throw error;
      }
    },
    [loginMutation, setUser, clearUser]
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutMutation.mutateAsync();
      clearUser();

      if (typeof window !== "undefined") {
        localStorage.removeItem("auth-storage");
      }
    } catch (error: any) {
      clearUser();
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth-storage");
      }
      throw error;
    }
  }, [logoutMutation, clearUser]);

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      role: UserRole,
      organization?: string,
      phone?: string
    ): Promise<{ user: User; isFirstUser: boolean }> => {
      try {
        const result = await registerMutation.mutateAsync({
          name,
          email,
          password,
          role,
          organization,
          phone,
        });

        if (result.isFirstUser) {
          setUser(result.user);
        }

        return result;
      } catch (error: any) {
        throw error;
      }
    },
    [registerMutation, setUser]
  );

  const clearError = useCallback(() => {
    loginMutation.reset();
    logoutMutation.reset();
    registerMutation.reset();
  }, [loginMutation, logoutMutation, registerMutation]);

  // Вычисляемые свойства
  const isAuthenticated = !!user && isValidUser(user);
  const isActive = user?.isActive === true;
  const loading =
    isCheckingAuth ||
    loginMutation.isPending ||
    logoutMutation.isPending ||
    registerMutation.isPending;

  const error =
    authError?.message ||
    loginMutation.error?.message ||
    logoutMutation.error?.message ||
    registerMutation.error?.message ||
    null;

  // Проверки ролей
  const isSuper = user?.role === UserRole.SUPER_ADMIN;
  const isOrganizer = user?.role === UserRole.ORGANIZER;
  const isReviewer = user?.role === UserRole.REVIEWER;
  const isParticipant = user?.role === UserRole.PARTICIPANT;

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isActive,
    login,
    logout,
    register,
    clearError,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isRegistering: registerMutation.isPending,
    isCheckingAuth,
    isSuper,
    isOrganizer,
    isReviewer,
    isParticipant,
    ...permissions,
  };
}
