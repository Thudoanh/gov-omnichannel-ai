import type { AfterHoursRule, NightShiftLog } from '../types';
import { apiRequest, json } from './api';

export const afterHoursApi = {
  rules: () => apiRequest<AfterHoursRule[]>('/after-hours/rules'),
  updateRule: (id: string, changes: Partial<AfterHoursRule>) => apiRequest<AfterHoursRule>(`/after-hours/rules/${encodeURIComponent(id)}`, json('PUT', changes)),
  logs: () => apiRequest<NightShiftLog[]>('/after-hours/logs'),
  createLog: (log: NightShiftLog) => apiRequest<NightShiftLog>('/after-hours/logs', json('POST', log)),
  updateLog: (id: string, changes: Partial<NightShiftLog>) => apiRequest<NightShiftLog>(`/after-hours/logs/${encodeURIComponent(id)}`, json('PATCH', changes))
};
