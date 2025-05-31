// src/services/conferenceService.ts

import { ID, Query } from "appwrite";
import { databases } from "./appwriteClient";
import { appwriteConfig } from "@/constants/appwriteConfig";
import {
  Conference,
  ConferenceWithDetails,
  CreateConferenceDto,
  UpdateConferenceDto,
  ConferenceFilters,
  DashboardStats,
  ConferenceTheme,
  ParticipationType,
  User,
} from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const conferenceApi = {
  // === КОНФЕРЕНЦИИ ===

  // Получить все конференции с фильтрацией
  getConferences: async (
    filters?: ConferenceFilters
  ): Promise<Conference[]> => {
    try {
      const queries: string[] = [Query.orderDesc("$createdAt")];

      if (filters?.theme?.length) {
        queries.push(Query.equal("theme", filters.theme));
      }
      if (filters?.participationType?.length) {
        queries.push(
          Query.equal("participationType", filters.participationType)
        );
      }
      if (filters?.organizerId) {
        queries.push(Query.equal("organizerId", filters.organizerId));
      }
      if (filters?.isPublished !== undefined) {
        queries.push(Query.equal("isPublished", filters.isPublished));
      }
      if (filters?.dateFrom) {
        queries.push(Query.greaterThanEqual("startDate", filters.dateFrom));
      }
      if (filters?.dateTo) {
        queries.push(Query.lessThanEqual("startDate", filters.dateTo));
      }

      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.conferences,
        queries
      );

      let conferences = response.documents as unknown as Conference[];

      // Фильтрация по поисковому запросу (клиентская сторона)
      if (filters?.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        conferences = conferences.filter(
          (conference) =>
            conference.title.toLowerCase().includes(searchLower) ||
            conference.description.toLowerCase().includes(searchLower) ||
            conference.location.toLowerCase().includes(searchLower)
        );
      }

      return conferences;
    } catch (error) {
      console.error("Ошибка при получении конференций:", error);
      return [];
    }
  },

  // Получить конференцию по ID с дополнительной информацией
  getConferenceById: async (
    id: string
  ): Promise<ConferenceWithDetails | null> => {
    try {
      const conference = (await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.conferences,
        id
      )) as unknown as Conference;

      // Получаем информацию об организаторе
      const organizer = (await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        conference.organizerId
      )) as unknown as User;

      // Получаем заявки на конференцию
      const applicationsResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.applications,
        [Query.equal("conferenceId", id), Query.orderDesc("$createdAt")]
      );

      // Получаем расписание конференции
      const scheduleResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.conferenceSchedule,
        [Query.equal("conferenceId", id), Query.orderAsc("date")]
      );

      // Считаем статистику
      const applications = applicationsResponse.documents;
      const stats = {
        totalApplications: applications.length,
        acceptedApplications: applications.filter(
          (app: any) => app.status === "ACCEPTED"
        ).length,
        pendingApplications: applications.filter(
          (app: any) =>
            app.status === "SUBMITTED" || app.status === "UNDER_REVIEW"
        ).length,
        rejectedApplications: applications.filter(
          (app: any) => app.status === "REJECTED"
        ).length,
      };

      return {
        ...conference,
        organizer,
        applications: applications as any[],
        schedule: scheduleResponse.documents as any[],
        stats,
      };
    } catch (error) {
      console.error("Ошибка при получении конференции:", error);
      return null;
    }
  },

  // Создать новую конференцию
  createConference: async (
    data: CreateConferenceDto,
    organizerId: string
  ): Promise<Conference> => {
    try {
      const conferenceData = {
        ...data,
        organizerId,
        isPublished: false, // По умолчанию создаём как черновик
        createdAt: new Date().toISOString(),
      };

      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.conferences,
        ID.unique(),
        conferenceData
      );

      return response as unknown as Conference;
    } catch (error) {
      console.error("Ошибка при создании конференции:", error);
      throw error;
    }
  },

  // Обновить конференцию
  updateConference: async (
    id: string,
    data: Partial<CreateConferenceDto & { isPublished?: boolean }>,
    userId: string
  ): Promise<Conference> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.conferences,
        id,
        data
      );

      return response as unknown as Conference;
    } catch (error) {
      console.error("Ошибка при обновлении конференции:", error);
      throw error;
    }
  },

  // Удалить конференцию
  deleteConference: async (id: string): Promise<boolean> => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.conferences,
        id
      );
      return true;
    } catch (error) {
      console.error("Ошибка при удалении конференции:", error);
      throw error;
    }
  },

  // Опубликовать конференцию
  publishConference: async (id: string): Promise<Conference> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.conferences,
        id,
        { isPublished: true }
      );

      return response as unknown as Conference;
    } catch (error) {
      console.error("Ошибка при публикации конференции:", error);
      throw error;
    }
  },

  // Снять с публикации
  unpublishConference: async (id: string): Promise<Conference> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.conferences,
        id,
        { isPublished: false }
      );

      return response as unknown as Conference;
    } catch (error) {
      console.error("Ошибка при снятии с публикации:", error);
      throw error;
    }
  },

  // === СТАТИСТИКА ===

  // Получить статистику для дашборда
  getDashboardStats: async (filters?: {
    organizerId?: string;
    participantId?: string;
  }): Promise<DashboardStats> => {
    try {
      // Получаем конференции
      const conferenceQueries: string[] = [];
      if (filters?.organizerId) {
        conferenceQueries.push(Query.equal("organizerId", filters.organizerId));
      }

      const conferencesResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.conferences,
        conferenceQueries
      );

      const conferences =
        conferencesResponse.documents as unknown as Conference[];

      // Получаем заявки
      const applicationQueries: string[] = [];
      if (filters?.participantId) {
        applicationQueries.push(
          Query.equal("participantId", filters.participantId)
        );
      }
      if (filters?.organizerId) {
        // Для организатора получаем заявки на его конференции
        const conferenceIds = conferences.map((c) => c.$id);
        if (conferenceIds.length > 0) {
          applicationQueries.push(Query.equal("conferenceId", conferenceIds));
        }
      }

      const applicationsResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.applications,
        applicationQueries
      );

      const applications = applicationsResponse.documents as any[];

      // Определяем активные конференции
      const now = new Date();
      const activeConferences = conferences.filter((c) => {
        const startDate = new Date(c.startDate);
        const endDate = new Date(c.endDate);
        return startDate <= now && endDate >= now;
      });

      // Предстоящие конференции
      const upcomingConferences = conferences.filter((c) => {
        const startDate = new Date(c.startDate);
        return startDate > now;
      });

      const stats: DashboardStats = {
        totalConferences: conferences.length,
        activeConferences: activeConferences.length,
        totalApplications: applications.length,
        pendingApplications: applications.filter(
          (a) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW"
        ).length,
        acceptedApplications: applications.filter(
          (a) => a.status === "ACCEPTED"
        ).length,
        rejectedApplications: applications.filter(
          (a) => a.status === "REJECTED"
        ).length,
        upcomingConferences: upcomingConferences.length,
        applicationsByTheme: {
          [ConferenceTheme.COMPUTER_SCIENCE]: 0,
          [ConferenceTheme.MEDICINE]: 0,
          [ConferenceTheme.EDUCATION]: 0,
          [ConferenceTheme.ENGINEERING]: 0,
          [ConferenceTheme.BUSINESS]: 0,
          [ConferenceTheme.SOCIAL_SCIENCES]: 0,
          [ConferenceTheme.NATURAL_SCIENCES]: 0,
          [ConferenceTheme.HUMANITIES]: 0,
          [ConferenceTheme.OTHER]: 0,
        },
        applicationsByStatus: {
          DRAFT: 0,
          SUBMITTED: 0,
          UNDER_REVIEW: 0,
          ACCEPTED: 0,
          REJECTED: 0,
          WAITLIST: 0,
        },
        monthlyStats: [], // Будет рассчитано позже
      };

      // Подсчитываем статистику по тематикам
      conferences.forEach((conference) => {
        const conferenceApplications = applications.filter(
          (a) => a.conferenceId === conference.$id
        );
        stats.applicationsByTheme[conference.theme] +=
          conferenceApplications.length;
      });

      // Подсчитываем статистику по статусам
      applications.forEach((application) => {
        stats.applicationsByStatus[
          application.status as keyof typeof stats.applicationsByStatus
        ]++;
      });

      // Рассчитываем месячную статистику
      const monthlyData: {
        [key: string]: { conferences: number; applications: number };
      } = {};

      conferences.forEach((conference) => {
        const month = new Date(conference.$createdAt).toISOString().slice(0, 7); // YYYY-MM
        if (!monthlyData[month]) {
          monthlyData[month] = { conferences: 0, applications: 0 };
        }
        monthlyData[month].conferences++;
      });

      applications.forEach((application) => {
        const month = new Date(application.$createdAt)
          .toISOString()
          .slice(0, 7);
        if (!monthlyData[month]) {
          monthlyData[month] = { conferences: 0, applications: 0 };
        }
        monthlyData[month].applications++;
      });

      stats.monthlyStats = Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12) // Последние 12 месяцев
        .map(([month, data]) => ({
          month,
          conferences: data.conferences,
          applications: data.applications,
        }));

      return stats;
    } catch (error) {
      console.error("Ошибка при получении статистики:", error);
      return {
        totalConferences: 0,
        activeConferences: 0,
        totalApplications: 0,
        pendingApplications: 0,
        acceptedApplications: 0,
        rejectedApplications: 0,
        upcomingConferences: 0,
        applicationsByTheme: {
          [ConferenceTheme.COMPUTER_SCIENCE]: 0,
          [ConferenceTheme.MEDICINE]: 0,
          [ConferenceTheme.EDUCATION]: 0,
          [ConferenceTheme.ENGINEERING]: 0,
          [ConferenceTheme.BUSINESS]: 0,
          [ConferenceTheme.SOCIAL_SCIENCES]: 0,
          [ConferenceTheme.NATURAL_SCIENCES]: 0,
          [ConferenceTheme.HUMANITIES]: 0,
          [ConferenceTheme.OTHER]: 0,
        },
        applicationsByStatus: {
          DRAFT: 0,
          SUBMITTED: 0,
          UNDER_REVIEW: 0,
          ACCEPTED: 0,
          REJECTED: 0,
          WAITLIST: 0,
        },
        monthlyStats: [],
      };
    }
  },

  // Поиск конференций
  searchConferences: async (searchTerm: string): Promise<Conference[]> => {
    try {
      const conferences = await conferenceApi.getConferences();
      const searchLower = searchTerm.toLowerCase();

      return conferences.filter(
        (conference) =>
          conference.title.toLowerCase().includes(searchLower) ||
          conference.description.toLowerCase().includes(searchLower) ||
          conference.location.toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error("Ошибка при поиске конференций:", error);
      return [];
    }
  },

  // Получить популярные тематики
  getPopularThemes: async (): Promise<
    Array<{ theme: ConferenceTheme; count: number }>
  > => {
    try {
      const conferences = await conferenceApi.getConferences({
        isPublished: true,
      });
      const themeCounts: { [key in ConferenceTheme]: number } = {
        [ConferenceTheme.COMPUTER_SCIENCE]: 0,
        [ConferenceTheme.MEDICINE]: 0,
        [ConferenceTheme.EDUCATION]: 0,
        [ConferenceTheme.ENGINEERING]: 0,
        [ConferenceTheme.BUSINESS]: 0,
        [ConferenceTheme.SOCIAL_SCIENCES]: 0,
        [ConferenceTheme.NATURAL_SCIENCES]: 0,
        [ConferenceTheme.HUMANITIES]: 0,
        [ConferenceTheme.OTHER]: 0,
      };

      conferences.forEach((conference) => {
        themeCounts[conference.theme]++;
      });

      return Object.entries(themeCounts)
        .map(([theme, count]) => ({ theme: theme as ConferenceTheme, count }))
        .filter(({ count }) => count > 0)
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error("Ошибка при получении популярных тематик:", error);
      return [];
    }
  },

  // Получить предстоящие конференции
  getUpcomingConferences: async (limit = 10): Promise<Conference[]> => {
    try {
      const now = new Date().toISOString();
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.conferences,
        [
          Query.equal("isPublished", true),
          Query.greaterThan("startDate", now),
          Query.orderAsc("startDate"),
          Query.limit(limit),
        ]
      );

      return response.documents as unknown as Conference[];
    } catch (error) {
      console.error("Ошибка при получении предстоящих конференций:", error);
      return [];
    }
  },

  // Получить конференции с открытым приёмом заявок
  getOpenForApplications: async (): Promise<Conference[]> => {
    try {
      const now = new Date().toISOString();
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.conferences,
        [
          Query.equal("isPublished", true),
          Query.greaterThan("submissionDeadline", now),
          Query.orderAsc("submissionDeadline"),
        ]
      );

      return response.documents as unknown as Conference[];
    } catch (error) {
      console.error(
        "Ошибка при получении конференций с открытым приёмом:",
        error
      );
      return [];
    }
  },
};

