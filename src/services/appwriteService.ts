// src/services/appwriteService.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ

import { Client, Account, Databases, ID, Query } from "appwrite";
import { appwriteConfig } from "@/constants/appwriteConfig";
import {
  User,
  UserRole,
  Conference,
  Application,
  ApplicationStatus,
} from "@/types";

// Создание клиента Appwrite
const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

const account = new Account(client);
const databases = new Databases(client);

// Вспомогательные функции маппинга
const mapUserDocument = (doc: any): User => {
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
    name: doc.name,
    email: doc.email,
    role: doc.role as UserRole,
    isActive: doc.isActive,
    organization: doc.organization || "",
    position: doc.position || "",
    bio: doc.bio || "",
    phone: doc.phone || "",
    orcid: doc.orcid || "",
    website: doc.website || "", // Fallback для отсутствующего поля
    createdAt: doc.createdAt,
  };
};

const mapConferenceDocument = (doc: any): Conference => {
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
    title: doc.title,
    description: doc.description,
    theme: doc.theme,
    startDate: doc.startDate,
    endDate: doc.endDate,
    submissionDeadline: doc.submissionDeadline,
    location: doc.location,
    participationType: doc.participationType,
    organizerId: doc.organizerId,
    contactEmail: doc.contactEmail,
    website: doc.website || "", // Fallback для отсутствующего поля
    maxParticipants: doc.maxParticipants,
    registrationFee: doc.registrationFee || 0,
    isPublished: doc.isPublished,
    requirements: doc.requirements || "",
    tags: doc.tags || [],
    createdAt: doc.createdAt,
  };
};

const mapApplicationDocument = (doc: any): Application => {
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
    conferenceId: doc.conferenceId,
    participantId: doc.participantId,
    status: doc.status,
    fullName: doc.fullName,
    organization: doc.organization,
    position: doc.position || "",
    email: doc.email,
    phone: doc.phone || "",
    hasPresentation: doc.hasPresentation,
    presentationType: doc.presentationType,
    presentationTitle: doc.presentationTitle || "",
    abstract: doc.abstract || "",
    keywords: doc.keywords || [],
    dietaryRestrictions: doc.dietaryRestrictions || "",
    accessibilityNeeds: doc.accessibilityNeeds || "",
    accommodationNeeded: doc.accommodationNeeded,
    assignedReviewerId: doc.assignedReviewerId,
    reviewerComments: doc.reviewerComments || "",
    reviewDate: doc.reviewDate,
    attended: doc.attended,
    certificateIssued: doc.certificateIssued,
    certificateUrl: doc.certificateUrl || "",
    createdAt: doc.createdAt,
  };
};

// Функция создания аккаунта
export const createAccount = async (
  name: string,
  email: string,
  password: string
) => {
  try {
    const response = await account.create(ID.unique(), email, password, name);
    return response;
  } catch (error: any) {
    console.error("Ошибка создания аккаунта:", error);

    if (error.code === 409 || error.message?.includes("already exists")) {
      throw new Error("Пользователь с таким email уже существует");
    }

    throw new Error(error.message || "Ошибка при создании аккаунта");
  }
};

// Вспомогательная функция для валидации и очистки URL
const validateAndCleanUrl = (url?: string): string | undefined => {
  if (!url || url.trim() === "") return undefined;

  const cleanUrl = url.trim();

  // Если URL не начинается с http:// или https://, добавляем https://
  if (cleanUrl && !cleanUrl.match(/^https?:\/\//)) {
    return `https://${cleanUrl}`;
  }

  // Проверяем валидность URL
  try {
    new URL(cleanUrl);
    return cleanUrl;
  } catch {
    return undefined;
  }
};

// Функция очистки данных от пустых URL полей
const cleanDocumentData = (data: any) => {
  const cleaned = { ...data };

  // Очищаем website поле, если оно пустое или невалидное
  if (cleaned.website !== undefined) {
    const validWebsite = validateAndCleanUrl(cleaned.website);
    if (validWebsite) {
      cleaned.website = validWebsite;
    } else {
      delete cleaned.website; // Удаляем поле, если URL невалидный
    }
  }

  return cleaned;
};

// Функция создания документа пользователя
export const createUserDocument = async (
  userId: string,
  userData: Omit<User, "$id" | "$createdAt" | "$updatedAt">
) => {
  try {
    const documentData = cleanDocumentData({
      ...userData,
      createdAt: userData.createdAt || new Date().toISOString(),
    });

    const response = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.users,
      userId,
      documentData
    );

    return mapUserDocument(response);
  } catch (error: any) {
    console.error("Ошибка создания документа пользователя:", error);

    if (error.code === 409) {
      throw new Error("Пользователь с таким ID уже существует");
    }

    throw new Error(
      error.message || "Ошибка при создании профиля пользователя"
    );
  }
};

