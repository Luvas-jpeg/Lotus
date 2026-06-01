import { Router } from "express";
import {
  assignConversation,
  getConversation,
  listConversations,
  resolveConversation,
} from "../services/conversation.service";
import { deleteConversationMessages, saveMessage } from "../services/message.service";
import { asyncHandler } from "../utils/asyncHandler";

export const conversationRoutes = Router();

conversationRoutes.get(
  "/conversations",
  asyncHandler(async (req, res) => {
    res.json(await listConversations());
  }),
);

conversationRoutes.get(
  "/conversations/:id",
  asyncHandler(async (req, res) => {
    const conversation = await getConversation(Number(req.params.id));

    if (!conversation) {
      return res.status(404).json({ error: "Conversa nao encontrada." });
    }

    res.json(conversation);
  }),
);

conversationRoutes.post(
  "/conversations/:id/assign",
  asyncHandler(async (req, res) => {
    const assignedTo = String(req.body.assignedTo || "").trim();
    res.json(await assignConversation(Number(req.params.id), assignedTo));
  }),
);

conversationRoutes.post(
  "/conversations/:id/resolve",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const conversation = await resolveConversation(id);
    await saveMessage(id, "system", "Atendimento marcado como resolvido.");
    res.json(conversation);
  }),
);

conversationRoutes.delete(
  "/conversations/:id/messages",
  asyncHandler(async (req, res) => {
    await deleteConversationMessages(Number(req.params.id));
    res.json({ ok: true });
  }),
);
