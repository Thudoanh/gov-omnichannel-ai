import type { MessageItem, TicketItem, TicketStatus } from '../types';
import { apiRequest, json } from './api';

export const ticketApi = {
  list: () => apiRequest<TicketItem[]>('/tickets'),
  get: (id: string) => apiRequest<TicketItem>(`/tickets/${encodeURIComponent(id)}`),
  create: (ticket: TicketItem) => apiRequest<TicketItem>('/tickets', json('POST', ticket)),
  update: (id: string, ticket: Partial<TicketItem>) => apiRequest<TicketItem>(`/tickets/${encodeURIComponent(id)}`, json('PUT', ticket)),
  remove: (id: string) => apiRequest<void>(`/tickets/${encodeURIComponent(id)}`, json('DELETE')),
  addMessage: (id: string, text: string) => apiRequest<TicketItem>(`/tickets/${encodeURIComponent(id)}/messages`, json('POST', { text })),
  addNote: (id: string, note: string) => apiRequest<TicketItem>(`/tickets/${encodeURIComponent(id)}/notes`, json('POST', { note })),
  setStatus: (id: string, status: TicketStatus) => apiRequest<TicketItem>(`/tickets/${encodeURIComponent(id)}/status`, json('PATCH', { status })),
  setAssignee: (id: string, assignedOfficer: string) => apiRequest<TicketItem>(`/tickets/${encodeURIComponent(id)}/assignee`, json('PATCH', { assignedOfficer }))
};
