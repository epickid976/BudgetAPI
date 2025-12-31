import { Router } from "express";
import { z } from "zod";
import { db } from "../api/src/config/db.js";
import { budgetMonths, budgetItems } from "../api/src/db/schema.js";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../api/src/middlewares/auth.js";
import * as budgetService from "../api/src/modules/budgets/service.js";

export const budgetsRouter = Router();

// All routes require authentication
budgetsRouter.use(requireAuth);

// Validation schemas
const setBudgetItemSchema = z.object({
  categoryId: z.string(),
  plannedCents: z.number().int(),
});

// GET /budgets - Get all budget months with items for the user
budgetsRouter.get("/", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const months = await budgetService.getAllMonths(userId);
    res.json(months);
  } catch (err) {
    console.error("Failed to fetch all budgets:", err);
    res.status(500).json({ error: "Failed to fetch budgets" });
  }
});

// GET /budgets/:year/:month
budgetsRouter.get("/:year/:month", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: "Invalid year or month" });
    }

    const result = await budgetService.getMonth(userId, year, month);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch budget" });
  }
});

// POST /budgets/:year/:month/items
budgetsRouter.post("/:year/:month/items", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);
    const data = setBudgetItemSchema.parse(req.body);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: "Invalid year or month" });
    }

    // Find or create budget month
    let [budgetMonth] = await db
      .select()
      .from(budgetMonths)
      .where(and(
        eq(budgetMonths.userId, userId),
        eq(budgetMonths.year, year),
        eq(budgetMonths.month, month)
      ));

    if (!budgetMonth) {
      [budgetMonth] = await db
        .insert(budgetMonths)
        .values({ userId, year, month })
        .returning();
    }

    // Check if budget item already exists
    const [existing] = await db
      .select()
      .from(budgetItems)
      .where(and(
        eq(budgetItems.budgetMonthId, budgetMonth.id),
        eq(budgetItems.categoryId, data.categoryId)
      ));

    if (existing) {
      return res.status(409).json({ error: "Budget item already exists, use PUT to update" });
    }

    // Create budget item
    const [item] = await db
      .insert(budgetItems)
      .values({
        budgetMonthId: budgetMonth.id,
        categoryId: data.categoryId,
        plannedCents: data.plannedCents,
      })
      .returning();

    res.status(201).json(item);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to create budget item" });
  }
});

// PUT /budgets/:year/:month/items/:categoryId
budgetsRouter.put("/:year/:month/items/:categoryId", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);
    const categoryId = req.params.categoryId;
    const { plannedCents } = z.object({ plannedCents: z.number().int() }).parse(req.body);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: "Invalid year or month" });
    }

    // Find budget month
    const [budgetMonth] = await db
      .select()
      .from(budgetMonths)
      .where(and(
        eq(budgetMonths.userId, userId),
        eq(budgetMonths.year, year),
        eq(budgetMonths.month, month)
      ));

    if (!budgetMonth) {
      return res.status(404).json({ error: "Budget month not found" });
    }

    // Find and update budget item
    const [existing] = await db
      .select()
      .from(budgetItems)
      .where(and(
        eq(budgetItems.budgetMonthId, budgetMonth.id),
        eq(budgetItems.categoryId, categoryId)
      ));

    if (!existing) {
      return res.status(404).json({ error: "Budget item not found" });
    }

    const [updated] = await db
      .update(budgetItems)
      .set({ plannedCents })
      .where(eq(budgetItems.id, existing.id))
      .returning();

    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to update budget item" });
  }
});

// DELETE /budgets/:year/:month/items/:categoryId
budgetsRouter.delete("/:year/:month/items/:categoryId", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);
    const categoryId = req.params.categoryId;

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: "Invalid year or month" });
    }

    // Find budget month
    const [budgetMonth] = await db
      .select()
      .from(budgetMonths)
      .where(and(
        eq(budgetMonths.userId, userId),
        eq(budgetMonths.year, year),
        eq(budgetMonths.month, month)
      ));

    if (!budgetMonth) {
      return res.status(404).json({ error: "Budget month not found" });
    }

    // Find budget item
    const [existing] = await db
      .select()
      .from(budgetItems)
      .where(and(
        eq(budgetItems.budgetMonthId, budgetMonth.id),
        eq(budgetItems.categoryId, categoryId)
      ));

    if (!existing) {
      return res.status(404).json({ error: "Budget item not found" });
    }

    await db.delete(budgetItems).where(eq(budgetItems.id, existing.id));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete budget item" });
  }
});