#!/usr/bin/env tsx

import { sql } from 'drizzle-orm';
import { db } from '../api/src/config/db.js';
import { config } from 'dotenv';

config();

console.log('🗑️  Dropping all existing tables...\n');

async function dropAllTables() {
    try {
        const isPostgres = process.env.DRIZZLE_DIALECT === 'postgresql';
        
        if (isPostgres) {
            console.log('Using PostgreSQL - dropping all tables in public schema...');
            
            // Drop all tables in PostgreSQL
            await db.execute(sql`
                DROP SCHEMA public CASCADE;
                CREATE SCHEMA public;
                GRANT ALL ON SCHEMA public TO postgres;
                GRANT ALL ON SCHEMA public TO public;
            `);
            
            console.log('✅ All PostgreSQL tables dropped successfully!');
        } else {
            console.log('Using SQLite - dropping individual tables...');
            
            const tables = [
                'budget_items',
                'budget_months',
                'transactions',
                'categories',
                'accounts',
                'blacklisted_tokens',
                'email_verification_tokens',
                'password_resets',
                'users'
            ];
            
            for (const table of tables) {
                try {
                    await db.execute(sql.raw(`DROP TABLE IF EXISTS ${table}`));
                    console.log(`✅ Dropped table: ${table}`);
                } catch (error: any) {
                    console.log(`⚠️  Could not drop ${table}:`, error.message);
                }
            }
        }
        
        console.log('\n✅ Database reset complete!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error resetting database:', error);
        process.exit(1);
    }
}

dropAllTables();

