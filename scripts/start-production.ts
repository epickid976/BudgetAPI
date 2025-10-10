#!/usr/bin/env tsx

import { spawn } from 'child_process';
import { config } from 'dotenv';

// Load environment variables
config();

console.log('🚀 Starting production deployment...\n');

// Check environment variables
console.log('📊 Checking environment variables...');
const required = ['DATABASE_URL', 'DRIZZLE_DIALECT', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error(`❌ ERROR: Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`✅ Database: ${process.env.DRIZZLE_DIALECT}`);
console.log(`✅ All required variables are set\n`);

// Run migrations
console.log('🗄️  Running database migrations...');
const migrate = spawn('npm', ['run', 'drizzle:push'], {
  stdio: 'inherit',
  shell: true
});

migrate.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ Migrations failed with code ${code}`);
    process.exit(1);
  }
  
  console.log('✅ Migrations completed successfully\n');
  
  // Start server
  console.log('🌐 Starting server...');
  const server = spawn('tsx', ['./bin/www'], {
    stdio: 'inherit',
    shell: true
  });
  
  server.on('close', (serverCode) => {
    process.exit(serverCode || 0);
  });
});

// Handle termination signals
process.on('SIGTERM', () => {
  console.log('\n⏹️  Received SIGTERM, shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⏹️  Received SIGINT, shutting down...');
  process.exit(0);
});

