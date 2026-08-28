import express from 'express';
import { apiRouter } from './routes/api.routes.js';
import { cors, logger } from './middleware/http.js';
import { errorHandler, notFound } from './utils/errors.js';
import { prisma } from './lib/prisma.js';
import { asyncHandler } from './utils/errors.js';

export const app = express();
app.disable('x-powered-by');
app.use(cors);
app.use(logger);
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', asyncHandler(async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'degraded', database: 'disconnected' });
  }
}));
app.use('/api/v1', apiRouter);
app.use(notFound);
app.use(errorHandler);
