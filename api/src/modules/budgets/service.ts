import { db } from "../../config/db.js";
import { budgetItems, budgetMonths, transactions } from "../../db/schema.js";
import {and, eq, gte, lte, sql} from "drizzle-orm";

import * as schema from "../../db/schema.js";
import {BetterSQLite3Database} from "drizzle-orm/better-sqlite3";

const sqliteDb = db as unknown as BetterSQLite3Database<typeof schema>;

export async function getMonth(userId: string, year: number, month: number) {
  const [bm] = await sqliteDb
    .select()
    .from(budgetMonths)
    .where(and(
      eq(budgetMonths.userId, userId),
      eq(budgetMonths.year, year),
      eq(budgetMonths.month, month),
    ));

  if (!bm) return { items: [] };

  // month is 1–12, build UTC dates at boundaries
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end   = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  const tx = await sqliteDb
    .select({
      categoryId: transactions.categoryId,
      actualCents: sql<number>`
        SUM(CASE WHEN ${transactions.amountCents} < 0 THEN 0 ELSE ${transactions.amountCents} END)
      `,
    })
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId),
      gte(transactions.occurredAt, start),
      lte(transactions.occurredAt, end),
    ))
    .groupBy(transactions.categoryId);

  const planned = await sqliteDb
    .select()
    .from(budgetItems)
    .where(eq(budgetItems.budgetMonthId, bm.id));

  const actualMap = new Map(tx.map(r => [r.categoryId, Number(r.actualCents ?? 0)]));
  const items = planned.map(it => ({
    categoryId: it.categoryId,
    plannedCents: it.plannedCents,
    actualCents: actualMap.get(it.categoryId) ?? 0,
  }));

  return { items };
}
