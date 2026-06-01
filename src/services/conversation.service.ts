import { prisma } from "../lib/prisma";

export async function getOrCreateConversation(contactId: number) {
  const existing = await prisma.conversation.findFirst({
    where: {
      contactId,
      status: {
        in: ["bot", "needs_human"],
      },
    },
    orderBy: {
      id: "desc",
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.conversation.create({
    data: {
      contactId,
      status: "bot",
    },
  });
}

export async function listConversations() {
  return prisma.conversation.findMany({
    include: {
      contact: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function getConversation(id: number) {
  return prisma.conversation.findUnique({
    where: { id },
    include: {
      contact: true,
      messages: {
        orderBy: { createdAt: "asc" },
      },
      handoffEvents: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function assignConversation(id: number, assignedTo: string) {
  return prisma.conversation.update({
    where: { id },
    data: {
      assignedTo,
      status: "needs_human",
    },
  });
}

export async function resolveConversation(id: number) {
  const conversation = await prisma.conversation.update({
    where: { id },
    data: {
      status: "resolved",
    },
  });

  await prisma.handoffEvent.updateMany({
    where: {
      conversationId: id,
      status: "open",
    },
    data: {
      status: "resolved",
      resolvedAt: new Date(),
    },
  });

  return conversation;
}
