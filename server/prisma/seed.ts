import { PrismaClient } from '@prisma/client';
import { INITIAL_AFTER_HOURS_RULES, INITIAL_BROADCAST_REPLIES, INITIAL_BROADCASTS, INITIAL_CANNED_SNIPPETS, INITIAL_FAQS, INITIAL_NIGHT_SHIFT_LOGS, INITIAL_TICKETS, INITIAL_USERS } from '../src/data/seed.js';

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction([
    prisma.session.deleteMany(), prisma.scheduledCallback.deleteMany(), prisma.broadcastReply.deleteMany(),
    prisma.message.deleteMany(), prisma.internalNote.deleteMany(), prisma.ticketAIAnalysis.deleteMany(),
    prisma.ticket.deleteMany(), prisma.afterHoursLog.deleteMany(), prisma.afterHoursRule.deleteMany(),
    prisma.cannedSnippet.deleteMany(), prisma.fAQ.deleteMany(), prisma.campaign.deleteMany(), prisma.user.deleteMany()
  ]);

  for (const user of INITIAL_USERS) {
    await prisma.user.create({ data: {
      id: user.id, username: user.username, fullName: user.fullName, email: user.email,
      phone: user.phone, idCard: user.idCard, role: user.role, title: user.title,
      department: user.department, badgeNumber: user.badgeNumber, avatarInitials: user.avatarInitials,
      avatarColor: user.avatarColor, status: user.status, createdAtLabel: user.createdAt,
      lastLogin: user.lastLogin, isVNeIDVerified: user.isVNeIDVerified ?? false
    } });
  }

  for (const ticket of INITIAL_TICKETS) {
    const assignee = await prisma.user.findFirst({ where: { fullName: ticket.assignedOfficer }, select: { id: true } });
    await prisma.ticket.create({ data: {
      id: ticket.id, citizenName: ticket.citizenName, phone: ticket.phone, email: ticket.email,
      channel: ticket.channel, channelName: ticket.channelName, category: ticket.category,
      urgency: ticket.urgency, status: ticket.status, createdAtLabel: ticket.createdAt,
      updatedAtLabel: ticket.updatedAt, assignedOfficer: ticket.assignedOfficer, assigneeId: assignee?.id,
      lastMessage: ticket.lastMessage, unreadCount: ticket.unreadCount,
      slaDeadlineMinutes: ticket.slaDeadlineMinutes, tags: ticket.tags ?? [],
      resolvedAtLabel: ticket.resolvedAt, resolutionType: ticket.resolutionType,
      messages: { create: ticket.conversation.map((message) => ({ id: message.id, sender: message.sender, senderName: message.senderName, text: message.text, timeLabel: message.time, attachments: message.attachments, isInternal: message.isInternal ?? false })) },
      internalNotes: ticket.internalNote ? { create: { content: ticket.internalNote, authorId: assignee?.id } } : undefined,
      aiAnalysis: { create: ticket.aiAnalysis }
    } });
  }

  await prisma.afterHoursRule.createMany({ data: INITIAL_AFTER_HOURS_RULES });
  for (const log of INITIAL_NIGHT_SHIFT_LOGS) {
    await prisma.afterHoursLog.create({ data: {
      id: log.id, citizenName: log.citizenName, phone: log.phone, channel: log.channel,
      receivedAtLabel: log.receivedAt, questionSnippet: log.questionSnippet, actionTaken: log.actionTaken,
      ticketCode: log.ticketCode, callbackAssignedTo: log.callbackAssignedTo,
      callbackTimeTarget: log.callbackTimeTarget, status: log.status,
      scheduledCallback: log.actionTaken === 'scheduled_morning_callback' ? { create: { assignedTo: log.callbackAssignedTo, targetLabel: log.callbackTimeTarget, status: log.status } } : undefined
    } });
  }

  await prisma.fAQ.createMany({ data: INITIAL_FAQS });
  await prisma.cannedSnippet.createMany({ data: INITIAL_CANNED_SNIPPETS });
  await prisma.campaign.createMany({ data: INITIAL_BROADCASTS.map((campaign) => ({
    id: campaign.id, title: campaign.title, category: campaign.category, targetGroup: campaign.targetGroup,
    recipientCount: campaign.recipientCount, channels: campaign.channels, scheduledAt: campaign.scheduledAt,
    status: campaign.status, contentSnippet: campaign.contentSnippet, deliveredCount: campaign.deliveredCount,
    readCount: campaign.readCount, responseCount: campaign.responseCount, failedCount: campaign.failedCount,
    createdAtLabel: campaign.createdAt, senderOfficer: campaign.senderOfficer
  })) });
  await prisma.broadcastReply.createMany({ data: INITIAL_BROADCAST_REPLIES.map((reply) => ({
    id: reply.id, campaignId: reply.campaignId, campaignTitle: reply.campaignTitle,
    citizenName: reply.citizenName, phone: reply.phone, channel: reply.channel,
    replyText: reply.replyText, receivedAtLabel: reply.receivedAt,
    status: reply.status, assignedOfficer: reply.assignedOfficer
  })) });

  console.info(`Seeded ${INITIAL_USERS.length} users, ${INITIAL_TICKETS.length} tickets, ${INITIAL_FAQS.length} FAQs and ${INITIAL_BROADCASTS.length} campaigns.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
