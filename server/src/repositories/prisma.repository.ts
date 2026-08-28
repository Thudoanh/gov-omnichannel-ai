import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import type { AfterHoursRule, BroadcastCampaign, BroadcastReply, CannedSnippet, FAQItem, MessageItem, NightShiftLog, TicketItem, UserProfile } from '../models/domain.js';
import { AppError } from '../utils/errors.js';
import { ticketInclude, toCampaign, toFAQ, toLog, toReply, toRule, toSnippet, toTicket, toUser } from './mappers.js';
import type { Repository } from './repository.js';

const missing = (kind: string, id: string) => new AppError(404, 'NOT_FOUND', `${kind} ${id} not found`);
const messageData = (message: MessageItem) => ({
  id: message.id, sender: message.sender, senderName: message.senderName, text: message.text,
  timeLabel: message.time, attachments: message.attachments as Prisma.InputJsonValue | undefined,
  isInternal: message.isInternal ?? false
});

async function assigneeId(client: Prisma.TransactionClient, assignedOfficer: string) {
  return (await client.user.findFirst({ where: { fullName: assignedOfficer }, select: { id: true } }))?.id;
}

export async function createTicketWithClient(client: Prisma.TransactionClient, item: TicketItem) {
  const assignedUserId = await assigneeId(client, item.assignedOfficer);
  const record = await client.ticket.create({
    data: {
      id: item.id, citizenName: item.citizenName, phone: item.phone, email: item.email,
      channel: item.channel, channelName: item.channelName, category: item.category,
      urgency: item.urgency, status: item.status, createdAtLabel: item.createdAt,
      updatedAtLabel: item.updatedAt, assignedOfficer: item.assignedOfficer,
      assigneeId: assignedUserId, lastMessage: item.lastMessage, unreadCount: item.unreadCount,
      slaDeadlineMinutes: item.slaDeadlineMinutes, tags: item.tags ?? [],
      resolvedAtLabel: item.resolvedAt, resolutionType: item.resolutionType,
      messages: { create: item.conversation.map(messageData) },
      internalNotes: item.internalNote ? { create: { content: item.internalNote, authorId: assignedUserId } } : undefined,
      aiAnalysis: { create: {
        summary: item.aiAnalysis.summary, category: item.aiAnalysis.category, intent: item.aiAnalysis.intent,
        urgencyReason: item.aiAnalysis.urgencyReason, lawCitation: item.aiAnalysis.lawCitation,
        suggestedReply: item.aiAnalysis.suggestedReply, confidenceScore: item.aiAnalysis.confidenceScore,
        autoResolvable: item.aiAnalysis.autoResolvable
      } }
    },
    include: ticketInclude
  });
  return toTicket(record);
}

export class UserRepository implements Repository<UserProfile> {
  async findAll() { return (await prisma.user.findMany({ orderBy: { createdAt: 'asc' } })).map(toUser); }
  async findById(id: string) { const item = await prisma.user.findUnique({ where: { id } }); return item ? toUser(item) : undefined; }
  async findByIdentifier(identifier: string) {
    const item = await prisma.user.findFirst({ where: { OR: [
      { id: identifier }, { username: { equals: identifier, mode: 'insensitive' } },
      { email: { equals: identifier, mode: 'insensitive' } }, { badgeNumber: { equals: identifier, mode: 'insensitive' } },
      { idCard: identifier }
    ] } });
    return item ? toUser(item) : undefined;
  }
  async create(item: UserProfile) {
    return toUser(await prisma.user.create({ data: {
      id: item.id, username: item.username, fullName: item.fullName, email: item.email,
      phone: item.phone, idCard: item.idCard, role: item.role, title: item.title,
      department: item.department, badgeNumber: item.badgeNumber, avatarInitials: item.avatarInitials,
      avatarColor: item.avatarColor, status: item.status, createdAtLabel: item.createdAt,
      lastLogin: item.lastLogin, isVNeIDVerified: item.isVNeIDVerified ?? false
    } }));
  }
  async update(id: string, changes: Partial<UserProfile>) {
    if (!await this.findById(id)) throw missing('User', id);
    return toUser(await prisma.user.update({ where: { id }, data: {
      username: changes.username, fullName: changes.fullName, email: changes.email, phone: changes.phone,
      idCard: changes.idCard, role: changes.role, title: changes.title, department: changes.department,
      badgeNumber: changes.badgeNumber, avatarInitials: changes.avatarInitials,
      avatarColor: changes.avatarColor, status: changes.status, lastLogin: changes.lastLogin,
      isVNeIDVerified: changes.isVNeIDVerified
    } }));
  }
  async delete(id: string) { const item = await this.findById(id); if (!item) throw missing('User', id); await prisma.user.delete({ where: { id } }); return item; }
}

