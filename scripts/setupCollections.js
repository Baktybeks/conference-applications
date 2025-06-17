// scripts/setupCollections.js - Обновленная версия для системы конференций
const { Client, Databases, Permission, Role } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

const appwriteConfig = {
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
};

const COLLECTION_SCHEMAS = {
  users: {
    name: { type: "string", required: true, size: 255 },
    email: { type: "email", required: true, size: 320 },
    role: {
      type: "enum",
      required: true,
      elements: ["SUPER_ADMIN", "ORGANIZER", "REVIEWER", "PARTICIPANT"],
    },
    isActive: { type: "boolean", required: false, default: false },
    organization: { type: "string", required: false, size: 255 },
    position: { type: "string", required: false, size: 255 },
    bio: { type: "string", required: false, size: 2000 },
    phone: { type: "string", required: false, size: 50 },
    orcid: { type: "string", required: false, size: 50 },
    website: { type: "url", required: false, size: 500 },
    createdAt: { type: "datetime", required: true },
  },

  conferences: {
    title: { type: "string", required: true, size: 255 },
    description: { type: "string", required: true, size: 5000 },
    theme: {
      type: "enum",
      required: true,
      elements: [
        "COMPUTER_SCIENCE",
        "MEDICINE",
        "EDUCATION",
        "ENGINEERING",
        "BUSINESS",
        "SOCIAL_SCIENCES",
        "NATURAL_SCIENCES",
        "HUMANITIES",
        "OTHER",
      ],
    },
    startDate: { type: "datetime", required: true },
    endDate: { type: "datetime", required: true },
    submissionDeadline: { type: "datetime", required: true },
    location: { type: "string", required: true, size: 500 },
    participationType: {
      type: "enum",
      required: true,
      elements: ["ONLINE", "OFFLINE", "HYBRID"],
    },
    organizerId: { type: "string", required: true, size: 36 },
    contactEmail: { type: "email", required: true, size: 320 },
    website: { type: "url", required: false, size: 500 },
    maxParticipants: { type: "integer", required: false, min: 1 },
    registrationFee: { type: "integer", required: false, min: 0 },
    isPublished: { type: "boolean", required: false, default: false },
    requirements: { type: "string", required: false, size: 2000 },
    tags: { type: "string", required: false, array: true },
    createdAt: { type: "datetime", required: true },
  },

  applications: {
    conferenceId: { type: "string", required: true, size: 36 },
    participantId: { type: "string", required: true, size: 36 },
    status: {
      type: "enum",
      required: true,
      elements: [
        "DRAFT",
        "SUBMITTED",
        "UNDER_REVIEW",
        "ACCEPTED",
        "REJECTED",
        "WAITLIST",
      ],
      default: "DRAFT",
    },
    // Информация об участнике
    fullName: { type: "string", required: true, size: 255 },
    organization: { type: "string", required: true, size: 255 },
    position: { type: "string", required: false, size: 255 },
    email: { type: "email", required: true, size: 320 },
    phone: { type: "string", required: false, size: 50 },
    // Информация о докладе
    hasPresentation: { type: "boolean", required: false, default: false },
    presentationType: {
      type: "enum",
      required: false,
      elements: ["ORAL", "POSTER", "WORKSHOP", "KEYNOTE", "PANEL"],
    },
    presentationTitle: { type: "string", required: false, size: 500 },
    abstract: { type: "string", required: false, size: 5000 },
    keywords: { type: "string", required: false, array: true },
    // Дополнительная информация
    dietaryRestrictions: { type: "string", required: false, size: 1000 },
    accessibilityNeeds: { type: "string", required: false, size: 1000 },
    accommodationNeeded: { type: "boolean", required: false, default: false },
    // Сертификаты и участие
    attended: { type: "boolean", required: false, default: false },
    createdAt: { type: "datetime", required: true },
  },

  applicationComments: {
    applicationId: { type: "string", required: true, size: 36 },
    authorId: { type: "string", required: true, size: 36 },
    text: { type: "string", required: true, size: 2000 },
    isInternal: { type: "boolean", required: false, default: false },
    createdAt: { type: "datetime", required: true },
  },

  applicationHistory: {
    applicationId: { type: "string", required: true, size: 36 },
    userId: { type: "string", required: true, size: 36 },
    action: { type: "string", required: true, size: 255 },
    oldValue: { type: "string", required: false, size: 500 },
    newValue: { type: "string", required: false, size: 500 },
    description: { type: "string", required: true, size: 1000 },
    createdAt: { type: "datetime", required: true },
  },

  conferenceSchedule: {
    conferenceId: { type: "string", required: true, size: 36 },
    date: { type: "datetime", required: true },
    timeSlots: { type: "string", required: true, size: 10000 }, // JSON строка с массивом временных слотов
    createdAt: { type: "datetime", required: true },
  },
};

