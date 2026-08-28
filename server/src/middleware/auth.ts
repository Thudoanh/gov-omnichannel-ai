import { createHash, randomBytes } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '../models/domain.js';
import { prisma } from '../lib/prisma.js';
import { dataStore } from '../repositories/data.repository.js';
import { AppError, asyncHandler } from '../utils/errors.js';

const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');

export const sessionStore = {
  async create(userId: string) {
    const token = randomBytes(32).toString('base64url');
    await prisma.session.create({ data: { tokenHash: tokenHash(token), userId, expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000) } });
    return token;
  },
  async get(token: string) {
    const session = await prisma.session.findUnique({ where: { tokenHash: tokenHash(token) } });
    if (!session || session.expiresAt <= new Date()) {
      if (session) await prisma.session.delete({ where: { id: session.id } });
      return undefined;
    }
    return session.userId;
  },
  async delete(token: string) { await prisma.session.deleteMany({ where: { tokenHash: tokenHash(token) } }); }
};

export const authenticate = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = req.header('authorization')?.replace(/^Bearer\s+/i, '');
  const userId = token && await sessionStore.get(token);
  const user = userId && await dataStore.users.findById(userId);
  if (!user) throw new AppError(401, 'UNAUTHORIZED', 'A valid mock session is required');
  req.user = user;
  next();
});

export const authorize = (...roles: UserRole[]) => (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'));
  if (!roles.includes(req.user.role)) return next(new AppError(403, 'FORBIDDEN', 'Your role cannot perform this action'));
  next();
};
