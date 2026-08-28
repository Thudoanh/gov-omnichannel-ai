import type { BroadcastCampaign, FAQItem, NightShiftLog, TicketItem, UserProfile, UserRole } from '../models/domain.js';
import { AppError } from './errors.js';
import { booleanField, emailField, numberField, optionalString, rejectFields, requireEnum, requireObject, stringArray, stringField } from './validation.js';

const roles = ['admin', 'team_lead', 'officer', 'receptionist'] as const;
const channels = ['zalo', 'facebook', 'email', 'dvc', 'hotline', 'sms', 'web'] as const;

export function publicRegistration(body: Record<string, unknown>): UserProfile {
  rejectFields(body, ['passwordHash', 'permissions']);
  return {
    id: optionalString(body, 'id', 100) ?? `user-${Date.now()}`,
    username: stringField(body, 'username', { max: 80, pattern: /^[\w.-]+$/ }),
    fullName: stringField(body, 'fullName', { max: 150 }), email: emailField(body),
    phone: stringField(body, 'phone', { max: 30, pattern: /^[+\d\s().-]+$/ }),
    idCard: stringField(body, 'idCard', { min: 9, max: 20, pattern: /^\d+$/ }),
    role: 'officer',
    title: optionalString(body, 'title', 150) ?? 'Chuyên viên Tiếp nhận TTHC',
    department: optionalString(body, 'department', 200) ?? 'Bộ phận Một Cửa UBND',
    badgeNumber: stringField(body, 'badgeNumber', { max: 50 }),
    avatarInitials: stringField(body, 'avatarInitials', { max: 10 }),
    avatarColor: stringField(body, 'avatarColor', { max: 100 }),
    status: 'available', createdAt: optionalString(body, 'createdAt', 100) ?? new Date().toLocaleDateString('vi-VN'),
    lastLogin: 'Vừa xong', isVNeIDVerified: Boolean(body.isVNeIDVerified)
  };
}

export function adminUserCreate(body: Record<string, unknown>): UserProfile {
  const user = publicRegistration(body);
  requireEnum(body.role, 'role', roles);
  return { ...user, role: body.role as UserRole, status: body.status === undefined ? 'available' : userStatus(body.status) };
}

function userStatus(value: unknown): UserProfile['status'] {
  requireEnum(value, 'status', ['available', 'busy', 'away']);
  return value as UserProfile['status'];
}

export function selfUserUpdate(body: Record<string, unknown>): Partial<UserProfile> {
  rejectFields(body, ['id', 'username', 'idCard', 'badgeNumber', 'role', 'status', 'createdAt', 'passwordHash', 'isVNeIDVerified']);
  return {
    fullName: body.fullName === undefined ? undefined : stringField(body, 'fullName', { max: 150 }),
    email: body.email === undefined ? undefined : emailField(body),
    phone: body.phone === undefined ? undefined : stringField(body, 'phone', { max: 30, pattern: /^[+\d\s().-]+$/ }),
    department: optionalString(body, 'department', 200), title: optionalString(body, 'title', 150),
    avatarInitials: optionalString(body, 'avatarInitials', 10), avatarColor: optionalString(body, 'avatarColor', 100)
  };
}

export function adminUserUpdate(body: Record<string, unknown>): Partial<UserProfile> {
  rejectFields(body, ['id', 'createdAt', 'passwordHash']);
  return {
    ...selfUserUpdate(Object.fromEntries(Object.entries(body).filter(([key]) => !['username', 'idCard', 'badgeNumber', 'role', 'status', 'isVNeIDVerified'].includes(key)))),
    username: body.username === undefined ? undefined : stringField(body, 'username', { max: 80, pattern: /^[\w.-]+$/ }),
    idCard: body.idCard === undefined ? undefined : stringField(body, 'idCard', { min: 9, max: 20, pattern: /^\d+$/ }),
    badgeNumber: body.badgeNumber === undefined ? undefined : stringField(body, 'badgeNumber', { max: 50 }),
    role: body.role === undefined ? undefined : (requireEnum(body.role, 'role', roles), body.role as UserRole),
    status: body.status === undefined ? undefined : userStatus(body.status),
    isVNeIDVerified: body.isVNeIDVerified === undefined ? undefined : booleanField(body, 'isVNeIDVerified')
  };
}