const COLLECTION_INDEXES = {
  users: [
    { key: "email", type: "unique" },
    { key: "role", type: "key" },
    { key: "isActive", type: "key" },
    { key: "organization", type: "key" },
  ],

  conferences: [
    { key: "organizerId", type: "key" },
    { key: "theme", type: "key" },
    { key: "participationType", type: "key" },
    { key: "isPublished", type: "key" },
    { key: "startDate", type: "key" },
    { key: "endDate", type: "key" },
    { key: "submissionDeadline", type: "key" },
    { key: "createdAt", type: "key" },
  ],

  applications: [
    { key: "conferenceId", type: "key" },
    { key: "participantId", type: "key" },
    { key: "status", type: "key" },
    { key: "assignedReviewerId", type: "key" },
    { key: "hasPresentation", type: "key" },
    { key: "presentationType", type: "key" },
    { key: "createdAt", type: "key" },
    { key: "attended", type: "key" },
  ],

  applicationComments: [
    { key: "applicationId", type: "key" },
    { key: "authorId", type: "key" },
    { key: "isInternal", type: "key" },
    { key: "createdAt", type: "key" },
  ],

  applicationHistory: [
    { key: "applicationId", type: "key" },
    { key: "userId", type: "key" },
    { key: "action", type: "key" },
    { key: "createdAt", type: "key" },
  ],

  conferenceSchedule: [
    { key: "conferenceId", type: "key" },
    { key: "date", type: "key" },
    { key: "createdAt", type: "key" },
  ],
};

const client = new Client();
client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const createAttribute = async (databaseId, collectionId, key, schema) => {
  try {
    const attributeType = schema.type;

    let isRequired = schema.required || false;
    let defaultValue = schema.default;

    if (isRequired && defaultValue !== null && defaultValue !== undefined) {
      console.log(
        `    ⚠️ Исправление ${key}: required=true с default значением -> required=false`
      );
      isRequired = false;
    }

    switch (attributeType) {
      case "string":
        return await databases.createStringAttribute(
          databaseId,
          collectionId,
          key,
          schema.size || 255,
          isRequired,
          defaultValue || null,
          schema.array || false
        );

      case "email":
        return await databases.createEmailAttribute(
          databaseId,
          collectionId,
          key,
          isRequired,
          defaultValue || null,
          schema.array || false
        );

      case "enum":
        return await databases.createEnumAttribute(
          databaseId,
          collectionId,
          key,
          schema.elements,
          isRequired,
          defaultValue || null,
          schema.array || false
        );

      case "boolean":
        return await databases.createBooleanAttribute(
          databaseId,
          collectionId,
          key,
          isRequired,
          defaultValue !== null && defaultValue !== undefined
            ? defaultValue
            : null,
          schema.array || false
        );

      case "datetime":
        return await databases.createDatetimeAttribute(
          databaseId,
          collectionId,
          key,
          isRequired,
          defaultValue || null,
          schema.array || false
        );

      case "integer":
        return await databases.createIntegerAttribute(
          databaseId,
          collectionId,
          key,
          isRequired,
          schema.min || null,
          schema.max || null,
          defaultValue || null,
          schema.array || false
        );

      case "url":
        return await databases.createUrlAttribute(
          databaseId,
          collectionId,
          key,
          isRequired,
          defaultValue || null,
          schema.array || false
        );

      default:
        throw new Error(`Неподдерживаемый тип атрибута: ${attributeType}`);
    }
  } catch (error) {
    console.error(`Ошибка создания атрибута ${key}:`, error.message);
    throw error;
  }
};

const createIndex = async (databaseId, collectionId, indexConfig) => {
  try {
    return await databases.createIndex(
      databaseId,
      collectionId,
      indexConfig.key,
      indexConfig.type,
      indexConfig.attributes || [indexConfig.key],
      indexConfig.orders || ["ASC"]
    );
  } catch (error) {
    console.error(`Ошибка создания индекса ${indexConfig.key}:`, error.message);
    throw error;
  }
};

