import type { AiResult } from "./types";

const MAX_INCOMING_LENGTH = 2000;
const MAX_REPLY_LENGTH = 1200;
const MINIMUM_CONFIDENCE = 0.45;

export type IncomingGuardrailResult = {
  shouldReplyImmediately: boolean;
  needsHuman: boolean;
  reason: string | null;
  reply: string | null;
  safeText: string;
};

const HUMAN_REQUEST_PATTERNS = [
  "falar com humano",
  "falar com atendente",
  "quero um atendente",
  "chamar atendente",
  "falar com gerente",
  "falar com responsavel",
  "suporte humano",
];

const SENSITIVE_PATTERNS = [
  "reclamacao",
  "cancelamento",
  "cancelar",
  "cobranca indevida",
  "processo judicial",
  "advogado",
  "fraude",
  "golpe",
  "vazamento",
  "nao resolveu",
];

const EMERGENCY_PATTERNS = [
  "emergencia",
  "risco de vida",
  "socorro",
  "acidente grave",
  "chamar ambulancia",
];

const PROMPT_INJECTION_PATTERNS = [
  "ignore as instrucoes",
  "ignore instrucoes anteriores",
  "esqueca as regras",
  "revele o prompt",
  "mostre o prompt",
  "system prompt",
  "modo desenvolvedor",
  "jailbreak",
];

export function inspectIncomingText(text: string): IncomingGuardrailResult {
  const trimmedText = text.trim();
  const normalizedText = normalizeText(trimmedText);

  if (!trimmedText) {
    return immediateReply({
      reply: "Nao recebi uma mensagem. Pode enviar novamente?",
      safeText: "",
    });
  }

  if (trimmedText.length > MAX_INCOMING_LENGTH) {
    return immediateReply({
      reply:
        "Sua mensagem ficou muito longa para este atendimento automatico. Vou encaminhar para uma pessoa responsavel.",
      safeText: trimmedText.slice(0, MAX_INCOMING_LENGTH),
      needsHuman: true,
      reason: "Mensagem recebida acima do limite permitido.",
    });
  }

  if (containsAny(normalizedText, EMERGENCY_PATTERNS)) {
    return immediateReply({
      reply:
        "Entendi que pode ser uma situacao urgente. Procure imediatamente o servico de emergencia adequado. Tambem vou encaminhar seu atendimento para uma pessoa responsavel.",
      safeText: trimmedText,
      needsHuman: true,
      reason: "Mensagem com indicio de emergencia.",
    });
  }

  if (containsAny(normalizedText, HUMAN_REQUEST_PATTERNS)) {
    return immediateReply({
      reply:
        "Claro. Vou encaminhar seu atendimento para uma pessoa responsavel continuar a conversa por aqui.",
      safeText: trimmedText,
      needsHuman: true,
      reason: "Cliente solicitou atendimento humano.",
    });
  }

  if (containsAny(normalizedText, SENSITIVE_PATTERNS)) {
    return immediateReply({
      reply:
        "Entendi. Para tratar isso com mais cuidado, vou encaminhar seu atendimento para uma pessoa responsavel.",
      safeText: trimmedText,
      needsHuman: true,
      reason: "Mensagem com assunto sensivel ou reclamacao.",
    });
  }

  if (containsAny(normalizedText, PROMPT_INJECTION_PATTERNS)) {
    return immediateReply({
      reply:
        "Posso ajudar com informacoes e atendimento da empresa. Qual e a sua duvida?",
      safeText: trimmedText,
      reason: "Tentativa de alterar ou revelar instrucoes internas.",
    });
  }

  return {
    shouldReplyImmediately: false,
    needsHuman: false,
    reason: null,
    reply: null,
    safeText: trimmedText,
  };
}

export function reviewAiResult(result: AiResult): AiResult {
  const confidence = clampConfidence(result.confidence);
  const reply = sanitizeReply(result.reply);

  if (!reply) {
    return {
      reply:
        "Nao consegui responder com seguranca agora. Vou encaminhar seu atendimento para uma pessoa responsavel.",
      needsHuman: true,
      handoffReason: "A IA retornou uma resposta vazia ou invalida.",
      confidence: 0,
    };
  }

  if (confidence < MINIMUM_CONFIDENCE) {
    return {
      reply:
        "Quero confirmar essa informacao com uma pessoa responsavel antes de continuar. Vou encaminhar seu atendimento.",
      needsHuman: true,
      handoffReason: "Resposta da IA com confianca abaixo do limite minimo.",
      confidence,
    };
  }

  return {
    reply,
    needsHuman: Boolean(result.needsHuman),
    handoffReason: result.needsHuman
      ? result.handoffReason || "IA solicitou atendimento humano."
      : null,
    confidence,
  };
}

export function normalizeText(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function containsAny(text: string, patterns: string[]) {
  return patterns.some((pattern) => text.includes(pattern));
}

function immediateReply(
  result: Partial<IncomingGuardrailResult> &
    Pick<IncomingGuardrailResult, "reply" | "safeText">,
): IncomingGuardrailResult {
  return {
    shouldReplyImmediately: true,
    needsHuman: result.needsHuman ?? false,
    reason: result.reason ?? null,
    reply: result.reply,
    safeText: result.safeText,
  };
}

function sanitizeReply(reply: string) {
  return String(reply || "").trim().slice(0, MAX_REPLY_LENGTH);
}

function clampConfidence(confidence: number) {
  if (!Number.isFinite(confidence)) {
    return 0;
  }

  return Math.min(Math.max(confidence, 0), 1);
}
