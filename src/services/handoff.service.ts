import { prisma } from "../lib/prisma";
import { saveMessage } from "./message.service";

export async function createHandoff(conversationId: number, reason: string, notifiedTo: string) {
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      status: "needs_human",
    },
  });

  const existing = await prisma.handoffEvent.findFirst({
    where: {
      conversationId,
      status: "open",
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.handoffEvent.create({
    data: {
      conversationId,
      reason,
      notifiedTo: notifiedTo || null,
    },
  });
}

export async function notifyManager(params: {
  conversationId: number;
  contactPhone: string;
  managerPhone: string;
  reason: string;
  lastMessage: string;
}) {
  if (!params.managerPhone) {
    return null;
  }

  const text = [
    "Novo atendimento precisa de humano.",
    `Contato: ${params.contactPhone}`,
    `Conversa: #${params.conversationId}`,
    `Motivo: ${params.reason}`,
    `Mensagem: "${params.lastMessage}"`,
  ].join("\n");

  await saveMessage(
    params.conversationId,
    "system",
    `Notificacao para gestor ${params.managerPhone}: ${text}`,
  );

  return {
    to: params.managerPhone,
    text,
  };
}

export async function listHandoffs() {
  return prisma.handoffEvent.findMany({
    include: {
      conversation: {
        include: {
          contact: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
