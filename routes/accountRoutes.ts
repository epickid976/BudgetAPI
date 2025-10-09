import { Router } from "express";
import { z } from "zod";
import { db } from "../api/src/config/db.js";
import { accounts } from "../api/src/db/schema.js";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../api/src/middlewares/auth.js";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../api/src/db/schema.js";

const sqliteDb = db as unknown as BetterSQLite3Database<typeof schema>;

export const accountsRouter = Router();

// All routes require authentication
accountsRouter.use(requireAuth);

// Validation schemas
const createAccountSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["cash", "checking", "credit"]),
  currency: z.string().length(3),
});

const updateAccountSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(["cash", "checking", "credit"]).optional(),
  currency: z.string().length(3).optional(),
});

// GET /accounts
accountsRouter.get("/", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const rows = await sqliteDb.select().from(accounts).where(eq(accounts.userId, userId));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

// GET /accounts/:id
accountsRouter.get("/:id", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const [account] = await sqliteDb
      .select()
      .from(accounts)
      .where(and(eq(accounts.id, req.params.id), eq(accounts.userId, userId)));
    
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }
    res.json(account);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch account" });
  }
});

// POST /accounts
accountsRouter.post("/", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const data = createAccountSchema.parse(req.body);
    const [row] = await sqliteDb.insert(accounts).values({ ...data, userId }).returning();
    res.status(201).json(row);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to create account" });
  }
});

// PUT /accounts/:id
accountsRouter.put("/:id", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const data = updateAccountSchema.parse(req.body);
    
    // Check ownership
    const [existing] = await sqliteDb
      .select()
      .from(accounts)
      .where(and(eq(accounts.id, req.params.id), eq(accounts.userId, userId)));
    
    if (!existing) {
      return res.status(404).json({ error: "Account not found" });
    }
    
    const [updated] = await sqliteDb
      .update(accounts)
      .set(data)
      .where(eq(accounts.id, req.params.id))
      .returning();
    
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to update account" });
  }
});

// DELETE /accounts/:id
accountsRouter.delete("/:id", async (req, res) => {
  try {
    const userId = (req as any).userId;
    
    // Check ownership
    const [existing] = await sqliteDb
      .select()
      .from(accounts)
      .where(and(eq(accounts.id, req.params.id), eq(accounts.userId, userId)));
    
    if (!existing) {
      return res.status(404).json({ error: "Account not found" });
    }
    
    await sqliteDb.delete(accounts).where(eq(accounts.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete account" });
  }
});