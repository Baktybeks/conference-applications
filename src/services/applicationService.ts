// src/services/applicationService.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createApplication,
  updateApplication,
  updateApplicationStatus,
  getApplications,
  getUserById,
} from "@/services/appwriteService";
import {
  ConferenceApplication,
  ApplicationStatus,
  PresentationType,
  ApplicationFilters,
  CreateApplicationDto,
  UpdateApplicationDto,
} from "@/types";
import { toast } from "react-toastify";

// ИСПРАВЛЕНИЕ: Используем CreateApplicationDto вместо CreateApplicationData
export interface CreateApplicationParams {
  data: CreateApplicationDto;
  participantId: string;
  isDraft: boolean;
}

// ИСПРАВЛЕНИЕ: Используем UpdateApplicationDto вместо UpdateApplicationData
export interface UpdateApplicationParams {
  applicationId: string;
  data: UpdateApplicationDto;
}

// Хук для создания заявки
export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      participantId,
      isDraft,
    }: CreateApplicationParams) => {
      // ИСПРАВЛЕНИЕ: Правильно формируем объект заявки
      const applicationData: Omit<ConferenceApplication, "$id" | "$updatedAt"> =
        {
          // Поля из CreateApplicationDto
          conferenceId: data.conferenceId,
          fullName: data.fullName,
          organization: data.organization,
          position: data.position || "",
          email: data.email,
          phone: data.phone || "",
          hasPresentation: data.hasPresentation,
          presentationType: data.presentationType,
          presentationTitle: data.presentationTitle || "",
          abstract: data.abstract || "",
          keywords: data.keywords || [],
          dietaryRestrictions: data.dietaryRestrictions || "",
          accessibilityNeeds: data.accessibilityNeeds || "",
          accommodationNeeded: data.accommodationNeeded || false,

          // Поля, добавляемые сервисом
          participantId,
          status: isDraft
            ? ApplicationStatus.DRAFT
            : ApplicationStatus.SUBMITTED,
          attended: false,
          $createdAt: new Date().toISOString(),
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
    mutationFn: async ({ applicationId, data }: UpdateApplicationParams) => {
      return await updateApplication(applicationId, data);
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

// Хук для подачи заявки (изменение статуса с DRAFT на SUBMITTED)
export function useSubmitApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (applicationId: string) => {
      return await updateApplicationStatus(
        applicationId,
        ApplicationStatus.SUBMITTED
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["application", data?.$id] });

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
        | ApplicationStatus.WAITLIST
        | ApplicationStatus.UNDER_REVIEW;
      comments?: string;
    }) => {
      console.log("Рецензирование заявки:", applicationId, status, comments);

      return await updateApplicationStatus(applicationId, status, comments);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["application", data?.$id] });
      queryClient.invalidateQueries({ queryKey: ["application-stats"] });

      const statusText = {
        [ApplicationStatus.DRAFT]: "сохранена как черновик",
        [ApplicationStatus.SUBMITTED]: "подана на рассмотрение",
        [ApplicationStatus.UNDER_REVIEW]: "отправлена на рассмотрение",
        [ApplicationStatus.ACCEPTED]: "принята",
        [ApplicationStatus.REJECTED]: "отклонена",
        [ApplicationStatus.WAITLIST]: "добавлена в список ожидания",
      }[data?.status as ApplicationStatus];

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
