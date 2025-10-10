#!/usr/bin/env tsx

import { config } from 'dotenv';
import { Pool } from 'pg';
import Database from 'better-sqlite3';

// Load environment variables
config();

console.log('🗑️  Dropping all existing tables...\n');

async function dropAllTables() {
    try {
        const isPostgres = process.env.DRIZZLE_DIALECT === 'postgresql';
        console.log(`Detected dialect: ${process.env.DRIZZLE_DIALECT}`);
        console.log(`Database URL: ${process.env.DATABASE_URL?.substring(0, 30)}...`);
        
        if (isPostgres) {
            console.log('Using PostgreSQL - connecting to database...');
            
            const pool = new Pool({ connectionString: process.env.DATABASE_URL });
            
            try {
                // Test connection
                await pool.query('SELECT NOW()');
                console.log('✅ Connected to PostgreSQL');
                
                // Get all tables
                const result = await pool.query(`
                    SELECT tablename 
                    FROM pg_tables 
                    WHERE schemaname = 'public'
                `);
                
                console.log(`Found ${result.rows.length} tables to drop`);
                
                // Drop each table
                for (const row of result.rows) {
                    const tableName = row.tablename;
                    try {
                        await pool.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE`);
                        console.log(`✅ Dropped table: ${tableName}`);
                    } catch (error: any) {
                        console.log(`⚠️  Could not drop ${tableName}:`, error.message);
                    }
                }
                
                console.log('✅ All PostgreSQL tables dropped successfully!');
                await pool.end();
                
            } catch (err: any) {
                console.error('❌ Error connecting to PostgreSQL:', err.message);
                console.error('Full error:', err);
                process.exit(1);
            }
        } else {
            console.log('Using SQLite - dropping individual tables...');
            
            const sqlite = new Database(process.env.DATABASE_URL || './budget.db');
            
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
                    sqlite.exec(`DROP TABLE IF EXISTS ${table}`);
                    console.log(`✅ Dropped table: ${table}`);
                } catch (error: any) {
                    console.log(`⚠️  Could not drop ${table}:`, error.message);
                }
            }
            
            sqlite.close();
        }
        
        console.log('\n✅ Database reset complete!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error resetting database:', error);
        process.exit(1);
    }
}

dropAllTables();
