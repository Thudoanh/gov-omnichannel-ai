import { apiRequest } from './api';

export interface AnalyticsOverviewData {
  tickets: { total: number; pending: number; processing: number; resolved: number };
  afterHours: { total: number; pendingCallbacks: number; autoAnswered: number };
  broadcast: { campaigns: number; delivered: number; readRate: number; responseRate: number };
  knowledgeBase: { faqs: number; autoResolutionEnabled: number; totalUsage: number; averageAccuracy: number };
}
export const analyticsApi = { overview: () => apiRequest<AnalyticsOverviewData>('/analytics/overview') };