export interface TicketFilters { channel?: string; status?: string; urgency?: string; category?: string; search?: string }
export class TicketRepository implements Repository<TicketItem> {
  async findAll() { return this.findFiltered({}); }
  async findFiltered(filters: TicketFilters) {
    const where: Prisma.TicketWhereInput = {
      channel: filters.channel as Prisma.EnumChannelTypeFilter['equals'],
      status: filters.status as Prisma.EnumTicketStatusFilter['equals'],
      urgency: filters.urgency as Prisma.EnumUrgencyLevelFilter['equals'],
      category: filters.category,
      ...(filters.search ? { OR: [
        { id: { contains: filters.search, mode: 'insensitive' } },
        { citizenName: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search } },
        { lastMessage: { contains: filters.search, mode: 'insensitive' } }
      ] } : {})
    };
    return (await prisma.ticket.findMany({ where, include: ticketInclude, orderBy: { createdAt: 'desc' } })).map(toTicket);
  }
  async findById(id: string) { const item = await prisma.ticket.findUnique({ where: { id }, include: ticketInclude }); return item ? toTicket(item) : undefined; }
  async create(item: TicketItem) { return prisma.$transaction((tx: Prisma.TransactionClient) => createTicketWithClient(tx, item)); }
  async update(id: string, changes: Partial<TicketItem>) {
    if (!await this.findById(id)) throw missing('Ticket', id);
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let assignedUserId: string | undefined;
      if (changes.assignedOfficer) assignedUserId = await assigneeId(tx, changes.assignedOfficer);
      if (changes.conversation) {
        await tx.message.deleteMany({ where: { ticketId: id } });
        if (changes.conversation.length) await tx.message.createMany({ data: changes.conversation.map((message) => ({ ...messageData(message), ticketId: id })) });
      }
      if (changes.internalNote !== undefined) await tx.internalNote.create({ data: { ticketId: id, content: changes.internalNote } });
      if (changes.aiAnalysis) await tx.ticketAIAnalysis.upsert({ where: { ticketId: id }, create: { ticketId: id, ...changes.aiAnalysis }, update: { ...changes.aiAnalysis } });
      const record = await tx.ticket.update({ where: { id }, data: {
        citizenName: changes.citizenName, phone: changes.phone, email: changes.email,
        channel: changes.channel, channelName: changes.channelName, category: changes.category,
        urgency: changes.urgency, status: changes.status, createdAtLabel: changes.createdAt,
        updatedAtLabel: changes.updatedAt, assignedOfficer: changes.assignedOfficer,
        assigneeId: changes.assignedOfficer ? assignedUserId ?? null : undefined,
        lastMessage: changes.lastMessage, unreadCount: changes.unreadCount,
        slaDeadlineMinutes: changes.slaDeadlineMinutes, tags: changes.tags,
        resolvedAtLabel: changes.resolvedAt, resolutionType: changes.resolutionType
      }, include: ticketInclude });
      return toTicket(record);
    });
  }
  async addMessage(id: string, message: MessageItem, assignedOfficer: string) {
    if (!await this.findById(id)) throw missing('Ticket', id);
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const assignedUserId = await assigneeId(tx, assignedOfficer);
      await tx.message.create({ data: { ticketId: id, ...messageData(message) } });
      return toTicket(await tx.ticket.update({ where: { id }, data: { lastMessage: message.text, assignedOfficer, assigneeId: assignedUserId ?? null, status: 'processing', updatedAtLabel: message.time }, include: ticketInclude }));
    });
  }
  async addNote(id: string, content: string, authorId?: string) {
    if (!await this.findById(id)) throw missing('Ticket', id);
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.internalNote.create({ data: { ticketId: id, authorId, content } });
      return toTicket(await tx.ticket.update({ where: { id }, data: { updatedAtLabel: new Date().toLocaleString('vi-VN') }, include: ticketInclude }));
    });
  }
  async delete(id: string) { const item = await this.findById(id); if (!item) throw missing('Ticket', id); await prisma.ticket.delete({ where: { id } }); return item; }
}

