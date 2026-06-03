import type { Message } from "../../generated/prisma/client";

const MAX_CONTEXT_CHARS = 3000;
const MAX_INCOMING_CHARS = 1000;
const MAX_HISTORY_MESSAGES = 10;
const MAX_HISTORY_MESSAGE_CHARS = 600;

export function prepareAiInput(params: {
  context: string;
  incomingText: string;
  history: Message[];
}) {
  return {
    context: trimText(params.context, MAX_CONTEXT_CHARS),
    incomingText: trimText(params.incomingText, MAX_INCOMING_CHARS),
    history: prepareHistory(params.history),
  };
}

function prepareHistory(history: Message[]) {
  return history.slice(0, MAX_HISTORY_MESSAGES).map((messages) => ({
    ...messages,
    text: trimText(messages.text, MAX_HISTORY_MESSAGE_CHARS),
  }));
}

function trimText(text: string, maxLength: number) {
  const cleanText = String(text || "").trim();

  if (cleanText.length <= maxLength) {
    return cleanText;
  }

  return `${cleanText.slice(0, maxLength)}`;
}
