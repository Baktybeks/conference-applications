// src/store/authStore.ts - ПОЛНОСТЬЮ ЗАМЕНИТЬ ФАЙЛ

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,

      setUser: (user: User) => {
        set({ user });
      },

      clearUser: () => {
        set({ user: null });
      },

      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => {
        // Добавляем проверку на наличие localStorage для SSR
        if (typeof window !== "undefined") {
          return localStorage;
        }
        // Fallback для SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);
