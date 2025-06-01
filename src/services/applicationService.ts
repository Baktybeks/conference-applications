// src/services/applicationService.ts

import { ID, Query } from "appwrite";
import { databases } from "./appwriteClient";
import { appwriteConfig } from "@/constants/appwriteConfig";
import {
  ConferenceApplication,
  ApplicationWithDetails,
  CreateApplicationDto,
  UpdateApplicationDto,
  ApplicationFilters,
  ApplicationStatus,
  User,
  Conference,
} from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const applicationApi = {
  // === ЗАЯВКИ ===

  // Получить все заявки с фильтрацией
  getApplications: async (
    filters?: ApplicationFilters
  ): Promise<ConferenceApplication[]> => {
    try {
      const queries: string[] = [Query.orderDesc("$createdAt")];

      if (filters?.status?.length) {
        queries.push(Query.equal("status", filters.status));
      }
      if (filters?.conferenceId) {
        queries.push(Query.equal("conferenceId", filters.conferenceId));
      }
      if (filters?.participantId) {
        queries.push(Query.equal("participantId", filters.participantId));
      }
      if (filters?.assignedReviewerId) {
        queries.push(Query.equal("assignedReviewerId", filters.assignedReviewerId));
      }
      if (filters?.hasPresentation !== undefined) {
        queries.push(Query.equal("hasPresentation", filters.hasPresentation));
      }
      if (filters?.presentationType?.length) {
        queries.push(Query.equal("presentationType", filters.presentationType));
      }
      if (filters?.dateFrom) {
        queries.push(Query.greaterThanEqual("$createdAt", filters.dateFrom));
      }
      if (filters?.dateTo) {
        queries.push(Query.lessThanEqual("$createdAt", filters.dateTo));
      }

      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.applications,
        queries
      );

      let applications = response.documents as unknown as ConferenceApplication[];

      // Фильтрация по поисковому запросу (клиентская сторона)
      if (filters?.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        applications = applications.filter(
          (application) =>
            application.fullName.toLowerCase().includes(searchLower) ||
            application.organization.toLowerCase().includes(searchLower) ||
            (application.presentationTitle &&
              application.presentationTitle.toLowerCase().includes(searchLower)) ||
            (application.email && application.email.toLowerCase().includes(searchLower))
        );
      }

      return applications;
    } catch (error) {
      console.error("Ошибка при получении заявок:", error);
      return [];
    }
  },

  // Получить заявку по ID с дополнительной информацией
  getApplicationById: async (
    id: string
  ): Promise<ApplicationWithDetails | null> => {
    try {
      const application = (await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.applications,
        id
      )) as unknown as ConferenceApplication;

      // Получаем информацию об участнике
      const participant = (await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        application.participantId
      )) as unknown as User;

      // Получаем информацию о конференции
      const conference = (await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.conferences,
        application.conferenceId
      )) as unknown as Conference;

      // Получаем информацию о рецензенте (если назначен)
      let assignedReviewer: User | undefined;
      if (application.assignedReviewerId) {
        try {
          assignedReviewer = (await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.users,
            application.assignedReviewerId
          )) as unknown as User;
        } catch (error) {
          console.warn("Не удалось получить данные рецензента:", error);
        }
      }

      // Получаем комментарии к заявке
      const commentsResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.applicationComments,
        [Query.equal("applicationId", id), Query.orderDesc("$createdAt")]
      );

      // Получаем историю изменений
      const historyResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.applicationHistory,
        [Query.equal("applicationId", id), Query.orderDesc("$createdAt")]
      );

      return {
        ...application,
        participant,
        conference,
        assignedReviewer,
        comments: commentsResponse.documents as any[],
        history: historyResponse.documents as any[],
      };
    } catch (error) {
      console.error("Ошибка при получении заявки:", error);
      return null;
    }
  },

  // Создать новую заявку
  createApplication: async (
    data: CreateApplicationDto,
    participantId: string,
    isDraft = false
  ): Promise<ConferenceApplication> => {
    try {
      const applicationData = {
        ...data,
        participantId,
        status: isDraft ? ApplicationStatus.DRAFT : ApplicationStatus.SUBMITTED,
        createdAt: new Date().toISOString(),
      };

      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.applications,
        ID.unique(),
        applicationData
      );

      // Добавляем запись в историю
      await applicationApi.addHistoryEntry(
        response.$id,
        participantId,
        "created",
        null,
        isDraft ? ApplicationStatus.DRAFT : ApplicationStatus.SUBMITTED,
        isDraft ? "Заявка создана как черновик" : "Заявка подана на рассмотрение"
      );

      return response as unknown as ConferenceApplication;
    } catch (error) {
      console.error("Ошибка при создании заявки:", error);
      throw error;
    }
  },

  // Обновить заявку
  updateApplication: async (
    id: string,
    data: UpdateApplicationDto,
    userId: string
  ): Promise<ConferenceApplication> => {
    try {
      // Получаем текущую заявку для сравнения
      const currentApplication = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.applications,
        id
      );

      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.applications,
        id,
        data
      );

      // Добавляем запись в историю при изменении статуса
      if (data.status && data.status !== currentApplication.status) {
        await applicationApi.addHistoryEntry(
          id,
          userId,
          "status_changed",
          currentApplication.status,
          data.status,
          `Статус изменен с "${currentApplication.status}" на "${data.status}"`
        );
      }

      // Добавляем запись в историю при назначении рецензента
      if (data.assignedReviewerId && data.assignedReviewerId !== currentApplication.assignedReviewerId) {
        await applicationApi.addHistoryEntry(
          id,
          userId,
          "reviewer_assigned",
          currentApplication.assignedReviewerId || null,
          data.assignedReviewerId,
          "Назначен рецензент"
        );
      }

      return response as unknown as ConferenceApplication;
    } catch (error) {
      console.error("Ошибка при обновлении заявки:", error);
      throw error;
    }
  },

  // Удалить заявку
  deleteApplication: async (id: string): Promise<boolean> => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.applications,
        id
      );
      return true;
    } catch (error) {
      console.error("Ошибка при удалении заявки:", error);
      throw error;
    }
  },

  // Изменить статус заявки
  updateApplicationStatus: async (
    id: string,
    status: ApplicationStatus,
    userId: string,
    comments?: string
  ): Promise<ConferenceApplication> => {
    try {
      const updateData: UpdateApplicationDto = { status };
      
      if (comments) {
        updateData.reviewerComments = comments;
        updateData.reviewDate = new Date().toISOString();
      }

      return await applicationApi.updateApplication(id, updateData, userId);
    } catch (error) {
      console.error("Ошибка при изменении статуса заявки:", error);
      throw error;
    }
  },

  // Назначить рецензента
  assignReviewer: async (
    applicationId: string,
    reviewerId: string,
    userId: string
  ): Promise<ConferenceApplication> => {
    try {
      return await applicationApi.updateApplication(
        applicationId,
        { assignedReviewerId: reviewerId },
        userId
      );
    } catch (error) {
      console.error("Ошибка при назначении рецензента:", error);
      throw error;
    }
  },

  // Добавить комментарий к заявке
  addComment: async (
    applicationId: string,
    authorId: string,
    text: string,
    isInternal = false
  ): Promise<any> => {
    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.applicationComments,
        ID.unique(),
        {
          applicationId,
          authorId,
          text,
          isInternal,
          createdAt: new Date().toISOString(),
        }
      );

      // Добавляем запись в историю
      await applicationApi.addHistoryEntry(
        applicationId,
        authorId,
        "comment_added",
        null,
        null,
        isInternal ? "Добавлен внутренний комментарий" : "Добавлен комментарий"
      );

      return response;
    } catch (error) {
      console.error("Ошибка при добавлении комментария:", error);
      throw error;
    }
  },

  // Добавить запись в историю
  addHistoryEntry: async (
    applicationId: string,
    userId: string,
    action: string,
    oldValue?: string | null,
    newValue?: string | null,
    description?: string
  ): Promise<any> => {
    try {
      return await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.applicationHistory,
        ID.unique(),
        {
          applicationId,
          userId,
          action,
          oldValue: oldValue || null,
          newValue: newValue || null,
          description: description || `Действие: ${action}`,
          createdAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error("Ошибка при добавлении записи в историю:", error);
      // Не блокируем основную операцию при ошибке логирования
    }
  },

  // Получить заявки для конкретной конференции
  getApplicationsByConference: async (
    conferenceId: string
  ): Promise<ConferenceApplication[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.applications,
        [Query.equal("conferenceId", conferenceId), Query.orderDesc("$createdAt")]
      );

      return response.documents as unknown as ConferenceApplication[];
    } catch (error) {
      console.error("Ошибка при получении заявок конференции:", error);
      return [];
    }
  },

  // Получить заявки конкретного участника
  getApplicationsByParticipant: async (
    participantId: string
  ): Promise<ConferenceApplication[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.applications,
        [Query.equal("participantId", participantId), Query.orderDesc("$createdAt")]
      );

      return response.documents as unknown as ConferenceApplication[];
    } catch (error) {
      console.error("Ошибка при получении заявок участника:", error);
      return [];
    }
  },

  // Получить заявки, назначенные рецензенту
  getApplicationsByReviewer: async (
    reviewerId: string
  ): Promise<ConferenceApplication[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.applications,
        [Query.equal("assignedReviewerId", reviewerId), Query.orderDesc("$createdAt")]
      );

      return response.documents as unknown as ConferenceApplication[];
    } catch (error) {
      console.error("Ошибка при получении заявок рецензента:", error);
      return [];
    }
  },

  // Отметить участие
  markAttendance: async (
    applicationId: string,
    attended: boolean,
    userId: string
  ): Promise<ConferenceApplication> => {
    try {
      return await applicationApi.updateApplication(
        applicationId,
        { attended },
        userId
      );
    } catch (error) {
      console.error("Ошибка при отметке участия:", error);
      throw error;
    }
  },

  // Выдать сертификат
  issueCertificate: async (
    applicationId: string,
    certificateUrl: string,
    userId: string
  ): Promise<ConferenceApplication> => {
    try {
      return await applicationApi.updateApplication(
        applicationId,
        {
          certificateIssued: true,
          certificateUrl,
        },
        userId
      );
    } catch (error) {
      console.error("Ошибка при выдаче сертификата:", error);
      throw error;
    }
  },

  // Статистика заявок
  getApplicationStats: async (filters?: {
    conferenceId?: string;
    participantId?: string;
    organizerId?: string;
  }) => {
    try {
      let applications = await applicationApi.getApplications();

      // Фильтрация по конференции
      if (filters?.conferenceId) {
        applications = applications.filter(
          (app) => app.conferenceId === filters.conferenceId
        );
      }

      // Фильтрация по участнику
      if (filters?.participantId) {
        applications = applications.filter(
          (app) => app.participantId === filters.participantId
        );
      }

      // Фильтрация по организатору (требует дополнительный запрос)
      if (filters?.organizerId) {
        // Получаем конференции организатора
        const conferencesResponse = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.collections.conferences,
          [Query.equal("organizerId", filters.organizerId)]
        );
        
        const conferenceIds = conferencesResponse.documents.map((c) => c.$id);
        applications = applications.filter((app) =>
          conferenceIds.includes(app.conferenceId)
        );
      }

      const stats = {
        total: applications.length,
        byStatus: applications.reduce((acc, app) => {
          acc[app.status] = (acc[app.status] || 0) + 1;
          return acc;
        }, {} as Record<ApplicationStatus, number>),
        withPresentation: applications.filter((app) => app.hasPresentation).length,
        attended: applications.filter((app) => app.attended).length,
        certificatesIssued: applications.filter((app) => app.certificateIssued).length,
      };

      return stats;
    } catch (error) {
      console.error("Ошибка при получении статистики заявок:", error);
      return {
        total: 0,
        byStatus: {} as Record<ApplicationStatus, number>,
        withPresentation: 0,
        attended: 0,
        certificatesIssued: 0,
      };
    }
  },
};

