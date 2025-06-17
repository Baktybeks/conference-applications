// src/services/applicationService.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createApplication,
  updateApplication,
  getApplications,
  getUserById,
} from "@/services/appwriteService";
import {
  ConferenceApplication,
  ApplicationStatus,
  PresentationType,
  ApplicationFilters,
} from "@/types";
import { toast } from "react-toastify";

// Типы для создания и обновления заявок
export interface CreateApplicationData {
  conferenceId: string;
  participantId: string;
  fullName: string;
  organization: string;
  position?: string;
  email: string;
  phone?: string;
  hasPresentation: boolean;
  presentationType?: PresentationType;
  presentationTitle?: string;
  abstract?: string;
  keywords?: string[];
  dietaryRestrictions?: string;
  accessibilityNeeds?: string;
  accommodationNeeded?: boolean;
}

export interface UpdateApplicationData extends Partial<CreateApplicationData> {
  status?: ApplicationStatus;
  reviewerComments?: string;
  assignedReviewerId?: string;
}

// Хук для создания заявки
export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateApplicationData) => {
      const applicationData: Omit<
        ConferenceApplication,
        "$id" | "$createdAt" | "$updatedAt"
      > = {
        ...data,
        status: ApplicationStatus.DRAFT,
        keywords: data.keywords || [],
        dietaryRestrictions: data.dietaryRestrictions || "",
        accessibilityNeeds: data.accessibilityNeeds || "",
        accommodationNeeded: data.accommodationNeeded || false,
        presentationTitle: data.presentationTitle || "",
        abstract: data.abstract || "",
        reviewerComments: "",
        attended: false,
        certificateIssued: false,
        certificateUrl: "",
        createdAt: new Date().toISOString(),
      };

      return await createApplication(applicationData);
    },
    onSuccess: (data) => {
      // Инвалидируем кеш для обновления списков заявок
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({
        queryKey: ["applications", data.participantId],
      });
      queryClient.invalidateQueries({
        queryKey: ["applications", data.conferenceId],
      });

      toast.success("Заявка успешно создана!");
    },
    onError: (error: any) => {
      console.error("Ошибка создания заявки:", error);
      toast.error(
        `Ошибка при создании заявки: ${error.message || "Неизвестная ошибка"}`
      );
    },
  });
}

// Хук для обновления заявки
export function useUpdateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
      data,
    }: {
      applicationId: string;
      data: UpdateApplicationData;
    }) => {
      // TODO: Реализовать updateApplication в appwriteService
      // Пока используем заглушку
      console.log("Обновление заявки:", applicationId, data);

      // Имитация обновления
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        $id: applicationId,
        ...data,
        $updatedAt: new Date().toISOString(),
      };
    },
    onSuccess: (data, variables) => {
      // Инвалидируем кеш
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({
        queryKey: ["application", variables.applicationId],
      });

      toast.success("Заявка успешно обновлена!");
    },
    onError: (error: any) => {
      console.error("Ошибка обновления заявки:", error);
      toast.error(
        `Ошибка при обновлении заявки: ${error.message || "Неизвестная ошибка"}`
      );
    },
  });
}

// Хук для получения списка заявок
export function useApplications(filters?: ApplicationFilters) {
  return useQuery({
    queryKey: ["applications", filters],
    queryFn: async () => {
      // TODO: Передать фильтры в getApplications
      const applications = await getApplications();

      // Применяем фильтры на клиенте (временно)
      if (!filters) return applications;

      return applications.filter((app) => {
        if (
          filters.participantId &&
          app.participantId !== filters.participantId
        ) {
          return false;
        }
        if (filters.conferenceId && app.conferenceId !== filters.conferenceId) {
          return false;
        }
        if (filters.status && app.status !== filters.status) {
          return false;
        }
        if (
          filters.assignedReviewerId &&
          app.assignedReviewerId !== filters.assignedReviewerId
        ) {
          return false;
        }
        if (
          filters.hasPresentation !== undefined &&
          app.hasPresentation !== filters.hasPresentation
        ) {
          return false;
        }
        return true;
      });
    },
    staleTime: 1000 * 60 * 5, // 5 минут
  });
}

// Хук для получения конкретной заявки
export function useApplication(applicationId: string) {
  return useQuery({
    queryKey: ["application", applicationId],
    queryFn: async () => {
      // TODO: Реализовать getApplicationById в appwriteService
      const applications = await getApplications();
      const application = applications.find((app) => app.$id === applicationId);

      if (!application) {
        throw new Error("Заявка не найдена");
      }

      return application;
    },
    enabled: !!applicationId,
  });
}

