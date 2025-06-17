// src/hooks/useUsers.ts - Хуки для работы с пользователями

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/services/userService";
import { User, UserRole } from "@/types";
import { toast } from "react-toastify";

// Ключи для React Query
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters?: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  stats: () => [...userKeys.all, "stats"] as const,
  inactive: () => [...userKeys.all, "inactive"] as const,
  byRole: (role: UserRole) => [...userKeys.all, "role", role] as const,
};

// Интерфейс для фильтров пользователей
export interface UserFilters {
  role?: UserRole | "";
  isActive?: boolean | "";
  searchTerm?: string;
}

// Хук для получения всех пользователей с фильтрацией
export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: async () => {
      // Если есть поисковый запрос, используем поиск
      if (filters?.searchTerm) {
        return await userApi.searchUsers(
          filters.searchTerm,
          filters.role && String(filters.role).trim() !== ""
            ? filters.role
            : undefined
        );
      }

      // Если фильтр по роли
      if (filters?.role && String(filters.role).trim() !== "") {
        return await userApi.getUsersByRole(filters.role);
      }

      // Если фильтр по активности
      if (filters?.isActive === false) {
        return await userApi.getInactiveUsers();
      }

      // Иначе получаем всех пользователей
      const allUsers = await userApi.getAllUsers();

      // Применяем фильтры на клиенте
      return allUsers.filter((user) => {
        if (
          filters?.isActive !== undefined &&
          filters.isActive !== "" &&
          user.isActive !== filters.isActive
        ) {
          return false;
        }
        return true;
      });
    },
    staleTime: 1000 * 60 * 5, // 5 минут
  });
}

// Хук для получения конкретного пользователя
export function useUser(userId: string) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => userApi.getUserById(userId),
    enabled: !!userId,
  });
}

// Хук для получения статистики пользователей
export function useUserStats() {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: () => userApi.getUserStats(),
    staleTime: 1000 * 60 * 10, // 10 минут
  });
}

// Хук для получения неактивных пользователей
export function useInactiveUsers() {
  return useQuery({
    queryKey: userKeys.inactive(),
    queryFn: () => userApi.getInactiveUsers(),
    staleTime: 1000 * 60 * 2, // 2 минуты
  });
}

// Хук для получения пользователей по роли
export function useUsersByRole(role: UserRole, activeOnly: boolean = false) {
  return useQuery({
    queryKey: userKeys.byRole(role),
    queryFn: () =>
      activeOnly
        ? userApi.getActiveUsersByRole(role)
        : userApi.getUsersByRole(role),
    staleTime: 1000 * 60 * 5, // 5 минут
  });
}

// Хук для активации пользователя
export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.activateUser,
    onSuccess: (updatedUser) => {
      // Обновляем кеш
      queryClient.setQueryData(userKeys.detail(updatedUser.$id), updatedUser);

      // Инвалидируем списки
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
      queryClient.invalidateQueries({ queryKey: userKeys.inactive() });

      toast.success(`Пользователь ${updatedUser.name} активирован`);
    },
    onError: (error: any) => {
      console.error("Ошибка активации пользователя:", error);
      toast.error(`Ошибка активации: ${error.message || "Неизвестная ошибка"}`);
    },
  });
}

// Хук для деактивации пользователя
export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.deactivateUser,
    onSuccess: (updatedUser) => {
      // Обновляем кеш
      queryClient.setQueryData(userKeys.detail(updatedUser.$id), updatedUser);

      // Инвалидируем списки
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
      queryClient.invalidateQueries({ queryKey: userKeys.inactive() });

      toast.success(`Пользователь ${updatedUser.name} заблокирован`);
    },
    onError: (error: any) => {
      console.error("Ошибка деактивации пользователя:", error);
      toast.error(
        `Ошибка блокировки: ${error.message || "Неизвестная ошибка"}`
      );
    },
  });
}

