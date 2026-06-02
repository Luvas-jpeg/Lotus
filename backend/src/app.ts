import express from "express";
import cors from "cors";
import { configRoutes } from "./routes/config.routes";
import { conversationRoutes } from "./routes/conversation.routes";
import { handoffRoutes } from "./routes/handoff.routes";
import { healthRoutes } from "./routes/health.routes";
import { incomingRoutes } from "./routes/incoming.routes";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/api", healthRoutes);
  app.use("/api", configRoutes);
  app.use("/api", conversationRoutes);
  app.use("/api", handoffRoutes);
  app.use("/api", incomingRoutes);

  app.use((
    error: Error & { statusCode?: number },
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (res.headersSent) {
      return next(error);
    }

    res.status(error.statusCode || 500).json({
      error: error.message || "Erro interno do servidor.",
    });
  });

  return app;
}
