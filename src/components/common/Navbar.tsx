// src/components/common/Navbar.tsx - СОЗДАТЬ ЭТОТ ФАЙЛ

"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types";
import { getRoleLabel, getRoleColor, getHomeRoute } from "@/utils/permissions";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Home,
  Calendar,
  FileText,
  Users,
  Shield,
  Bell,
  Search,
  Plus,
  BarChart3,
  HelpCircle,
  Eye,
} from "lucide-react";

// Типы для навигации
interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  description?: string;
}

interface NavigationGroup {
  title: string;
  items: NavigationItem[];
}

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Функция выхода
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  }, [logout, router]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const toggleProfileMenu = useCallback(() => {
    setIsProfileMenuOpen((prev) => !prev);
  }, []);

  const closeMenus = useCallback(() => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, []);

  // Генерация навигационных ссылок на основе роли
  const navigationGroups = useMemo((): NavigationGroup[] => {
    if (!user) return [];

    const groups: NavigationGroup[] = [];

    // Основные разделы
    const mainItems: NavigationItem[] = [
      {
        href: getHomeRoute(user.role),
        label: "Главная",
        icon: Home,
        description: "Обзор и статистика",
      },
    ];

    // Конференции
    const conferenceItems: NavigationItem[] = [];

    if (user.role === UserRole.SUPER_ADMIN) {
      conferenceItems.push({
        href: "/admin/conferences",
        label: "Все конференции",
        icon: Calendar,
        description: "Управление всеми конференциями",
      });
    }

    if ([UserRole.SUPER_ADMIN, UserRole.ORGANIZER].includes(user.role)) {
      conferenceItems.push({
        href: "/organizer/conferences",
        label:
          user.role === UserRole.SUPER_ADMIN
            ? "Мои конференции"
            : "Конференции",
        icon: Calendar,
        description: "Управление конференциями",
      });
      conferenceItems.push({
        href: "/organizer/conferences/create",
        label: "Создать конференцию",
        icon: Plus,
        description: "Добавить новую конференцию",
      });
    }

    if (user.role === UserRole.PARTICIPANT) {
      conferenceItems.push({
        href: "/participant/conferences",
        label: "Доступные конференции",
        icon: Calendar,
        description: "Просмотр доступных конференций",
      });
    }

    if (conferenceItems.length > 0) {
      groups.push({
        title: "Конференции",
        items: conferenceItems,
      });
    }

    // Заявки
    const applicationItems: NavigationItem[] = [];

    if (user.role === UserRole.SUPER_ADMIN) {
      applicationItems.push({
        href: "/admin/applications",
        label: "Все заявки",
        icon: FileText,
        description: "Управление всеми заявками",
      });
    }

    if ([UserRole.SUPER_ADMIN, UserRole.ORGANIZER].includes(user.role)) {
      applicationItems.push({
        href: "/organizer/applications",
        label: "Заявки конференций",
        icon: FileText,
        description: "Заявки на мои конференции",
      });
    }

    if ([UserRole.SUPER_ADMIN, UserRole.PARTICIPANT].includes(user.role)) {
      applicationItems.push({
        href: "/participant/applications",
        label: "Мои заявки",
        icon: FileText,
        description: "Поданные мною заявки",
      });
      applicationItems.push({
        href: "/participant/applications/create",
        label: "Подать заявку",
        icon: Plus,
        description: "Создать новую заявку",
      });
    }

    if (applicationItems.length > 0) {
      groups.push({
        title: "Заявки",
        items: applicationItems,
      });
    }

    // Управление (только для админов)
    if (user.role === UserRole.SUPER_ADMIN) {
      const managementItems: NavigationItem[] = [
        {
          href: "/admin/users",
          label: "Пользователи",
          icon: Users,
          description: "Управление пользователями",
        },
      ];

      groups.push({
        title: "Управление",
        items: managementItems,
      });
    }

    // Основная группа всегда первая
    groups.unshift({
      title: "Основное",
      items: mainItems,
    });

    return groups;
  }, [user]);

  // Проверка активного пути
  const isActivePath = useCallback(
    (href: string): boolean => {
      if (href === getHomeRoute(user?.role || UserRole.PARTICIPANT)) {
        return pathname === href;
      }
      return pathname.startsWith(href);
    },
    [pathname, user?.role]
  );

  // Иконка роли
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return Shield;
      case UserRole.ORGANIZER:
        return Calendar;
      case UserRole.PARTICIPANT:
        return User;
      default:
        return User;
    }
  };

  // Не показываем Navbar если пользователь не авторизован или загружается
  if (!user || loading) {
    return null;
  }

  const RoleIcon = getRoleIcon(user.role);

  return (
    <>
      {/* Основная навигационная панель */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Левая часть - лого и основная навигация */}
            <div className="flex items-center">
              {/* Лого */}
              <Link
                href={getHomeRoute(user.role)}
                className="flex-shrink-0 flex items-center group"
                onClick={closeMenus}
              >
                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:bg-indigo-700 transition-colors">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">
                  Система конференций
                </span>
              </Link>

              {/* Десктопная навигация */}
              <div className="hidden lg:ml-8 lg:flex lg:space-x-1">
                {navigationGroups[0]?.items.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    isActive={isActivePath(item.href)}
                    onClick={closeMenus}
                  />
                ))}
              </div>
            </div>

            {/* Правая часть - действия и профиль */}
            <div className="flex items-center space-x-4">
              {/* Поиск (скрыт на мобильных) */}
              <div className="hidden md:block">
                <SearchButton />
              </div>

              {/* Уведомления */}
              <NotificationButton />

              {/* Быстрые действия для создания */}
              {user.role === UserRole.PARTICIPANT && (
                <Link
                  href="/participant/applications/create"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  onClick={closeMenus}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Подать заявку</span>
                </Link>
              )}

              {/* Профиль пользователя - десктоп */}
              <div className="hidden md:block relative">
                <UserProfileDropdown
                  user={user}
                  isOpen={isProfileMenuOpen}
                  onToggle={toggleProfileMenu}
                  onLogout={handleLogout}
                  onClose={closeMenus}
                />
              </div>

              {/* Мобильное меню - кнопка */}
              <div className="md:hidden">
                <button
                  onClick={toggleMenu}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
                  aria-expanded={isMenuOpen}
                >
                  {isMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Мобильное меню */}
      <MobileMenu
        isOpen={isMenuOpen}
        navigationGroups={navigationGroups}
        user={user}
        isActivePath={isActivePath}
        onLogout={handleLogout}
        onClose={closeMenus}
      />

      {/* Оверлей для закрытия меню */}
      {(isMenuOpen || isProfileMenuOpen) && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-25 md:hidden"
          onClick={closeMenus}
        />
      )}
    </>
  );
}

