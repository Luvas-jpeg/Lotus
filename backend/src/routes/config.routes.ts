import { Router } from "express";
import { ensureConfig, toggleConfig, updateConfig } from "../services/config.service";
import { asyncHandler } from "../utils/asyncHandler";

export const configRoutes = Router();

configRoutes.get(
  "/config",
  asyncHandler(async (req, res) => {
    res.json(await ensureConfig());
  }),
);

configRoutes.post(
  "/config",
  asyncHandler(async (req, res) => {
    res.json(await updateConfig(req.body));
  }),
);

configRoutes.post(
  "/toggle",
  asyncHandler(async (req, res) => {
    res.json(await toggleConfig());
  }),
);
