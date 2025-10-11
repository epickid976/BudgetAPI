import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { Request, Response, NextFunction } from "express";
import { isTokenBlacklisted } from "../services/tokenBlacklist.js";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
    const hdr = req.headers.authorization;
    
    // Log for debugging
    console.log('[Auth] Request to:', req.method, req.path);
    console.log('[Auth] Authorization header:', hdr ? 'Present' : 'Missing');
    
    if (!hdr?.startsWith("Bearer ")) {
        console.log('[Auth] Error: Missing or invalid Authorization header format');
        return res.status(401).json({ error: "UNAUTHORIZED", details: "Missing or invalid Authorization header" });
    }
    
    try {
        const token = hdr.slice(7);
        console.log('[Auth] Token length:', token.length);
        
        // Verify token signature and expiration
        const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string };
        console.log('[Auth] Token verified for user:', payload.sub);
        
        // Check if token is blacklisted
        const blacklisted = await isTokenBlacklisted(token);
        if (blacklisted) {
            console.log('[Auth] Error: Token is blacklisted');
            return res.status(401).json({ error: "TOKEN_REVOKED" });
        }
        
        // Attach user ID to request
        (req as any).userId = payload.sub;
        (req as any).token = token; // Store token for logout
        console.log('[Auth] Success: User authenticated');
        next();
    } catch (error: any) {
        console.log('[Auth] Error:', error.name, error.message);
        return res.status(401).json({ 
            error: "UNAUTHORIZED", 
            details: error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token'
        });
    }
}