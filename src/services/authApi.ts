import type { UserProfile } from '../types';
import { apiRequest, json, setAuthToken } from './api';

export const authApi = {
  async login(userOrIdentifier: UserProfile | string) {
    const isString = typeof userOrIdentifier === 'string';
    const payload = isString ? { identifier: userOrIdentifier } : { identifier: userOrIdentifier.id, user: userOrIdentifier };
    const result = await apiRequest<{ user: UserProfile; token: string }>('/auth/login', json('POST', payload));
    setAuthToken(result.token); return result.user;
  },
  me: () => apiRequest<UserProfile>('/auth/me'),
  async logout() { await apiRequest('/auth/logout', json('POST')); setAuthToken(null); }
};