// Компонент ссылки навигации
interface NavLinkProps {
  item: NavigationItem;
  isActive: boolean;
  onClick: () => void;
  mobile?: boolean;
}

function NavLink({ item, isActive, onClick, mobile = false }: NavLinkProps) {
  const baseClasses = mobile
    ? "flex items-center px-4 py-3 text-base font-medium transition-colors"
    : "inline-flex items-center px-3 py-2 text-sm font-medium transition-colors";

  const activeClasses = mobile
    ? "text-indigo-700 bg-indigo-50 border-r-4 border-indigo-700"
    : "text-indigo-600 border-b-2 border-indigo-500";

  const inactiveClasses = mobile
    ? "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
    : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300";

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      <item.icon
        className={`${mobile ? "h-5 w-5 mr-3" : "h-4 w-4 mr-2"} flex-shrink-0`}
      />
      {item.label}
      {item.badge && (
        <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

// Компонент мобильного меню
interface MobileMenuProps {
  isOpen: boolean;
  navigationGroups: NavigationGroup[];
  user: any;
  isActivePath: (href: string) => boolean;
  onLogout: () => void;
  onClose: () => void;
}

function MobileMenu({
  isOpen,
  navigationGroups,
  user,
  isActivePath,
  onLogout,
  onClose,
}: MobileMenuProps) {
  if (!isOpen) return null;

  const RoleIcon =
    user.role === UserRole.SUPER_ADMIN
      ? Shield
      : user.role === UserRole.ORGANIZER
      ? Eye
      : User;

  return (
    <div className="md:hidden fixed top-16 inset-x-0 z-40 bg-white shadow-lg border-b border-gray-200 max-h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="pt-2 pb-3 space-y-1">
        {/* Профиль пользователя в мобильном меню */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                <RoleIcon className="h-6 w-6 text-gray-600" />
              </div>
            </div>
            <div className="ml-3">
              <div className="text-base font-medium text-gray-800">
                {user.name}
              </div>
              <div className="text-sm text-gray-500">{user.email}</div>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getRoleColor(
                  user.role
                )}`}
              >
                {getRoleLabel(user.role)}
              </span>
            </div>
          </div>
        </div>

        {/* Навигационные группы */}
        {navigationGroups.map((group, groupIndex) => (
          <div key={group.title}>
            {groupIndex > 0 && (
              <div className="border-t border-gray-200 my-2" />
            )}
            <div className="px-4 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {group.title}
              </h3>
            </div>
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={isActivePath(item.href)}
                onClick={onClose}
                mobile
              />
            ))}
          </div>
        ))}

        {/* Действия */}
        <div className="border-t border-gray-200 pt-4 pb-3">
          <div className="px-4 space-y-2">
            <button
              onClick={() => {
                onClose();
                // Открыть поиск
              }}
              className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Search className="h-5 w-5 mr-3" />
              Поиск
            </button>

            <Link
              href="/help"
              onClick={onClose}
              className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              <HelpCircle className="h-5 w-5 mr-3" />
              Помощь
            </Link>

            <button
              onClick={onLogout}
              className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Выйти
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент выпадающего меню профиля
interface UserProfileDropdownProps {
  user: any;
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
  onClose: () => void;
}

function UserProfileDropdown({
  user,
  isOpen,
  onToggle,
  onLogout,
  onClose,
}: UserProfileDropdownProps) {
  const RoleIcon =
    user.role === UserRole.SUPER_ADMIN
      ? Shield
      : user.role === UserRole.ORGANIZER
      ? Eye
      : User;

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center mr-2">
          <RoleIcon className="h-5 w-5 text-gray-600" />
        </div>
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900">{user.name}</div>
          <div className="text-xs text-gray-500">{getRoleLabel(user.role)}</div>
        </div>
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {/* Информация о пользователе */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${getRoleColor(
                  user.role
                )}`}
              >
                {getRoleLabel(user.role)}
              </span>
            </div>

            <div className="border-t border-gray-100">
              <button
                onClick={onLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Выйти
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Компонент кнопки поиска
function SearchButton() {
  return (
    <button
      onClick={() => {
        console.log("Открыть поиск");
      }}
      className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
      title="Поиск"
    >
      <Search className="h-5 w-5" />
    </button>
  );
}

// Компонент кнопки уведомлений
function NotificationButton() {
  const [hasUnread] = useState(false);

  return (
    <button
      onClick={() => {
        console.log("Открыть уведомления");
      }}
      className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
      title="Уведомления"
    >
      <Bell className="h-5 w-5" />
      {hasUnread && (
        <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
      )}
    </button>
  );
}
