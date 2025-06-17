// src/components/common/LoadingSpinner.tsx - Спиннер загрузки

"use client";

import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "indigo" | "white" | "gray";
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  color = "indigo",
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const colorClasses = {
    indigo: "border-indigo-600",
    white: "border-white",
    gray: "border-gray-400",
  };

  return (
    <div
      className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    />
  );
}
