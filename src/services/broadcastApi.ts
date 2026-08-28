import type { BroadcastCampaign, BroadcastReply, TicketItem } from '../types';
import { apiRequest, json } from './api';

export const broadcastApi = {
  list: () => apiRequest<BroadcastCampaign[]>('/campaigns'),
  create: (campaign: Omit<BroadcastCampaign, 'id'>) => apiRequest<BroadcastCampaign>('/campaigns', json('POST', campaign)),
  update: (id: string, changes: Partial<BroadcastCampaign>) => apiRequest<BroadcastCampaign>(`/campaigns/${encodeURIComponent(id)}`, json('PUT', changes)),
  remove: (id: string) => apiRequest<void>(`/campaigns/${encodeURIComponent(id)}`, json('DELETE')),
  replies: () => apiRequest<BroadcastReply[]>('/broadcast-replies'),
  updateReply: (id: string, changes: Partial<BroadcastReply>) => apiRequest<BroadcastReply>(`/broadcast-replies/${encodeURIComponent(id)}`, json('PATCH', changes)),
  routeReplyToTicket: (id: string, ticket: TicketItem) => apiRequest<{ reply: BroadcastReply; ticket: TicketItem }>(`/broadcast-replies/${encodeURIComponent(id)}/route-to-ticket`, json('POST', { ticket }))
};
