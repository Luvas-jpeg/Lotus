import { Router } from "express";

export const healthRoutes = Router();

healthRoutes.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "whatsapp-ai-mvp",
  });
});
