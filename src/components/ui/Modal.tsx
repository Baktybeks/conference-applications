// src/components/ui/Modal.tsx - УЛУЧШЕННАЯ ВЕРСИЯ
"use client";

import React, { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className = "",
}: ModalProps) {
  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-7xl mx-4",
  };

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto"
      style={{ zIndex: 9999 }}
    >
      {/* Backdrop с улучшенной видимостью */}
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Оверлей с градиентом для лучшей видимости */}
        <div
          className="fixed inset-0 bg-black bg-opacity-60 transition-opacity backdrop-blur-sm"
          onClick={onClose}
          style={{ zIndex: -1 }}
        />

        {/* Модальное окно с тенями и границами */}
        <div
          className={`
            inline-block align-bottom bg-white rounded-xl text-left overflow-hidden 
            shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:w-full 
            border border-gray-200 relative
            ${sizeClasses[size]} 
            ${className}
          `}
          style={{ zIndex: 1 }}
        >
          {/* Заголовок с улучшенными стилями */}
          {title && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Контент с правильным отступом */}
          <div className="bg-white px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// Улучшенный компонент для футера модального окна
interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export function ModalFooter({ children, className = "" }: ModalFooterProps) {
  return (
    <div
      className={`bg-gray-50 border-t border-gray-200 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0 ${className}`}
    >
      {children}
    </div>
  );
}
