// src/utils/cookieSync.ts - Утилиты для синхронизации cookies

import { User } from "@/types";

// Функция для обновления cookie с данными пользователя
export function updateAuthCookie(user: User | null) {
  console.log("🍪 Обновляем auth cookie:", user ? user.role : "null");

  if (user) {
    const authData = {
      state: {
        user: user,
      },
    };

    const cookieValue = encodeURIComponent(JSON.stringify(authData));
    document.cookie = `auth-storage=${cookieValue}; path=/; max-age=86400; SameSite=Lax`;

    console.log("✅ Auth cookie обновлен для пользователя:", user.email);
  } else {
    // Очищаем cookie при выходе
    document.cookie = `auth-storage=; path=/; max-age=0; SameSite=Lax`;
    console.log("🗑️ Auth cookie очищен");
  }
}

// Функция для чтения cookie
export function readAuthCookie(): User | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  const authCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("auth-storage=")
  );

  if (!authCookie) {
    console.log("🍪 Auth cookie не найден");
    return null;
  }

  try {
    const cookieValue = authCookie.split("=")[1];
    const decodedValue = decodeURIComponent(cookieValue);
    const parsed = JSON.parse(decodedValue);

    console.log("🍪 Auth cookie прочитан:", parsed.state?.user?.email);
    return parsed.state?.user || null;
  } catch (error) {
    console.error("❌ Ошибка при чтении auth cookie:", error);
    return null;
  }
}

// Хук для автоматической синхронизации cookies
import { useEffect } from "react";

export function useAuthCookieSync(user: User | null) {
  useEffect(() => {
    updateAuthCookie(user);
  }, [user]);
}
