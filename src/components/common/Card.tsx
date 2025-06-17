// src/components/common/Card.tsx - Компонент карточки

"use client";

import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  className = "",
  padding = true,
  hover = false,
  onClick,
}: CardProps) {
  const baseClasses = "bg-white rounded-lg shadow border border-gray-200";
  const paddingClasses = padding ? "p-6" : "";
  const hoverClasses = hover
    ? "hover:shadow-md transition-shadow cursor-pointer"
    : "";
  const clickableClasses = onClick ? "cursor-pointer" : "";

  return (
    <div
      className={`${baseClasses} ${paddingClasses} ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
