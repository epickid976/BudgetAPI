import { db } from "../../config/db.js";
import { transactions } from "../../db/schema.js";
import { and, eq, gte, lte } from "drizzle-orm";

// handy helper if you may get seconds OR milliseconds
const toDate = (n: number) => (n > 1e12 ? new Date(n) : new Date(n * 1000));


export async function listTx(
  userId: string,
  params: { from?: number; to?: number; accountId?: string; categoryId?: string; limit?: number; cursor?: string }
) {
  const where = and(
    eq(transactions.userId, userId),
    params.from ? gte(transactions.occurredAt, toDate(params.from)) : undefined,
    params.to   ? lte(transactions.occurredAt, toDate(params.to))   : undefined,
    params.accountId  ? eq(transactions.accountId, params.accountId)     : undefined,
    params.categoryId ? eq(transactions.categoryId, params.categoryId)   : undefined,
  );

  const limit = Math.min(params.limit ?? 50, 200);
  return db.select().from(transactions).where(where).limit(limit);
}
