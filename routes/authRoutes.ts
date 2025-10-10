import { Router } from "express";
import { z } from "zod";
import * as authService from "../api/src/modules/auth/service.js";
import { requireAuth } from "../api/src/middlewares/auth.js";
import { db } from "../api/src/config/db.js";
import { users, passwordResets, emailVerificationTokens } from "../api/src/db/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import * as emailService from "../api/src/services/email.js";

export const authRouter = Router();

// Validation schemas
const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

const refreshSchema = z.object({
    refreshToken: z.string(),
});

const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

const resetPasswordSchema = z.object({
    token: z.string(),
    newPassword: z.string().min(8),
});

const changePasswordSchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(8),
});

const verifyEmailSchema = z.object({
    token: z.string(),
});

const resendVerificationSchema = z.object({
    email: z.string().email(),
});

// POST /auth/register
authRouter.post("/register", async (req, res) => {
    try {
        const data = registerSchema.parse(req.body);
        
        // First, get the user ID - we need to modify register to return it
        const [existingUser] = await db.select().from(users).where(eq(users.email, data.email));
        if (existingUser) {
            return res.status(409).json({ error: "Email already in use" });
        }
        
        // Register the user
        const result = await authService.register(data.email, data.password);
        
        // Get the newly created user ID
        const [newUser] = await db.select().from(users).where(eq(users.email, data.email));
        
        if (newUser) {
            // Generate verification token
            const verificationToken = crypto.randomBytes(32).toString("hex");
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            
            await db.insert(emailVerificationTokens).values({
                userId: newUser.id,
                token: verificationToken,
                expiresAt,
            });
            
            // Send verification email (will log to console if email not configured)
            await emailService.sendVerificationEmail(data.email, verificationToken);
        }
        
        res.status(201).json(result);
    } catch (err: any) {
        if (err.message === "EMAIL_IN_USE") {
            return res.status(409).json({ error: "Email already in use" });
        }
        res.status(400).json({ error: err.message || "Registration failed" });
    }
});

// POST /auth/login
authRouter.post("/login", async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const tokens = await authService.login(data.email, data.password);
    res.json(tokens);
  } catch (err: any) {
    if (err.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    res.status(400).json({ error: err.message || "Login failed" });
  }
});

// POST /auth/refresh
authRouter.post("/refresh", async (req, res) => {
  try {
    const data = refreshSchema.parse(req.body);
    const tokens = await authService.refreshTokens(data.refreshToken);
    res.json(tokens);
  } catch (err: any) {
    res.status(401).json({ error: "Invalid or expired refresh token" });
  }
});

// GET /auth/me
authRouter.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const [user] = await db.select({
      id: users.id,
      email: users.email,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
    }).from(users).where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to get user" });
  }
});

// POST /auth/logout (client-side, this just returns success)
authRouter.post("/logout", requireAuth, async (req, res) => {
  // With JWT, logout is handled client-side by deleting tokens
  // This endpoint exists for consistency/future token blacklisting
  res.json({ message: "Logged out successfully" });
});

// POST /auth/forgot-password
authRouter.post("/forgot-password", async (req, res) => {
  try {
    const data = forgotPasswordSchema.parse(req.body);

    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, data.email));

    // Always return success (don't reveal if email exists - security)
    if (!user) {
      return res.json({ message: "If that email exists, a reset link has been sent" });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.insert(passwordResets).values({
      userId: user.id,
      token,
      expiresAt,
    });

    // Send password reset email (will log to console if email not configured)
    await emailService.sendPasswordResetEmail(data.email, token);

    res.json({ message: "If that email exists, a reset link has been sent" });
  } catch (err) {
    res.status(400).json({ error: "Failed to process request" });
  }
});

// POST /auth/reset-password
authRouter.post("/reset-password", async (req, res) => {
  try {
    const data = resetPasswordSchema.parse(req.body);

    // Find valid reset token
    const [reset] = await db
      .select()
      .from(passwordResets)
      .where(eq(passwordResets.token, data.token));

    if (!reset || reset.used || reset.expiresAt < new Date()) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Update password
    const passwordHash = await bcrypt.hash(data.newPassword, 12);
    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, reset.userId));

    // Mark token as used
    await db
      .update(passwordResets)
      .set({ used: true })
      .where(eq(passwordResets.id, reset.id));

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(400).json({ error: "Failed to reset password" });
  }
});

// POST /auth/change-password
authRouter.post("/change-password", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const data = changePasswordSchema.parse(req.body);

    // Get current user
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Update to new password
    const passwordHash = await bcrypt.hash(data.newPassword, 12);
    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, userId));

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(400).json({ error: "Failed to change password" });
  }
});

// POST /auth/verify-email
authRouter.post("/verify-email", async (req, res) => {
  try {
    const data = verifyEmailSchema.parse(req.body);

    // Find valid verification token
    const [verification] = await db
      .select()
      .from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.token, data.token));

    if (!verification || verification.used || verification.expiresAt < new Date()) {
      return res.status(400).json({ error: "Invalid or expired verification token" });
    }

    // Get user email for welcome email
    const [user] = await db.select().from(users).where(eq(users.id, verification.userId));

    // Mark email as verified
    await db
      .update(users)
      .set({ emailVerified: true })
      .where(eq(users.id, verification.userId));

    // Mark token as used
    await db
      .update(emailVerificationTokens)
      .set({ used: true })
      .where(eq(emailVerificationTokens.id, verification.id));

    // Send welcome email (optional, won't throw if it fails)
    if (user) {
      await emailService.sendWelcomeEmail(user.email);
    }

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    res.status(400).json({ error: "Failed to verify email" });
  }
});

// POST /auth/resend-verification
authRouter.post("/resend-verification", async (req, res) => {
  try {
    const data = resendVerificationSchema.parse(req.body);

    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, data.email));

    // Always return success (don't reveal if email exists - security)
    if (!user) {
      return res.json({ message: "If that email exists and is unverified, a verification link has been sent" });
    }

    // If already verified, don't send
    if (user.emailVerified) {
      return res.json({ message: "If that email exists and is unverified, a verification link has been sent" });
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.insert(emailVerificationTokens).values({
      userId: user.id,
      token,
      expiresAt,
    });

    // Send verification email (will log to console if email not configured)
    await emailService.sendVerificationEmail(data.email, token);

    res.json({ message: "If that email exists and is unverified, a verification link has been sent" });
  } catch (err) {
    res.status(400).json({ error: "Failed to process request" });
  }
});