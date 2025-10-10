import { db } from "../config/db.js";
import { blacklistedTokens } from "../db/schema.js";
import { eq, lt } from "drizzle-orm";
import jwt from "jsonwebtoken";

/**
 * Add a token to the blacklist
 */
export async function blacklistToken(
  token: string, 
  userId: string, 
  reason: string = "logout"
): Promise<void> {
  try {
    // Decode token to get expiration
    const decoded = jwt.decode(token) as { exp?: number };
    
    if (!decoded || !decoded.exp) {
      throw new Error("Invalid token format");
    }

    // Convert exp (seconds) to Date
    const expiresAt = new Date(decoded.exp * 1000);

    await db.insert(blacklistedTokens).values({
      token,
      userId,
      reason,
      expiresAt,
    });

    console.log(`Token blacklisted for user ${userId}: ${reason}`);
  } catch (error) {
    console.error("Error blacklisting token:", error);
    throw error;
  }
}

/**
 * Check if a token is blacklisted
 */
export async function isTokenBlacklisted(token: string): Promise<boolean> {
  try {
    const [result] = await db
      .select()
      .from(blacklistedTokens)
      .where(eq(blacklistedTokens.token, token))
      .limit(1);

    return !!result;
  } catch (error) {
    console.error("Error checking token blacklist:", error);
    // Fail open - if we can't check, allow the request
    // (Alternatively, fail closed by returning true)
    return false;
  }
}

/**
 * Blacklist all tokens for a user (useful for password changes, security events)
 * Note: This only works for future tokens. Existing tokens can't be revoked without
 * storing a user-level "tokens_valid_after" timestamp.
 */
export async function blacklistAllUserTokens(
  userId: string,
  tokens: string[],
  reason: string = "password_change"
): Promise<void> {
  try {
    const blacklistPromises = tokens.map(token => 
      blacklistToken(token, userId, reason)
    );
    
    await Promise.all(blacklistPromises);
    console.log(`Blacklisted ${tokens.length} tokens for user ${userId}`);
  } catch (error) {
    console.error("Error blacklisting user tokens:", error);
    throw error;
  }
}

/**
 * Clean up expired tokens from the blacklist
 * Run this periodically (e.g., via cron job or on app startup)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  try {
    const now = new Date();
    
    const result = await db
      .delete(blacklistedTokens)
      .where(lt(blacklistedTokens.expiresAt, now));

    console.log(`Cleaned up expired blacklisted tokens`);
    return 0; // Drizzle doesn't return affected rows for delete
  } catch (error) {
    console.error("Error cleaning up expired tokens:", error);
    return 0;
  }
}

/**
 * Get blacklisted tokens for a user (for debugging/admin)
 */
export async function getUserBlacklistedTokens(userId: string) {
  try {
    return await db
      .select({
        id: blacklistedTokens.id,
        reason: blacklistedTokens.reason,
        expiresAt: blacklistedTokens.expiresAt,
        createdAt: blacklistedTokens.createdAt,
      })
      .from(blacklistedTokens)
      .where(eq(blacklistedTokens.userId, userId));
  } catch (error) {
    console.error("Error fetching user blacklisted tokens:", error);
    return [];
  }
}

