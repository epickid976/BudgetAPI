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

// CORS - Allow Vue frontend to communicate with API
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
