import express from 'express';
import cors from 'cors';
import { config, validateEnv } from './config/env';
import healthRouter from './routes/health';
import uploadRouter from './routes/upload';
import jobsRouter from './routes/jobs';
import cronRouter from './routes/cron';
import authRouter from './routes/auth';
import storageRouter from './routes/storage';
import youtubeRouter from './routes/youtube';

const app = express();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Validate Environment Variables
validateEnv();

// Register API Routes
app.use('/api', healthRouter);
app.use('/api', uploadRouter);
app.use('/api', jobsRouter);
app.use('/api', cronRouter);
app.use('/api', authRouter);
app.use('/api', youtubeRouter);
app.use('/api', storageRouter);

// Start Express Server
app.listen(config.port, () => {
  console.log(`====================================================`);
  console.log(`🚀 PuffiFlow Core API Server running on port ${config.port}`);
  console.log(`   Health Check: http://localhost:${config.port}/api/health`);
  console.log(`====================================================`);
});

export default app;
