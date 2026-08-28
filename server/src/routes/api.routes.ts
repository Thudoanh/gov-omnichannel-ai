import { Router } from 'express';
import * as resource from '../controllers/resource.controller.js';
import { authenticate, authorize, sessionStore } from '../middleware/auth.js';
import type { AfterHoursRule, BroadcastCampaign, BroadcastReply, CannedSnippet, FAQItem, NightShiftLog, TicketItem, UserProfile } from '../models/domain.js';
import { dataStore } from '../repositories/data.repository.js';
import { analyticsOverview } from '../services/analytics.service.js';
import { routeBroadcastReplyToTicket } from '../services/broadcast.service.js';
import { ticketService } from '../services/domain.service.js';
import { adminUserCreate, adminUserUpdate, campaignCreate, faqCreate, logCreate, publicRegistration, selfUserUpdate, ticketCreate } from '../utils/dto.js';
import { AppError, asyncHandler } from '../utils/errors.js';
import { booleanField, optionalString, rejectFields, requireEnum, requireId, requireObject, stringArray, stringField } from '../utils/validation.js';

export const apiRouter = Router();
const managers = authorize('admin', 'team_lead');
const broadcasters = authorize('admin', 'team_lead', 'receptionist');

apiRouter.post('/auth/login', asyncHandler(async (req, res) => {
  const body = requireObject(req.body);
  const identifier = stringField(body, body.identifier !== undefined ? 'identifier' : body.username !== undefined ? 'username' : 'userId', { max: 254 });
  let user = await dataStore.users.findByIdentifier(identifier);
  if (!user && body.user) user = await dataStore.users.create(publicRegistration(requireObject(body.user)));
  if (!user) throw new AppError(401, 'INVALID_CREDENTIALS', 'User account was not found');
  const token = await sessionStore.create(user.id);
  res.json({ success: true, data: { user: { ...user, lastLogin: 'Vừa xong' }, token } });
}));
apiRouter.post('/auth/logout', authenticate, asyncHandler(async (req, res) => {
  const token = req.header('authorization')?.replace(/^Bearer\s+/i, '');
  if (token) await sessionStore.delete(token);
  res.json({ success: true, data: { loggedOut: true } });
}));
apiRouter.get('/auth/me', authenticate, (req, res) => res.json({ success: true, data: req.user }));

apiRouter.use(authenticate);

apiRouter.get('/users', resource.list(dataStore.users));
apiRouter.get('/users/:id', resource.get(dataStore.users));
apiRouter.post('/users', authorize('admin'), resource.create<UserProfile>(dataStore.users, adminUserCreate));
apiRouter.put('/users/:id', asyncHandler(async (req, res) => {
  const id = requireId(req.params.id);
  if (req.user?.role !== 'admin' && req.user?.id !== id) throw new AppError(403, 'FORBIDDEN', 'Users may only update their own profile');
  const changes = req.user?.role === 'admin' ? adminUserUpdate(requireObject(req.body)) : selfUserUpdate(requireObject(req.body));
  res.json({ success: true, data: await dataStore.users.update(id, changes) });
}));
apiRouter.delete('/users/:id', authorize('admin'), resource.remove(dataStore.users));

apiRouter.get('/tickets', resource.list(dataStore.tickets, (req) => {
  if (req.query.channel) requireEnum(req.query.channel, 'channel', ['zalo', 'facebook', 'email', 'dvc', 'hotline', 'sms', 'web']);
  if (req.query.status) requireEnum(req.query.status, 'status', ['pending', 'processing', 'resolved', 'auto_resolved', 'scheduled_callback']);
  if (req.query.urgency) requireEnum(req.query.urgency, 'urgency', ['urgent', 'high', 'normal', 'low']);
  return ticketService.list(req.query);
}));
apiRouter.get('/tickets/:id', resource.get(dataStore.tickets));
apiRouter.post('/tickets', resource.create<TicketItem>(dataStore.tickets, ticketCreate));
apiRouter.put('/tickets/:id', managers, resource.update(dataStore.tickets));
apiRouter.delete('/tickets/:id', managers, resource.remove(dataStore.tickets));
apiRouter.post('/tickets/:id/messages', asyncHandler(async (req, res) => {
  const body = requireObject(req.body); rejectFields(body, ['sender', 'senderName', 'isInternal']);
  const item = await ticketService.addMessage(requireId(req.params.id), { text: stringField(body, 'text', { max: 20000 }) }, req.user!);
  res.status(201).json({ success: true, data: item });
}));
apiRouter.post('/tickets/:id/notes', asyncHandler(async (req, res) => {
  const body = requireObject(req.body);
  const item = await ticketService.addNote(requireId(req.params.id), stringField(body, 'note', { max: 10000 }), req.user?.id);
  res.status(201).json({ success: true, data: item });
}));
apiRouter.patch('/tickets/:id/status', asyncHandler(async (req, res) => {
  const body = requireObject(req.body); requireEnum(body.status, 'status', ['pending', 'processing', 'resolved', 'auto_resolved', 'scheduled_callback']);
  res.json({ success: true, data: await dataStore.tickets.update(requireId(req.params.id), { status: body.status as TicketItem['status'] }) });
}));
apiRouter.patch('/tickets/:id/assignee', managers, asyncHandler(async (req, res) => {
  const body = requireObject(req.body);
  res.json({ success: true, data: await dataStore.tickets.update(requireId(req.params.id), { assignedOfficer: stringField(body, 'assignedOfficer', { max: 150 }) }) });
}));

