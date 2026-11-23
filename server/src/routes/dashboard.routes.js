import express from "express";
import * as dashboardController from "../controllers/dashboard.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { getDashboardActivitySchema } from "../validations/dashboard.validation.js";

const router = express.Router();

router.use(requireAuth);

/**
 * @swagger
 * /api/v1/dashboard/activity:
 *   get:
 *     summary: Get recent user activity across all workspaces
 *     tags: [Dashboard]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [all, "01", "02", "03", "04", "05"]
 *         description: Category filter code
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 8
 *           maximum: 10
 *         description: Number of recent items to return (max 10)
 *     responses:
 *       200:
 *         description: Recent activity list and total count
 */
router.get(
  "/activity",
  validate(getDashboardActivitySchema, "query"),
  dashboardController.getDashboardActivity
);

export default router;
