export interface ApiEnvelope<T> { success: true; data: T; meta?: { total: number } }
export interface ApiFailure { success: false; error: { code: string; message: string } }

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api/v1';
let authToken = localStorage.getItem('govtech_api_token') ?? '';

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}

export function setAuthToken(token: string | null) {
  authToken = token ?? '';
  if (token) localStorage.setItem('govtech_api_token', token);
  else localStorage.removeItem('govtech_api_token');
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}), ...init.headers }
  });
  if (response.status === 204) return undefined as T;
  const payload = await response.json() as ApiEnvelope<T> | ApiFailure;
  if (!response.ok || !payload.success) {
    const failure = payload as ApiFailure;
    throw new ApiError(response.status, failure.error?.code ?? 'API_ERROR', failure.error?.message ?? 'Không thể kết nối máy chủ');
  }
  return payload.data;
}

export const json = (method: string, body?: unknown): RequestInit => ({ method, body: body === undefined ? undefined : JSON.stringify(body) });
