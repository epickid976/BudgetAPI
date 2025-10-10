import { db } from "../../config/db.js";
import { users } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

export async function register(email: string, password: string) {
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length) throw new Error("EMAIL_IN_USE");
    const passwordHash = await bcrypt.hash(password, 12);
    const [u] = await db.insert(users).values({ email, passwordHash }).returning();
    return issueTokens(u.id);
}

export async function login(email: string, password: string) {
    const [u] = await db.select().from(users).where(eq(users.email, email));
    if (!u) throw new Error("INVALID_CREDENTIALS");
    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok) throw new Error("INVALID_CREDENTIALS");
    
    // Check if email is verified
    if (!u.emailVerified) throw new Error("EMAIL_NOT_VERIFIED");
    
    return issueTokens(u.id);
}

// Add this function to auth/service.ts
export async function refreshTokens(refreshToken: string) {
  try {
    const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { sub: string; typ: string };
    if (payload.typ !== "refresh") throw new Error("INVALID_TOKEN");
    return issueTokens(payload.sub);
  } catch {
    throw new Error("INVALID_TOKEN");
  }
}

function issueTokens(userId: string) {
  const access = jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
  const refresh = jwt.sign({ sub: userId, typ: "refresh" }, env.JWT_REFRESH_SECRET, { expiresIn: "30d" });
  return { access, refresh };
}