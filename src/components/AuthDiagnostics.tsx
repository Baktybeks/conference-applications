// src/components/AuthDiagnostics.tsx - Компонент для диагностики авторизации

"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { readAuthCookie } from "@/utils/cookieSync";

export function AuthDiagnostics() {
  const { user, loading, error, isAuthenticated } = useAuth();
  const [cookieData, setCookieData] = useState<any>(null);
  const [allCookies, setAllCookies] = useState<string>("");

  useEffect(() => {
    // Читаем cookie данные
    const cookieUser = readAuthCookie();
    setCookieData(cookieUser);

    // Получаем все cookies для отладки
    setAllCookies(document.cookie);
  }, [user]);

  if (process.env.NODE_ENV !== "development") {
    return null; // Показываем только в режиме разработки
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg max-w-md max-h-96 overflow-auto text-xs font-mono z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-yellow-400">🔧 AUTH DEBUG</h3>
        <button
          onClick={() => {
            const element = document.querySelector(
              "[data-auth-debug]"
            ) as HTMLElement;
            if (element) {
              element.style.display =
                element.style.display === "none" ? "block" : "none";
            }
          }}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>

      <div data-auth-debug className="space-y-2">
        <div>
          <div className="text-green-400">useAuth Hook:</div>
          <div>Loading: {loading ? "✅" : "❌"}</div>
          <div>Authenticated: {isAuthenticated ? "✅" : "❌"}</div>
          <div>Error: {error || "None"}</div>
          <div>User Role: {user?.role || "None"}</div>
          <div>User Active: {user?.isActive ? "✅" : "❌"}</div>
          <div>User ID: {user?.$id || "None"}</div>
        </div>

        <div>
          <div className="text-blue-400">Cookie Data:</div>
          <div>Has Cookie: {cookieData ? "✅" : "❌"}</div>
          <div>Cookie Role: {cookieData?.role || "None"}</div>
          <div>Cookie Active: {cookieData?.isActive ? "✅" : "❌"}</div>
          <div>Cookie ID: {cookieData?.$id || "None"}</div>
        </div>

        <div>
          <div className="text-purple-400">Sync Status:</div>
          <div>Match: {user?.$id === cookieData?.$id ? "✅" : "❌"}</div>
          <div>Same Role: {user?.role === cookieData?.role ? "✅" : "❌"}</div>
        </div>

        <div>
          <div className="text-orange-400">Current URL:</div>
          <div>{window.location.pathname}</div>
        </div>

        <div>
          <div className="text-red-400">All Cookies:</div>
          <div className="break-all max-h-20 overflow-y-auto">
            {allCookies || "None"}
          </div>
        </div>

        <div>
          <div className="text-cyan-400">Actions:</div>
          <button
            onClick={() => {
              document.cookie = "auth-storage=; path=/; max-age=0";
              window.location.reload();
            }}
            className="bg-red-600 px-2 py-1 rounded text-white mr-2"
          >
            Clear Cookie
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 px-2 py-1 rounded text-white"
          >
            Reload
          </button>
        </div>
      </div>
    </div>
  );
}
