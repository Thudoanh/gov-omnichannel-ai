-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'team_lead', 'officer', 'receptionist');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('available', 'busy', 'away');

-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('zalo', 'facebook', 'dvc', 'hotline', 'email', 'web', 'sms');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('pending', 'processing', 'resolved', 'auto_resolved', 'scheduled_callback');

-- CreateEnum
CREATE TYPE "UrgencyLevel" AS ENUM ('urgent', 'high', 'normal', 'low');

-- CreateEnum
CREATE TYPE "MessageSender" AS ENUM ('citizen', 'officer', 'ai_bot', 'system');

-- CreateEnum
CREATE TYPE "ResolutionType" AS ENUM ('human', 'ai_auto', 'canned_response', 'after_hours_bot');

-- CreateEnum
CREATE TYPE "ScheduleType" AS ENUM ('night_shift', 'weekend', 'holiday', 'all_officers_busy');

-- CreateEnum
CREATE TYPE "AfterHoursAction" AS ENUM ('ai_instant_answered', 'scheduled_morning_callback', 'escalated_oncall_officer');

-- CreateEnum
CREATE TYPE "AfterHoursStatus" AS ENUM ('pending_morning', 'completed', 'notified');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('completed', 'sending', 'scheduled', 'draft');

-- CreateEnum
CREATE TYPE "BroadcastReplyStatus" AS ENUM ('new', 'routed_to_inbox', 'replied');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "idCard" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'officer',
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "badgeNumber" TEXT NOT NULL,
    "avatarInitials" TEXT NOT NULL,
    "avatarColor" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'available',
    "createdAtLabel" TEXT NOT NULL,
    "lastLogin" TEXT,
    "isVNeIDVerified" BOOLEAN NOT NULL DEFAULT false,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "citizenName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "channel" "ChannelType" NOT NULL,
    "channelName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "urgency" "UrgencyLevel" NOT NULL,
    "status" "TicketStatus" NOT NULL,
    "createdAtLabel" TEXT NOT NULL,
    "updatedAtLabel" TEXT NOT NULL,
    "assignedOfficer" TEXT NOT NULL,
    "assigneeId" TEXT,
    "lastMessage" TEXT NOT NULL,
    "unreadCount" INTEGER,
    "slaDeadlineMinutes" INTEGER,
    "tags" TEXT[],
    "resolvedAtLabel" TEXT,
    "resolutionType" "ResolutionType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "sender" "MessageSender" NOT NULL,
    "senderName" TEXT,
    "text" TEXT NOT NULL,
    "timeLabel" TEXT NOT NULL,
    "attachments" JSONB,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternalNote" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "authorId" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InternalNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketAIAnalysis" (
    "ticketId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "intent" TEXT NOT NULL,
    "urgencyReason" TEXT NOT NULL,
    "lawCitation" TEXT NOT NULL,
    "suggestedReply" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "autoResolvable" BOOLEAN NOT NULL,

    CONSTRAINT "TicketAIAnalysis_pkey" PRIMARY KEY ("ticketId")
);

