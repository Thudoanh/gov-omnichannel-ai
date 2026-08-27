import React, { useState, useEffect } from 'react';
import {
  TabKey,
  TicketItem,
  ChannelType,
  AfterHoursRule,
  NightShiftLog,
  FAQItem,
  CannedSnippet,
  BroadcastCampaign,
  BroadcastReply,
  TicketStatus,
  AppNotification,
  SoundSettings
} from './types';
import {
  INITIAL_TICKETS,
  INITIAL_AFTER_HOURS_RULES,
  INITIAL_NIGHT_SHIFT_LOGS,
  INITIAL_FAQS,
  INITIAL_CANNED_SNIPPETS,
  INITIAL_BROADCASTS,
  INITIAL_BROADCAST_REPLIES,
  INITIAL_NOTIFICATIONS,
  INITIAL_USERS
} from './data/mockData';
import { Header } from './components/Header';
import { OmnichannelInbox } from './components/OmnichannelInbox';
import { AfterHoursAutoPilot } from './components/AfterHoursAutoPilot';
import { AIKnowledgeBaseFAQ } from './components/AIKnowledgeBaseFAQ';
import { MassBroadcastCenter } from './components/MassBroadcastCenter';
import { AnalyticsOverview } from './components/AnalyticsOverview';
import { AIFloatingChatbot } from './components/AIFloatingChatbot';
import { NotificationSoundModal } from './components/NotificationSoundModal';
import { AuthModal } from './components/AuthModal';
import { playSoundByPreset } from './utils/audio';
import { UserProfile } from './types';
import { hasTabAccess, ROLE_CONFIGS } from './utils/rbac';

