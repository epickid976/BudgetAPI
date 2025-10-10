#!/usr/bin/env tsx
/**
 * Cleanup script for expired blacklisted tokens
 * 
 * Run this periodically via cron job:
 * 0 2 * * * cd /path/to/project && npm run cleanup:tokens
 */

import { cleanupExpiredTokens } from "../services/tokenBlacklist.js";

async function main() {
  console.log("Starting token blacklist cleanup...");
  
  try {
    const cleaned = await cleanupExpiredTokens();
    console.log(`✅ Cleanup complete. Removed expired tokens.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    process.exit(1);
  }
}

main();

