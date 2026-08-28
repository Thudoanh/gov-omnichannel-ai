import type { UserProfile } from '../types';
import { apiRequest, json, setAuthToken } from './api';

export const authApi = {
  async login(user: UserProfile) {
    const result = await apiRequest<{ user: UserProfile; token: string }>('/auth/login', json('POST', { identifier: user.id, user }));
    setAuthToken(result.token); return result.user;
  },
  me: () => apiRequest<UserProfile>('/auth/me'),
  async logout() { await apiRequest('/auth/logout', json('POST')); setAuthToken(null); }
};