export default function App() {
  // Authentication & Officer Profile State
  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('govtech_users');
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('govtech_current_user');
      return saved ? JSON.parse(saved) : INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'register' | 'forgot' | 'profile'>('login');

  const [currentTab, setCurrentTab] = useState<TabKey>('inbox');
  const [tickets, setTickets] = useState<TicketItem[]>(INITIAL_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(INITIAL_TICKETS[0]);
  const [isAfterHoursMode, setIsAfterHoursMode] = useState<boolean>(false);
  const [afterHoursRules, setAfterHoursRules] = useState<AfterHoursRule[]>(INITIAL_AFTER_HOURS_RULES);
  const [nightShiftLogs, setNightShiftLogs] = useState<NightShiftLog[]>(INITIAL_NIGHT_SHIFT_LOGS);
  const [faqs, setFaqs] = useState<FAQItem[]>(INITIAL_FAQS);
  const [cannedSnippets] = useState<CannedSnippet[]>(INITIAL_CANNED_SNIPPETS);
  const [broadcasts, setBroadcasts] = useState<BroadcastCampaign[]>(INITIAL_BROADCASTS);
  const [broadcastReplies, setBroadcastReplies] = useState<BroadcastReply[]>(INITIAL_BROADCAST_REPLIES);

  // Cross-Module Interaction State
  const [inboxFilter, setInboxFilter] = useState<{
    channel?: string;
    status?: string;
    urgency?: string;
    category?: string;
    searchQuery?: string;
  } | null>(null);
  const [inboxPrefilledMessage, setInboxPrefilledMessage] = useState<string>('');
  const [broadcastPrefilledDraft, setBroadcastPrefilledDraft] = useState<{
    title?: string;
    category?: string;
    content?: string;
  } | null>(null);

  // Notification and Sound Settings state
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);
  const [notificationModalTab, setNotificationModalTab] = useState<'notifications' | 'sound'>('notifications');
  const [soundSettings, setSoundSettings] = useState<SoundSettings>({
    isEnabled: true,
    volume: 80,
    preset: 'gov-standard',
    playOnUrgentOnly: false,
    playOnNewMessage: true,
    playOnAutoResolved: true,
  });

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'urgent' } | null>(null);

  // Sync users & current user to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('govtech_users', JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  }, [users]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('govtech_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('govtech_current_user');
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  const showToast = (text: string, type: 'success' | 'info' | 'urgent' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Auth Handlers
  const handleOpenAuthModal = (view: 'login' | 'register' | 'forgot' | 'profile' = 'login') => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    // update in users list if exists
    setUsers(prev => {
      const idx = prev.findIndex(u => u.id === user.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = user;
        return next;
      }
      return [user, ...prev];
    });
    showToast(`Đăng nhập ca trực thành công: ${user.fullName} (${user.title})`, 'success');
  };

  const handleRegister = (newUser: UserProfile) => {
    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    showToast(`Đã tạo tài khoản cán bộ thành công: ${newUser.fullName}`, 'success');
  };

  const handleUpdateProfile = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    showToast('Đã lưu thông tin hồ sơ cán bộ thành công', 'success');
  };

  const handleLogout = () => {
    const prevName = currentUser?.fullName || 'Cán bộ';
    setCurrentUser(null);
    showToast(`Đã bàn giao ca trực và đăng xuất: ${prevName}`, 'info');
  };

  const handleStatusChange = (status: 'available' | 'busy' | 'away') => {
    if (currentUser) {
      const updated = { ...currentUser, status };
      setCurrentUser(updated);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
      const statusLabel = status === 'available' ? 'Sẵn sàng tiếp nhận' : status === 'busy' ? 'Bận xử lý hồ sơ' : 'Tạm vắng';
      showToast(`Đã đổi trạng thái sang: ${statusLabel}`, 'info');
    }
  };

  const handleOpenNotificationModal = (tab: 'notifications' | 'sound' = 'notifications') => {
    setNotificationModalTab(tab);
    setIsNotificationModalOpen(true);
  };

  const handleCloseNotificationModal = () => {
    setIsNotificationModalOpen(false);
  };

  const handleUpdateSoundSettings = (newSettings: Partial<SoundSettings>) => {
    setSoundSettings(prev => ({ ...prev, ...newSettings }));
    showToast('Đã cập nhật cài đặt âm thanh thông báo', 'info');
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showToast('Đã đánh dấu tất cả thông báo là đã đọc', 'success');
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    showToast('Đã xóa tất cả thông báo', 'info');
  };

  const handleSelectNotification = (targetTab?: TabKey, ticketId?: string) => {
    if (targetTab) {
      setCurrentTab(targetTab);
    }
    if (ticketId) {
      const found = tickets.find(t => t.id === ticketId);
      if (found) {
        setSelectedTicket(found);
      }
    }
  };

  const handleToggleAfterHoursMode = () => {
    const nextMode = !isAfterHoursMode;
    setIsAfterHoursMode(nextMode);
    if (nextMode) {
      showToast('Đã kích hoạt chế độ Trực Tự Động 24/7 (Ngoài Giờ). AI sẽ tự động tiếp nhận & đặt lịch hẹn!', 'urgent');
      if (soundSettings.isEnabled) {
        playSoundByPreset('urgent-alert', soundSettings.volume, true);
      }
      // Add notification
      const newNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        title: 'Chuyển sang Chế độ Trực Tự Động 24/7',
        message: 'Đã kích hoạt Trợ lý AI tiếp nhận và lên lịch gọi lại ngoài giờ hành chính.',
        time: 'Vừa xong',
        type: 'bot',
        isRead: false,
        targetTab: 'afterhours'
      };
      setNotifications(prev => [newNotif, ...prev]);
    } else {
      showToast('Đã chuyển sang chế độ Trong Giờ Làm Việc (Cán bộ trực tiếp thụ lý)', 'success');
      if (soundSettings.isEnabled) {
        playSoundByPreset(soundSettings.preset, soundSettings.volume, false);
      }
      const newNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        title: 'Bắt đầu Ca Trực Hành Chính',
        message: 'Cán bộ trực Lê Minh Tâm tiếp nhận thụ lý phản ánh công dân trực tiếp.',
        time: 'Vừa xong',
        type: 'system',
        isRead: false,
        targetTab: 'inbox'
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  // Ticket Management
  const handleSendMessage = (ticketId: string, text: string) => {
    const officerName = currentUser ? `${currentUser.fullName} (${currentUser.title})` : 'Cán bộ trực ban';
    setTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          const newMsg = {
            id: `msg-${Date.now()}`,
            sender: 'officer' as const,
            senderName: officerName,
            text,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
          };
          const updated = {
            ...t,
            status: 'processing' as TicketStatus,
            lastMessage: text,
            assignedOfficer: currentUser?.fullName || t.assignedOfficer,
            conversation: [...t.conversation, newMsg]
          };
          if (selectedTicket?.id === ticketId) {
            setSelectedTicket(updated);
          }
          return updated;
        }
        return t;
      })
    );
    showToast('Đã gửi phản hồi chính thức thành công qua ' + (selectedTicket?.channelName || 'kênh'), 'success');
  };

  const handleUpdateStatus = (ticketId: string, status: TicketStatus) => {
    setTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          const updated = { ...t, status };
          if (selectedTicket?.id === ticketId) setSelectedTicket(updated);
          return updated;
        }
        return t;
      })
    );
    showToast(`Đã cập nhật trạng thái hồ sơ ${ticketId}`, 'info');
  };

  const handleUpdateInternalNote = (ticketId: string, note: string) => {
    setTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          const updated = { ...t, internalNote: note };
          if (selectedTicket?.id === ticketId) setSelectedTicket(updated);
          return updated;
        }
        return t;
      })
    );
    showToast('Đã lưu ghi chú nội bộ cho chuyên viên', 'success');
  };

  // After Hours Rules & Logs
  const handleToggleRule = (ruleId: string) => {
    setAfterHoursRules(prev =>
      prev.map(r => (r.id === ruleId ? { ...r, isActive: !r.isActive } : r))
    );
    showToast('Đã cập nhật kịch bản trực ngoài giờ', 'info');
  };

  const handleResolveNightLog = (logId: string) => {
    setNightShiftLogs(prev =>
      prev.map(l => (l.id === logId ? { ...l, status: 'completed' as const } : l))
    );
    showToast('Đã liên hệ hỗ trợ công dân thành công', 'success');
  };

  // FAQ & Knowledge Base
  const handleToggleFAQAutoResolution = (faqId: string) => {
    setFaqs(prev =>
      prev.map(f => (f.id === faqId ? { ...f, autoResolutionEnabled: !f.autoResolutionEnabled } : f))
    );
    showToast('Đã thay đổi trạng thái tự động trả lời cho thủ tục', 'info');
  };

  const handleAddFAQ = (newFaqData: Omit<FAQItem, 'id' | 'usageCount' | 'accuracyRate'>) => {
    const newFaq: FAQItem = {
      ...newFaqData,
      id: `faq-${Date.now()}`,
      usageCount: 1,
      accuracyRate: 99.0
    };
    setFaqs(prev => [newFaq, ...prev]);
    showToast('Đã thêm thủ tục mới vào Kho Tri Thức AI', 'success');
  };

  // Mass Broadcast
  const handleCreateCampaign = (newCampData: Omit<BroadcastCampaign, 'id' | 'deliveredCount' | 'readCount' | 'responseCount' | 'failedCount' | 'createdAt'>) => {
    const delivered = Math.floor(newCampData.recipientCount * 0.98);
    const read = Math.floor(delivered * 0.85);
    const newCamp: BroadcastCampaign = {
      ...newCampData,
      id: `CAMP-2026-0${broadcasts.length + 1}`,
      deliveredCount: delivered,
      readCount: read,
      responseCount: 12,
      failedCount: newCampData.recipientCount - delivered,
      createdAt: 'Vừa xong'
    };
    setBroadcasts(prev => [newCamp, ...prev]);
    showToast(`Đã phát sóng thông báo thành công đến ${newCamp.recipientCount} người dân!`, 'success');
  };

  const handleRouteReplyToInbox = (replyId: string) => {
    const reply = broadcastReplies.find(r => r.id === replyId);
    setBroadcastReplies(prev =>
      prev.map(r => (r.id === replyId ? { ...r, status: 'routed_to_inbox' as const } : r))
    );

    if (reply) {
      // Create real ticket from broadcast reply
      const newTicketId = `TKT-REPLY-${Date.now().toString().slice(-4)}`;
      const channelBadgeMap: Record<string, string> = {
        zalo: 'Zalo OA',
        dvc: 'Cổng DVC',
        sms: 'SMS Brandname',
        facebook: 'Fanpage'
      };

      const newTicket: TicketItem = {
        id: newTicketId,
        citizenName: reply.citizenName,
        phone: reply.phone,
        channel: reply.channel,
        channelName: channelBadgeMap[reply.channel] || 'Kênh trực tuyến',
        category: 'Phản hồi sau phát sóng',
        urgency: 'normal',
        status: 'pending',
        createdAt: 'Vừa xong',
        updatedAt: 'Vừa xong',
        lastMessage: reply.replyText,
        assignedOfficer: currentUser?.fullName || 'Chưa phân công',
        conversation: [
          {
            id: `msg-${Date.now()}-0`,
            sender: 'officer',
            senderName: 'Hệ thống Phát sóng',
            text: `[Thông điệp đã gửi]: ${reply.campaignTitle}`,
            time: reply.receivedAt
          },
          {
            id: `msg-${Date.now()}-1`,
            sender: 'citizen',
            senderName: reply.citizenName,
            text: reply.replyText,
            time: reply.receivedAt
          }
        ],
        aiAnalysis: {
          category: 'Tư vấn hành chính',
          intent: 'Phản hồi / Thắc mắc sau thông báo phát sóng',
          summary: `Công dân phản hồi nội dung bản tin: "${reply.campaignTitle}". Cần chuyên viên tư vấn tiếp.`,
          urgencyReason: 'Công dân tương tác phản hồi bản tin phát sóng diện rộng',
          lawCitation: 'Quy trình giải quyết phản ánh kiến nghị công dân',
          confidenceScore: 92,
          autoResolvable: false,
          suggestedReply: `Chào ${reply.citizenName}, chuyên viên đã ghi nhận phản hồi của bạn về "${reply.campaignTitle}". Bạn có cần hỗ trợ hướng dẫn nộp hồ sơ cụ thể không?`
        }
      };

      setTickets(prev => [newTicket, ...prev]);
      setSelectedTicket(newTicket);
      
      const newNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        title: 'Phản hồi mới từ Bản tin Phát sóng',
        message: `${reply.citizenName} (${reply.phone}) đã phản hồi bản tin: "${reply.campaignTitle}"`,
        time: 'Vừa xong',
        type: 'message',
        isRead: false,
        targetTab: 'inbox',
        ticketId: newTicketId
      };
      setNotifications(prev => [newNotif, ...prev]);
      showToast(`Đã tạo hồ sơ #${newTicketId} và chuyển vào Hộp Thư tiếp nhận!`, 'success');
    } else {
      showToast('Đã chuyển phản hồi của công dân vào Hàng đợi tiếp nhận chung', 'success');
    }
  };

  // Cross-Module Linked Action Handlers
  const handleFilterInbox = (filter: { channel?: string; status?: string; urgency?: string; category?: string; searchQuery?: string }) => {
    setInboxFilter(filter);
    setCurrentTab('inbox');
    showToast('Đã áp dụng bộ lọc theo chỉ số thống kê', 'info');
  };

  const handleOpenTicketInInbox = (ticketIdOrPhone: string) => {
    const found = tickets.find(t => t.id === ticketIdOrPhone || t.phone === ticketIdOrPhone);
    if (found) {
      setSelectedTicket(found);
      setCurrentTab('inbox');
      showToast(`Đã mở hồ sơ #${found.id} của ${found.citizenName}`, 'success');
    } else {
      // Check if matches a night shift log
      const nightLog = nightShiftLogs.find(l => l.phone === ticketIdOrPhone || l.id === ticketIdOrPhone || l.ticketCode === ticketIdOrPhone);
      if (nightLog) {
        const newTicketId = nightLog.ticketCode || `TKT-NIGHT-${Date.now().toString().slice(-4)}`;
        const newTicket: TicketItem = {
          id: newTicketId,
          citizenName: nightLog.citizenName,
          phone: nightLog.phone,
          channel: nightLog.channel,
          channelName: nightLog.channel === 'zalo' ? 'Zalo OA' : nightLog.channel === 'dvc' ? 'Cổng DVC' : 'Hotline',
          category: 'Trực đêm 24/7',
          urgency: nightLog.actionTaken === 'scheduled_morning_callback' ? 'urgent' : 'normal',
          status: nightLog.actionTaken === 'ai_instant_answered' ? 'auto_resolved' : 'scheduled_callback',
          createdAt: nightLog.receivedAt,
          updatedAt: 'Vừa xong',
          lastMessage: nightLog.questionSnippet,
          assignedOfficer: currentUser?.fullName || 'Lê Minh Tâm',
          conversation: [
            {
              id: `msg-${Date.now()}-0`,
              sender: 'citizen',
              senderName: nightLog.citizenName,
              text: nightLog.questionSnippet,
              time: nightLog.receivedAt
            },
            {
              id: `msg-${Date.now()}-1`,
              sender: 'ai_bot',
              senderName: 'Trợ lý Trực Đêm AI',
              text: 'Đã tiếp nhận yêu cầu và xếp lịch hỗ trợ',
              time: nightLog.receivedAt
            }
          ],
          aiAnalysis: {
            category: 'Trực đêm 24/7',
            intent: 'Tiếp nhận xử lý ngoài giờ hành chính',
            summary: `Tiếp nhận ngoài giờ: ${nightLog.questionSnippet}`,
            urgencyReason: 'Yêu cầu được tiếp nhận ngoài giờ làm việc',
            lawCitation: 'Quy chế tiếp nhận hồ sơ ngoài giờ',
            confidenceScore: 95,
            autoResolvable: nightLog.actionTaken === 'ai_instant_answered',
            suggestedReply: `Chào ${nightLog.citizenName}, chuyên viên thụ lý hồ sơ xin liên hệ để giải quyết theo lịch hẹn.`
          }
        };

        setTickets(prev => [newTicket, ...prev]);
        setSelectedTicket(newTicket);
        setCurrentTab('inbox');
        showToast(`Đã chuyển nhật ký trực đêm thành hồ sơ #${newTicketId}!`, 'success');
      } else {
        setCurrentTab('inbox');
      }
    }
  };

  const handleSimulateNightShift = (simData: { channel: ChannelType; question: string; citizenName?: string; phone?: string }) => {
    const isAutoRes = simData.question.toLowerCase().includes('làm lại') || simData.question.toLowerCase().includes('căn cước') || simData.question.toLowerCase().includes('cccd');
    const newLogId = `LOG-${Date.now().toString().slice(-4)}`;
    const ticketCode = `NIGHT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const citizenName = simData.citizenName || 'Công dân trực tuyến';
    const phone = simData.phone || '0918889999';
    const botReply = isAutoRes
      ? 'Theo Luật Căn cước 2023: Thủ tục cấp lại thẻ Căn cước thực hiện trực tuyến 100% qua Cổng DVC Bộ Công an. Lệ phí: 70.000 VNĐ. Thời gian xử lý: 07 ngày làm việc.'
      : 'Cảm ơn Quý công dân đã gửi câu hỏi. Bộ phận Một cửa hiện đang ngoài giờ làm việc. AI đã ghi nhận nhu cầu và hẹn cán bộ chuyên trách gọi lại vào 08h30 sáng mai.';
    const callbackTime = isAutoRes ? 'Đã giải quyết tự động' : '08:30 Sáng mai';

    const newLog: NightShiftLog = {
      id: newLogId,
      citizenName,
      phone,
      channel: simData.channel,
      receivedAt: '23:15 (Đêm nay)',
      questionSnippet: simData.question,
      actionTaken: isAutoRes ? 'ai_instant_answered' : 'scheduled_morning_callback',
      ticketCode,
      callbackAssignedTo: 'Lê Minh Tâm',
      callbackTimeTarget: callbackTime,
      status: isAutoRes ? 'completed' : 'pending_morning'
    };

    setNightShiftLogs(prev => [newLog, ...prev]);

    // Also add to tickets queue
    const newTicket: TicketItem = {
      id: ticketCode,
      citizenName,
      phone,
      channel: simData.channel,
      channelName: simData.channel === 'zalo' ? 'Zalo OA' : simData.channel === 'dvc' ? 'Cổng DVC' : 'Hotline',
      category: isAutoRes ? 'Cấp đổi/Cấp lại Căn cước công dân' : 'Tư vấn hồ sơ hành chính tổng hợp',
      urgency: isAutoRes ? 'normal' : 'urgent',
      status: isAutoRes ? 'auto_resolved' : 'scheduled_callback',
      createdAt: '23:15 (Đêm nay)',
      updatedAt: 'Vừa xong',
      lastMessage: simData.question,
      assignedOfficer: 'Trợ lý AI 24/7',
      conversation: [
        {
          id: `msg-${Date.now()}-0`,
          sender: 'citizen',
          senderName: citizenName,
          text: simData.question,
          time: '23:15'
        },
        {
          id: `msg-${Date.now()}-1`,
          sender: 'ai_bot',
          senderName: 'Trợ lý Trực Đêm AI',
          text: botReply,
          time: '23:15'
        }
      ],
      aiAnalysis: {
        category: isAutoRes ? 'Căn cước công dân' : 'Tư vấn hành chính',
        intent: isAutoRes ? 'Cấp đổi Căn cước' : 'Hẹn gọi lại ngoài giờ',
        summary: `Hồ sơ tiếp nhận tự động ngoài giờ: ${simData.question}`,
        urgencyReason: isAutoRes ? 'Xử lý tự động thành công' : 'Lịch hẹn gọi lại sáng sớm',
        lawCitation: isAutoRes ? 'Luật Căn cước số 26/2023/QH15' : 'Quy định tiếp nhận và trả kết quả TTHC',
        confidenceScore: isAutoRes ? 96 : 88,
        autoResolvable: isAutoRes,
        suggestedReply: botReply
      }
    };

    setTickets(prev => [newTicket, ...prev]);

    // Add notification
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: isAutoRes ? 'AI Trực Đêm đã tự động giải quyết' : 'Ca trực đêm: Lịch hẹn gọi lại sáng mai',
      message: `${citizenName} (${phone}): ${simData.question}`,
      time: 'Vừa xong',
      type: 'bot',
      isRead: false,
      targetTab: 'afterhours',
      ticketId: ticketCode
    };
    setNotifications(prev => [newNotif, ...prev]);

    if (soundSettings.isEnabled) {
      playSoundByPreset(isAutoRes ? soundSettings.preset : 'urgent-alert', soundSettings.volume, !isAutoRes);
    }

    showToast(`Đã mô phỏng tiếp nhận tin trực đêm thành công: #${ticketCode}`, 'success');

    return {
      ticketCode,
      botAnswer: botReply,
      callbackTime
    };
  };

  const handleApplyFAQToInbox = (faq: FAQItem) => {
    setInboxPrefilledMessage(`Kính gửi Quý công dân, về thủ tục "${faq.title}": ${faq.officialAnswer} (Căn cứ: ${faq.legalBasis})`);
    setCurrentTab('inbox');
    showToast(`Đã áp dụng mẫu trả lời của thủ tục "${faq.title}" vào ô soạn thảo`, 'success');
  };

  const handleCreateBroadcastFromFAQ = (faq: FAQItem) => {
    setBroadcastPrefilledDraft({
      title: `Thông báo hướng dẫn thủ tục: ${faq.title}`,
      category: faq.category,
      content: `UBND Quận thông báo hướng dẫn công dân về "${faq.title}": ${faq.officialAnswer}. Căn cứ theo ${faq.legalBasis}. Người dân có thể thực hiện trực tuyến 100% qua Cổng DVC.`
    });
    setCurrentTab('broadcast');
    showToast(`Đã tạo bản thảo phát sóng từ thủ tục "${faq.title}"`, 'success');
  };

  const handleCreateBroadcastFromTicket = (ticket: TicketItem) => {
    setBroadcastPrefilledDraft({
      title: `Thông báo phổ biến quy định về ${ticket.category}`,
      category: ticket.category,
      content: `UBND thông báo đến toàn thể công dân: Về thủ tục ${ticket.category}, các giấy tờ cần thiết và quy trình tiếp nhận trực tuyến theo ${ticket.aiAnalysis.lawCitation}.`
    });
    setCurrentTab('broadcast');
    showToast(`Đã tạo bản thảo phát sóng từ hồ sơ #${ticket.id}`, 'success');
  };

  const handleTestWithRealTicket = (faq: FAQItem, question: string) => {
    const testTicketId = `TKT-TEST-${Date.now().toString().slice(-4)}`;
    const newTicket: TicketItem = {
      id: testTicketId,
      citizenName: 'Công dân Thử Nghiệm AI',
      phone: '0901234567',
      channel: 'zalo',
      channelName: 'Zalo OA',
      category: faq.category,
      urgency: 'normal',
      status: 'pending',
      createdAt: 'Vừa xong',
      updatedAt: 'Vừa xong',
      lastMessage: question,
      assignedOfficer: currentUser?.fullName || 'Lê Minh Tâm',
      conversation: [
        {
          id: `msg-${Date.now()}-0`,
          sender: 'citizen',
          senderName: 'Công dân Thử Nghiệm AI',
          text: question,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }
      ],
      aiAnalysis: {
        category: faq.category,
        intent: faq.title,
        summary: `Hồ sơ thử nghiệm khớp ý định AI: ${faq.title}`,
        urgencyReason: 'Thử nghiệm phân luồng tự động',
        lawCitation: faq.legalBasis,
        confidenceScore: 98,
        autoResolvable: faq.autoResolutionEnabled,
        suggestedReply: faq.officialAnswer
      }
    };

    setTickets(prev => [newTicket, ...prev]);
    setSelectedTicket(newTicket);
    setCurrentTab('inbox');
    showToast(`Đã tạo hồ sơ thử nghiệm #${testTicketId} trong Hộp Thư!`, 'success');
  };

  const handleNavigateToFAQ = (keyword?: string) => {
    setCurrentTab('faq');
    if (keyword) {
      showToast(`Chuyển đến Kho Tri Thức tra cứu: ${keyword}`, 'info');
    }
  };

  const pendingTicketsCount = tickets.filter(t => t.status === 'pending').length;
  const unreadNotificationCount = notifications.filter(n => !n.isRead).length;

  const handleTabSelect = (tab: TabKey) => {
    if (currentUser && !hasTabAccess(currentUser.role, tab)) {
      const roleLabel = ROLE_CONFIGS[currentUser.role]?.shortLabel || currentUser.role;
      showToast(`Tài khoản vai trò [${roleLabel}] không có quyền truy cập chức năng này.`, 'urgent');
      return;
    }
    setCurrentTab(tab);
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-slate-800 flex flex-col selection:bg-[#a81c1c] selection:text-white">
      
      {/* Top Officer Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={handleTabSelect}
        pendingCount={pendingTicketsCount}
        isAfterHoursMode={isAfterHoursMode}
        onToggleAfterHoursMode={handleToggleAfterHoursMode}
        soundSettings={soundSettings}
        unreadNotificationCount={unreadNotificationCount}
        onOpenNotificationModal={handleOpenNotificationModal}
        currentUser={currentUser}
        onOpenAuthModal={handleOpenAuthModal}
        onLogout={handleLogout}
        onStatusChange={handleStatusChange}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-3 sm:p-5 lg:p-6">
        
        {/* Pain Point 1: Unified Omnichannel Inbox */}
        {currentTab === 'inbox' && (
          <OmnichannelInbox
            tickets={tickets}
            selectedTicket={selectedTicket}
            onSelectTicket={setSelectedTicket}
            onSendMessage={handleSendMessage}
            onUpdateStatus={handleUpdateStatus}
            onUpdateInternalNote={handleUpdateInternalNote}
            onApplyCannedResponse={(text) => handleSendMessage(selectedTicket?.id || '', text)}
            initialFilter={inboxFilter}
            initialMessageInput={inboxPrefilledMessage}
            onNavigateToFAQ={handleNavigateToFAQ}
            onCreateBroadcastFromTicket={handleCreateBroadcastFromTicket}
          />
        )}

        {/* Pain Point 2: 24/7 After-Hours Auto-Pilot */}
        {currentTab === 'afterhours' && (
          <AfterHoursAutoPilot
            isAfterHoursMode={isAfterHoursMode}
            onToggleAfterHoursMode={handleToggleAfterHoursMode}
            rules={afterHoursRules}
            onToggleRule={handleToggleRule}
            nightShiftLogs={nightShiftLogs}
            onResolveNightLog={handleResolveNightLog}
            onSimulateNightShift={handleSimulateNightShift}
            onOpenTicketInInbox={handleOpenTicketInInbox}
            onNavigateTab={handleTabSelect}
          />
        )}

        {/* Pain Point 3: AI Knowledge Base & FAQ Auto-Resolution */}
        {currentTab === 'faq' && (
          <AIKnowledgeBaseFAQ
            faqs={faqs}
            cannedSnippets={cannedSnippets}
            onToggleFAQAutoResolution={handleToggleFAQAutoResolution}
            onAddFAQ={handleAddFAQ}
            onApplyToInbox={handleApplyFAQToInbox}
            onCreateBroadcastFromFAQ={handleCreateBroadcastFromFAQ}
            onTestWithRealTicket={handleTestWithRealTicket}
            onNavigateTab={handleTabSelect}
          />
        )}

        {/* Pain Point 4: Mass Omnichannel Broadcast */}
        {currentTab === 'broadcast' && (
          <MassBroadcastCenter
            campaigns={broadcasts}
            replies={broadcastReplies}
            onCreateCampaign={handleCreateCampaign}
            onRouteReplyToInbox={handleRouteReplyToInbox}
            onOpenTicketInInbox={handleOpenTicketInInbox}
            onNavigateTab={handleTabSelect}
            prefilledDraft={broadcastPrefilledDraft}
          />
        )}

        {/* SLA & Performance Analytics */}
        {currentTab === 'analytics' && (
          <AnalyticsOverview
            tickets={tickets}
            broadcasts={broadcasts}
            nightShiftLogs={nightShiftLogs}
            faqs={faqs}
            onNavigateTab={handleTabSelect}
            onFilterInbox={handleFilterInbox}
          />
        )}

      </main>

      {/* Notification & Sound Settings Modal */}
      <NotificationSoundModal
        isOpen={isNotificationModalOpen}
        onClose={handleCloseNotificationModal}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearAllNotifications={handleClearAllNotifications}
        onSelectNotification={handleSelectNotification}
        soundSettings={soundSettings}
        onUpdateSoundSettings={handleUpdateSoundSettings}
        initialTab={notificationModalTab}
      />

      {/* Authentication & Profile Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onUpdateProfile={handleUpdateProfile}
        initialView={authModalView}
        registeredUsers={users}
      />

      {/* Floating AI Administrative Assistant Chatbot */}
      <AIFloatingChatbot />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-24 right-6 z-50 animate-bounce-short pointer-events-none">
          <div className={`px-4 py-3 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2.5 border backdrop-blur-md ${
            toastMessage.type === 'urgent'
              ? 'bg-red-50 text-red-900 border-red-300'
              : toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-white text-slate-800 border-slate-300'
          }`}>
            <i className={`fa-solid ${
              toastMessage.type === 'urgent'
                ? 'fa-circle-exclamation text-red-600'
                : toastMessage.type === 'success'
                ? 'fa-circle-check text-emerald-600'
                : 'fa-circle-info text-blue-600'
            }`}></i>
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

    </div>
  );
}

