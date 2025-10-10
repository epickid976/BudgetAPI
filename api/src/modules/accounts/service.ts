import { db } from "../../config/db.js";
import { accounts, transactions } from "../../db/schema.js";
import { eq, sql } from "drizzle-orm";

/**
 * Get all accounts for a user with their current balances
 */
export async function getAccountsWithBalances(userId: string) {
  // Get all accounts
  const userAccounts = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, userId));

  // Get balances for each account
  const balances = await getAllAccountBalances(userId);

  // Combine accounts with their balances
  return userAccounts.map(account => ({
    ...account,
    balanceCents: balances.get(account.id) ?? 0,
  }));
}

/**
 * Get a single account with its balance
 */
export async function getAccountWithBalance(userId: string, accountId: string) {
  const [account] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.id, accountId));

  if (!account) {
    return null;
  }

  const balanceCents = await getAccountBalance(accountId);

  return {
    ...account,
    balanceCents,
  };
}

/**
 * Get balance for a specific account
 */
export async function getAccountBalance(accountId: string): Promise<number> {
  const [result] = await db
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
  const results = await db
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

