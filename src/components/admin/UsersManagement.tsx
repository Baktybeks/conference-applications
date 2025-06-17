// src/components/admin/UsersManagement.tsx - ПОЛНЫЙ КОМПОНЕНТ управления пользователями

"use client";

import React, { useState, useMemo, useCallback } from "react";
import { User, UserRole } from "@/types";
import { getRoleLabel, getRoleColor } from "@/utils/permissions";
import {
  useUsers,
  useUserStats,
  useUserManagement,
  UserFilters,
} from "@/hooks/useUsers";

// UI компоненты
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

// Иконки
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Eye,
  Mail,
  Calendar,
  Building,
  Shield,
  MoreHorizontal,
  Check,
  X,
  Plus,
  Download,
  RefreshCw,
} from "lucide-react";

export function UsersManagement() {
  // Состояние фильтров и поиска
  const [filters, setFilters] = useState<UserFilters>({
    role: "",
    isActive: "",
    searchTerm: "",
  });

  // Состояние выбранных пользователей для массовых действий
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Состояние модальных окон
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isBulkActionConfirmOpen, setIsBulkActionConfirmOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<
    "activate" | "deactivate" | null
  >(null);

  // Хуки
  const { data: users = [], isLoading, error, refetch } = useUsers(filters);
  const { data: stats } = useUserStats();
  const userManagement = useUserManagement();

  // Опции для фильтров
  const roleOptions = [
    { value: "", label: "Все роли" },
    { value: UserRole.SUPER_ADMIN, label: "Супер администратор" },
    { value: UserRole.ORGANIZER, label: "Организатор" },
    { value: UserRole.REVIEWER, label: "Рецензент" },
    { value: UserRole.PARTICIPANT, label: "Участник" },
  ];

  const statusOptions = [
    { value: "", label: "Все статусы" },
    { value: "true", label: "Активные" },
    { value: "false", label: "Заблокированные" },
  ];

  // Обработчики фильтров
  const handleFilterChange = useCallback(
    (key: keyof UserFilters, value: any) => {
      setFilters((prev) => ({
        ...prev,
        [key]:
          value === ""
            ? undefined
            : key === "isActive"
            ? value === "true"
            : value,
      }));
      setSelectedUsers([]); // Сбрасываем выбор при изменении фильтров
    },
    []
  );

  const handleSearchChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: value }));
    setSelectedUsers([]);
  }, []);

  // Обработчики выбора пользователей
  const handleSelectUser = useCallback((userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.$id));
    }
  }, [selectedUsers.length, users]);

  // Обработчики действий с пользователями
  const handleUserClick = useCallback((user: User) => {
    setSelectedUser(user);
    setIsUserDetailsOpen(true);
  }, []);

  const handleActivateUser = useCallback(
    (userId: string) => {
      userManagement.activateUser(userId);
    },
    [userManagement]
  );

  const handleDeactivateUser = useCallback(
    (userId: string) => {
      userManagement.deactivateUser(userId);
    },
    [userManagement]
  );

  // Обработчики массовых действий
  const handleBulkAction = useCallback((action: "activate" | "deactivate") => {
    setBulkAction(action);
    setIsBulkActionConfirmOpen(true);
  }, []);

  const confirmBulkAction = useCallback(() => {
    if (bulkAction === "activate") {
      userManagement.bulkActivate(selectedUsers);
    } else if (bulkAction === "deactivate") {
      userManagement.bulkDeactivate(selectedUsers);
    }
    setSelectedUsers([]);
    setIsBulkActionConfirmOpen(false);
    setBulkAction(null);
  }, [bulkAction, selectedUsers, userManagement]);

  // Фильтрованная статистика
  const filteredStats = useMemo(() => {
    if (!users.length) return { total: 0, active: 0, inactive: 0 };

    const active = users.filter((u) => u.isActive).length;
    return {
      total: users.length,
      active,
      inactive: users.length - active,
    };
  }, [users]);

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          Ошибка загрузки пользователей: {error.message}
        </div>
        <Button onClick={() => refetch()} icon={RefreshCw}>
          Повторить
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и статистика */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Управление пользователями
          </h2>
          <p className="text-gray-600 mt-1">
            Активация, блокировка и управление пользователями системы
          </p>
        </div>

        {/* Быстрая статистика */}
        <div className="flex space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {filteredStats.total}
            </div>
            <div className="text-sm text-gray-600">Всего</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredStats.active}
            </div>
            <div className="text-sm text-gray-600">Активные</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {filteredStats.inactive}
            </div>
            <div className="text-sm text-gray-600">Заблокированные</div>
          </div>
        </div>
      </div>

      {/* Фильтры и поиск */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Поиск */}
          <Input
            placeholder="Поиск по имени или email..."
            value={filters.searchTerm || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
            icon={Search}
            iconPosition="left"
          />

          {/* Фильтр по роли */}
          <Select
            placeholder="Выберите роль"
            value={filters.role || ""}
            onChange={(e) => handleFilterChange("role", e.target.value)}
            options={roleOptions}
          />

          {/* Фильтр по статусу */}
          <Select
            placeholder="Выберите статус"
            value={filters.isActive?.toString() || ""}
            onChange={(e) => handleFilterChange("isActive", e.target.value)}
            options={statusOptions}
          />

          {/* Кнопка сброса фильтров */}
          <Button
            variant="outline"
            onClick={() => {
              setFilters({ role: "", isActive: "", searchTerm: "" });
              setSelectedUsers([]);
            }}
            icon={X}
          >
            Сбросить
          </Button>
        </div>

        {/* Массовые действия */}
        {selectedUsers.length > 0 && (
          <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-indigo-900">
                Выбрано {selectedUsers.length} пользователей
              </span>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => handleBulkAction("activate")}
                  loading={userManagement.isBulkActivating}
                  icon={UserCheck}
                >
                  Активировать
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleBulkAction("deactivate")}
                  loading={userManagement.isBulkDeactivating}
                  icon={UserX}
                >
                  Заблокировать
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Таблица пользователей */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={
                    users.length > 0 && selectedUsers.length === users.length
                  }
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </TableHead>
              <TableHead sortable>Пользователь</TableHead>
              <TableHead sortable>Роль</TableHead>
              <TableHead sortable>Статус</TableHead>
              <TableHead sortable>Дата регистрации</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-400 mr-2" />
                    Загрузка пользователей...
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-gray-500">
                    {filters.searchTerm ||
                    filters.role ||
                    filters.isActive !== undefined
                      ? "Пользователи не найдены по заданным критериям"
                      : "Пользователи не найдены"}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.$id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.$id)}
                      onChange={() => handleSelectUser(user.$id)}
                      className="rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell>
                    <div
                      className="flex items-center cursor-pointer hover:text-indigo-600"
                      onClick={() => handleUserClick(user)}
                    >
                      <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-gray-600">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getRoleColor(user.role)}
                    >
                      {getRoleLabel(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "success" : "error"} dot>
                      {user.isActive ? "Активен" : "Заблокирован"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(user.$createdAt).toLocaleDateString("ru-RU")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUserClick(user)}
                        icon={Eye}
                      >
                        Просмотр
                      </Button>
                      {user.isActive ? (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeactivateUser(user.$id)}
                          loading={userManagement.isDeactivating}
                          icon={UserX}
                        >
                          Заблокировать
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleActivateUser(user.$id)}
                          loading={userManagement.isActivating}
                          icon={UserCheck}
                        >
                          Активировать
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Модальное окно деталей пользователя */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={isUserDetailsOpen}
        onClose={() => {
          setIsUserDetailsOpen(false);
          setSelectedUser(null);
        }}
        onActivate={handleActivateUser}
        onDeactivate={handleDeactivateUser}
        isLoading={userManagement.isLoading}
      />

      {/* Модальное окно подтверждения массовых действий */}
      <Modal
        isOpen={isBulkActionConfirmOpen}
        onClose={() => setIsBulkActionConfirmOpen(false)}
        title="Подтверждение действия"
        size="md"
      >
        <div className="text-gray-900">
          <p className="mb-4">
            Вы уверены, что хотите{" "}
            {bulkAction === "activate" ? "активировать" : "заблокировать"}{" "}
            <strong>{selectedUsers.length}</strong> пользователей?
          </p>
          <p className="text-sm text-gray-600">
            Это действие затронет всех выбранных пользователей.
          </p>
        </div>

        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setIsBulkActionConfirmOpen(false)}
          >
            Отмена
          </Button>
          <Button
            variant={bulkAction === "activate" ? "success" : "danger"}
            onClick={confirmBulkAction}
            loading={
              userManagement.isBulkActivating ||
              userManagement.isBulkDeactivating
            }
            className="ml-3"
          >
            {bulkAction === "activate" ? "Активировать" : "Заблокировать"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

// Компонент модального окна с деталями пользователя
interface UserDetailsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onActivate: (userId: string) => void;
  onDeactivate: (userId: string) => void;
  isLoading: boolean;
}