// Хук для обновления пользователя
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      userApi.updateUser(id, data),
    onSuccess: (updatedUser) => {
      // Обновляем кеш
      queryClient.setQueryData(userKeys.detail(updatedUser.$id), updatedUser);

      // Инвалидируем списки
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });

      toast.success(`Пользователь ${updatedUser.name} обновлен`);
    },
    onError: (error: any) => {
      console.error("Ошибка обновления пользователя:", error);
      toast.error(
        `Ошибка обновления: ${error.message || "Неизвестная ошибка"}`
      );
    },
  });
}

// Хук для удаления пользователя
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: (_, userId) => {
      // Удаляем из кеша
      queryClient.removeQueries({ queryKey: userKeys.detail(userId) });

      // Инвалидируем списки
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });

      toast.success("Пользователь удален");
    },
    onError: (error: any) => {
      console.error("Ошибка удаления пользователя:", error);
      toast.error(`Ошибка удаления: ${error.message || "Неизвестная ошибка"}`);
    },
  });
}

// Хук для массовой активации пользователей
export function useBulkActivateUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.bulkActivateUsers,
    onSuccess: (_, userIds) => {
      // Инвалидируем все связанные запросы
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
      queryClient.invalidateQueries({ queryKey: userKeys.inactive() });

      // Удаляем кеш конкретных пользователей чтобы они перезагрузились
      userIds.forEach((id) => {
        queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      });

      toast.success(`Активировано ${userIds.length} пользователей`);
    },
    onError: (error: any) => {
      console.error("Ошибка массовой активации:", error);
      toast.error(
        `Ошибка массовой активации: ${error.message || "Неизвестная ошибка"}`
      );
    },
  });
}

// Хук для массовой деактивации пользователей
export function useBulkDeactivateUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.bulkDeactivateUsers,
    onSuccess: (_, userIds) => {
      // Инвалидируем все связанные запросы
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
      queryClient.invalidateQueries({ queryKey: userKeys.inactive() });

      // Удаляем кеш конкретных пользователей чтобы они перезагрузились
      userIds.forEach((id) => {
        queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      });

      toast.success(`Заблокировано ${userIds.length} пользователей`);
    },
    onError: (error: any) => {
      console.error("Ошибка массовой деактивации:", error);
      toast.error(
        `Ошибка массовой блокировки: ${error.message || "Неизвестная ошибка"}`
      );
    },
  });
}

// Хук для проверки существования пользователя по email
export function useCheckUserExists(email: string) {
  return useQuery({
    queryKey: ["user-exists", email],
    queryFn: () => userApi.checkUserExists(email),
    enabled: !!email && email.length > 0,
    staleTime: 1000 * 60 * 5, // 5 минут
  });
}

// Комбинированный хук для управления пользователями
export function useUserManagement() {
  const activateUser = useActivateUser();
  const deactivateUser = useDeactivateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const bulkActivate = useBulkActivateUsers();
  const bulkDeactivate = useBulkDeactivateUsers();

  return {
    // Одиночные действия
    activateUser: activateUser.mutate,
    deactivateUser: deactivateUser.mutate,
    updateUser: updateUser.mutate,
    deleteUser: deleteUser.mutate,

    // Массовые действия
    bulkActivate: bulkActivate.mutate,
    bulkDeactivate: bulkDeactivate.mutate,

    // Состояния загрузки
    isActivating: activateUser.isPending,
    isDeactivating: deactivateUser.isPending,
    isUpdating: updateUser.isPending,
    isDeleting: deleteUser.isPending,
    isBulkActivating: bulkActivate.isPending,
    isBulkDeactivating: bulkDeactivate.isPending,

    // Общий статус загрузки
    isLoading:
      activateUser.isPending ||
      deactivateUser.isPending ||
      updateUser.isPending ||
      deleteUser.isPending ||
      bulkActivate.isPending ||
      bulkDeactivate.isPending,
  };
}