export class FAQRepository implements Repository<FAQItem> {
  async findAll() { return (await prisma.fAQ.findMany({ orderBy: { createdAt: 'asc' } })).map(toFAQ); }
  async findById(id: string) { const item = await prisma.fAQ.findUnique({ where: { id } }); return item ? toFAQ(item) : undefined; }
  async create(item: FAQItem) { return toFAQ(await prisma.fAQ.create({ data: item })); }
  async update(id: string, c: Partial<FAQItem>) { if (!await this.findById(id)) throw missing('FAQ', id); return toFAQ(await prisma.fAQ.update({ where: { id }, data: { intentCode: c.intentCode, title: c.title, category: c.category, sampleQuestions: c.sampleQuestions, keywords: c.keywords, officialAnswer: c.officialAnswer, legalBasis: c.legalBasis, requiredDocuments: c.requiredDocuments, processingDays: c.processingDays, fee: c.fee, autoResolutionEnabled: c.autoResolutionEnabled, usageCount: c.usageCount, accuracyRate: c.accuracyRate } })); }
  async delete(id: string) { const item = await this.findById(id); if (!item) throw missing('FAQ', id); await prisma.fAQ.delete({ where: { id } }); return item; }
}

export class SnippetRepository implements Repository<CannedSnippet> {
  async findAll() { return (await prisma.cannedSnippet.findMany({ orderBy: { createdAt: 'asc' } })).map(toSnippet); }
  async findById(id: string) { const item = await prisma.cannedSnippet.findUnique({ where: { id } }); return item ? toSnippet(item) : undefined; }
  async create(i: CannedSnippet) { return toSnippet(await prisma.cannedSnippet.create({ data: i })); }
  async update(id: string, c: Partial<CannedSnippet>) { if (!await this.findById(id)) throw missing('Snippet', id); return toSnippet(await prisma.cannedSnippet.update({ where: { id }, data: { title: c.title, shortcut: c.shortcut, category: c.category, content: c.content, variables: c.variables } })); }
  async delete(id: string) { const item = await this.findById(id); if (!item) throw missing('Snippet', id); await prisma.cannedSnippet.delete({ where: { id } }); return item; }
}

export class RuleRepository implements Repository<AfterHoursRule> {
  async findAll() { return (await prisma.afterHoursRule.findMany({ orderBy: { createdAt: 'asc' } })).map(toRule); }
  async findById(id: string) { const item = await prisma.afterHoursRule.findUnique({ where: { id } }); return item ? toRule(item) : undefined; }
  async create(i: AfterHoursRule) { return toRule(await prisma.afterHoursRule.create({ data: i })); }
  async update(id: string, c: Partial<AfterHoursRule>) { if (!await this.findById(id)) throw missing('Rule', id); return toRule(await prisma.afterHoursRule.update({ where: { id }, data: { title: c.title, scheduleType: c.scheduleType, activeTimeWindow: c.activeTimeWindow, autoReplyTemplate: c.autoReplyTemplate, createCallbackTicket: c.createCallbackTicket, smsZaloConfirmation: c.smsZaloConfirmation, aiBotEnabled: c.aiBotEnabled, isActive: c.isActive } })); }
  async delete(id: string) { const item = await this.findById(id); if (!item) throw missing('Rule', id); await prisma.afterHoursRule.delete({ where: { id } }); return item; }
}

