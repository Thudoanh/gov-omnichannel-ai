import type { CannedSnippet, FAQItem } from '../types';
import { apiRequest, json } from './api';

export const faqApi = {
  list: () => apiRequest<FAQItem[]>('/faqs'),
  create: (faq: Omit<FAQItem, 'id'>) => apiRequest<FAQItem>('/faqs', json('POST', faq)),
  update: (id: string, changes: Partial<FAQItem>) => apiRequest<FAQItem>(`/faqs/${encodeURIComponent(id)}`, json('PUT', changes)),
  remove: (id: string) => apiRequest<void>(`/faqs/${encodeURIComponent(id)}`, json('DELETE')),
  snippets: () => apiRequest<CannedSnippet[]>('/snippets')
};
