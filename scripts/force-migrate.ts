#!/usr/bin/env tsx

import { sql } from 'drizzle-orm';
import { db } from '../api/src/config/db.js';
import { config } from 'dotenv';

config();

console.log('🗄️  Force creating database tables...\n');

const createTablesSQL = `
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email_verified INTEGER DEFAULT 0 NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL
);

-- Create email verification tokens
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at INTEGER NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL
);

-- Create password reset tokens
CREATE TABLE IF NOT EXISTS password_resets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at INTEGER NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL,
    used INTEGER DEFAULT 0 NOT NULL
);

-- Create blacklisted tokens
CREATE TABLE IF NOT EXISTS blacklisted_tokens (
    id TEXT PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    expires_at INTEGER NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    balance REAL DEFAULT 0 NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL,
    updated_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    color TEXT,
    icon TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    date INTEGER NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL,
    updated_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL
);

-- Create budget months table
CREATE TABLE IF NOT EXISTS budget_months (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    income REAL DEFAULT 0 NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL,
    UNIQUE(user_id, month)
);

-- Create budget items table
CREATE TABLE IF NOT EXISTS budget_items (
    id TEXT PRIMARY KEY,
    budget_month_id TEXT NOT NULL REFERENCES budget_months(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    planned REAL NOT NULL,
    spent REAL DEFAULT 0 NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL,
    updated_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS email_verification_tokens_user_idx ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS email_verification_tokens_token_idx ON email_verification_tokens(token);

CREATE INDEX IF NOT EXISTS password_resets_user_idx ON password_resets(user_id);
CREATE INDEX IF NOT EXISTS password_resets_token_idx ON password_resets(token);

CREATE INDEX IF NOT EXISTS blacklisted_tokens_token_idx ON blacklisted_tokens(token);
CREATE INDEX IF NOT EXISTS blacklisted_tokens_user_idx ON blacklisted_tokens(user_id);

CREATE INDEX IF NOT EXISTS accounts_user_idx ON accounts(user_id);
CREATE INDEX IF NOT EXISTS categories_user_idx ON categories(user_id);
CREATE INDEX IF NOT EXISTS transactions_user_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_account_idx ON transactions(account_id);
CREATE INDEX IF NOT EXISTS transactions_category_idx ON transactions(category_id);
CREATE INDEX IF NOT EXISTS budget_months_user_idx ON budget_months(user_id);
CREATE INDEX IF NOT EXISTS budget_items_budget_month_idx ON budget_items(budget_month_id);
CREATE INDEX IF NOT EXISTS budget_items_category_idx ON budget_items(category_id);
`;

// For PostgreSQL, convert SQLite syntax
const createTablesPostgresSQL = `
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email_verified INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create email verification tokens
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create password reset tokens
CREATE TABLE IF NOT EXISTS password_resets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    used INTEGER DEFAULT 0 NOT NULL
);

-- Create blacklisted tokens
CREATE TABLE IF NOT EXISTS blacklisted_tokens (
    id TEXT PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    balance REAL DEFAULT 0 NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    color TEXT,
    icon TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create budget months table
CREATE TABLE IF NOT EXISTS budget_months (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    income REAL DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(user_id, month)
);

-- Create budget items table
CREATE TABLE IF NOT EXISTS budget_items (
    id TEXT PRIMARY KEY,
    budget_month_id TEXT NOT NULL REFERENCES budget_months(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    planned REAL NOT NULL,
    spent REAL DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS email_verification_tokens_user_idx ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS email_verification_tokens_token_idx ON email_verification_tokens(token);

CREATE INDEX IF NOT EXISTS password_resets_user_idx ON password_resets(user_id);
CREATE INDEX IF NOT EXISTS password_resets_token_idx ON password_resets(token);

CREATE INDEX IF NOT EXISTS blacklisted_tokens_token_idx ON blacklisted_tokens(token);
CREATE INDEX IF NOT EXISTS blacklisted_tokens_user_idx ON blacklisted_tokens(user_id);

CREATE INDEX IF NOT EXISTS accounts_user_idx ON accounts(user_id);
CREATE INDEX IF NOT EXISTS categories_user_idx ON categories(user_id);
CREATE INDEX IF NOT EXISTS transactions_user_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_account_idx ON transactions(account_id);
CREATE INDEX IF NOT EXISTS transactions_category_idx ON transactions(category_id);
CREATE INDEX IF NOT EXISTS budget_months_user_idx ON budget_months(user_id);
CREATE INDEX IF NOT EXISTS budget_items_budget_month_idx ON budget_items(budget_month_id);
CREATE INDEX IF NOT EXISTS budget_items_category_idx ON budget_items(category_id);
`;

async function main() {
    try {
        const isPostgres = process.env.DRIZZLE_DIALECT === 'postgresql';
        const sqlToRun = isPostgres ? createTablesPostgresSQL : createTablesSQL;
        
        console.log(`Using ${isPostgres ? 'PostgreSQL' : 'SQLite'} syntax`);
        
        // Split by semicolon and run each statement
        const statements = sqlToRun
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));
        
        console.log(`Executing ${statements.length} SQL statements...\n`);
        
        for (const statement of statements) {
            try {
                await db.execute(sql.raw(statement));
                console.log('✅', statement.substring(0, 50) + '...');
            } catch (error: any) {
                // Ignore "already exists" errors
                if (!error.message?.includes('already exists')) {
                    console.error('❌', statement.substring(0, 50) + '...');
                    console.error('   Error:', error.message);
                }
            }
        }
        
        console.log('\n✅ Database tables created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error creating tables:', error);
        process.exit(1);
    }
}

main();

