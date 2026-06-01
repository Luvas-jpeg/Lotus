-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BotConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "phone" TEXT NOT NULL DEFAULT '',
    "managerPhone" TEXT NOT NULL DEFAULT '',
    "systemPrompt" TEXT NOT NULL DEFAULT '',
    "context" TEXT NOT NULL DEFAULT '',
    "intervalMinutes" INTEGER NOT NULL DEFAULT 10,
    "temperature" REAL NOT NULL DEFAULT 0.6,
    "mode" TEXT NOT NULL DEFAULT 'reactive',
    "active" BOOLEAN NOT NULL DEFAULT false,
    "nextRunAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_BotConfig" ("active", "context", "createdAt", "id", "intervalMinutes", "managerPhone", "mode", "nextRunAt", "phone", "temperature", "updatedAt") SELECT "active", "context", "createdAt", "id", "intervalMinutes", "managerPhone", "mode", "nextRunAt", "phone", "temperature", "updatedAt" FROM "BotConfig";
DROP TABLE "BotConfig";
ALTER TABLE "new_BotConfig" RENAME TO "BotConfig";
CREATE TABLE "new_Conversation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "contactId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'bot',
    "assignedTo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Conversation_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Conversation" ("assignedTo", "contactId", "createdAt", "id", "status", "updatedAt") SELECT "assignedTo", "contactId", "createdAt", "id", "status", "updatedAt" FROM "Conversation";
DROP TABLE "Conversation";
ALTER TABLE "new_Conversation" RENAME TO "Conversation";
CREATE TABLE "new_HandoffEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "conversationId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "notifiedTo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    CONSTRAINT "HandoffEvent_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_HandoffEvent" ("conversationId", "createdAt", "id", "notifiedTo", "reason", "resolvedAt", "status") SELECT "conversationId", "createdAt", "id", "notifiedTo", "reason", "resolvedAt", "status" FROM "HandoffEvent";
DROP TABLE "HandoffEvent";
ALTER TABLE "new_HandoffEvent" RENAME TO "HandoffEvent";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
