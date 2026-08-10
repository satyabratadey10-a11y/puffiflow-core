import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config, validateEnv } from './config/env';

import healthRouter from './routes/health';
import uploadRouter from './routes/upload';
import jobsRouter from './routes/jobs';
import cronRouter from './routes/cron';
import authRouter from './routes/auth';
import storageRouter from './routes/storage';
import youtubeRouter from './routes/youtube';

const app = express();

// Validate Environment Variables
validateEnv();

// 1. Helmet Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Managed by Next.js frontend
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Explicit Security Invariant Headers
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// 2. CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://puffiflow-core-web-t8e1.vercel.app',
  'http://localhost:3000',
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server crons)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive CORS for public APIs while setting origin headers
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));

// 3. Global & Sensitive Endpoint Rate Limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again later.' },
});

const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 sensitive requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded for sensitive operation. Please try again later.' },
});

app.use(globalLimiter);

// 4. Register API Routes
app.use('/api', healthRouter);
app.use('/api/storage', sensitiveLimiter);
app.use('/api/upload', sensitiveLimiter);
app.use('/api/auth', sensitiveLimiter);

app.use('/api', uploadRouter);
app.use('/api', jobsRouter);
app.use('/api', cronRouter);
app.use('/api', authRouter);
app.use('/api', youtubeRouter);
app.use('/api', storageRouter);

// 5. Global Error Handling Middleware (Masking internal stack traces & system details)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Unhandled Internal Error]:', err.message || err);
  return res.status(500).json({
    error: 'An internal server error occurred.',
  });
});

// Start Express Server
app.listen(config.port, () => {
  console.log(`====================================================`);
  console.log(`🚀 PuffiFlow Core API Server running on port ${config.port}`);
  console.log(`   Health Check: http://localhost:${config.port}/api/health`);
  console.log(`====================================================`);
});

export default app;
