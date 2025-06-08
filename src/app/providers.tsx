// src/app/providers.tsx - ПОЛНОСТЬЮ ЗАМЕНИТЬ ФАЙЛ

"use client";

import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ClientOnlyToastContainer } from "@/components/ClientOnlyToastContainer";
import { useSyncAuthCookie } from "@/hooks/useSyncAuthCookie";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // Обрабатываем ошибки Appwrite
              if (error && typeof error === "object" && "code" in error) {
                // Не повторяем запросы при ошибках авторизации
                if (error.code === 401 || error.code === 403) {
                  return false;
                }

                // Ограничиваем повторы для других ошибок
                if (error.code === 429) {
                  return failureCount < 3;
                }
              }
              return failureCount < 2;
            },
            staleTime: 1000 * 60 * 5, // 5 минут
          },
        },
      })
  );

  // Состояние для отслеживания монтирования на клиенте
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // ИСПРАВЛЕНО: Подключаем синхронизацию auth cookie только на клиенте
  useSyncAuthCookie();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Рендерим devtools только на клиенте в dev режиме */}
      {isClient && process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
      <ClientOnlyToastContainer />
    </QueryClientProvider>
  );
}
