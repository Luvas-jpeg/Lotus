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

export async function getRecentHistory(conversationId: number) {
  return prisma.message.findMany({
    where: {
      conversationId,
      role: {
        in: ["user", "bot"],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });
}

export async function deleteConversationMessages(conversationId: number) {
  return prisma.message.deleteMany({
    where: {
      conversationId,
    },
  });
}
