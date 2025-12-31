import { Router } from "express";
import { z } from "zod";
import { db } from "../api/src/config/db.js";
import { transactions } from "../api/src/db/schema.js";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../api/src/middlewares/auth.js";
import * as transactionService from "../api/src/modules/transactions/service.js";

export const transactionsRouter = Router();

// All routes require authentication
transactionsRouter.use(requireAuth);

// Validation schemas
const createTransactionSchema = z.object({
  accountId: z.string(),
  categoryId: z.string(),
  amountCents: z.number().int(),
  note: z.string().optional(),
  occurredAt: z.number().or(z.string().transform(s => new Date(s).getTime())),
});

const updateTransactionSchema = z.object({
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  amountCents: z.number().int().optional(),
  note: z.string().optional(),
  occurredAt: z.number().or(z.string().transform(s => new Date(s).getTime())).optional(),
});

const listQuerySchema = z.object({
  from: z.string().optional().transform(s => s ? parseInt(s) : undefined),
  to: z.string().optional().transform(s => s ? parseInt(s) : undefined),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  limit: z.string().optional().transform(s => s ? parseInt(s) : undefined),
});

// GET /transactions
transactionsRouter.get("/", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const params = listQuerySchema.parse(req.query);
    const rows = await transactionService.listTx(userId, params);
    res.json(rows);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to fetch transactions" });
  }
});

// GET /transactions/:id
transactionsRouter.get("/:id", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, req.params.id), eq(transactions.userId, userId)));

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transaction" });
  }
});

// POST /transactions
transactionsRouter.post("/", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const data = createTransactionSchema.parse(req.body);

    // Convert timestamp to Date if needed
    const occurredAt = typeof data.occurredAt === 'number'
      ? (data.occurredAt > 1e12 ? new Date(data.occurredAt) : new Date(data.occurredAt * 1000))
      : new Date(data.occurredAt);

    const [row] = await db.insert(transactions).values({
      userId,
      accountId: data.accountId,
      categoryId: data.categoryId,
      amountCents: data.amountCents,
      note: data.note,
      occurredAt,
    }).returning();

    res.status(201).json(row);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to create transaction" });
  }
});

// PUT /transactions/:id
transactionsRouter.put("/:id", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const data = updateTransactionSchema.parse(req.body);

    // Check ownership
    const [existing] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, req.params.id), eq(transactions.userId, userId)));

    if (!existing) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Convert timestamp if provided
    const updateData: any = { ...data };
    if (data.occurredAt) {
      updateData.occurredAt = typeof data.occurredAt === 'number'
        ? (data.occurredAt > 1e12 ? new Date(data.occurredAt) : new Date(data.occurredAt * 1000))
        : new Date(data.occurredAt);
    }

    const [updated] = await db
      .update(transactions)
      .set(updateData)
      .where(eq(transactions.id, req.params.id))
      .returning();

    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to update transaction" });
  }
});

// DELETE /transactions/:id
transactionsRouter.delete("/:id", async (req, res) => {
  try {
    const userId = (req as any).userId;

    // Check ownership
    const [existing] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, req.params.id), eq(transactions.userId, userId)));

    if (!existing) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    await db.delete(transactions).where(eq(transactions.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    console.error("Failed to delete transaction:", err);
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});