// src/constants/appwriteConfig.ts

export const appwriteConfig = {
  endpoint:
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",
  collections: {
    users: process.env.NEXT_PUBLIC_USERS_COLLECTION_ID || "users",
    conferences:
      process.env.NEXT_PUBLIC_CONFERENCES_COLLECTION_ID || "conferences",
    applications:
      process.env.NEXT_PUBLIC_APPLICATIONS_COLLECTION_ID || "applications",
    applicationComments:
      process.env.NEXT_PUBLIC_APPLICATION_COMMENTS_COLLECTION_ID ||
      "application_comments",
    applicationHistory:
      process.env.NEXT_PUBLIC_APPLICATION_HISTORY_COLLECTION_ID ||
      "application_history",
    conferenceSchedule:
      process.env.NEXT_PUBLIC_CONFERENCE_SCHEDULE_COLLECTION_ID ||
      "conference_schedule",
  },
} as const;

// Типы для TypeScript
export type CollectionName = keyof typeof appwriteConfig.collections;

// Валидация переменных окружения
const requiredEnvVars = [
  "NEXT_PUBLIC_APPWRITE_ENDPOINT",
  "NEXT_PUBLIC_APPWRITE_PROJECT_ID",
  "NEXT_PUBLIC_APPWRITE_DATABASE_ID",
  // Collection IDs
  "NEXT_PUBLIC_USERS_COLLECTION_ID",
  "NEXT_PUBLIC_CONFERENCES_COLLECTION_ID",
  "NEXT_PUBLIC_APPLICATIONS_COLLECTION_ID",
  "NEXT_PUBLIC_APPLICATION_COMMENTS_COLLECTION_ID",
  "NEXT_PUBLIC_APPLICATION_HISTORY_COLLECTION_ID",
  "NEXT_PUBLIC_CONFERENCE_SCHEDULE_COLLECTION_ID",
] as const;

// Проверка отсутствующих переменных
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(
    `⚠️ Отсутствуют необходимые переменные окружения: ${missingEnvVars.join(
      ", "
    )}`
  );

  if (process.env.NODE_ENV !== "development") {
    console.error(
      "❌ В production режиме все переменные окружения обязательны!"
    );
  }
}

// Функция для получения ID коллекции с валидацией
export const getCollectionId = (collectionName: CollectionName): string => {
  const id = appwriteConfig.collections[collectionName];
  if (!id) {
    throw new Error(`ID коллекции ${collectionName} не найден в конфигурации`);
  }
  return id;
};

// Вспомогательная функция для проверки конфигурации
export const validateAppwriteConfig = (): boolean => {
  const { endpoint, projectId, databaseId } = appwriteConfig;

  if (!endpoint || !projectId || !databaseId) {
    console.error("❌ Основные параметры Appwrite не настроены");
    return false;
  }

  const emptyCollections = Object.entries(appwriteConfig.collections)
    .filter(([_, id]) => !id)
    .map(([name]) => name);

  if (emptyCollections.length > 0) {
    console.error(
      `❌ Не настроены ID коллекций: ${emptyCollections.join(", ")}`
    );
    return false;
  }

  console.log("✅ Конфигурация Appwrite валидна");
  return true;
};

export default appwriteConfig;
