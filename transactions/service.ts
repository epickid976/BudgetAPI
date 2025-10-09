import { db } from "../config/db.js";
import { transactions } from "../db/schema.js";
import { and, eq, gte, lte } from "drizzle-orm";

import * as schema from "../db/schema.js";
import {BetterSQLite3Database} from "drizzle-orm/better-sqlite3";

const sqliteDb = db as unknown as BetterSQLite3Database<typeof schema>;

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
  return sqliteDb.select().from(transactions).where(where).limit(limit);
}