// Создание сессии (вход)
export const createSession = async (email: string, password: string) => {
  try {
    const response = await account.createEmailPasswordSession(email, password);
    return response;
  } catch (error: any) {
    console.error("Ошибка создания сессии:", error);

    if (error.code === 401) {
      throw new Error("Неверный email или пароль");
    }

    throw new Error(error.message || "Ошибка при входе в систему");
  }
};

// Получение текущего пользователя из Auth
export const getCurrentUser = async () => {
  try {
    const response = await account.get();
    return response;
  } catch (error: any) {
    if (error.code === 401) {
      return null;
    }
    console.error("Ошибка получения текущего пользователя:", error);
    return null;
  }
};

// Получение документа пользователя по ID
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const response = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.users,
      userId
    );

    return mapUserDocument(response);
  } catch (error: any) {
    console.error("Ошибка получения пользователя:", error);

    if (error.code === 404) {
      return null;
    }

    throw new Error(
      error.message || "Ошибка при получении данных пользователя"
    );
  }
};

// Функция обновления документа пользователя
export const updateUserDocument = async (
  userId: string,
  updates: Partial<User>
): Promise<User | null> => {
  try {
    const { $id, $createdAt, $updatedAt, ...updateData } = updates;

    // Очищаем данные от невалидных URL
    const cleanedData = cleanDocumentData(updateData);

    const response = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.users,
      userId,
      cleanedData
    );

    return mapUserDocument(response);
  } catch (error: any) {
    console.error("Ошибка обновления пользователя:", error);
    throw new Error(error.message || "Ошибка при обновлении профиля");
  }
};

// Выход из системы
export const logout = async () => {
  try {
    await account.deleteSession("current");
  } catch (error: any) {
    console.error("Ошибка при выходе:", error);
  }
};

// Удаление аккаунта
export const deleteAccount = async () => {
  try {
    // Сначала удаляем все сессии
    await account.deleteSessions();
    // Затем удаляем аккаунт
    // Примечание: В Appwrite удаление аккаунта возможно только через админский API
    // Здесь можно реализовать пометку аккаунта как удаленного
  } catch (error: any) {
    console.error("Ошибка при удалении аккаунта:", error);
    throw new Error(error.message || "Ошибка при удалении аккаунта");
  }
};

// Получение списка пользователей (только для администраторов)
export const getUsers = async (queries: string[] = []): Promise<User[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.collections.users,
      queries
    );

    return response.documents.map(mapUserDocument);
  } catch (error: any) {
    console.error("Ошибка получения списка пользователей:", error);
    throw new Error(
      error.message || "Ошибка при получении списка пользователей"
    );
  }
};

// Активация/деактивация пользователя
export const toggleUserActivation = async (
  userId: string,
  isActive: boolean
): Promise<User | null> => {
  return updateUserDocument(userId, { isActive });
};

// Обновление роли пользователя
export const updateUserRole = async (
  userId: string,
  role: UserRole
): Promise<User | null> => {
  return updateUserDocument(userId, { role });
};

// Создание конференции
export const createConference = async (
  conferenceData: Omit<Conference, "$id" | "$createdAt" | "$updatedAt">
) => {
  try {
    const dataWithCreatedAt = {
      ...conferenceData,
      createdAt: conferenceData.createdAt || new Date().toISOString(),
    };

    // Очищаем данные от невалидных URL
    const cleanedData = cleanDocumentData(dataWithCreatedAt);

    const response = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.conferences,
      ID.unique(),
      cleanedData
    );

    return mapConferenceDocument(response);
  } catch (error: any) {
    console.error("Ошибка создания конференции:", error);
    throw new Error(error.message || "Ошибка при создании конференции");
  }
};

