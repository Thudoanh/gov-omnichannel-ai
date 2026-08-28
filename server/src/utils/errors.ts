import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

export const asyncHandler = (handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => void handler(req, res, next).catch(next);

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, 'ROUTE_NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found`));
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  let appError: AppError;
  if (error instanceof AppError) appError = error;
  else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') appError = new AppError(409, 'CONFLICT', 'A resource with the same unique value already exists');
  else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') appError = new AppError(404, 'NOT_FOUND', 'Resource not found');
  else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') appError = new AppError(409, 'RELATION_CONFLICT', 'The resource is still referenced by related data');
  else if (error instanceof Prisma.PrismaClientInitializationError) appError = new AppError(503, 'DATABASE_UNAVAILABLE', 'Database is unavailable');
  else appError = new AppError(500, 'INTERNAL_ERROR', 'Internal server error');
  if (!(error instanceof AppError) && !(error instanceof Prisma.PrismaClientKnownRequestError)) console.error(error);
  res.status(appError.status).json({ success: false, error: { code: appError.code, message: appError.message } });
}