export function ticketCreate(body: Record<string, unknown>): TicketItem {
  requireEnum(body.channel, 'channel', channels); requireEnum(body.urgency, 'urgency', ['urgent', 'high', 'normal', 'low']);
  requireEnum(body.status, 'status', ['pending', 'processing', 'resolved', 'auto_resolved', 'scheduled_callback']);
  const analysis = requireObject(body.aiAnalysis);
  const conversation = body.conversation;
  if (!Array.isArray(conversation) || conversation.length > 500) throw new AppError(400, 'VALIDATION_ERROR', 'conversation must be an array');
  return {
    id: optionalString(body, 'id', 100) ?? `REQ-${Date.now()}`,
    citizenName: stringField(body, 'citizenName', { max: 150 }), phone: stringField(body, 'phone', { max: 30 }),
    email: body.email === undefined ? undefined : emailField(body), channel: body.channel as TicketItem['channel'],
    channelName: stringField(body, 'channelName', { max: 100 }), category: stringField(body, 'category', { max: 200 }),
    urgency: body.urgency as TicketItem['urgency'], status: body.status as TicketItem['status'],
    createdAt: optionalString(body, 'createdAt', 100) ?? new Date().toLocaleString('vi-VN'),
    updatedAt: optionalString(body, 'updatedAt', 100) ?? new Date().toLocaleString('vi-VN'),
    assignedOfficer: stringField(body, 'assignedOfficer', { max: 150 }), lastMessage: stringField(body, 'lastMessage', { max: 10000 }),
    unreadCount: body.unreadCount === undefined ? undefined : numberField(body, 'unreadCount', 0, 100000),
    conversation: conversation.map((raw, index) => {
      const message = requireObject(raw); requireEnum(message.sender, `conversation[${index}].sender`, ['citizen', 'officer', 'ai_bot', 'system']);
      return { id: optionalString(message, 'id', 100) ?? `msg-${Date.now()}-${index}`, sender: message.sender as TicketItem['conversation'][number]['sender'], senderName: optionalString(message, 'senderName', 150), text: stringField(message, 'text', { max: 20000 }), time: stringField(message, 'time', { max: 100 }), isInternal: message.isInternal === undefined ? undefined : booleanField(message, 'isInternal') };
    }),
    aiAnalysis: { summary: stringField(analysis, 'summary', { max: 10000 }), category: stringField(analysis, 'category', { max: 200 }), intent: stringField(analysis, 'intent', { max: 500 }), urgencyReason: stringField(analysis, 'urgencyReason', { max: 5000 }), lawCitation: stringField(analysis, 'lawCitation', { max: 5000 }), suggestedReply: stringField(analysis, 'suggestedReply', { max: 20000 }), confidenceScore: numberField(analysis, 'confidenceScore', 0, 100), autoResolvable: booleanField(analysis, 'autoResolvable') },
    internalNote: optionalString(body, 'internalNote', 10000), slaDeadlineMinutes: body.slaDeadlineMinutes === undefined ? undefined : numberField(body, 'slaDeadlineMinutes', 0, 1000000),
    tags: body.tags === undefined ? [] : stringArray(body, 'tags', 100), resolvedAt: optionalString(body, 'resolvedAt', 100),
    resolutionType: body.resolutionType as TicketItem['resolutionType']
  };
}

export function faqCreate(body: Record<string, unknown>): FAQItem {
  return { id: optionalString(body, 'id', 100) ?? `faq-${Date.now()}`, intentCode: stringField(body, 'intentCode', { max: 150 }), title: stringField(body, 'title', { max: 500 }), category: stringField(body, 'category', { max: 200 }), sampleQuestions: stringArray(body, 'sampleQuestions'), keywords: stringArray(body, 'keywords'), officialAnswer: stringField(body, 'officialAnswer', { max: 30000 }), legalBasis: stringField(body, 'legalBasis', { max: 10000 }), requiredDocuments: stringArray(body, 'requiredDocuments'), processingDays: stringField(body, 'processingDays', { max: 200 }), fee: stringField(body, 'fee', { max: 500 }), autoResolutionEnabled: booleanField(body, 'autoResolutionEnabled', false), usageCount: body.usageCount === undefined ? 0 : numberField(body, 'usageCount', 0), accuracyRate: body.accuracyRate === undefined ? 0 : numberField(body, 'accuracyRate', 0, 100) };
}

export function campaignCreate(body: Record<string, unknown>): BroadcastCampaign {
  const channelValues = stringArray(body, 'channels', 7); channelValues.forEach((value) => requireEnum(value, 'channels', channels));
  requireEnum(body.status, 'status', ['completed', 'sending', 'scheduled', 'draft']);
  return { id: optionalString(body, 'id', 100) ?? `CAMP-${Date.now()}`, title: stringField(body, 'title', { max: 1000 }), category: stringField(body, 'category', { max: 200 }), targetGroup: stringField(body, 'targetGroup', { max: 2000 }), recipientCount: numberField(body, 'recipientCount', 0, 100000000), channels: channelValues as BroadcastCampaign['channels'], scheduledAt: stringField(body, 'scheduledAt', { max: 100 }), status: body.status as BroadcastCampaign['status'], contentSnippet: stringField(body, 'contentSnippet', { max: 30000 }), deliveredCount: body.deliveredCount === undefined ? 0 : numberField(body, 'deliveredCount', 0), readCount: body.readCount === undefined ? 0 : numberField(body, 'readCount', 0), responseCount: body.responseCount === undefined ? 0 : numberField(body, 'responseCount', 0), failedCount: body.failedCount === undefined ? 0 : numberField(body, 'failedCount', 0), createdAt: optionalString(body, 'createdAt', 100) ?? new Date().toLocaleString('vi-VN'), senderOfficer: stringField(body, 'senderOfficer', { max: 150 }) };
}

export function logCreate(body: Record<string, unknown>): NightShiftLog {
  requireEnum(body.channel, 'channel', channels); requireEnum(body.actionTaken, 'actionTaken', ['ai_instant_answered', 'scheduled_morning_callback', 'escalated_oncall_officer']); requireEnum(body.status, 'status', ['pending_morning', 'completed', 'notified']);
  return { id: optionalString(body, 'id', 100) ?? `NIGHT-${Date.now()}`, citizenName: stringField(body, 'citizenName', { max: 150 }), phone: stringField(body, 'phone', { max: 30 }), channel: body.channel as NightShiftLog['channel'], receivedAt: optionalString(body, 'receivedAt', 100) ?? new Date().toLocaleString('vi-VN'), questionSnippet: stringField(body, 'questionSnippet', { max: 10000 }), actionTaken: body.actionTaken as NightShiftLog['actionTaken'], ticketCode: optionalString(body, 'ticketCode', 100) ?? `REQ-${Date.now()}`, callbackAssignedTo: stringField(body, 'callbackAssignedTo', { max: 150 }), callbackTimeTarget: stringField(body, 'callbackTimeTarget', { max: 200 }), status: body.status as NightShiftLog['status'] };
}
