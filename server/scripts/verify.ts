import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import { app } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';

const ids = {
  injectedUser: 'verify-injected-user', managedUser: 'verify-managed-user',
  ticket: 'VERIFY-TICKET-001', routedTicket: 'VERIFY-ROUTED-001',
  faq: 'verify-faq-001', campaign: 'VERIFY-CAMPAIGN-001'
};
const verificationStartedAt = new Date();

let server: Server;
let baseUrl = '';

async function start() {
  server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Could not allocate verification port');
  baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
}

async function stop() { await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); }

async function request(path: string, options: RequestInit = {}, token?: string) {
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}), ...options.headers } });
  const payload = await response.json();
  return { status: response.status, payload };
}

const post = (body: unknown): RequestInit => ({ method: 'POST', body: JSON.stringify(body) });
const put = (body: unknown): RequestInit => ({ method: 'PUT', body: JSON.stringify(body) });

async function login(identifier: string) {
  const result = await request('/auth/login', post({ identifier }));
  assert.equal(result.status, 200); return result.payload.data.token as string;
}

async function cleanup() {
  await prisma.session.deleteMany({ where: { OR: [{ userId: { in: [ids.injectedUser, ids.managedUser] } }, { createdAt: { gte: verificationStartedAt } }] } });
  await prisma.ticket.deleteMany({ where: { id: { in: [ids.ticket, ids.routedTicket] } } });
  await prisma.fAQ.deleteMany({ where: { id: ids.faq } });
  await prisma.broadcastReply.updateMany({ where: { id: 'REP-03' }, data: { status: 'new', assignedOfficer: null } });
  await prisma.broadcastReply.deleteMany({ where: { campaignId: ids.campaign } });
  await prisma.campaign.deleteMany({ where: { id: ids.campaign } });
  await prisma.user.deleteMany({ where: { id: { in: [ids.injectedUser, ids.managedUser] } } });
}

const userProfile = (id: string, role = 'admin') => ({
  id, username: id, fullName: `Verification ${id}`, email: `${id}@example.test`, phone: '0901234567',
  idCard: id === ids.injectedUser ? '000000000091' : '000000000092', role,
  title: 'Verification Officer', department: 'Verification', badgeNumber: id.toUpperCase(),
  avatarInitials: 'VT', avatarColor: 'from-blue-700 to-blue-800', status: 'available', createdAt: 'Verification'
});

const ticket = (id: string) => ({
  id, citizenName: 'Verification Citizen', phone: '0909999999', channel: 'web', channelName: 'Web',
  category: 'Verification', urgency: 'normal', status: 'pending', createdAt: 'Verification', updatedAt: 'Verification',
  assignedOfficer: 'Trần Thị Mai', lastMessage: 'Verification message', conversation: [{ id: `${id}-msg`, sender: 'citizen', text: 'Verification message', time: '09:00' }],
  aiAnalysis: { summary: 'Verification', category: 'Verification', intent: 'Verification', urgencyReason: 'Verification', lawCitation: 'Verification', suggestedReply: 'Verification reply', confidenceScore: 90, autoResolvable: false }, tags: ['verification']
});

