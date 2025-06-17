// src/components/organizer/dashboard/QuickStats.tsx
"use client";

import React from "react";
import { StatsCard } from "@/components/ui/StatsCard";
import {
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Users,
} from "lucide-react";

interface QuickStatsProps {
  organizerId: string;
  className?: string;
}

interface OrganizerStats {
  conferences: number;
  activeConferences: number;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
}

export function QuickStats({ organizerId, className = "" }: QuickStatsProps) {
  // TODO: Заменить на реальный API вызов
  const stats: OrganizerStats = {
    conferences: 5,
    activeConferences: 2,
    totalApplications: 128,
    pendingApplications: 23,
    acceptedApplications: 87,
    rejectedApplications: 18,
  };

  // TODO: Добавить логику для получения трендов
  const trends = {
    conferences: { value: 12, isPositive: true },
    applications: { value: 8, isPositive: true },
    accepted: { value: 15, isPositive: true },
  };

  return (
    <div className={`grid grid-cols-2 md:grid-cols-6 gap-4 ${className}`}>
      <StatsCard
        title="Всего конференций"
        value={stats.conferences}
        icon={Calendar}
        color="gray"
        trend={trends.conferences}
      />

      <StatsCard
        title="Активные"
        value={stats.activeConferences}
        icon={Users}
        color="green"
        subtitle="сейчас идут"
      />

      <StatsCard
        title="Всего заявок"
        value={stats.totalApplications}
        icon={FileText}
        color="blue"
        trend={trends.applications}
      />

      <StatsCard
        title="На рассмотрении"
        value={stats.pendingApplications}
        icon={Clock}
        color="yellow"
        subtitle="требуют внимания"
      />

      <StatsCard
        title="Принято"
        value={stats.acceptedApplications}
        icon={CheckCircle}
        color="green"
        trend={trends.accepted}
      />

      <StatsCard
        title="Отклонено"
        value={stats.rejectedApplications}
        icon={XCircle}
        color="red"
      />
    </div>
  );
}
