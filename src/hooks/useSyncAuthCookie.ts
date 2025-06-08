// src/hooks/useSyncAuthCookie.ts
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export function useSyncAuthCookie() {
  const { user, setUser, clearUser } = useAuthStore();

  useEffect(() => {
    // Синхронизируем состояние с localStorage только на клиенте
    if (typeof window !== "undefined") {
      const checkAuthState = () => {
        try {
          const authData = localStorage.getItem("auth-storage");

          if (authData) {
            const parsed = JSON.parse(authData);
            const localUser = parsed.state?.user;

            // Если пользователь в localStorage отличается от текущего состояния
            if (JSON.stringify(localUser) !== JSON.stringify(user)) {
              if (localUser && localUser.$id && localUser.isActive) {
                setUser(localUser);
              } else {
                clearUser();
              }
            }
          } else if (user) {
            // Если localStorage пуст, но пользователь есть в состоянии - очищаем
            clearUser();
          }
        } catch (error) {
          console.error("Ошибка при синхронизации auth state:", error);
          clearUser();
        }
      };

      // Проверяем сразу
      checkAuthState();

      // Следим за изменениями localStorage
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === "auth-storage") {
          checkAuthState();
        }
      };

      window.addEventListener("storage", handleStorageChange);

      return () => {
        window.removeEventListener("storage", handleStorageChange);
      };
    }
  }, [user, setUser, clearUser]);
}
