import { Router } from "express";
import { listHandoffs } from "../services/handoff.service";
import { asyncHandler } from "../utils/asyncHandler";

export const handoffRoutes = Router();

handoffRoutes.get(
  "/handoffs",
  asyncHandler(async (req, res) => {
    res.json(await listHandoffs());
  }),
);
