// src/middleware.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ С ДЕТАЛЬНЫМ ЛОГИРОВАНИЕМ

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UserRole } from "@/types";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  console.log(`🛡️ Middleware: проверка пути ${path}`);

  // Получаем auth cookie
  const authSession = request.cookies.get("auth-storage");
  console.log("🍪 Auth cookie найден:", !!authSession);

  let user = null;

  if (authSession) {
    try {
      const parsed = JSON.parse(authSession.value);
      user = parsed.state?.user;
      console.log(
        "👤 Пользователь из cookie:",
        user
          ? {
              id: user.$id,
              email: user.email,
              role: user.role,
              isActive: user.isActive,
            }
          : null
      );
    } catch (error) {
      console.error("❌ Ошибка при разборе auth-session:", error);
    }
  }

  // ИСПРАВЛЕНО: Более строгая проверка валидности пользователя
  const isAuthenticated = !!user && user.$id && user.email && user.role;
  const isActive = user?.isActive === true;

  console.log("🔍 Статус авторизации:", {
    isAuthenticated,
    isActive,
    userRole: user?.role,
    path,
  });

  // Публичные страницы - если пользователь уже авторизован, перенаправляем
  if (path.startsWith("/login") || path.startsWith("/register")) {
    if (isAuthenticated && isActive) {
      console.log("✅ Пользователь уже авторизован, перенаправляем по роли");
      return redirectByRole(user.role, request);
    }
    console.log("📄 Доступ к публичной странице разрешен");
    return NextResponse.next();
  }

  // ИСПРАВЛЕНО: Проверка авторизации для защищенных маршрутов
  if (!isAuthenticated || !isActive) {
    console.log("🚫 Неавторизованный доступ, перенаправляем на /login");
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Проверка прав доступа по ролям
  if (path.startsWith("/admin")) {
    if (user.role !== UserRole.SUPER_ADMIN) {
      console.log("🚫 Недостаточно прав для /admin, перенаправляем по роли");
      return redirectByRole(user.role, request);
    }
    console.log("✅ Доступ к /admin разрешен для SUPER_ADMIN");
  }

  if (path.startsWith("/organizer")) {
    if (![UserRole.SUPER_ADMIN, UserRole.ORGANIZER].includes(user.role)) {
      console.log(
        "🚫 Недостаточно прав для /organizer, перенаправляем по роли"
      );
      return redirectByRole(user.role, request);
    }
    console.log("✅ Доступ к /organizer разрешен");
  }

  if (path.startsWith("/participant")) {
    if (![UserRole.SUPER_ADMIN, UserRole.PARTICIPANT].includes(user.role)) {
      console.log(
        "🚫 Недостаточно прав для /participant, перенаправляем по роли"
      );
      return redirectByRole(user.role, request);
    }
    console.log("✅ Доступ к /participant разрешен");
  }

  // Перенаправление с главной страницы
  if (path === "/") {
    console.log("🏠 Перенаправление с главной страницы по роли");
    return redirectByRole(user.role, request);
  }

  console.log("✅ Доступ разрешен, продолжаем");
  return NextResponse.next();
}

function redirectByRole(role: UserRole, request: NextRequest) {
  let targetPath: string;

  switch (role) {
    case UserRole.SUPER_ADMIN:
      targetPath = "/admin";
      console.log("👑 Перенаправление SUPER_ADMIN на /admin");
      break;
    case UserRole.ORGANIZER:
      targetPath = "/organizer";
      console.log("📋 Перенаправление ORGANIZER на /organizer");
      break;
    case UserRole.PARTICIPANT:
      targetPath = "/participant";
      console.log("🎓 Перенаправление PARTICIPANT на /participant");
      break;
    default:
      targetPath = "/login";
      console.log("❓ Неизвестная роль, перенаправление на /login");
  }

  const url = new URL(targetPath, request.url);
  console.log(
    `🚀 Выполняем редирект: ${request.nextUrl.pathname} → ${targetPath}`
  );
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
