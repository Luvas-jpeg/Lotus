import OpenAI from "openai";
import type { AiMessage, AiResult } from "../types";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const AI_REPLY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    reply: {
      type: "string",
    },
    needsHuman: {
      type: "boolean",
    },
    handoffReason: {
      type: ["string", "null"],
    },
    confidence: {
      type: "number",
    },
  },
  required: ["reply", "needsHuman", "handoffReason", "confidence"],
};

export function hasOpenAiConfig() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function generateOpenAiReply(
  messages: AiMessage[],
): Promise<AiResult> {
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    input: messages,
    text: {
      format: {
        type: "json_schema",
        name: "whatsapp_ai_reply",
        strict: true,
        schema: AI_REPLY_SCHEMA,
      },
    },
  });

  const rawText = response.output_text;

  if (!rawText) {
    throw new Error("A IA nao retornou texto.");
  }

  const parsed = JSON.parse(rawText) as AiResult;

  return {
    reply: String(parsed.reply || "").trim(),
    needsHuman: Boolean(parsed.needsHuman),
    handoffReason: parsed.handoffReason ? String(parsed.handoffReason) : null,
    confidence: Number(parsed.confidence || 0),
  };
}
