import { AppError } from './errors.js';

export function requireObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new AppError(400, 'INVALID_BODY', 'Request body must be a JSON object');
  return value as Record<string, unknown>;
}

export function requireFields(body: Record<string, unknown>, fields: string[]) {
  const missing = fields.filter((field) => body[field] === undefined || body[field] === null || body[field] === '');
  if (missing.length) throw new AppError(400, 'VALIDATION_ERROR', `Missing required fields: ${missing.join(', ')}`);
}

export function requireEnum(value: unknown, field: string, values: readonly string[]) {
  if (typeof value !== 'string' || !values.includes(value)) throw new AppError(400, 'VALIDATION_ERROR', `${field} must be one of: ${values.join(', ')}`);
}

export function requireId(id: string | undefined) {
  if (!id || !/^[\w.-]+$/.test(id)) throw new AppError(400, 'INVALID_ID', 'Invalid route id');
  return id;
}

export function stringField(body: Record<string, unknown>, field: string, options: { min?: number; max?: number; pattern?: RegExp } = {}) {
  const value = body[field];
  const min = options.min ?? 1;
  const max = options.max ?? 5000;
  if (typeof value !== 'string' || value.trim().length < min || value.length > max || (options.pattern && !options.pattern.test(value))) {
    throw new AppError(400, 'VALIDATION_ERROR', `${field} is invalid`);
  }
  return value.trim();
}

export function optionalString(body: Record<string, unknown>, field: string, max = 5000) {
  if (body[field] === undefined || body[field] === null) return undefined;
  if (typeof body[field] !== 'string' || body[field].length > max) throw new AppError(400, 'VALIDATION_ERROR', `${field} is invalid`);
  return body[field] as string;
}

export function booleanField(body: Record<string, unknown>, field: string, fallback?: boolean) {
  if (body[field] === undefined && fallback !== undefined) return fallback;
  if (typeof body[field] !== 'boolean') throw new AppError(400, 'VALIDATION_ERROR', `${field} must be boolean`);
  return body[field] as boolean;
}

export function numberField(body: Record<string, unknown>, field: string, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const value = body[field];
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw new AppError(400, 'VALIDATION_ERROR', `${field} must be between ${min} and ${max}`);
  return value;
}

export function stringArray(body: Record<string, unknown>, field: string, maxItems = 100) {
  const value = body[field];
  if (!Array.isArray(value) || value.length > maxItems || value.some((item) => typeof item !== 'string' || item.length > 1000)) throw new AppError(400, 'VALIDATION_ERROR', `${field} must be an array of strings`);
  return value as string[];
}

export function emailField(body: Record<string, unknown>, field = 'email') {
  return stringField(body, field, { max: 254, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ });
}

export function rejectFields(body: Record<string, unknown>, fields: string[]) {
  const rejected = fields.filter((field) => body[field] !== undefined);
  if (rejected.length) throw new AppError(400, 'PRIVILEGED_FIELDS_NOT_ALLOWED', `Fields cannot be changed here: ${rejected.join(', ')}`);
}