-- CreateTable
CREATE TABLE "FAQ" (
    "id" TEXT NOT NULL,
    "intentCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "sampleQuestions" TEXT[],
    "keywords" TEXT[],
    "officialAnswer" TEXT NOT NULL,
    "legalBasis" TEXT NOT NULL,
    "requiredDocuments" TEXT[],
    "processingDays" TEXT NOT NULL,
    "fee" TEXT NOT NULL,
    "autoResolutionEnabled" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "accuracyRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FAQ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CannedSnippet" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortcut" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "variables" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CannedSnippet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AfterHoursRule" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "scheduleType" "ScheduleType" NOT NULL,
    "activeTimeWindow" TEXT NOT NULL,
    "autoReplyTemplate" TEXT NOT NULL,
    "createCallbackTicket" BOOLEAN NOT NULL,
    "smsZaloConfirmation" BOOLEAN NOT NULL,
    "aiBotEnabled" BOOLEAN NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AfterHoursRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AfterHoursLog" (
    "id" TEXT NOT NULL,
    "citizenName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "channel" "ChannelType" NOT NULL,
    "receivedAtLabel" TEXT NOT NULL,
    "questionSnippet" TEXT NOT NULL,
    "actionTaken" "AfterHoursAction" NOT NULL,
    "ticketCode" TEXT NOT NULL,
    "callbackAssignedTo" TEXT NOT NULL,
    "callbackTimeTarget" TEXT NOT NULL,
    "status" "AfterHoursStatus" NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AfterHoursLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledCallback" (
    "id" TEXT NOT NULL,
    "afterHoursLogId" TEXT NOT NULL,
    "assignedTo" TEXT NOT NULL,
    "targetLabel" TEXT NOT NULL,
    "status" "AfterHoursStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledCallback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "targetGroup" TEXT NOT NULL,
    "recipientCount" INTEGER NOT NULL,
    "channels" "ChannelType"[],
    "scheduledAt" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL,
    "contentSnippet" TEXT NOT NULL,
    "deliveredCount" INTEGER NOT NULL DEFAULT 0,
    "readCount" INTEGER NOT NULL DEFAULT 0,
    "responseCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAtLabel" TEXT NOT NULL,
    "senderOfficer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BroadcastReply" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "campaignTitle" TEXT NOT NULL,
    "citizenName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "channel" "ChannelType" NOT NULL,
    "replyText" TEXT NOT NULL,
    "receivedAtLabel" TEXT NOT NULL,
    "status" "BroadcastReplyStatus" NOT NULL,
    "assignedOfficer" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BroadcastReply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_idCard_key" ON "User"("idCard");

-- CreateIndex
CREATE UNIQUE INDEX "User_badgeNumber_key" ON "User"("badgeNumber");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Ticket_status_idx" ON "Ticket"("status");

-- CreateIndex
CREATE INDEX "Ticket_channel_idx" ON "Ticket"("channel");

-- CreateIndex
CREATE INDEX "Ticket_urgency_idx" ON "Ticket"("urgency");

-- CreateIndex
CREATE INDEX "Ticket_category_idx" ON "Ticket"("category");

-- CreateIndex
CREATE INDEX "Ticket_createdAt_idx" ON "Ticket"("createdAt");

-- CreateIndex
CREATE INDEX "Ticket_assigneeId_idx" ON "Ticket"("assigneeId");

-- CreateIndex
CREATE INDEX "Message_ticketId_createdAt_idx" ON "Message"("ticketId", "createdAt");

-- CreateIndex
CREATE INDEX "InternalNote_ticketId_createdAt_idx" ON "InternalNote"("ticketId", "createdAt");

-- CreateIndex
CREATE INDEX "InternalNote_authorId_idx" ON "InternalNote"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "FAQ_intentCode_key" ON "FAQ"("intentCode");

-- CreateIndex
CREATE INDEX "FAQ_category_idx" ON "FAQ"("category");

-- CreateIndex
CREATE UNIQUE INDEX "CannedSnippet_shortcut_key" ON "CannedSnippet"("shortcut");

-- CreateIndex
CREATE INDEX "CannedSnippet_category_idx" ON "CannedSnippet"("category");

-- CreateIndex
CREATE INDEX "AfterHoursRule_scheduleType_isActive_idx" ON "AfterHoursRule"("scheduleType", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "AfterHoursLog_ticketCode_key" ON "AfterHoursLog"("ticketCode");

-- CreateIndex
CREATE INDEX "AfterHoursLog_status_idx" ON "AfterHoursLog"("status");

-- CreateIndex
CREATE INDEX "AfterHoursLog_actionTaken_idx" ON "AfterHoursLog"("actionTaken");

-- CreateIndex
CREATE INDEX "AfterHoursLog_receivedAt_idx" ON "AfterHoursLog"("receivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledCallback_afterHoursLogId_key" ON "ScheduledCallback"("afterHoursLogId");

-- CreateIndex
CREATE INDEX "ScheduledCallback_status_idx" ON "ScheduledCallback"("status");

-- CreateIndex
CREATE INDEX "Campaign_status_idx" ON "Campaign"("status");

-- CreateIndex
CREATE INDEX "Campaign_createdAt_idx" ON "Campaign"("createdAt");

-- CreateIndex
CREATE INDEX "BroadcastReply_campaignId_idx" ON "BroadcastReply"("campaignId");

-- CreateIndex
CREATE INDEX "BroadcastReply_status_idx" ON "BroadcastReply"("status");

-- CreateIndex
CREATE INDEX "BroadcastReply_receivedAt_idx" ON "BroadcastReply"("receivedAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketAIAnalysis" ADD CONSTRAINT "TicketAIAnalysis_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledCallback" ADD CONSTRAINT "ScheduledCallback_afterHoursLogId_fkey" FOREIGN KEY ("afterHoursLogId") REFERENCES "AfterHoursLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BroadcastReply" ADD CONSTRAINT "BroadcastReply_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
