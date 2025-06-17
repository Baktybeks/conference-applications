// src/components/common/PageHeader.tsx - Компонент заголовка страницы

"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  children,
  actions,
}: PageHeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                {Icon && (
                  <div className="flex-shrink-0 mr-4">
                    <Icon className="h-8 w-8 text-indigo-600" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate">
                    {title}
                  </h1>
                  {description && (
                    <p className="mt-1 text-sm text-gray-500">{description}</p>
                  )}
                </div>
              </div>
              {children && <div className="mt-4">{children}</div>}
            </div>
            {actions && (
              <div className="mt-4 flex md:mt-0 md:ml-4">{actions}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
