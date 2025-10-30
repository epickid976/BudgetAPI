import { Router } from "express";
import { z } from "zod";
import * as authService from "../api/src/modules/auth/service.js";
import { requireAuth } from "../api/src/middlewares/auth.js";
import { db } from "../api/src/config/db.js";
import { users, passwordResets, emailVerificationTokens, categories } from "../api/src/db/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import * as emailService from "../api/src/services/email.js";
import * as tokenBlacklist from "../api/src/services/tokenBlacklist.js";

export const authRouter = Router();

// Validation schemas
const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(1).max(100).optional(), // Optional full name
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

const deleteAccountSchema = z.object({
    password: z.string().min(1),
});

const updateProfileSchema = z.object({
    name: z.string().min(1).max(100).optional(),
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
        const result = await authService.register(data.email, data.password, data.name);
        
        // Get the newly created user
        const [newUser] = await db.select({
            id: users.id,
            email: users.email,
            name: users.name,
            emailVerified: users.emailVerified,
            createdAt: users.createdAt,
        }).from(users).where(eq(users.email, data.email));
        
        if (newUser) {
            // Create default "Other" categories for the new user
            await db.insert(categories).values([
                {
                    userId: newUser.id,
                    name: "Other",
                    kind: "expense",
                },
                {
                    userId: newUser.id,
                    name: "Other",
                    kind: "income",
                }
            ]);
            
            // Only handle email verification if required
            const requireVerification = process.env.REQUIRE_EMAIL_VERIFICATION === "true";
            if (requireVerification) {
                // Generate verification token
                const verificationToken = crypto.randomBytes(32).toString("hex");
                const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
                
                await db.insert(emailVerificationTokens).values({
                    userId: newUser.id,
                    token: verificationToken,
                    expiresAt,
                });
                
                // Send verification email (will log to console if email not configured)
                // Don't throw if email fails - registration should still succeed
                try {
                    await emailService.sendVerificationEmail(data.email, verificationToken);
                } catch (emailError) {
                    console.error("Failed to send verification email, but registration succeeded:", emailError);
                }
            } else {
                console.log("📧 Email verification disabled - user can login immediately");
            }
        }
        
        // Return in format frontend expects
        res.status(201).json({
            accessToken: result.access,
            refreshToken: result.refresh,
            user: newUser
        });
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
    
    // Get user info
    const [user] = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
    }).from(users).where(eq(users.email, data.email));
    
    // Return in format frontend expects
    res.json({
      accessToken: tokens.access,
      refreshToken: tokens.refresh,
      user
    });
  } catch (err: any) {
    if (err.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    if (err.message === "EMAIL_NOT_VERIFIED") {
      return res.status(403).json({ error: "Please verify your email before logging in. Check your inbox for the verification link." });
    }
    res.status(400).json({ error: err.message || "Login failed" });
  }
});

// POST /auth/refresh
authRouter.post("/refresh", async (req, res) => {
  try {
    const data = refreshSchema.parse(req.body);
    const tokens = await authService.refreshTokens(data.refreshToken);
    
    // Return in format frontend expects
    res.json({
      accessToken: tokens.access,
      refreshToken: tokens.refresh
    });
  } catch (err: any) {
    res.status(401).json({ error: "Invalid or expired refresh token" });
  }
});

// GET /auth/test-token - Test if token is valid (for debugging)
authRouter.get("/test-token", requireAuth, async (req, res) => {
  res.json({ 
    success: true, 
    userId: (req as any).userId,
    message: "Token is valid!" 
  });
});

// GET /auth/me
authRouter.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const [user] = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
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

// PUT /auth/profile - Update user profile
authRouter.put("/profile", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const data = updateProfileSchema.parse(req.body);
    
    // Update user profile
    await db.update(users)
      .set({ name: data.name })
      .where(eq(users.id, userId));
    
    // Return updated user
    const [user] = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
    }).from(users).where(eq(users.id, userId));
    
    res.json(user);
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ error: "Invalid data", details: err.errors });
    }
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// POST /auth/logout
authRouter.post("/logout", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const token = (req as any).token;

    // Blacklist the access token
    if (token) {
      await tokenBlacklist.blacklistToken(token, userId, "logout");
    }

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    // Even if blacklisting fails, return success
    // Client will delete tokens anyway
    res.json({ message: "Logged out successfully" });
  }
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
    try {
      await emailService.sendPasswordResetEmail(data.email, token);
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
    }

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
    const token = (req as any).token;
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

    // Blacklist current token (user will need to login again)
    if (token) {
      await tokenBlacklist.blacklistToken(token, userId, "password_change");
    }

    res.json({ 
      message: "Password changed successfully. Please login again with your new password." 
    });
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
    try {
      await emailService.sendVerificationEmail(data.email, token);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    res.json({ message: "If that email exists and is unverified, a verification link has been sent" });
  } catch (err) {
    res.status(400).json({ error: "Failed to process request" });
  }
});

// DELETE /auth/account - Delete user account
authRouter.delete("/account", requireAuth, async (req, res) => {
  try {
    const data = deleteAccountSchema.parse(req.body);
    const userId = (req as any).userId;
    const token = (req as any).token;

    // Get the user
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify password for security
    const passwordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Blacklist the current access token
    if (token) {
      await tokenBlacklist.blacklistToken(token, userId, "account_deletion");
    }

    // Delete the user (cascade will delete all related data: accounts, transactions, budgets, etc.)
    await db.delete(users).where(eq(users.id, userId));

    res.json({ message: "Account deleted successfully" });
  } catch (err: any) {
    console.error("Delete account error:", err);
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: "Password is required" });
    }
    res.status(500).json({ error: "Failed to delete account" });
  }
});