export class LogRepository implements Repository<NightShiftLog> {
  async findAll() { return (await prisma.afterHoursLog.findMany({ orderBy: { receivedAt: 'desc' } })).map(toLog); }
  async findCallbacks() { return (await prisma.afterHoursLog.findMany({ where: { actionTaken: 'scheduled_morning_callback' }, orderBy: { receivedAt: 'desc' } })).map(toLog); }
  async findById(id: string) { const item = await prisma.afterHoursLog.findUnique({ where: { id } }); return item ? toLog(item) : undefined; }
  async create(i: NightShiftLog) { return toLog(await prisma.afterHoursLog.create({ data: { id: i.id, citizenName: i.citizenName, phone: i.phone, channel: i.channel, receivedAtLabel: i.receivedAt, questionSnippet: i.questionSnippet, actionTaken: i.actionTaken, ticketCode: i.ticketCode, callbackAssignedTo: i.callbackAssignedTo, callbackTimeTarget: i.callbackTimeTarget, status: i.status, scheduledCallback: i.actionTaken === 'scheduled_morning_callback' ? { create: { assignedTo: i.callbackAssignedTo, targetLabel: i.callbackTimeTarget, status: i.status } } : undefined } })); }
  async update(id: string, c: Partial<NightShiftLog>) { if (!await this.findById(id)) throw missing('After-hours log', id); return prisma.$transaction(async (tx: Prisma.TransactionClient) => { if (c.status) await tx.scheduledCallback.updateMany({ where: { afterHoursLogId: id }, data: { status: c.status } }); return toLog(await tx.afterHoursLog.update({ where: { id }, data: { citizenName: c.citizenName, phone: c.phone, channel: c.channel, receivedAtLabel: c.receivedAt, questionSnippet: c.questionSnippet, actionTaken: c.actionTaken, ticketCode: c.ticketCode, callbackAssignedTo: c.callbackAssignedTo, callbackTimeTarget: c.callbackTimeTarget, status: c.status } })); }); }
  async delete(id: string) { const item = await this.findById(id); if (!item) throw missing('After-hours log', id); await prisma.afterHoursLog.delete({ where: { id } }); return item; }
}

export class CampaignRepository implements Repository<BroadcastCampaign> {
  async findAll() { return (await prisma.campaign.findMany({ orderBy: { createdAt: 'desc' } })).map(toCampaign); }
  async findById(id: string) { const item = await prisma.campaign.findUnique({ where: { id } }); return item ? toCampaign(item) : undefined; }
  async create(i: BroadcastCampaign) { return toCampaign(await prisma.campaign.create({ data: { id: i.id, title: i.title, category: i.category, targetGroup: i.targetGroup, recipientCount: i.recipientCount, channels: i.channels, scheduledAt: i.scheduledAt, status: i.status, contentSnippet: i.contentSnippet, deliveredCount: i.deliveredCount, readCount: i.readCount, responseCount: i.responseCount, failedCount: i.failedCount, createdAtLabel: i.createdAt, senderOfficer: i.senderOfficer } })); }
  async update(id: string, c: Partial<BroadcastCampaign>) { if (!await this.findById(id)) throw missing('Campaign', id); return toCampaign(await prisma.campaign.update({ where: { id }, data: { title: c.title, category: c.category, targetGroup: c.targetGroup, recipientCount: c.recipientCount, channels: c.channels, scheduledAt: c.scheduledAt, status: c.status, contentSnippet: c.contentSnippet, deliveredCount: c.deliveredCount, readCount: c.readCount, responseCount: c.responseCount, failedCount: c.failedCount, createdAtLabel: c.createdAt, senderOfficer: c.senderOfficer } })); }
  async delete(id: string) { const item = await this.findById(id); if (!item) throw missing('Campaign', id); await prisma.campaign.delete({ where: { id } }); return item; }
}

export class ReplyRepository implements Repository<BroadcastReply> {
  async findAll() { return (await prisma.broadcastReply.findMany({ orderBy: { receivedAt: 'desc' } })).map(toReply); }
  async findById(id: string) { const item = await prisma.broadcastReply.findUnique({ where: { id } }); return item ? toReply(item) : undefined; }
  async create(i: BroadcastReply) { return toReply(await prisma.broadcastReply.create({ data: { id: i.id, campaignId: i.campaignId, campaignTitle: i.campaignTitle, citizenName: i.citizenName, phone: i.phone, channel: i.channel, replyText: i.replyText, receivedAtLabel: i.receivedAt, status: i.status, assignedOfficer: i.assignedOfficer } })); }
  async update(id: string, c: Partial<BroadcastReply>) { if (!await this.findById(id)) throw missing('Broadcast reply', id); return toReply(await prisma.broadcastReply.update({ where: { id }, data: { campaignId: c.campaignId, campaignTitle: c.campaignTitle, citizenName: c.citizenName, phone: c.phone, channel: c.channel, replyText: c.replyText, receivedAtLabel: c.receivedAt, status: c.status, assignedOfficer: c.assignedOfficer } })); }
  async delete(id: string) { const item = await this.findById(id); if (!item) throw missing('Broadcast reply', id); await prisma.broadcastReply.delete({ where: { id } }); return item; }
}
