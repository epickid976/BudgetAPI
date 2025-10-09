// routes/accounts.ts
import { Router } from "express";
import { z } from "zod";
import { db } from "../config/db.js";
import { accounts } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../db/schema.js";

const sqliteDb = db as unknown as BetterSQLite3Database<typeof schema>;

const createAccountSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["cash", "checking", "credit"]),
  currency: z.string().length(3),
});

const router = Router();

//Test
// router.get("/", async (req, res) => {
//   res.send("Hello World");
// });

router.get("/", async (req, res, next) => {
  try {
    const userId = (req as any).userId;
    const rows = await sqliteDb
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId));
    res.json(rows);
  } catch (err) {
    next(err);
  }
});


router.post("/", async (req, res, next) => {
  try {
    const userId = (req as any).userId;
    const data = createAccountSchema.parse(req.body);
    const [row] = await sqliteDb.insert(accounts).values({ ...data, userId }).returning();
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

export default router; // <- CommonJS `require()` can read this as `.default`