// Получение конференций
export const getConferences = async (
  queries: string[] = []
): Promise<Conference[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.collections.conferences,
      queries
    );

    return response.documents.map(mapConferenceDocument);
  } catch (error: any) {
    console.error("Ошибка получения конференций:", error);
    throw new Error(error.message || "Ошибка при получении конференций");
  }
};

// ДОБАВЛЕНО: Обновление конференции
export const updateConference = async (
  conferenceId: string,
  updates: Partial<Conference>
): Promise<Conference | null> => {
  try {
    const { $id, $createdAt, $updatedAt, ...updateData } = updates;

    // Очищаем данные от невалидных URL
    const cleanedData = cleanDocumentData(updateData);

    const response = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.conferences,
      conferenceId,
      cleanedData
    );

    return mapConferenceDocument(response);
  } catch (error: any) {
    console.error("Ошибка обновления конференции:", error);
    throw new Error(error.message || "Ошибка при обновлении конференции");
  }
};

// ДОБАВЛЕНО: Получение конкретной конференции по ID
export const getConferenceById = async (
  conferenceId: string
): Promise<Conference | null> => {
  try {
    const response = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.conferences,
      conferenceId
    );

    return mapConferenceDocument(response);
  } catch (error: any) {
    console.error("Ошибка получения конференции:", error);

    if (error.code === 404) {
      return null;
    }

    throw new Error(error.message || "Ошибка при получении конференции");
  }
};

// Создание заявки
export const createApplication = async (
  applicationData: Omit<Application, "$id" | "$createdAt" | "$updatedAt">
) => {
  try {
    const dataWithCreatedAt = {
      ...applicationData,
      createdAt: applicationData.createdAt || new Date().toISOString(),
    };

    const response = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.applications,
      ID.unique(),
      dataWithCreatedAt
    );

    return mapApplicationDocument(response);
  } catch (error: any) {
    console.error("Ошибка создания заявки:", error);
    throw new Error(error.message || "Ошибка при создании заявки");
  }
};

// Получение заявок
export const getApplications = async (
  queries: string[] = []
): Promise<Application[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.collections.applications,
      queries
    );

    return response.documents.map(mapApplicationDocument);
  } catch (error: any) {
    console.error("Ошибка получения заявок:", error);
    throw new Error(error.message || "Ошибка при получении заявок");
  }
};

// Получение конкретной заявки по ID
export const getApplicationById = async (
  applicationId: string
): Promise<Application | null> => {
  try {
    const response = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.applications,
      applicationId
    );

    return mapApplicationDocument(response);
  } catch (error: any) {
    console.error("Ошибка получения заявки:", error);

    if (error.code === 404) {
      return null;
    }

    throw new Error(error.message || "Ошибка при получении заявки");
  }
};

// Обновление заявки
export const updateApplication = async (
  applicationId: string,
  updates: Partial<Application>
): Promise<Application | null> => {
  try {
    const { $id, $createdAt, $updatedAt, ...updateData } = updates;

    const response = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.applications,
      applicationId,
      updateData
    );

    return mapApplicationDocument(response);
  } catch (error: any) {
    console.error("Ошибка обновления заявки:", error);
    throw new Error(error.message || "Ошибка при обновлении заявки");
  }
};

// Удаление заявки
export const deleteApplication = async (
  applicationId: string
): Promise<void> => {
  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.applications,
      applicationId
    );
  } catch (error: any) {
    console.error("Ошибка удаления заявки:", error);
    throw new Error(error.message || "Ошибка при удалении заявки");
  }
};

// Получение заявок участника
export const getParticipantApplications = async (
  participantId: string
): Promise<Application[]> => {
  return getApplications([Query.equal("participantId", participantId)]);
};

// Получение заявок конференции
export const getConferenceApplications = async (
  conferenceId: string
): Promise<Application[]> => {
  return getApplications([Query.equal("conferenceId", conferenceId)]);
};

// Получение заявок рецензента
export const getReviewerApplications = async (
  reviewerId: string
): Promise<Application[]> => {
  return getApplications([Query.equal("assignedReviewerId", reviewerId)]);
};

// Получение заявок по статусу
export const getApplicationsByStatus = async (
  status: ApplicationStatus
): Promise<Application[]> => {
  return getApplications([Query.equal("status", status)]);
};

// Назначение рецензента заявке
export const assignReviewer = async (
  applicationId: string,
  reviewerId: string
): Promise<Application | null> => {
  return updateApplication(applicationId, {
    assignedReviewerId: reviewerId,
    status: ApplicationStatus.UNDER_REVIEW,
  });
};

