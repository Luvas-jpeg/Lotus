import { generateAiReply } from "../ai/ai.service";
import { inspectIncomingText } from "../ai/guardrail";
import { ensureConfig } from "./config.service";
import { getOrCreateContact } from "./contact.service";
import { getOrCreateConversation } from "./conversation.service";
import { createHandoff, notifyManager } from "./handoff.service";
import { getRecentHistory, saveMessage } from "./message.service";

export async function handleIncomingMessage(input: {
  phone: string;
  name?: string;
  text: string;
}) {
  const config = await ensureConfig();
  const contact = await getOrCreateContact(input.phone, input.name || "");
  const conversation = await getOrCreateConversation(contact.id);
  const userMessage = await saveMessage(conversation.id, "user", input.text);

  if (!config.active) {
    const systemMessage = await saveMessage(
      conversation.id,
      "system",
      "Mensagem recebida, mas o bot esta inativo.",
    );

    return { contact, conversation, userMessage, systemMessage };
  }

  if (conversation.status === "needs_human") {
    const systemMessage = await saveMessage(
      conversation.id,
      "system",
      "Conversa aguardando atendimento humano. IA nao respondeu automaticamente.",
    );

    return { contact, conversation, userMessage, systemMessage };
  }

  const guardrail = inspectIncomingText(input.text);

  if (guardrail.shouldReplyImmediately && guardrail.reply) {
    if (guardrail.needsHuman) {
      const reason = guardrail.reason || "Guardrail solicitou atendimento humano.";
      const handoff = await createHandoff(
        conversation.id,
        reason,
        config.managerPhone,
      );
      const notification = await notifyManager({
        conversationId: conversation.id,
        contactPhone: contact.phone,
        managerPhone: config.managerPhone,
        reason,
        lastMessage: input.text,
      });
      const botMessage = await saveMessage(
        conversation.id,
        "bot",
        guardrail.reply,
        {
          confidence: 1,
          needsHuman: true,
        },
      );

      return {
        contact,
        conversation: {
          ...conversation,
          status: "needs_human",
        },
        userMessage,
        botMessage,
        handoff,
        notification,
      };
    }

    const botMessage = await saveMessage(conversation.id, "bot", guardrail.reply, {
      confidence: 1,
      needsHuman: false,
    });

    return { contact, conversation, userMessage, botMessage };
  }

  const history = await getRecentHistory(conversation.id, {
    excludeMessageId: userMessage.id,
  });
  const ai = await generateAiReply({
    config,
    history,
    incomingText: guardrail.safeText,
  });

  if (ai.needsHuman) {
    const reason = ai.handoffReason || "IA solicitou atendimento humano.";
    const handoff = await createHandoff(
      conversation.id,
      reason,
      config.managerPhone,
    );
    const notification = await notifyManager({
      conversationId: conversation.id,
      contactPhone: contact.phone,
      managerPhone: config.managerPhone,
      reason,
      lastMessage: input.text,
    });
    const botMessage = await saveMessage(conversation.id, "bot", ai.reply, {
      confidence: ai.confidence,
      needsHuman: true,
    });

    return {
      contact,
      conversation: {
        ...conversation,
        status: "needs_human",
      },
      userMessage,
      botMessage,
      handoff,
      notification,
    };
  }

  const botMessage = await saveMessage(conversation.id, "bot", ai.reply, {
    confidence: ai.confidence,
    needsHuman: false,
  });

  return { contact, conversation, userMessage, botMessage };
}
