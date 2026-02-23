import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import uploadRouter from './routes/upload';
import statusRouter from './routes/status';
import transcribeRouter from './routes/transcribe';
import analyzeRouter from './routes/analyze';
import exportRouter from './routes/export';
import { errorMiddleware } from './middleware/error.middleware';
import logger from './utils/logger';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve uploaded videos for preview
app.use('/uploads', express.static(path.resolve(UPLOAD_DIR)));

// Routes
app.use('/api/upload', uploadRouter);
app.use('/api/status', statusRouter);
app.use('/api/transcribe', transcribeRouter);
app.use('/api/analyze', analyzeRouter);
app.use('/api/export', exportRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Error handler
app.use(errorMiddleware);

const server = app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});

// Disable timeouts for large file uploads
server.timeout = 0;
server.requestTimeout = 0;

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    // Cleanup uploads
    if (fs.existsSync(UPLOAD_DIR)) {
      const files = fs.readdirSync(UPLOAD_DIR);
      for (const file of files) {
        try {
          fs.unlinkSync(path.join(UPLOAD_DIR, file));
        } catch {
          // ignore
        }
      }
    }
    process.exit(0);
  });
});
