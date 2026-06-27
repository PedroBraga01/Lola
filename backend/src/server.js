import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';

import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import calendarRoutes from './routes/calendar.js';
import tasksRoutes from './routes/tasks.js';

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ---------------------
// Middleware
// ---------------------

// Security headers
app.use(helmet());

// CORS — allow frontend origin with credentials
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parse JSON bodies
app.use(express.json());

// Trust proxy is required when behind a reverse proxy (like Render) to set secure cookies
app.set('trust proxy', 1);

// Session management (in-memory store)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'lola-dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // true on Render
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // none required for cross-domain cookies
    },
  })
);

// ---------------------
// Routes
// ---------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Lola Backend',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/tasks', tasksRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

// ---------------------
// Start server
// ---------------------
app.listen(PORT, () => {
  console.log(`🚀 Lola Backend rodando na porta ${PORT}`);
  console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
});
