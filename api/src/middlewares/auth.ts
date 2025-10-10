import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const hdr = req.headers.authorization;
    if (!hdr?.startsWith("Bearer ")) return res.status(401).json({ error: "UNAUTHORIZED"});
    try {
        const token = hdr.slice(7);
        const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string };
        (req as any).userId = payload.sub;
        next();
    } catch {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }
}