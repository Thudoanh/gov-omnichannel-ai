import type { NextFunction, Request, Response } from 'express';

export function cors(req: Request, res: Response, next: NextFunction) {
  const allowedOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:3000';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
}

export function logger(req: Request, res: Response, next: NextFunction) {
  const started = Date.now();
  res.on('finish', () => console.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - started}ms`));
  next();
}
