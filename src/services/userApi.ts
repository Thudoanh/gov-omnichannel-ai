import type { UserProfile } from '../types';
import { apiRequest, json } from './api';

export const userApi = {
  list: () => apiRequest<UserProfile[]>('/users'),
  create: (user: UserProfile) => apiRequest<UserProfile>('/users', json('POST', user)),
  update: (id: string, changes: Partial<UserProfile>) => apiRequest<UserProfile>(`/users/${encodeURIComponent(id)}`, json('PUT', changes)),
  remove: (id: string) => apiRequest<void>(`/users/${encodeURIComponent(id)}`, json('DELETE'))
};
