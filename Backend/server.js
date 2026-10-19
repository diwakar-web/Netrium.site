import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';


const app = express();
const PORT = process.env.PORT || 5000;

// Prevent uncaught rejections from terminating the server process
process.on('unhandledRejection', (reason, promise) => {
  console.warn('[Process Notice] Handled async rejection:', reason?.message || reason);
});

process.on('uncaughtException', (err) => {
  console.warn('[Process Notice] Handled uncaught exception:', err?.message || err);
});

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors({
  origin: '*', // Allow requests from any frontend port/client
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger for API calls
app.use((req, res, next) => {
  console.log(`[API ${req.method}] ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.status(200).json({
    status: 'online',
    service: 'Netrium Systems Laboratory API',
    timestamp: new Date().toISOString(),
    database: {
      state: dbStateMap[mongoose.connection.readyState] || 'unknown',
      connected: mongoose.connection.readyState === 1,
      name: mongoose.connection.name
    }
  });
});

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error occurred'
  });
});

const server = app.listen(PORT, () => {
  console.log(`\n=======================================================`);
  console.log(`[Netrium] Backend Server is ONLINE & READY!`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
  console.log(`Auth Endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`=======================================================\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[PORT CONFLICT] Port ${PORT} is already in use by another process.`);
    console.error(`   To free port ${PORT}, stop the existing process or set PORT=5001 in Backend/.env.\n`);
    process.exit(1);
  } else {
    console.error('[Server Error]', err);
  }
});