// Обновление статуса заявки
export const updateApplicationStatus = async (
  applicationId: string,
  status: ApplicationStatus,
  comments?: string
): Promise<Application | null> => {
  const updates: Partial<Application> = {
    status,
    ...(comments && { reviewerComments: comments }),
    ...(status !== ApplicationStatus.DRAFT && {
      reviewDate: new Date().toISOString(),
    }),
  };

  return updateApplication(applicationId, updates);
};

// Подача заявки (смена статуса с DRAFT на SUBMITTED)
export const submitApplication = async (
  applicationId: string
): Promise<Application | null> => {
  return updateApplicationStatus(applicationId, ApplicationStatus.SUBMITTED);
};

// Принятие заявки
export const acceptApplication = async (
  applicationId: string,
  comments?: string
): Promise<Application | null> => {
  return updateApplicationStatus(
    applicationId,
    ApplicationStatus.ACCEPTED,
    comments
  );
};

// Отклонение заявки
export const rejectApplication = async (
  applicationId: string,
  comments?: string
): Promise<Application | null> => {
  return updateApplicationStatus(
    applicationId,
    ApplicationStatus.REJECTED,
    comments
  );
};

// Добавление в список ожидания
export const waitlistApplication = async (
  applicationId: string,
  comments?: string
): Promise<Application | null> => {
  return updateApplicationStatus(
    applicationId,
    ApplicationStatus.WAITLIST,
    comments
  );
};

// Получение статистики заявок
export const getApplicationStats = async (filters?: {
  conferenceId?: string;
  participantId?: string;
  organizerId?: string;
}) => {
  try {
    let queries: string[] = [];

    if (filters?.conferenceId) {
      queries.push(Query.equal("conferenceId", filters.conferenceId));
    }

    if (filters?.participantId) {
      queries.push(Query.equal("participantId", filters.participantId));
    }

    if (filters?.organizerId) {
      const organizerConferences = await getConferences([
        Query.equal("organizerId", filters.organizerId),
      ]);
      const conferenceIds = organizerConferences.map((conf) => conf.$id);

      if (conferenceIds.length > 0) {
        queries.push(Query.equal("conferenceId", conferenceIds));
      } else {
        return {
          total: 0,
          draft: 0,
          submitted: 0,
          underReview: 0,
          accepted: 0,
          rejected: 0,
          waitlist: 0,
          withPresentation: 0,
          withoutPresentation: 0,
        };
      }
    }

    const applications = await getApplications(queries);

    return {
      total: applications.length,
      draft: applications.filter(
        (app) => app.status === ApplicationStatus.DRAFT
      ).length,
      submitted: applications.filter(
        (app) => app.status === ApplicationStatus.SUBMITTED
      ).length,
      underReview: applications.filter(
        (app) => app.status === ApplicationStatus.UNDER_REVIEW
      ).length,
      accepted: applications.filter(
        (app) => app.status === ApplicationStatus.ACCEPTED
      ).length,
      rejected: applications.filter(
        (app) => app.status === ApplicationStatus.REJECTED
      ).length,
      waitlist: applications.filter(
        (app) => app.status === ApplicationStatus.WAITLIST
      ).length,
      withPresentation: applications.filter((app) => app.hasPresentation)
        .length,
      withoutPresentation: applications.filter((app) => !app.hasPresentation)
        .length,
    };
  } catch (error: any) {
    console.error("Ошибка получения статистики заявок:", error);
    throw new Error(error.message || "Ошибка при получении статистики");
  }
};

// Экспорт объекта с функциями
export const appwriteService = {
  createAccount,
  createUserDocument,
  createSession,
  getCurrentUser,
  getUserById,
  updateUserDocument,
  logout,
  deleteAccount,
  getUsers,
  toggleUserActivation,
  updateUserRole,
  createConference,
  getConferences,
  getConferenceById,
  updateConference,
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  getParticipantApplications,
  getConferenceApplications,
  getReviewerApplications,
  getApplicationsByStatus,
  assignReviewer,
  updateApplicationStatus,
  submitApplication,
  acceptApplication,
  rejectApplication,
  waitlistApplication,
  getApplicationStats,
};

// Экспорт по умолчанию
export default appwriteService;
