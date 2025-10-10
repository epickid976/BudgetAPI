#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status

echo "🚀 Starting production deployment..."

echo "📊 Checking environment variables..."
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL is not set!"
  exit 1
fi

if [ -z "$DRIZZLE_DIALECT" ]; then
  echo "❌ ERROR: DRIZZLE_DIALECT is not set!"
  exit 1
fi

echo "✅ Environment variables OK"

echo "🗄️  Running database migrations..."
npm run drizzle:push

if [ $? -eq 0 ]; then
  echo "✅ Migrations completed successfully"
else
  echo "❌ Migrations failed!"
  exit 1
fi

echo "🌐 Starting server..."
tsx ./bin/www