function UserDetailsModal({
  user,
  isOpen,
  onClose,
  onActivate,
  onDeactivate,
  isLoading,
}: UserDetailsModalProps) {
  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Информация о пользователе"
      size="lg"
    >
      <div className="space-y-6">
        {/* Основная информация */}
        <div className="flex items-start space-x-4">
          <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xl font-medium text-gray-600">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
            <p className="text-gray-600">{user.email}</p>
            <div className="mt-2 flex items-center space-x-3">
              <Badge variant="secondary" className={getRoleColor(user.role)}>
                {getRoleLabel(user.role)}
              </Badge>
              <Badge variant={user.isActive ? "success" : "error"} dot>
                {user.isActive ? "Активен" : "Заблокирован"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Детальная информация */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Контактная информация
            </h4>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 text-gray-900">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center text-sm">
                  <span className="text-gray-600">Телефон:</span>
                  <span className="ml-2 text-gray-900">{user.phone}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Дополнительная информация
            </h4>
            <div className="space-y-2">
              {user.organization && (
                <div className="flex items-center text-sm">
                  <Building className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Организация:</span>
                  <span className="ml-2 text-gray-900">
                    {user.organization}
                  </span>
                </div>
              )}
              {user.position && (
                <div className="flex items-center text-sm">
                  <span className="text-gray-600">Должность:</span>
                  <span className="ml-2 text-gray-900">{user.position}</span>
                </div>
              )}
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Регистрация:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(user.$createdAt).toLocaleDateString("ru-RU")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Биография */}
        {user.bio && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">О себе</h4>
            <p className="text-sm text-gray-600">{user.bio}</p>
          </div>
        )}
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Закрыть
        </Button>
        {user.isActive ? (
          <Button
            variant="danger"
            onClick={() => onDeactivate(user.$id)}
            loading={isLoading}
            icon={UserX}
            className="ml-3"
          >
            Заблокировать
          </Button>
        ) : (
          <Button
            variant="success"
            onClick={() => onActivate(user.$id)}
            loading={isLoading}
            icon={UserCheck}
            className="ml-3"
          >
            Активировать
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}
