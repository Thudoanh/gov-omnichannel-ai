export type ChannelType = 'zalo' | 'facebook' | 'dvc' | 'hotline' | 'email' | 'web' | 'sms';
export type TicketStatus = 'pending' | 'processing' | 'resolved' | 'auto_resolved' | 'scheduled_callback';
export type UrgencyLevel = 'urgent' | 'high' | 'normal' | 'low';
export type UserRole = 'admin' | 'team_lead' | 'officer' | 'receptionist';
export type TabKey = 'inbox' | 'afterhours' | 'faq' | 'broadcast' | 'analytics';

export interface UserProfile {
  id: string; username: string; fullName: string; email: string; phone: string; idCard: string;
  role: UserRole; title: string; department: string; badgeNumber: string; avatarInitials: string;
  avatarColor: string; status: 'available' | 'busy' | 'away'; createdAt: string;
  lastLogin?: string; isVNeIDVerified?: boolean;
}
export interface MessageItem { id: string; sender: 'citizen' | 'officer' | 'ai_bot' | 'system'; senderName?: string; text: string; time: string; attachments?: { name: string; size: string; type: string }[]; isInternal?: boolean; }
export interface TicketAIAnalysis { summary: string; category: string; intent: string; urgencyReason: string; lawCitation: string; suggestedReply: string; confidenceScore: number; autoResolvable: boolean; }
export interface TicketItem { id: string; citizenName: string; phone: string; email?: string; channel: ChannelType; channelName: string; category: string; urgency: UrgencyLevel; status: TicketStatus; createdAt: string; updatedAt: string; assignedOfficer: string; lastMessage: string; unreadCount?: number; conversation: MessageItem[]; aiAnalysis: TicketAIAnalysis; internalNote?: string; slaDeadlineMinutes?: number; tags?: string[]; resolvedAt?: string; resolutionType?: 'human' | 'ai_auto' | 'canned_response' | 'after_hours_bot'; }
export interface AfterHoursRule { id: string; title: string; scheduleType: 'night_shift' | 'weekend' | 'holiday' | 'all_officers_busy'; activeTimeWindow: string; autoReplyTemplate: string; createCallbackTicket: boolean; smsZaloConfirmation: boolean; aiBotEnabled: boolean; isActive: boolean; }
export interface NightShiftLog { id: string; citizenName: string; phone: string; channel: ChannelType; receivedAt: string; questionSnippet: string; actionTaken: 'ai_instant_answered' | 'scheduled_morning_callback' | 'escalated_oncall_officer'; ticketCode: string; callbackAssignedTo: string; callbackTimeTarget: string; status: 'pending_morning' | 'completed' | 'notified'; }
export interface FAQItem { id: string; intentCode: string; title: string; category: string; sampleQuestions: string[]; keywords: string[]; officialAnswer: string; legalBasis: string; requiredDocuments: string[]; processingDays: string; fee: string; autoResolutionEnabled: boolean; usageCount: number; accuracyRate: number; }
export interface CannedSnippet { id: string; title: string; shortcut: string; category: string; content: string; variables: string[]; }
export interface BroadcastCampaign { id: string; title: string; category: string; targetGroup: string; recipientCount: number; channels: ChannelType[]; scheduledAt: string; status: 'completed' | 'sending' | 'scheduled' | 'draft'; contentSnippet: string; deliveredCount: number; readCount: number; responseCount: number; failedCount: number; createdAt: string; senderOfficer: string; }
export interface BroadcastReply { id: string; campaignId: string; campaignTitle: string; citizenName: string; phone: string; channel: ChannelType; replyText: string; receivedAt: string; status: 'new' | 'routed_to_inbox' | 'replied'; assignedOfficer?: string; }
export interface AppNotification { id: string; title: string; message: string; time: string; type: 'urgent' | 'message' | 'system' | 'bot' | 'sla'; isRead: boolean; targetTab?: TabKey; ticketId?: string; }
