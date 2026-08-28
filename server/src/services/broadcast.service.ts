import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import type { TicketItem } from '../models/domain.js';
import { createTicketWithClient } from '../repositories/prisma.repository.js';
import { toReply } from '../repositories/mappers.js';
import { AppError } from '../utils/errors.js';

export async function routeBroadcastReplyToTicket(replyId: string, ticket: TicketItem) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const reply = await tx.broadcastReply.findUnique({ where: { id: replyId } });
    if (!reply) throw new AppError(404, 'BROADCAST_REPLY_NOT_FOUND', `Broadcast reply ${replyId} not found`);
    if (reply.status === 'routed_to_inbox') throw new AppError(409, 'REPLY_ALREADY_ROUTED', 'Broadcast reply was already routed to the inbox');
    const updatedReply = await tx.broadcastReply.update({ where: { id: replyId }, data: { status: 'routed_to_inbox', assignedOfficer: ticket.assignedOfficer } });
    const createdTicket = await createTicketWithClient(tx, ticket);
    return { reply: toReply(updatedReply), ticket: createdTicket };
  });
}
