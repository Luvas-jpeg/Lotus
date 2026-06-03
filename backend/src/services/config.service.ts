import { prisma } from "../lib/prisma";
import { clampNumber, getNextRunAt } from "../utils/time";

export async function ensureConfig() {
  return prisma.botConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      systemPrompt: "",
    },
  });
}

export async function updateConfig(input: {
  phone?: unknown;
  managerPhone?: unknown;
  systemPrompt?: unknown;
  context?: unknown;
  interval?: unknown;
  temperature?: unknown;
  mode?: unknown;
}) {
  const current = await ensureConfig();
  const intervalMinutes = clampNumber(Number(input.interval || 10), 1, 1440);
  const temperature = clampNumber(Number(input.temperature || 0.6), 0, 1);
  const mode = input.mode === "proactive" ? "proactive" : "reactive";
  const systemPrompt =
    typeof input.systemPrompt === "string"
      ? input.systemPrompt.trim()
      : current.systemPrompt;

  return prisma.botConfig.update({
    where: { id: 1 },
    data: {
      phone: String(input.phone || "").trim(),
      managerPhone: String(input.managerPhone || "").trim(),
      systemPrompt,
      context: String(input.context || "").trim(),
      intervalMinutes,
      temperature,
      mode,
      nextRunAt: current.active ? getNextRunAt(intervalMinutes) : null,
    },
  });
}

export async function toggleConfig() {
  const config = await ensureConfig();

  if (!config.active && !config.phone) {
    throw Object.assign(new Error("Informe um numero antes de ativar o bot."), {
      statusCode: 400,
    });
  }

  const active = !config.active;

  return prisma.botConfig.update({
    where: { id: 1 },
    data: {
      active,
      nextRunAt: active ? getNextRunAt(config.intervalMinutes) : null,
    },
  });
}