// Хук для получения заявок участника
export function useParticipantApplications(participantId: string) {
  return useApplications({ participantId });
}

// Хук для получения заявок конференции
export function useConferenceApplications(conferenceId: string) {
  return useApplications({ conferenceId });
}

// Хук для получения заявок рецензента
export function useReviewerApplications(reviewerId: string) {
  return useApplications({ assignedReviewerId: reviewerId });
}

// Хук для подачи заявки (изменение статуса с DRAFT на SUBMITTED)
export function useSubmitApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (applicationId: string) => {
      // TODO: Реализовать в appwriteService
      console.log("Подача заявки:", applicationId);

      // Имитация подачи заявки
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        $id: applicationId,
        status: ApplicationStatus.SUBMITTED,
        $updatedAt: new Date().toISOString(),
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["application", data.$id] });

      toast.success("Заявка успешно подана на рассмотрение!");
    },
    onError: (error: any) => {
      console.error("Ошибка подачи заявки:", error);
      toast.error(
        `Ошибка при подаче заявки: ${error.message || "Неизвестная ошибка"}`
      );
    },
  });
}

// Хук для принятия/отклонения заявки (для организаторов)
export function useReviewApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
      status,
      comments,
    }: {
      applicationId: string;
      status:
        | ApplicationStatus.ACCEPTED
        | ApplicationStatus.REJECTED
        | ApplicationStatus.WAITLIST;
      comments?: string;
    }) => {
      // TODO: Реализовать в appwriteService
      console.log("Рецензирование заявки:", applicationId, status, comments);

      // Имитация рецензирования
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        $id: applicationId,
        status,
        reviewerComments: comments || "",
        reviewDate: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["application", data.$id] });

      const statusText = {
        [ApplicationStatus.ACCEPTED]: "принята",
        [ApplicationStatus.REJECTED]: "отклонена",
        [ApplicationStatus.WAITLIST]: "добавлена в список ожидания",
      }[data.status];

      toast.success(`Заявка ${statusText}!`);
    },
    onError: (error: any) => {
      console.error("Ошибка рецензирования заявки:", error);
      toast.error(
        `Ошибка при рецензировании: ${error.message || "Неизвестная ошибка"}`
      );
    },
  });
}

// Хук для удаления заявки
export function useDeleteApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (applicationId: string) => {
      // TODO: Реализовать deleteApplication в appwriteService
      console.log("Удаление заявки:", applicationId);

      // Имитация удаления
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return applicationId;
    },
    onSuccess: (applicationId) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.removeQueries({ queryKey: ["application", applicationId] });

      toast.success("Заявка успешно удалена!");
    },
    onError: (error: any) => {
      console.error("Ошибка удаления заявки:", error);
      toast.error(
        `Ошибка при удалении заявки: ${error.message || "Неизвестная ошибка"}`
      );
    },
  });
}

// Вспомогательная функция для получения статистики заявок
export function useApplicationStats(filters?: ApplicationFilters) {
  return useQuery({
    queryKey: ["application-stats", filters],
    queryFn: async () => {
      const applications = await getApplications();

      // Применяем фильтры
      const filteredApps = applications.filter((app) => {
        if (!filters) return true;

        if (
          filters.participantId &&
          app.participantId !== filters.participantId
        ) {
          return false;
        }
        if (filters.conferenceId && app.conferenceId !== filters.conferenceId) {
          return false;
        }
        if (
          filters.assignedReviewerId &&
          app.assignedReviewerId !== filters.assignedReviewerId
        ) {
          return false;
        }

        return true;
      });

      // Подсчитываем статистику
      const stats = {
        total: filteredApps.length,
        draft: filteredApps.filter(
          (app) => app.status === ApplicationStatus.DRAFT
        ).length,
        submitted: filteredApps.filter(
          (app) => app.status === ApplicationStatus.SUBMITTED
        ).length,
        underReview: filteredApps.filter(
          (app) => app.status === ApplicationStatus.UNDER_REVIEW
        ).length,
        accepted: filteredApps.filter(
          (app) => app.status === ApplicationStatus.ACCEPTED
        ).length,
        rejected: filteredApps.filter(
          (app) => app.status === ApplicationStatus.REJECTED
        ).length,
        waitlist: filteredApps.filter(
          (app) => app.status === ApplicationStatus.WAITLIST
        ).length,
        withPresentation: filteredApps.filter((app) => app.hasPresentation)
          .length,
        withoutPresentation: filteredApps.filter((app) => !app.hasPresentation)
          .length,
      };

      return stats;
    },
    staleTime: 1000 * 60 * 5, // 5 минут
  });
}
