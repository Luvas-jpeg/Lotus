import { Router } from "express";
import { handleIncomingMessage } from "../services/incoming.service";
import { asyncHandler } from "../utils/asyncHandler";

export const incomingRoutes = Router();

incomingRoutes.post(
  "/incoming-message",
  asyncHandler(async (req, res) => {
    const phone = String(req.body.phone || "").trim();
    const name = String(req.body.name || "").trim();
    const text = String(req.body.text || "").trim();

    if (!phone || !text) {
      return res.status(400).json({
        error: "Telefone e mensagem sao obrigatorios.",
      });
    }

    res.json(await handleIncomingMessage({ phone, name, text }));
  }),
);
