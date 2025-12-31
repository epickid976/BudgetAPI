import { Router } from "express";
import { z } from "zod";
import { db } from "../api/src/config/db.js";
import { accounts } from "../api/src/db/schema.js";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../api/src/middlewares/auth.js";
import * as accountService from "../api/src/modules/accounts/service.js";

export const accountsRouter = Router();

// All routes require authentication
accountsRouter.use(requireAuth);

// Validation schemas
const createAccountSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["cash", "checking", "savings", "credit"]),
  currency: z.string().length(3),
});

const updateAccountSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(["cash", "checking", "savings", "credit"]).optional(),
  currency: z.string().length(3).optional(),
});

// GET /accounts?includeBalance=true
accountsRouter.get("/", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const includeBalance = req.query.includeBalance === 'true';

    if (includeBalance) {
      // Return accounts with calculated balances
      const rows = await accountService.getAccountsWithBalances(userId);
      res.json(rows);
    } else {
      // Return accounts without balances (faster query)
      const rows = await db.select().from(accounts).where(eq(accounts.userId, userId));
      res.json(rows);
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

// GET /accounts/balances - Get balances for all accounts
accountsRouter.get("/balances", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const balances = await accountService.getAllAccountBalances(userId);

    // Convert Map to object for JSON response
    const balancesObj = Object.fromEntries(balances);
    res.json(balancesObj);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch balances" });
  }
});

// GET /accounts/:id?includeBalance=true
accountsRouter.get("/:id", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const includeBalance = req.query.includeBalance === 'true';

    if (includeBalance) {
      // Return account with balance
      const account = await accountService.getAccountWithBalance(userId, req.params.id);
      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }
      res.json(account);
    } else {
      // Return account without balance
      const [account] = await db
        .select()
        .from(accounts)
        .where(and(eq(accounts.id, req.params.id), eq(accounts.userId, userId)));

      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }
      res.json(account);
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch account" });
  }
});

// POST /accounts
accountsRouter.post("/", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const data = createAccountSchema.parse(req.body);
    const [row] = await db.insert(accounts).values({ ...data, userId }).returning();
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
    const [existing] = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.id, req.params.id), eq(accounts.userId, userId)));

    if (!existing) {
      return res.status(404).json({ error: "Account not found" });
    }

    const [updated] = await db
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
    const [existing] = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.id, req.params.id), eq(accounts.userId, userId)));

    if (!existing) {
      return res.status(404).json({ error: "Account not found" });
    }

    await db.delete(accounts).where(eq(accounts.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    console.error("Failed to delete account:", err);
    res.status(500).json({ error: "Failed to delete account" });
  }
});