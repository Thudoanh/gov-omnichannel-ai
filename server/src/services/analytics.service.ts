import { prisma } from '../lib/prisma.js';

export async function analyticsOverview() {
  const [totalTickets, pending, processing, resolved, autoResolved, totalLogs, pendingCallbacks, autoAnswered, campaignAggregate, campaignCount, faqAggregate, faqCount, enabledFaqs] = await prisma.$transaction([
    prisma.ticket.count(), prisma.ticket.count({ where: { status: 'pending' } }),
    prisma.ticket.count({ where: { status: 'processing' } }), prisma.ticket.count({ where: { status: 'resolved' } }),
    prisma.ticket.count({ where: { status: 'auto_resolved' } }), prisma.afterHoursLog.count(),
    prisma.afterHoursLog.count({ where: { status: 'pending_morning' } }),
    prisma.afterHoursLog.count({ where: { actionTaken: 'ai_instant_answered' } }),
    prisma.campaign.aggregate({ _sum: { deliveredCount: true, readCount: true, responseCount: true } }),
    prisma.campaign.count(), prisma.fAQ.aggregate({ _sum: { usageCount: true }, _avg: { accuracyRate: true } }),
    prisma.fAQ.count(), prisma.fAQ.count({ where: { autoResolutionEnabled: true } })
  ]);
  const delivered = campaignAggregate._sum.deliveredCount ?? 0;
  const reads = campaignAggregate._sum.readCount ?? 0;
  const responses = campaignAggregate._sum.responseCount ?? 0;
  return {
    tickets: { total: totalTickets, pending, processing, resolved: resolved + autoResolved },
    afterHours: { total: totalLogs, pendingCallbacks, autoAnswered },
    broadcast: { campaigns: campaignCount, delivered, readRate: delivered ? Number((reads / delivered * 100).toFixed(1)) : 0, responseRate: delivered ? Number((responses / delivered * 100).toFixed(1)) : 0 },
    knowledgeBase: { faqs: faqCount, autoResolutionEnabled: enabledFaqs, totalUsage: faqAggregate._sum.usageCount ?? 0, averageAccuracy: Number((faqAggregate._avg.accuracyRate ?? 0).toFixed(1)) }
  };
}
