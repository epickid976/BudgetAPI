import { db } from "../../config/db.js";
import { accounts, transactions } from "../../db/schema.js";
import { eq, sql } from "drizzle-orm";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema.js";

const sqliteDb = db as unknown as BetterSQLite3Database<typeof schema>;

/**
 * Get all accounts for a user with their current balances
 */
export async function getAccountsWithBalances(userId: string) {
  // Query accounts and calculate balance from transactions
  const results = await sqliteDb
    .select({
      id: accounts.id,
      userId: accounts.userId,
      name: accounts.name,
      type: accounts.type,
      currency: accounts.currency,
      createdAt: accounts.createdAt,
      balanceCents: sql<number>`COALESCE(SUM(${transactions.amountCents}), 0)`,
    })
    .from(accounts)
    .leftJoin(transactions, eq(accounts.id, transactions.accountId))
    .where(eq(accounts.userId, userId))
    .groupBy(accounts.id);

  return results;
}

/**
 * Get a single account with its balance
 */
export async function getAccountWithBalance(userId: string, accountId: string) {
  const [result] = await sqliteDb
    .select({
      id: accounts.id,
      userId: accounts.userId,
      name: accounts.name,
      type: accounts.type,
      currency: accounts.currency,
      createdAt: accounts.createdAt,
      balanceCents: sql<number>`COALESCE(SUM(${transactions.amountCents}), 0)`,
    })
    .from(accounts)
    .leftJoin(transactions, eq(accounts.id, transactions.accountId))
    .where(eq(accounts.id, accountId))
    .groupBy(accounts.id);

  return result;
}

/**
 * Get balance for a specific account
 */
export async function getAccountBalance(accountId: string): Promise<number> {
  const [result] = await sqliteDb
    .select({
      balanceCents: sql<number>`COALESCE(SUM(${transactions.amountCents}), 0)`,
    })
    .from(transactions)
    .where(eq(transactions.accountId, accountId));

  return result?.balanceCents ?? 0;
}

/**
 * Get balances for all user accounts as a map
 */
export async function getAllAccountBalances(userId: string): Promise<Map<string, number>> {
  const results = await sqliteDb
    .select({
      accountId: transactions.accountId,
      balanceCents: sql<number>`SUM(${transactions.amountCents})`,
    })
    .from(transactions)
    .innerJoin(accounts, eq(accounts.id, transactions.accountId))
    .where(eq(accounts.userId, userId))
    .groupBy(transactions.accountId);

  return new Map(results.map(r => [r.accountId, Number(r.balanceCents ?? 0)]));
}

