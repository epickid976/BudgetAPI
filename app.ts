import createError from 'http-errors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';

// Import routes
import { authRouter } from './routes/authRoutes.ts';
import { accountsRouter } from './routes/accountRoutes.ts';
import { categoriesRouter } from './routes/categoryRoutes.ts';
import { transactionsRouter } from './routes/transactionRoutes.ts';
import { budgetsRouter } from './routes/budgetRoutes.ts';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS - Allow frontends to communicate with API
const allowedOrigins = [
  // Development - Common frontend ports
  'http://localhost:3000',      // React/Next.js default
  'http://localhost:3001',      // Alternative React
  'http://localhost:3002',      // Alternative frontend
  'http://localhost:3003',      // Alternative frontend
  'http://localhost:5173',      // Vite default
  'http://localhost:5174',      // Alternative Vite
  'http://localhost:8080',      // Vue CLI default
  'http://localhost:8081',      // Alternative Vue
  'http://localhost:4200',      // Angular default
  
  // Production - Add your deployed frontend URLs
  process.env.FRONTEND_URL,     // From environment variable
  'https://budget-vue.ejvapps.online',  // Your Vercel deployment
  // 'https://your-app.vercel.app',
  // 'https://your-app.netlify.app',
  // 'https://yourdomain.com',
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // In development, allow all localhost origins
    if (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    // Log rejected origins for debugging
    console.log(`CORS rejected origin: ${origin}`);
    console.log(`Allowed origins:`, allowedOrigins);
    console.log(`NODE_ENV:`, process.env.NODE_ENV);
    
    // Don't throw error - just deny
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // Cache preflight requests for 10 minutes
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/auth', authRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/budgets', budgetsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).json({ error: 'Not found' });
});

// error handler
app.use(function(err, req, res, next) {
  console.error('Error:', err);
  
  // Send JSON error response
  res.status(err.status || 500).json({
    error: req.app.get('env') === 'development' ? err.message : 'Internal server error'
  });
});

export default app;
