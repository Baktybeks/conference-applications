// src/services/appwriteService.ts - ФУНКЦИОНАЛЬНАЯ ВЕРСИЯ

import { Client, Account, Databases, ID, Query } from "appwrite";
import { appwriteConfig } from "@/constants/appwriteConfig";
import { User, UserRole, Conference, Application } from "@/types";

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
    website: doc.website || "",
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
    website: doc.website || "",
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

// ИСПРАВЛЕННАЯ функция создания аккаунта
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

// ИСПРАВЛЕННАЯ функция создания документа пользователя
export const createUserDocument = async (
  userId: string,
  userData: Omit<User, "$id" | "$createdAt" | "$updatedAt">
) => {
  try {
    // ИСПРАВЛЕНИЕ: Убеждаемся, что createdAt передается
    const documentData = {
      ...userData,
      createdAt: userData.createdAt || new Date().toISOString(), // Гарантируем наличие createdAt
    };

    const response = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.users,
      userId, // Используем userId из Auth как ID документа
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
    // Если пользователь не авторизован, это нормально
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

// ИСПРАВЛЕННАЯ функция обновления документа пользователя
export const updateUserDocument = async (
  userId: string,
  updates: Partial<User>
): Promise<User | null> => {
  try {
    // Удаляем системные поля, которые нельзя обновлять
    const { $id, $createdAt, $updatedAt, ...updateData } = updates;

    const response = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.users,
      userId,
      updateData
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
    // Игнорируем ошибки выхода, так как пользователь может быть уже не авторизован
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
    // ИСПРАВЛЕНИЕ: Добавляем createdAt
    const dataWithCreatedAt = {
      ...conferenceData,
      createdAt: conferenceData.createdAt || new Date().toISOString(),
    };

    const response = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.conferences,
      ID.unique(),
      dataWithCreatedAt
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

// Создание заявки
export const createApplication = async (
  applicationData: Omit<Application, "$id" | "$createdAt" | "$updatedAt">
) => {
  try {
    // ИСПРАВЛЕНИЕ: Добавляем createdAt
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

// Экспорт объекта с функциями для обратной совместимости
export const appwriteService = {
  createAccount,
  createUserDocument,
  createSession,
  getCurrentUser,
  getUserById,
  updateUserDocument,
  logout,
  getUsers,
  toggleUserActivation,
  updateUserRole,
  createConference,
  getConferences,
  createApplication,
  getApplications,
};

// Экспорт по умолчанию
export default appwriteService;

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
    // Удаляем системные поля, которые нельзя обновлять
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

    // Для организатора нужно получить заявки из всех его конференций
    if (filters?.organizerId) {
      const organizerConferences = await getConferences([
        Query.equal("organizerId", filters.organizerId),
      ]);
      const conferenceIds = organizerConferences.map((conf) => conf.$id);

      if (conferenceIds.length > 0) {
        queries.push(Query.equal("conferenceId", conferenceIds));
      } else {
        // Если у организатора нет конференций, возвращаем пустую статистику
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

// Обновляем экспорт объекта appwriteService
export const appwriteService = {
  // ... существующие методы
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
  createApplication,

  // Новые методы для заявок
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
