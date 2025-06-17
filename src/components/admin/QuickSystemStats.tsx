// src/components/admin/QuickSystemStats.tsx

"use client";

import React from "react";
import { DashboardStats } from "@/types";

interface QuickSystemStatsProps {
  stats?: DashboardStats;
  isLoading?: boolean;
}

export function QuickSystemStats({
  stats,
  isLoading = false,
}: QuickSystemStatsProps) {
  // Дефолтные значения, если данные еще не загружены
  const defaultStats = {
    totalUsers: 0,
    activeUsers: 0,
    totalConferences: 0,
    publishedConferences: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
  };

  const displayStats = stats || defaultStats;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="text-center animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
      <StatItem
        value={displayStats.totalUsers}
        label="Всего пользователей"
        color="text-gray-900"
      />
      <StatItem
        value={displayStats.activeUsers}
        label="Активные"
        color="text-green-600"
      />
      <StatItem
        value={displayStats.totalConferences}
        label="Конференции"
        color="text-blue-600"
      />
      <StatItem
        value={displayStats.publishedConferences}
        label="Опубликованы"
        color="text-purple-600"
      />
      <StatItem
        value={displayStats.totalApplications}
        label="Всего заявок"
        color="text-indigo-600"
      />
      <StatItem
        value={displayStats.pendingApplications}
        label="На рассмотрении"
        color="text-yellow-600"
      />
      <StatItem
        value={displayStats.acceptedApplications}
        label="Принятые"
        color="text-green-600"
      />
      <StatItem
        value={displayStats.rejectedApplications}
        label="Отклоненные"
        color="text-red-600"
      />
    </div>
  );
}

interface StatItemProps {
  value: string | number;
  label: string;
  color: string;
}

function StatItem({ value, label, color }: StatItemProps) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${color}`}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="text-sm text-gray-600 leading-tight">{label}</div>
    </div>
  );
}