// React Query ключи
export const conferenceKeys = {
  all: ["conferences"] as const,
  lists: () => [...conferenceKeys.all, "list"] as const,
  list: (filters?: ConferenceFilters) =>
    [...conferenceKeys.lists(), filters] as const,
  details: () => [...conferenceKeys.all, "detail"] as const,
  detail: (id: string) => [...conferenceKeys.details(), id] as const,
  stats: (filters?: { organizerId?: string; participantId?: string }) =>
    [...conferenceKeys.all, "stats", filters] as const,
  popular: () => [...conferenceKeys.all, "popular"] as const,
  upcoming: () => [...conferenceKeys.all, "upcoming"] as const,
  openApplications: () => [...conferenceKeys.all, "open-applications"] as const,
};

// React Query хуки

// Получение конференций с фильтрацией
export const useConferences = (filters?: ConferenceFilters) => {
  return useQuery({
    queryKey: conferenceKeys.list(filters),
    queryFn: () => conferenceApi.getConferences(filters),
    staleTime: 1000 * 60 * 5, // 5 минут
  });
};

// Получение конкретной конференции
export const useConference = (id: string) => {
  return useQuery({
    queryKey: conferenceKeys.detail(id),
    queryFn: () => conferenceApi.getConferenceById(id),
    staleTime: 1000 * 60 * 2, // 2 минуты
    enabled: !!id,
  });
};

