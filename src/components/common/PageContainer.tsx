// src/components/common/PageContainer.tsx - Контейнер для страниц

"use client";

import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: boolean;
  className?: string;
}

export function PageContainer({
  children,
  maxWidth = "full",
  padding = true,
  className = "",
}: PageContainerProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full",
  };

  const paddingClasses = padding ? "px-4 sm:px-6 lg:px-8 py-8" : "";

  return (
    <div
      className={`${maxWidthClasses[maxWidth]} mx-auto ${paddingClasses} ${className}`}
    >
      {children}
    </div>
  );
}
