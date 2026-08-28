import { CampaignRepository, FAQRepository, LogRepository, ReplyRepository, RuleRepository, SnippetRepository, TicketRepository, UserRepository } from './prisma.repository.js';

export const dataStore = {
  users: new UserRepository(),
  tickets: new TicketRepository(),
  rules: new RuleRepository(),
  logs: new LogRepository(),
  faqs: new FAQRepository(),
  snippets: new SnippetRepository(),
  campaigns: new CampaignRepository(),
  replies: new ReplyRepository()
};