const setupCollections = async () => {
  try {
    console.log("🚀 Начинаем создание коллекций для системы конференций...");
    console.log(
      "📋 Всего коллекций для создания:",
      Object.keys(COLLECTION_SCHEMAS).length
    );

    const databaseId = appwriteConfig.databaseId;

    if (!databaseId) {
      throw new Error("Database ID не найден! Проверьте переменные окружения.");
    }

    for (const [collectionName, schema] of Object.entries(COLLECTION_SCHEMAS)) {
      console.log(`\n📁 Создание коллекции: ${collectionName}`);

      try {
        const collectionId = appwriteConfig.collections[collectionName];

        const collection = await databases.createCollection(
          databaseId,
          collectionId,
          collectionName,
          [
            Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
          ],
          false
        );

        console.log(
          `  ✅ Коллекция ${collectionName} создана (ID: ${collectionId})`
        );

        console.log(`  📝 Добавление атрибутов...`);
        let attributeCount = 0;

        for (const [attributeKey, attributeSchema] of Object.entries(schema)) {
          try {
            await createAttribute(
              databaseId,
              collectionId,
              attributeKey,
              attributeSchema
            );
            attributeCount++;
            console.log(`    ✅ ${attributeKey} (${attributeSchema.type})`);

            await new Promise((resolve) => setTimeout(resolve, 1000));
          } catch (error) {
            console.error(`    ❌ ${attributeKey}: ${error.message}`);
          }
        }

        console.log(
          `  📊 Создано атрибутов: ${attributeCount}/${
            Object.keys(schema).length
          }`
        );

        if (COLLECTION_INDEXES[collectionName]) {
          console.log(`  🔍 Создание индексов...`);
          let indexCount = 0;

          for (const indexConfig of COLLECTION_INDEXES[collectionName]) {
            try {
              await createIndex(databaseId, collectionId, indexConfig);
              indexCount++;
              console.log(`    ✅ Индекс: ${indexConfig.key}`);

              await new Promise((resolve) => setTimeout(resolve, 1000));
            } catch (error) {
              console.error(
                `    ❌ Индекс ${indexConfig.key}: ${error.message}`
              );
            }
          }

          console.log(
            `  📈 Создано индексов: ${indexCount}/${COLLECTION_INDEXES[collectionName].length}`
          );
        }
      } catch (error) {
        console.error(
          `❌ Ошибка создания коллекции ${collectionName}:`,
          error.message
        );
      }
    }

    console.log("\n🎉 Настройка коллекций завершена!");
    console.log("🔗 Откройте консоль Appwrite для проверки результата.");
  } catch (error) {
    console.error("💥 Общая ошибка:", error.message);
    console.log("\n🔍 Проверьте:");
    console.log("- Переменные окружения в .env.local");
    console.log("- Права доступа API ключа");
    console.log("- Подключение к интернету");
  }
};

const resetCollections = async () => {
  try {
    console.log("🗑️ Удаление существующих коллекций...");

    const databaseId = appwriteConfig.databaseId;
    let deletedCount = 0;

    for (const [collectionName] of Object.entries(COLLECTION_SCHEMAS)) {
      try {
        const collectionId = appwriteConfig.collections[collectionName];
        await databases.deleteCollection(databaseId, collectionId);
        deletedCount++;
        console.log(`✅ ${collectionName} удалена`);
      } catch (error) {
        console.log(`⚠️ ${collectionName} не найдена или уже удалена`);
      }
    }

    console.log(`🧹 Удалено коллекций: ${deletedCount}`);
  } catch (error) {
    console.error("Ошибка при удалении коллекций:", error.message);
  }
};

const checkEnvironment = () => {
  const required = [
    "NEXT_PUBLIC_APPWRITE_ENDPOINT",
    "NEXT_PUBLIC_APPWRITE_PROJECT_ID",
    "NEXT_PUBLIC_APPWRITE_DATABASE_ID",
    "APPWRITE_API_KEY",
  ];

  const missing = required.filter((env) => !process.env[env]);

  if (missing.length > 0) {
    console.error("❌ Отсутствуют переменные окружения:");
    missing.forEach((env) => console.error(`  - ${env}`));
    console.log("\n💡 Создайте файл .env.local с необходимыми переменными");
    process.exit(1);
  }

  console.log("✅ Все переменные окружения найдены");
};

const main = async () => {
  console.log("🔧 Conference Management System - Настройка базы данных\n");

  checkEnvironment();

  const command = process.argv[2];

  switch (command) {
    case "setup":
      await setupCollections();
      break;
    case "reset":
      await resetCollections();
      break;
    case "reset-setup":
      await resetCollections();
      console.log("\n⏳ Ожидание 3 секунды перед созданием...");
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await setupCollections();
      break;
    default:
      console.log("📖 Использование:");
      console.log(
        "  node scripts/setupCollections.js setup        - Создать коллекции"
      );
      console.log(
        "  node scripts/setupCollections.js reset        - Удалить коллекции"
      );
      console.log(
        "  node scripts/setupCollections.js reset-setup  - Пересоздать коллекции"
      );
      break;
  }
};

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  setupCollections,
  resetCollections,
  COLLECTION_SCHEMAS,
  COLLECTION_INDEXES,
  appwriteConfig,
};
