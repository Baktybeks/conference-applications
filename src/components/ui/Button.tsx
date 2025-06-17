// src/components/ui/Button.tsx - ФИНАЛЬНАЯ ИСПРАВЛЕННАЯ ВЕРСИЯ
"use client";

import React, { ReactNode } from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { LucideIcon } from "lucide-react";

interface ButtonProps {
  children: ReactNode;
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement> | React.FormEvent
  ) => void | Promise<void>;
  type?: "button" | "submit" | "reset";
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "success";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  className?: string;
  fullWidth?: boolean;
  form?: string; // Для связывания с формой
}

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = "left",
  className = "",
  fullWidth = false,
  form,
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary:
      "text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 disabled:hover:bg-indigo-600",
    secondary:
      "text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:ring-indigo-500 disabled:hover:bg-indigo-100",
    outline:
      "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500 disabled:hover:bg-white",
    ghost:
      "text-gray-700 hover:bg-gray-100 focus:ring-indigo-500 disabled:hover:bg-transparent",
    danger:
      "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:hover:bg-red-600",
    success:
      "text-white bg-green-600 hover:bg-green-700 focus:ring-green-500 disabled:hover:bg-green-600",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm min-h-[32px]",
    md: "px-4 py-2 text-sm min-h-[36px]",
    lg: "px-6 py-3 text-base min-h-[44px]",
  };

  const isDisabled = disabled || loading;

  // Простой обработчик - передаем событие как есть
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={isDisabled}
      form={form}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `
        .replace(/\s+/g, " ")
        .trim()}
    >
      {loading && (
        <LoadingSpinner
          size="sm"
          color={
            variant === "primary" ||
            variant === "danger" ||
            variant === "success"
              ? "white"
              : "indigo"
          }
          className={`${iconPosition === "left" ? "mr-2" : "ml-2"}`}
        />
      )}

      {Icon && !loading && iconPosition === "left" && (
        <Icon className="h-4 w-4 mr-2" />
      )}

      <span className="truncate">{children}</span>

      {Icon && !loading && iconPosition === "right" && (
        <Icon className="h-4 w-4 ml-2" />
      )}
    </button>
  );
}
