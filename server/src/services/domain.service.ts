import type { MessageItem, UserProfile } from '../models/domain.js';
import { dataStore } from '../repositories/data.repository.js';

const nowLabel = () => new Date().toLocaleString('vi-VN');

export const ticketService = {
  list(query: Record<string, unknown>) {
    return dataStore.tickets.findFiltered({
      channel: typeof query.channel === 'string' ? query.channel : undefined,
      status: typeof query.status === 'string' ? query.status : undefined,
      urgency: typeof query.urgency === 'string' ? query.urgency : undefined,
      category: typeof query.category === 'string' ? query.category : undefined,
      search: typeof query.search === 'string' ? query.search : undefined
    });
  },
  addMessage(ticketId: string, input: Pick<MessageItem, 'text'> & Partial<MessageItem>, officer: UserProfile) {
    const message: MessageItem = {
      id: `msg-${Date.now()}`, sender: input.sender ?? 'officer',
      senderName: input.senderName ?? `${officer.fullName} (${officer.title})`,
      text: input.text, time: input.time ?? nowLabel(), attachments: input.attachments
    };
    return dataStore.tickets.addMessage(ticketId, message, officer.fullName);
  },
  addNote(ticketId: string, note: string, authorId?: string) {
    return dataStore.tickets.addNote(ticketId, note, authorId);
  }
};
