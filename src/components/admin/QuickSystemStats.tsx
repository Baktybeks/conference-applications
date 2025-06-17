// src/components/admin/QuickSystemStats.tsx

"use client";

import React from "react";

export function QuickSystemStats() {
  // TODO: Получить реальные данные
  const stats = {
    totalUsers: 248,
    activeUsers: 185,
    totalConferences: 42,
    activeConferences: 8,
    totalApplications: 1847,
    pendingReview: 127,
    systemHealth: 98.5,
    storageUsed: 67,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
      <StatItem
        value={stats.totalUsers}
        label="Всего пользователей"
        color="text-gray-900"
      />
      <StatItem
        value={stats.activeUsers}
        label="Активные"
        color="text-green-600"
      />
      <StatItem
        value={stats.totalConferences}
        label="Конференции"
        color="text-blue-600"
      />
      <StatItem
        value={stats.activeConferences}
        label="Активные"
        color="text-purple-600"
      />
      <StatItem
        value={stats.totalApplications}
        label="Всего заявок"
        color="text-indigo-600"
      />
      <StatItem
        value={stats.pendingReview}
        label="На рассмотрении"
        color="text-yellow-600"
      />
      <StatItem
        value={`${stats.systemHealth}%`}
        label="Здоровье системы"
        color="text-green-600"
      />
      <StatItem
        value={`${stats.storageUsed}%`}
        label="Использ. места"
        color="text-orange-600"
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
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}
