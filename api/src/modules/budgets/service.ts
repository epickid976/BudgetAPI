import { db } from "../../config/db.js";
import { budgetItems, budgetMonths, transactions } from "../../db/schema.js";
import { and, eq, gte, lte, sql } from "drizzle-orm";

export async function getMonth(userId: string, year: number, month: number) {
  const [bm] = await db
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
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  const tx = await db
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

  const planned = await db
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

export async function getAllMonths(userId: string) {
  // Get all budget months for the user
  const months = await db
    .select()
    .from(budgetMonths)
    .where(eq(budgetMonths.userId, userId));

  if (months.length === 0) return [];

  // For each month, get items with actual spending
  const results = await Promise.all(months.map(async (bm) => {
    const year = bm.year;
    const month = bm.month;

    // month is 1–12, build UTC dates at boundaries
    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const tx = await db
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

    const planned = await db
      .select()
      .from(budgetItems)
      .where(eq(budgetItems.budgetMonthId, bm.id));

    const actualMap = new Map(tx.map(r => [r.categoryId, Number(r.actualCents ?? 0)]));
    const items = planned.map(it => ({
      categoryId: it.categoryId,
      plannedCents: it.plannedCents,
      actualCents: actualMap.get(it.categoryId) ?? 0,
    }));

    return {
      id: bm.id,
      year: bm.year,
      month: bm.month,
      items,
    };
  }));

  return results;
}
