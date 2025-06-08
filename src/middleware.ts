// src/middleware.ts - ПОЛНОСТЬЮ ЗАМЕНИТЬ ФАЙЛ

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UserRole } from "@/types";

export function middleware(request: NextRequest) {
  const authSession = request.cookies.get("auth-storage");
  let user = null;

  if (authSession) {
    try {
      const parsed = JSON.parse(authSession.value);
      user = parsed.state?.user;
    } catch (error) {
      console.error("Ошибка при разборе auth-session:", error);
    }
  }

  // ИСПРАВЛЕНО: Более строгая проверка валидности пользователя
  const isAuthenticated = !!user && user.$id && user.email && user.role;
  const isActive = user?.isActive === true;
  const path = request.nextUrl.pathname;

  // Публичные страницы
  if (path.startsWith("/login") || path.startsWith("/register")) {
    if (isAuthenticated && isActive) {
      return redirectByRole(user.role, request);
    }
    return NextResponse.next();
  }

  // ИСПРАВЛЕНО: Проверка авторизации для защищенных маршрутов
  if (!isAuthenticated || !isActive) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Проверка прав доступа по ролям
  if (path.startsWith("/admin") && user.role !== UserRole.SUPER_ADMIN) {
    return redirectByRole(user.role, request);
  }

  if (
    path.startsWith("/organizer") &&
    ![UserRole.SUPER_ADMIN, UserRole.ORGANIZER].includes(user.role)
  ) {
    return redirectByRole(user.role, request);
  }

  if (
    path.startsWith("/reviewer") &&
    ![UserRole.SUPER_ADMIN, UserRole.REVIEWER].includes(user.role)
  ) {
    return redirectByRole(user.role, request);
  }

  if (
    path.startsWith("/participant") &&
    ![UserRole.SUPER_ADMIN, UserRole.PARTICIPANT].includes(user.role)
  ) {
    return redirectByRole(user.role, request);
  }

  // Перенаправление с главной страницы
  if (path === "/") {
    return redirectByRole(user.role, request);
  }

  return NextResponse.next();
}

function redirectByRole(role: UserRole, request: NextRequest) {
  let path: string;

  switch (role) {
    case UserRole.SUPER_ADMIN:
      path = "/admin";
      break;
    case UserRole.ORGANIZER:
      path = "/organizer";
      break;
    case UserRole.REVIEWER:
      path = "/reviewer";
      break;
    case UserRole.PARTICIPANT:
      path = "/participant";
      break;
    default:
      path = "/login";
  }

  const url = new URL(path, request.url);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|public|favicon.ico).*)",
    "/admin/:path*",
    "/organizer/:path*",
    "/reviewer/:path*",
    "/participant/:path*",
    "/login",
    "/register",
    "/",
  ],
};
