import type { Prisma } from '@prisma/client';
import type { AfterHoursRule, BroadcastCampaign, BroadcastReply, CannedSnippet, FAQItem, MessageItem, NightShiftLog, TicketItem, UserProfile } from '../models/domain.js';

export const ticketInclude = {
  messages: { orderBy: { createdAt: 'asc' as const } },
  internalNotes: { orderBy: { createdAt: 'asc' as const } },
  aiAnalysis: true
} satisfies Prisma.TicketInclude;

export type TicketRecord = Prisma.TicketGetPayload<{ include: typeof ticketInclude }>;

export function toUser(record: Prisma.UserGetPayload<Record<string, never>>): UserProfile {
  return {
    id: record.id, username: record.username, fullName: record.fullName, email: record.email,
    phone: record.phone, idCard: record.idCard, role: record.role, title: record.title,
    department: record.department, badgeNumber: record.badgeNumber, avatarInitials: record.avatarInitials,
    avatarColor: record.avatarColor, status: record.status, createdAt: record.createdAtLabel,
    lastLogin: record.lastLogin ?? undefined, isVNeIDVerified: record.isVNeIDVerified
  };
}

function toMessage(record: TicketRecord['messages'][number]): MessageItem {
  return {
    id: record.id, sender: record.sender, senderName: record.senderName ?? undefined, text: record.text,
    time: record.timeLabel,
    attachments: record.attachments ? record.attachments as unknown as MessageItem['attachments'] : undefined,
    isInternal: record.isInternal || undefined
  };
}

export function toTicket(record: TicketRecord): TicketItem {
  if (!record.aiAnalysis) throw new Error(`Ticket ${record.id} is missing AI analysis`);
  const { ticketId: _ticketId, ...aiAnalysis } = record.aiAnalysis;
  return {
    id: record.id, citizenName: record.citizenName, phone: record.phone, email: record.email ?? undefined,
    channel: record.channel, channelName: record.channelName, category: record.category, urgency: record.urgency,
    status: record.status, createdAt: record.createdAtLabel, updatedAt: record.updatedAtLabel,
    assignedOfficer: record.assignedOfficer, lastMessage: record.lastMessage,
    unreadCount: record.unreadCount ?? undefined, conversation: record.messages.map(toMessage),
    aiAnalysis,
    internalNote: record.internalNotes.at(-1)?.content,
    slaDeadlineMinutes: record.slaDeadlineMinutes ?? undefined, tags: record.tags,
    resolvedAt: record.resolvedAtLabel ?? undefined,
    resolutionType: record.resolutionType ?? undefined
  };
}

export const toFAQ = (record: Prisma.FAQGetPayload<Record<string, never>>): FAQItem => ({
  id: record.id, intentCode: record.intentCode, title: record.title, category: record.category,
  sampleQuestions: record.sampleQuestions, keywords: record.keywords, officialAnswer: record.officialAnswer,
  legalBasis: record.legalBasis, requiredDocuments: record.requiredDocuments,
  processingDays: record.processingDays, fee: record.fee,
  autoResolutionEnabled: record.autoResolutionEnabled, usageCount: record.usageCount, accuracyRate: record.accuracyRate
});

export const toSnippet = (record: Prisma.CannedSnippetGetPayload<Record<string, never>>): CannedSnippet => ({
  id: record.id, title: record.title, shortcut: record.shortcut, category: record.category,
  content: record.content, variables: record.variables
});

export const toRule = (record: Prisma.AfterHoursRuleGetPayload<Record<string, never>>): AfterHoursRule => ({
  id: record.id, title: record.title, scheduleType: record.scheduleType,
  activeTimeWindow: record.activeTimeWindow, autoReplyTemplate: record.autoReplyTemplate,
  createCallbackTicket: record.createCallbackTicket, smsZaloConfirmation: record.smsZaloConfirmation,
  aiBotEnabled: record.aiBotEnabled, isActive: record.isActive
});

export const toLog = (record: Prisma.AfterHoursLogGetPayload<Record<string, never>>): NightShiftLog => ({
  id: record.id, citizenName: record.citizenName, phone: record.phone, channel: record.channel,
  receivedAt: record.receivedAtLabel, questionSnippet: record.questionSnippet,
  actionTaken: record.actionTaken, ticketCode: record.ticketCode,
  callbackAssignedTo: record.callbackAssignedTo, callbackTimeTarget: record.callbackTimeTarget,
  status: record.status
});

export const toCampaign = (record: Prisma.CampaignGetPayload<Record<string, never>>): BroadcastCampaign => ({
  id: record.id, title: record.title, category: record.category, targetGroup: record.targetGroup,
  recipientCount: record.recipientCount, channels: record.channels, scheduledAt: record.scheduledAt,
  status: record.status, contentSnippet: record.contentSnippet, deliveredCount: record.deliveredCount,
  readCount: record.readCount, responseCount: record.responseCount, failedCount: record.failedCount,
  createdAt: record.createdAtLabel, senderOfficer: record.senderOfficer
});

export const toReply = (record: Prisma.BroadcastReplyGetPayload<Record<string, never>>): BroadcastReply => ({
  id: record.id, campaignId: record.campaignId, campaignTitle: record.campaignTitle,
  citizenName: record.citizenName, phone: record.phone, channel: record.channel,
  replyText: record.replyText, receivedAt: record.receivedAtLabel, status: record.status,
  assignedOfficer: record.assignedOfficer ?? undefined
});
