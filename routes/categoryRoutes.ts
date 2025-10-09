import { Router } from "express";
import { z } from "zod";
import { db } from "../api/src/config/db.js";
import { categories } from "../api/src/db/schema.js";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../api/src/middlewares/auth.js";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../api/src/db/schema.js";

const sqliteDb = db as unknown as BetterSQLite3Database<typeof schema>;

export const categoriesRouter = Router();

// All routes require authentication
categoriesRouter.use(requireAuth);

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(1),
  kind: z.enum(["income", "expense"]),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  kind: z.enum(["income", "expense"]).optional(),
});

// GET /categories
categoriesRouter.get("/", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { kind } = req.query;

    let query = sqliteDb.select().from(categories).where(eq(categories.userId, userId));

    // Optional filter by kind
    if (kind === "income" || kind === "expense") {
      query = sqliteDb
        .select()
        .from(categories)
        .where(and(eq(categories.userId, userId), eq(categories.kind, kind)));
    }

    const rows = await query;
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// GET /categories/:id
categoriesRouter.get("/:id", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const [category] = await sqliteDb
      .select()
      .from(categories)
      .where(and(eq(categories.id, req.params.id), eq(categories.userId, userId)));

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch category" });
  }
});

// POST /categories
categoriesRouter.post("/", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const data = createCategorySchema.parse(req.body);
    const [row] = await sqliteDb.insert(categories).values({ ...data, userId }).returning();
    res.status(201).json(row);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to create category" });
  }
});

// PUT /categories/:id
categoriesRouter.put("/:id", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const data = updateCategorySchema.parse(req.body);

    // Check ownership
    const [existing] = await sqliteDb
      .select()
      .from(categories)
      .where(and(eq(categories.id, req.params.id), eq(categories.userId, userId)));

    if (!existing) {
      return res.status(404).json({ error: "Category not found" });
    }

    const [updated] = await sqliteDb
      .update(categories)
      .set(data)
      .where(eq(categories.id, req.params.id))
      .returning();

    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to update category" });
  }
});

// DELETE /categories/:id
categoriesRouter.delete("/:id", async (req, res) => {
  try {
    const userId = (req as any).userId;

    // Check ownership
    const [existing] = await sqliteDb
      .select()
      .from(categories)
      .where(and(eq(categories.id, req.params.id), eq(categories.userId, userId)));

    if (!existing) {
      return res.status(404).json({ error: "Category not found" });
    }

    await sqliteDb.delete(categories).where(eq(categories.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete category" });
  }
});