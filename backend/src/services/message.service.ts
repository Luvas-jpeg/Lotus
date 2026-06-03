import { prisma } from "../lib/prisma";

export async function saveMessage(
  conversationId: number,
  role: "user" | "bot" | "system",
  text: string,
  options: { confidence?: number; needsHuman?: boolean } = {},
) {
  const message = await prisma.message.create({
    data: {
      conversationId,
      role,
      text,
      confidence: options.confidence ?? null,
      needsHuman: options.needsHuman ?? false,
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      updatedAt: new Date(),
    },
  });

  return message;
}

export async function getRecentHistory(
  conversationId: number,
  options: { excludeMessageId?: number } = {},
) {
  return prisma.message.findMany({
    where: {
      conversationId,
      id: options.excludeMessageId
        ? {
            not: options.excludeMessageId,
          }
        : undefined,
      role: {
        in: ["user", "bot"],
      },
    },
    orderBy: {
      id: "desc",
    },
    take: 10,
  });
}

export async function deleteConversationMessages(conversationId: number) {
  return prisma.message.deleteMany({
    where: {
      conversationId,
    },
  });
}