// React Query ключи
export const applicationKeys = {
  all: ["applications"] as const,
  lists: () => [...applicationKeys.all, "list"] as const,
  list: (filters?: ApplicationFilters) =>
    [...applicationKeys.lists(), filters] as const,
  details: () => [...applicationKeys.all, "detail"] as const,
  detail: (id: string) => [...applicationKeys.details(), id] as const,
  byConference: (conferenceId: string) =>
    [...applicationKeys.all, "conference", conferenceId] as const,
  byParticipant: (participantId: string) =>
    [...applicationKeys.all, "participant", participantId] as const,
  byReviewer: (reviewerId: string) =>
    [...applicationKeys.all, "reviewer", reviewerId] as const,
  stats: (filters?: { conferenceId?: string; participantId?: string; organizerId?: string }) =>
    [...applicationKeys.all, "stats", filters] as const,
};

// React Query хуки

// Получение заявок с фильтрацией
export const useApplications = (filters?: ApplicationFilters) => {
  return useQuery({
    queryKey: applicationKeys.list(filters),
    queryFn: () => applicationApi.getApplications(filters),
    staleTime: 1000 * 60 * 2, // 2 минуты
  });
};

// Получение конкретной заявки
export const useApplication = (id: string) => {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: () => applicationApi.getApplicationById(id),
    staleTime: 1000 * 60 * 1, // 1 минута
    enabled: !!id,
  });
};

// Создание заявки
export const useCreateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      participantId,
      isDraft,
    }: {
      data: CreateApplicationDto;
      participantId: string;
      isDraft?: boolean;
    }) => applicationApi.createApplication(data, participantId, isDraft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
};

// Обновление заявки
export const useUpdateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
      userId,
    }: {
      id: string;
      data: UpdateApplicationDto;