async function main() {
  await cleanup(); await start();
  try {
    const health = await fetch(`${baseUrl.replace('/api/v1', '')}/api/health`).then(async (response) => ({ status: response.status, body: await response.json() }));
    assert.equal(health.status, 200); assert.equal(health.body.database, 'connected');

    const officerToken = await login('user-002');
    const adminToken = await login('user-003');

    const registration = await request('/auth/login', post({ identifier: ids.injectedUser, user: userProfile(ids.injectedUser, 'admin') }));
    assert.equal(registration.status, 200); assert.equal(registration.payload.data.user.role, 'officer');
    const injectedToken = registration.payload.data.token as string;

    const selfEscalation = await request(`/users/${ids.injectedUser}`, put({ role: 'admin' }), injectedToken);
    assert.equal(selfEscalation.status, 400);
    const unchangedUser = await request(`/users/${ids.injectedUser}`, {}, injectedToken);
    assert.equal(unchangedUser.payload.data.role, 'officer');

    const forbiddenMutation = await request('/after-hours/rules/rule-night', put({ isActive: false }), officerToken);
    assert.equal(forbiddenMutation.status, 403);

    const adminRoleChange = await request(`/users/${ids.injectedUser}`, put({ role: 'team_lead' }), adminToken);
    assert.equal(adminRoleChange.status, 200); assert.equal(adminRoleChange.payload.data.role, 'team_lead');

    const managedUser = await request('/users', post(userProfile(ids.managedUser, 'officer')), adminToken);
    assert.equal(managedUser.status, 201);
    const createdTicket = await request('/tickets', post(ticket(ids.ticket)), adminToken);
    assert.equal(createdTicket.status, 201);
    const message = await request(`/tickets/${ids.ticket}/messages`, post({ text: 'Persisted officer response' }), adminToken);
    assert.equal(message.status, 201); assert.equal(message.payload.data.conversation.at(-1).text, 'Persisted officer response');
    const note = await request(`/tickets/${ids.ticket}/notes`, post({ note: 'Persisted internal note' }), adminToken);
    assert.equal(note.status, 201); assert.equal(note.payload.data.internalNote, 'Persisted internal note');

    const faq = await request('/faqs', post({ id: ids.faq, intentCode: 'VERIFY_INTENT_001', title: 'Verification FAQ', category: 'Verification', sampleQuestions: ['Question'], keywords: ['verify'], officialAnswer: 'Answer', legalBasis: 'Basis', requiredDocuments: [], processingDays: '1 day', fee: '0', autoResolutionEnabled: true, usageCount: 1, accuracyRate: 99 }), adminToken);
    assert.equal(faq.status, 201);
    const campaign = await request('/campaigns', post({ id: ids.campaign, title: 'Verification campaign', category: 'Verification', targetGroup: 'Verification users', recipientCount: 10, channels: ['web'], scheduledAt: 'Verification', status: 'draft', contentSnippet: 'Verification', deliveredCount: 0, readCount: 0, responseCount: 0, failedCount: 0, createdAt: 'Verification', senderOfficer: 'Trần Thị Mai' }), adminToken);
    assert.equal(campaign.status, 201);

    await stop(); await start();
    const adminAfterRestart = await login('user-003');
    for (const [path, expectedId] of [[`/users/${ids.managedUser}`, ids.managedUser], [`/tickets/${ids.ticket}`, ids.ticket], [`/faqs/${ids.faq}`, ids.faq], [`/campaigns/${ids.campaign}`, ids.campaign]] as const) {
      const persisted = await request(path, {}, adminAfterRestart); assert.equal(persisted.status, 200); assert.equal(persisted.payload.data.id, expectedId);
    }

    await prisma.broadcastReply.update({ where: { id: 'REP-03' }, data: { status: 'new', assignedOfficer: null } });
    const routed = await request('/broadcast-replies/REP-03/route-to-ticket', post({ ticket: ticket(ids.routedTicket) }), adminAfterRestart);
    assert.equal(routed.status, 201); assert.equal(routed.payload.data.reply.status, 'routed_to_inbox'); assert.equal(routed.payload.data.ticket.id, ids.routedTicket);

    await prisma.ticket.delete({ where: { id: ids.routedTicket } });
    await prisma.broadcastReply.update({ where: { id: 'REP-03' }, data: { status: 'new', assignedOfficer: null } });
    const rollback = await request('/broadcast-replies/REP-03/route-to-ticket', post({ ticket: ticket('REQ-2026-8821') }), adminAfterRestart);
    assert.equal(rollback.status, 409);
    const replyAfterRollback = await prisma.broadcastReply.findUniqueOrThrow({ where: { id: 'REP-03' } });
    assert.equal(replyAfterRollback.status, 'new');

    console.info(JSON.stringify({ health: 'pass', registrationRoleInjection: 'pass', selfRoleEscalation: 'pass', mutationRbac: 'pass', adminRoleManagement: 'pass', persistenceAfterRestart: ['User', 'Ticket', 'Message', 'InternalNote', 'FAQ', 'Campaign'], broadcastTransactionCommit: 'pass', broadcastTransactionRollback: 'pass' }, null, 2));
  } finally {
    if (server?.listening) await stop();
    await cleanup(); await prisma.$disconnect();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
