# Running BudgetAPI in PyCharm

## Quick Start

The application is now ready to run! Here's what was fixed:

### Fixed Issues
1. ✅ Converted all files from CommonJS to ES modules
2. ✅ Added `.env` file with required environment variables
3. ✅ Installed and configured `dotenv` for environment variable loading
4. ✅ Fixed all TypeScript imports to use `.js` extensions (required for ES modules)
5. ✅ Created PyCharm run configurations that use `tsx` instead of plain `node`

## Running in PyCharm

### ⭐ Option 1: Use Pre-configured Run Configuration (Easiest!)
The run configuration has been automatically created. Simply:
1. Look at the top-right of PyCharm for the run configuration dropdown
2. Select **"Start BudgetAPI"** or **"bin/www"** from the dropdown
3. Click the **green ▶️ play button** (or press Shift+F10)
4. Your browser will automatically open to http://localhost:3000

### Option 2: Using npm scripts
1. Open the `package.json` file
2. Click the green play button next to `"start": "tsx ./bin/www"`
3. The server will start on http://localhost:3000

### Option 3: Using Terminal in PyCharm
1. Open the built-in terminal in PyCharm (View > Tool Windows > Terminal)
2. Run: `npm start`

## Important: Why tsx is Required

This project uses TypeScript files (`.ts`) but Node.js natively only runs JavaScript (`.js`). The `tsx` package:
- Transpiles TypeScript to JavaScript on-the-fly
- Handles ES module imports with `.js` extensions correctly
- Allows mixing `.ts` and `.js` files seamlessly

**Don't run files directly with `node`** - always use `npm start` or the pre-configured run configurations!

## Environment Variables

The `.env` file has been created with default values:

```env
DRIZZLE_DIALECT=sqlite
DATABASE_URL=./budget.db
JWT_ACCESS_SECRET=your-access-secret-key-min-16-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-16-chars
PORT=3000
NODE_ENV=development
```

**Important**: Change the JWT secrets before deploying to production!

## Testing the Application

Once running, you can access:
- **Web UI**: http://localhost:3000
- **API Endpoint**: http://localhost:3000/api/accounts

## Troubleshooting

If you encounter issues:
1. Make sure Node.js v18+ is installed
2. Run `npm install` to ensure all dependencies are installed
3. Check that the `.env` file exists in the project root
4. Verify PyCharm is using the correct Node.js interpreter