// Создание конференции
export const useCreateConference = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      organizerId,
    }: {
      data: CreateConferenceDto;
      organizerId: string;
    }) => conferenceApi.createConference(data, organizerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conferenceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: conferenceKeys.stats() });
    },
  });
};

// Обновление конференции
export const useUpdateConference = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
      userId,
    }: {
      id: string;
      data: Partial<CreateConferenceDto & { isPublished?: boolean }>;
      userId: string;
    }) => conferenceApi.updateConference(id, data, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: conferenceKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: conferenceKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: conferenceKeys.stats() });
    },
  });
};

// Удаление конференции
export const useDeleteConference = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => conferenceApi.deleteConference(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conferenceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: conferenceKeys.stats() });
    },
  });
};

// Публикация конференции
export const usePublishConference = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => conferenceApi.publishConference(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: conferenceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: conferenceKeys.detail(id) });
    },
  });
};

// Снятие с публикации
export const useUnpublishConference = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => conferenceApi.unpublishConference(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: conferenceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: conferenceKeys.detail(id) });
    },
  });
};

// Получение статистики
export const useDashboardStats = (filters?: {
  organizerId?: string;
  participantId?: string;
}) => {
  return useQuery({
    queryKey: conferenceKeys.stats(filters),
    queryFn: () => conferenceApi.getDashboardStats(filters),
    staleTime: 1000 * 60 * 10, // 10 минут
  });
};

// Получение популярных тематик
export const usePopularThemes = () => {
  return useQuery({
    queryKey: conferenceKeys.popular(),
    queryFn: () => conferenceApi.getPopularThemes(),
    staleTime: 1000 * 60 * 30, // 30 минут
  });
};

// Получение предстоящих конференций
export const useUpcomingConferences = (limit?: number) => {
  return useQuery({
    queryKey: conferenceKeys.upcoming(),
    queryFn: () => conferenceApi.getUpcomingConferences(limit),
    staleTime: 1000 * 60 * 15, // 15 минут
  });
};

// Получение конференций с открытым приёмом заявок
export const useOpenApplicationsConferences = () => {
  return useQuery({
    queryKey: conferenceKeys.openApplications(),
    queryFn: () => conferenceApi.getOpenForApplications(),
    staleTime: 1000 * 60 * 10, // 10 минут
  });
};
