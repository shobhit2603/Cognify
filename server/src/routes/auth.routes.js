import express from "express";
import passport from "passport";
import * as authController from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";

const router = express.Router();

// Regular Auth Routes
router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", requireAuth, authController.getMe);

// Google OAuth Routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login?error=true" }),
  authController.googleCallback
);

export default router;