apiRouter.get('/after-hours/rules', resource.list(dataStore.rules));
apiRouter.post('/after-hours/rules', managers, resource.create<AfterHoursRule>(dataStore.rules, (body) => {
  requireEnum(body.scheduleType, 'scheduleType', ['night_shift', 'weekend', 'holiday', 'all_officers_busy']);
  return { id: optionalString(body, 'id', 100) ?? `rule-${Date.now()}`, title: stringField(body, 'title', { max: 500 }), scheduleType: body.scheduleType as AfterHoursRule['scheduleType'], activeTimeWindow: stringField(body, 'activeTimeWindow', { max: 500 }), autoReplyTemplate: stringField(body, 'autoReplyTemplate', { max: 20000 }), createCallbackTicket: booleanField(body, 'createCallbackTicket'), smsZaloConfirmation: booleanField(body, 'smsZaloConfirmation'), aiBotEnabled: booleanField(body, 'aiBotEnabled'), isActive: booleanField(body, 'isActive') };
}));
apiRouter.put('/after-hours/rules/:id', managers, resource.update(dataStore.rules));
apiRouter.delete('/after-hours/rules/:id', managers, resource.remove(dataStore.rules));
apiRouter.get('/after-hours/logs', resource.list(dataStore.logs));
apiRouter.post('/after-hours/logs', managers, resource.create<NightShiftLog>(dataStore.logs, logCreate));
apiRouter.patch('/after-hours/logs/:id', managers, resource.update(dataStore.logs));
apiRouter.get('/callbacks', resource.list(dataStore.logs, () => dataStore.logs.findCallbacks()));
apiRouter.post('/callbacks', managers, resource.create<NightShiftLog>(dataStore.logs, logCreate));
apiRouter.patch('/callbacks/:id', managers, resource.update(dataStore.logs));

apiRouter.get('/faqs', resource.list(dataStore.faqs));
apiRouter.get('/faqs/:id', resource.get(dataStore.faqs));
apiRouter.post('/faqs', managers, resource.create<FAQItem>(dataStore.faqs, faqCreate));
apiRouter.put('/faqs/:id', managers, resource.update(dataStore.faqs));
apiRouter.delete('/faqs/:id', managers, resource.remove(dataStore.faqs));
apiRouter.get('/snippets', resource.list(dataStore.snippets));
apiRouter.post('/snippets', managers, resource.create<CannedSnippet>(dataStore.snippets, (body) => ({ id: optionalString(body, 'id', 100) ?? `snippet-${Date.now()}`, title: stringField(body, 'title', { max: 500 }), shortcut: stringField(body, 'shortcut', { max: 100 }), category: stringField(body, 'category', { max: 200 }), content: stringField(body, 'content', { max: 30000 }), variables: stringArray(body, 'variables') })));
apiRouter.put('/snippets/:id', managers, resource.update(dataStore.snippets));
apiRouter.delete('/snippets/:id', managers, resource.remove(dataStore.snippets));

apiRouter.get('/campaigns', resource.list(dataStore.campaigns));
apiRouter.get('/campaigns/:id', resource.get(dataStore.campaigns));
apiRouter.post('/campaigns', broadcasters, resource.create<BroadcastCampaign>(dataStore.campaigns, campaignCreate));
apiRouter.put('/campaigns/:id', managers, resource.update(dataStore.campaigns));
apiRouter.delete('/campaigns/:id', managers, resource.remove(dataStore.campaigns));
apiRouter.patch('/campaigns/:id/status', managers, asyncHandler(async (req, res) => {
  const body = requireObject(req.body); requireEnum(body.status, 'status', ['completed', 'sending', 'scheduled', 'draft']);
  res.json({ success: true, data: await dataStore.campaigns.update(requireId(req.params.id), { status: body.status as BroadcastCampaign['status'] }) });
}));
apiRouter.get('/broadcast-replies', resource.list(dataStore.replies));
apiRouter.patch('/broadcast-replies/:id', broadcasters, resource.update<BroadcastReply>(dataStore.replies));
apiRouter.post('/broadcast-replies/:id/route-to-ticket', broadcasters, asyncHandler(async (req, res) => {
  const body = requireObject(req.body);
  const ticket = ticketCreate(requireObject(body.ticket));
  res.status(201).json({ success: true, data: await routeBroadcastReplyToTicket(requireId(req.params.id), ticket) });
}));

apiRouter.get('/analytics/overview', asyncHandler(async (_req, res) => res.json({ success: true, data: await analyticsOverview() })));
