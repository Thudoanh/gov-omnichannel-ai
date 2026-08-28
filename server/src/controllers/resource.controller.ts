import type { Request, RequestHandler } from 'express';
import type { Entity, Repository } from '../repositories/repository.js';
import { AppError } from '../utils/errors.js';
import { asyncHandler } from '../utils/errors.js';
import { requireId, requireObject } from '../utils/validation.js';

export const list = <T extends Entity>(repository: Repository<T>, select?: (req: Request) => Promise<T[]>): RequestHandler =>
  asyncHandler(async (req, res) => { const items = select ? await select(req) : await repository.findAll(); res.json({ success: true, data: items, meta: { total: items.length } }); });

export const get = <T extends Entity>(repository: Repository<T>): RequestHandler =>
  asyncHandler(async (req, res) => { const item = await repository.findById(requireId(req.params.id)); if (!item) throw new AppError(404, 'NOT_FOUND', `Resource ${req.params.id} not found`); res.json({ success: true, data: item }); });

export const create = <T extends Entity>(repository: Repository<T>, make: (body: Record<string, unknown>) => T): RequestHandler =>
  asyncHandler(async (req, res) => { const item = await repository.create(make(requireObject(req.body))); res.status(201).json({ success: true, data: item }); });

export const update = <T extends Entity>(repository: Repository<T>, map?: (body: Record<string, unknown>) => Partial<T>): RequestHandler =>
  asyncHandler(async (req, res) => { const body = requireObject(req.body); const item = await repository.update(requireId(req.params.id), map ? map(body) : body as Partial<T>); res.json({ success: true, data: item }); });

export const remove = <T extends Entity>(repository: Repository<T>): RequestHandler =>
  asyncHandler(async (req, res) => { const deleted = await repository.delete(requireId(req.params.id)); res.json({ success: true, data: { id: deleted.id, deleted: true } }); });
