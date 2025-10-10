import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { Request, Response, NextFunction } from "express";
import { isTokenBlacklisted } from "../services/tokenBlacklist.js";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
    const hdr = req.headers.authorization;
    if (!hdr?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "UNAUTHORIZED" });
    }
    
    try {
        const token = hdr.slice(7);
        
        // Verify token signature and expiration
        const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string };
        
        // Check if token is blacklisted
        const blacklisted = await isTokenBlacklisted(token);
        if (blacklisted) {
            return res.status(401).json({ error: "TOKEN_REVOKED" });
        }
        
        // Attach user ID to request
        (req as any).userId = payload.sub;
        (req as any).token = token; // Store token for logout
        next();
    } catch (error) {
        return res.status(401).json({ error: "UNAUTHORIZED" });
    }
}