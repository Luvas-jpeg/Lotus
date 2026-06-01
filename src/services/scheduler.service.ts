import { createProactiveMessage } from "./ai.service";
import { ensureConfig } from "./config.service";
import { getOrCreateContact } from "./contact.service";
import { getOrCreateConversation } from "./conversation.service";
import { prisma } from "../lib/prisma";
import { saveMessage } from "./message.service";
import { getNextRunAt } from "../utils/time";

export function startScheduler() {
  setInterval(async () => {
    try {
      const config = await ensureConfig();

      if (!config.active || config.mode !== "proactive" || !config.nextRunAt || !config.phone) {
        return;
      }

      if (Date.now() < config.nextRunAt.getTime()) {
        return;
      }

      const contact = await getOrCreateContact(config.phone);
      const conversation = await getOrCreateConversation(contact.id);

      if (conversation.status === "bot") {
        await saveMessage(conversation.id, "bot", createProactiveMessage(config));
      }

      await prisma.botConfig.update({
        where: { id: 1 },
        data: {
          nextRunAt: getNextRunAt(config.intervalMinutes),
        },
      });
    } catch (error) {
      console.error("Erro no agendador:", error);
    }
  }, 1000);
}
