import { prepareAiInput } from "./tokenBudget";
import type { BotConfig, Message } from "../../generated/prisma/client";
import { DEFAULT_AI_PROMPT } from "./prompt";
import type { AiMessage, AiResult } from "./types";
import { reviewAiResult } from "./guardrail";
import {
  generateOpenAiReply,
  hasOpenAiConfig,
} from "./providers/openai.provider";

export function buildAiMessages(params: {
  config: BotConfig;
  history: Message[];
  incomingText: string;
}): AiMessage[] {
  const systemPrompt = params.config.systemPrompt.trim() || DEFAULT_AI_PROMPT;
  const input = prepareAiInput({
    context: params.config.context,
    incomingText: params.incomingText,
    history: params.history,
  });
  const history = [...input.history].reverse();

  return [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "system",
      content: `Contexto do negocio:\n\n${input.context || "Nenhum contexto foi informado."}`,
    },
    ...history.map((message) => ({
      role: message.role === "bot" ? ("assistant" as const) : ("user" as const),
      content: message.text,
    })),
    {
      role: "user",
      content: input.context,
    },
  ];
}

export async function generateAiReply(params: {
  config: BotConfig;
  history: Message[];
  incomingText: string;
}): Promise<AiResult> {
  const messages = buildAiMessages(params);

  if (process.env.AI_PROVIDER === "openai" && hasOpenAiConfig()) {
    try {
      return reviewAiResult(await generateOpenAiReply(messages));
    } catch (error) {
      console.error("Erro ao chamar OpenAI. Usando fallback simulado:", error);
    }
  }

  return reviewAiResult(generateFallbackReply(params));
}

function generateFallbackReply(params: {
  config: BotConfig;
  incomingText: string;
}): AiResult {
  const normalizedText = params.incomingText
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const escalationWords = [
    "humano",
    "atendente",
    "gerente",
    "responsavel",
    "reclamacao",
    "cancelar",
    "cancelamento",
    "problema",
    "urgente",
    "nao resolveu",
  ];

  const needsHuman = escalationWords.some((word) =>
    normalizedText.includes(word),
  );

  if (needsHuman) {
    return {
      reply:
        "Vou encaminhar isso para uma pessoa responsavel te ajudar melhor. Assim que possivel, ela continua o atendimento por aqui.",
      needsHuman: true,
      handoffReason:
        "Cliente pediu atendimento humano ou relatou um problema sensivel.",
      confidence: 0.92,
    };
  }

  const context = params.config.context
    ? "Considerando o contexto configurado"
    : "Como ainda nao ha contexto detalhado configurado";

  const reply = params.incomingText.includes("?")
    ? `${context}, posso te ajudar com essa duvida. Me diga se voce quer informacoes sobre valores, horarios, servicos ou proximos passos.`
    : `${context}, recebi sua mensagem e posso continuar o atendimento por aqui.`;

  return {
    reply,
    needsHuman: false,
    handoffReason: null,
    confidence: 0.78,
  };
}

export function createProactiveMessage(config: BotConfig) {
  const options = [
    "Oi, passando para saber se posso ajudar com alguma informacao agora.",
    "Tudo certo por ai? Posso continuar o atendimento quando voce quiser.",
    "Estou por aqui caso queira tirar duvidas ou seguir para o proximo passo.",
  ];

  const message = options[Math.floor(Math.random() * options.length)];

  if (config.context) {
    return `${message} Vou manter o contexto configurado no atendimento.`;
  }

  return message;
}
