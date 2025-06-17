// src/components/ui/Tabs.tsx
"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  badge?: number;
}

interface TabsProps {
  items: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  variant?: "default" | "pills" | "underline";
}

export function Tabs({
  items,
  activeTab,
  onTabChange,
  className = "",
  variant = "underline",
}: TabsProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "pills":
        return {
          container: "bg-gray-100 p-1 rounded-lg",
          tab: "rounded-md px-4 py-2 text-sm font-medium transition-colors",
          active: "bg-white text-gray-900 shadow-sm",
          inactive: "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
        };
      case "default":
        return {
          container: "border-b border-gray-200",
          tab: "px-4 py-2 text-sm font-medium transition-colors",
          active: "text-indigo-600 bg-indigo-50 border-indigo-600",
          inactive: "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
        };
      case "underline":
      default:
        return {
          container: "",
          tab: "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
          active: "border-indigo-500 text-indigo-600",
          inactive:
            "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
        };
    }
  };

  const classes = getVariantClasses();

  return (
    <nav className={`${classes.container} ${className}`}>
      <div className="flex space-x-8">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`${classes.tab} ${
                isActive ? classes.active : classes.inactive
              }`}
            >
              <div className="flex items-center">
                {Icon && <Icon className="h-4 w-4 mr-2" />}
                {item.label}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
