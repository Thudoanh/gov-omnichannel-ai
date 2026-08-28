import React, { useState, useEffect } from 'react';
import { TicketItem, ChannelType, TicketStatus, TabKey } from '../types';

interface OmnichannelInboxProps {
  tickets: TicketItem[];
  selectedTicket: TicketItem | null;
  onSelectTicket: (ticket: TicketItem) => void;
  onSendMessage: (ticketId: string, text: string) => void;
  onUpdateStatus: (ticketId: string, status: TicketStatus) => void;
  onUpdateInternalNote: (ticketId: string, note: string) => void;
  onApplyCannedResponse?: (text: string) => void;
  initialFilter?: {
    channel?: string;
    status?: string;
    urgency?: string;
    category?: string;
    searchQuery?: string;
  } | null;
  initialMessageInput?: string;
  onNavigateToFAQ?: (searchKeyword?: string) => void;
  onCreateBroadcastFromTicket?: (ticket: TicketItem) => void;
}

export const OmnichannelInbox: React.FC<OmnichannelInboxProps> = ({
  tickets,
  selectedTicket,
  onSelectTicket,
  onSendMessage,
  onUpdateStatus,
  onUpdateInternalNote,
  initialFilter,
  initialMessageInput,
  onNavigateToFAQ,
  onCreateBroadcastFromTicket,
}) => {
  // View mode: 'dashboard' (overview table of all incoming messages) or 'chat' (active chat with left queue + right AI panel)
  const [viewMode, setViewMode] = useState<'dashboard' | 'chat'>('dashboard');
  const [channelFilter, setChannelFilter] = useState<string>(initialFilter?.channel || 'all');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter?.status || 'all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>(initialFilter?.urgency || 'all');
  const [categoryFilter, setCategoryFilter] = useState<string>(initialFilter?.category || 'all');
  const [searchQuery, setSearchQuery] = useState<string>(initialFilter?.searchQuery || '');
  const [messageInput, setMessageInput] = useState<string>(initialMessageInput || '');
  const [internalNoteInput, setInternalNoteInput] = useState<string>('');
  const [copiedToast, setCopiedToast] = useState<boolean>(false);

  // Synchronize when initialFilter changes from parent
  useEffect(() => {
    if (initialFilter) {
      if (initialFilter.channel !== undefined) setChannelFilter(initialFilter.channel);
      if (initialFilter.status !== undefined) setStatusFilter(initialFilter.status);
      if (initialFilter.urgency !== undefined) setUrgencyFilter(initialFilter.urgency);
      if (initialFilter.category !== undefined) setCategoryFilter(initialFilter.category);
      if (initialFilter.searchQuery !== undefined) setSearchQuery(initialFilter.searchQuery);
    }
  }, [initialFilter]);

  // Synchronize when initialMessageInput changes
  useEffect(() => {
    if (initialMessageInput) {
      setMessageInput(initialMessageInput);
      setViewMode('chat');
    }
  }, [initialMessageInput]);

  // Sync internal note when ticket changes
  useEffect(() => {
    if (selectedTicket) {
      setInternalNoteInput(selectedTicket.internalNote || '');
    }
  }, [selectedTicket?.id]);

  const filteredTickets = tickets.filter(t => {
    if (channelFilter !== 'all' && t.channel !== channelFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (urgencyFilter !== 'all' && t.urgency !== urgencyFilter) return false;
    if (categoryFilter !== 'all' && !t.category.toLowerCase().includes(categoryFilter.toLowerCase())) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.citizenName.toLowerCase().includes(q);
      const matchPhone = t.phone.includes(q);
      const matchId = t.id.toLowerCase().includes(q);
      const matchMsg = t.lastMessage.toLowerCase().includes(q);
      const matchCat = t.category.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchId && !matchMsg && !matchCat) return false;
    }
    return true;
  });

  const handleSelectMessageToChat = (ticket: TicketItem) => {
    onSelectTicket(ticket);
    setViewMode('chat');
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !messageInput.trim()) return;
    onSendMessage(selectedTicket.id, messageInput.trim());
    setMessageInput('');
  };

  const handleInsertAISuggestion = () => {
    if (!selectedTicket) return;
    setMessageInput(selectedTicket.aiAnalysis.suggestedReply);
  };

  const handleCopyLegalCitation = () => {
    if (!selectedTicket) return;
    navigator.clipboard.writeText(selectedTicket.aiAnalysis.lawCitation);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const getChannelBadge = (channel: ChannelType) => {
    switch (channel) {
      case 'zalo':
        return { name: 'Zalo OA', icon: 'fa-solid fa-comment-dots', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'facebook':
        return { name: 'Facebook Fanpage', icon: 'fa-brands fa-facebook-messenger', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'dvc':
        return { name: 'Cổng DVC Quốc gia', icon: 'fa-solid fa-landmark', color: 'bg-red-50 text-red-700 border-red-200' };
      case 'hotline':
        return { name: 'Tổng đài 1022', icon: 'fa-solid fa-phone', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'email':
        return { name: 'Email DVC', icon: 'fa-solid fa-envelope', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'web':
        return { name: 'Web Portal', icon: 'fa-solid fa-globe', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' };
      default:
        return { name: channel, icon: 'fa-solid fa-message', color: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' };
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Chờ tiếp nhận</span>;
      case 'processing':
        return <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-300 inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span> Đang thụ lý</span>;
      case 'resolved':
        return <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Đã giải quyết</span>;
      case 'auto_resolved':
        return <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-300 inline-flex items-center gap-1.5"> AI Xử lý xong</span>;
      case 'scheduled_callback':
        return <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-300 inline-flex items-center gap-1.5"> Hẹn gọi lại</span>;
    }
  };

  // Metrics for Dashboard overview
  const totalCount = tickets.length;
  const urgentCount = tickets.filter(t => t.urgency === 'urgent').length;
  const pendingCount = tickets.filter(t => t.status === 'pending').length;
  const processingCount = tickets.filter(t => t.status === 'processing' || t.status === 'scheduled_callback').length;
  const autoResolvedCount = tickets.filter(t => t.status === 'auto_resolved' || t.status === 'resolved').length;

  const zaloCount = tickets.filter(t => t.channel === 'zalo').length;
  const dvcCount = tickets.filter(t => t.channel === 'dvc').length;
  const fbCount = tickets.filter(t => t.channel === 'facebook').length;
  const hotlineCount = tickets.filter(t => t.channel === 'hotline').length;
  const emailCount = tickets.filter(t => t.channel === 'email' || t.channel === 'web').length;

  return (
    <div className="space-y-3">
      
      {/* Header Banner: Hộp Thư */}
      {viewMode === 'dashboard' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-[#a81c1c] text-lg shrink-0">
              
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight">Hộp Thư</h2>
            </div>
          </div>

          {/* Integration Status indicator */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-slate-800 dark:text-slate-200 font-bold">5/5 Kênh Trực Tuyến</span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="text-[#a81c1c] font-mono font-black">{totalCount} Hồ sơ tiếp nhận</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DASHBOARD VIEW (Ban đầu: Bảng ghi nhận toàn bộ tin nhắn đa kênh)        */}
      {/* ========================================================================= */}
      {viewMode === 'dashboard' ? (
        <div className="space-y-3 animate-in fade-in duration-150">
          
          {/* Compact Metric Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block leading-none">Tổng tiếp nhận</span>
                <span className="text-lg font-black text-slate-900 dark:text-slate-100 mt-1 block leading-tight">{totalCount}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-red-200 rounded-lg px-3 py-2 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[10px] text-red-700 font-bold uppercase block leading-none">Khẩn cấp</span>
                <span className="text-lg font-black text-[#a81c1c] mt-1 block leading-tight flex items-center gap-1">
                  {urgentCount}
                  {urgentCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-amber-200 rounded-lg px-3 py-2 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[10px] text-amber-800 font-bold uppercase block leading-none">Chờ tiếp nhận</span>
                <span className="text-lg font-black text-amber-700 mt-1 block leading-tight">{pendingCount}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-blue-200 rounded-lg px-3 py-2 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[10px] text-blue-800 font-bold uppercase block leading-none">Đang xử lý / Hẹn</span>
                <span className="text-lg font-black text-blue-700 mt-1 block leading-tight">{processingCount}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-purple-200 rounded-lg px-3 py-2 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[10px] text-purple-800 font-bold uppercase block leading-none">AI Đã Xử Lý</span>
                <span className="text-lg font-black text-purple-800 mt-1 block leading-tight">{autoResolvedCount}</span>
              </div>
            </div>

          </div>

          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-xs space-y-3">
            
            {/* Top Toolbar: Search + Dropdowns */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm theo Tên công dân, Số điện thoại, Mã hồ sơ #REQ, hoặc từ khóa nội dung..."
                  className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 pl-9 pr-8 py-2.5 rounded-lg text-xs border border-slate-300 dark:border-slate-600 focus:border-[#a81c1c] focus:bg-white dark:bg-slate-800 focus:outline-none placeholder:text-slate-400 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-slate-300 text-xs"
                  >
                    
                  </button>
                )}
              </div>

              {/* Status, Urgency, Category Dropdowns */}
              <div className="flex flex-wrap items-center gap-2">
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-[#a81c1c] outline-none font-semibold"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ tiếp nhận</option>
                  <option value="processing">Đang thụ lý</option>
                  <option value="resolved">Đã giải quyết</option>
                  <option value="auto_resolved">AI Tự động xong</option>
                  <option value="scheduled_callback">Hẹn gọi lại</option>
                </select>

                <select
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value)}
                  className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-[#a81c1c] outline-none font-semibold"
                >
                  <option value="all">Tất cả độ ưu tiên</option>
                  <option value="urgent">Chỉ tin khẩn cấp</option>
                  <option value="high">Ưu tiên cao</option>
                  <option value="normal">Tiêu chuẩn</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-[#a81c1c] outline-none font-semibold"
                >
                  <option value="all">Tất cả lĩnh vực TTHC</option>
                  <option value="đất đai">Đất đai & Nhà ở</option>
                  <option value="kinh doanh">Đăng ký kinh doanh</option>
                  <option value="căn cước">Căn cước & Cư trú</option>
                  <option value="hộ tịch">Hộ tịch & Khai sinh</option>
                  <option value="xây dựng">Xây dựng & Quy hoạch</option>
                </select>

              </div>
            </div>

            {/* Quick Channel Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pt-1 text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-bold shrink-0 text-[11px]">Kênh tiếp nhận:</span>
              
              <button
                onClick={() => setChannelFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  channelFilter === 'all'
                    ? 'bg-[#a81c1c] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600'
                }`}
              >
                <span>Tất cả ({totalCount})</span>
              </button>

              <button
                onClick={() => setChannelFilter('zalo')}
                className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  channelFilter === 'zalo'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600'
                }`}
              >
                
                <span>Zalo OA ({zaloCount})</span>
              </button>

              <button
                onClick={() => setChannelFilter('dvc')}
                className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  channelFilter === 'dvc'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600'
                }`}
              >
                
                <span>Cổng DVC ({dvcCount})</span>
              </button>

              <button
                onClick={() => setChannelFilter('facebook')}
                className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  channelFilter === 'facebook'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600'
                }`}
              >
                
                <span>Facebook ({fbCount})</span>
              </button>

              <button
                onClick={() => setChannelFilter('hotline')}
                className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  channelFilter === 'hotline'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600'
                }`}
              >
                
                <span>Tổng đài 1022 ({hotlineCount})</span>
              </button>

              <button
                onClick={() => setChannelFilter('email')}
                className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  channelFilter === 'email'
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600'
                }`}
              >
                
                <span>Email & Portal ({emailCount})</span>
              </button>
            </div>

          </div>

          {/* Master Table of Messages */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
            
            <div className="p-3.5 border-b border-slate-200 dark:border-slate-700 bg-[#f8fafc] dark:bg-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-slate-900 dark:text-slate-100">Danh sách tin nhắn</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">({filteredTickets.length})</span>
              </div>
            </div>

            {filteredTickets.length === 0 ? (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Không tìm thấy yêu cầu nào phù hợp.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setChannelFilter('all');
                    setStatusFilter('all');
                    setUrgencyFilter('all');
                    setCategoryFilter('all');
                  }}
                  className="mt-3 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-[#a81c1c] hover:bg-red-50 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-600"
                >
                  Xóa bộ lọc tìm kiếm
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] text-slate-700 dark:text-slate-300">
                  <thead className="bg-[#f1f5f9] text-slate-700 dark:text-slate-300 uppercase text-[10px] font-black tracking-wider border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">Kênh & Thời gian</th>
                      <th className="py-2.5 px-3">Công dân / Tổ chức</th>
                      <th className="py-2.5 px-3">Nội dung tin nhắn & Yêu cầu</th>
                      <th className="py-2.5 px-3">Lĩnh vực & Chẩn đoán AI</th>
                      <th className="py-2.5 px-3">Độ khẩn</th>
                      <th className="py-2.5 px-3">Trạng thái</th>
                      <th className="py-2.5 px-3">Cán bộ phụ trách</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredTickets.map((ticket) => {
                      const badge = getChannelBadge(ticket.channel);
                      const isUrgent = ticket.urgency === 'urgent';
                      const isSelected = selectedTicket?.id === ticket.id;

                      return (
                        <tr
                          key={ticket.id}
                          onClick={() => handleSelectMessageToChat(ticket)}
                          className={`cursor-pointer transition-colors group hover:bg-red-50/40 ${
                            isSelected ? 'bg-red-50/70 font-medium' : ''
                          }`}
                        >
                          {/* Channel & Time */}
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="space-y-1">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-flex items-center gap-1 ${badge.color}`}>
                                
                                {badge.name}
                              </span>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                                
                                {ticket.createdAt}
                              </div>
                            </div>
                          </td>

                          {/* Citizen Profile */}
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900 dark:text-slate-100 text-xs group-hover:text-[#a81c1c] transition-colors">
                              {ticket.citizenName}
                            </div>
                            <div className="font-mono text-[11px] text-blue-700 font-semibold">
                              {ticket.phone}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                              #{ticket.id}
                            </div>
                          </td>

                          {/* Message Content */}
                          <td className="py-2.5 px-3 max-w-xs">
                            <p className="text-[11px] text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">
                              {ticket.lastMessage}
                            </p>
                            {ticket.aiAnalysis.summary && (
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 italic line-clamp-1">
                                🤖 Tóm tắt: {ticket.aiAnalysis.summary}
                              </div>
                            )}
                          </td>

                          {/* Category & AI Confidence */}
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="font-bold text-slate-800 dark:text-slate-200 text-[11px] flex items-center gap-1">
                              
                              {ticket.category}
                            </div>
                            <div className="text-[10px] text-emerald-700 font-bold mt-0.5 flex items-center gap-1">
                              
                              Khớp AI: {ticket.aiAnalysis.confidenceScore}%
                            </div>
                          </td>

                          {/* Urgency */}
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            {isUrgent ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-800 border border-red-300 inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
                                Khẩn cấp
                              </span>
                            ) : ticket.urgency === 'high' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                Ưu tiên cao
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                Tiêu chuẩn
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            {getStatusBadge(ticket.status)}
                          </td>

                          {/* Officer */}
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
                              {ticket.assignedOfficer}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>
      ) : (
        /* ========================================================================= */
        /* 2. CHAT & AI SPLIT VIEW (Sau khi click vào tin nhắn)                       */
        /* ========================================================================= */
        <div className="animate-in fade-in duration-150">
          
          {/* 3-Column Split Workstation: Left (Queue) + Middle (Chat Thread) + Right (AI Assistant) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            
            {/* COLUMN 1: LEFT MESSAGE QUEUE (3 Cols) */}
            <div className="lg:col-span-3 xl:col-span-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col h-full shadow-xs relative">
              
              <div className="p-3 border-b border-slate-200 dark:border-slate-700 space-y-2 bg-[#f8fafc] dark:bg-slate-900 sticky top-0 z-10 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setViewMode('dashboard')} className="px-1.5 py-1 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded" title="Quay lại">
                      
                    </button>
                    <span className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      
                      <span>Hàng đợi tin nhắn</span>
                    </span>
                  </div>
                  <span className="text-[10px] bg-red-100 text-[#a81c1c] px-2 py-0.5 rounded font-black">
                    {filteredTickets.length}
                  </span>
                </div>

                <div className="relative">
                  
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Lọc tên, SĐT, #REQ..."
                    className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 pl-8 pr-3 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-600 focus:border-[#a81c1c] focus:outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Scrollable Left Ticket List */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTickets.map((ticket) => {
                  const badge = getChannelBadge(ticket.channel);
                  const isSelected = selectedTicket?.id === ticket.id;
                  const isUrgent = ticket.urgency === 'urgent';

                  return (
                    <div
                      key={ticket.id}
                      onClick={() => onSelectTicket(ticket)}
                      className={`p-3 cursor-pointer transition-colors relative ${
                        isSelected
                          ? 'bg-red-50/80 border-l-4 border-[#a81c1c]'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border flex items-center gap-1 ${badge.color}`}>
                            
                            {badge.name}
                          </span>
                          {isUrgent && (
                            <span className="px-1 py-0.2 rounded text-[8px] font-black bg-red-100 text-red-800 border border-red-300 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-red-600 animate-ping"></span>
                              Khẩn
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono">{ticket.createdAt}</span>
                      </div>

                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate pr-1">
                          {ticket.citizenName}
                        </h4>
                        <span className="font-mono text-[9px] text-blue-700 shrink-0">#{ticket.id}</span>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1 leading-snug mb-1">
                        {ticket.lastMessage}
                      </p>

                      <div className="flex items-center justify-between text-[9px] text-slate-500 dark:text-slate-400">
                        <span className="truncate max-w-[120px] font-medium">{ticket.category}</span>
                        {getStatusBadge(ticket.status)}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* COLUMN 2: MIDDLE CONVERSATION THREAD (5 Cols) */}
            <div className="lg:col-span-5 xl:col-span-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col h-full shadow-xs relative">
              {selectedTicket ? (
                <>
                  {/* Active Chat Header */}
                  <div className="p-3.5 border-b border-slate-200 dark:border-slate-700 bg-[#f8fafc] dark:bg-slate-900 flex items-center justify-between sticky top-0 z-10 rounded-t-xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#a81c1c] to-red-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                        {selectedTicket.citizenName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">{selectedTicket.citizenName}</h3>
                          <span className="text-[10px] font-mono text-blue-700 font-bold">{selectedTicket.phone}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <span>Mã hồ sơ: <strong className="text-slate-800 dark:text-slate-200">{selectedTicket.id}</strong></span>
                          <span>•</span>
                          <span>Kênh: <strong className="text-slate-800 dark:text-slate-200">{selectedTicket.channelName}</strong></span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <span className="text-[10px] bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-semibold shadow-2xs">
                        Phụ trách: <strong className="text-slate-800 dark:text-slate-200">{selectedTicket.assignedOfficer}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Chat Thread Messages */}
                  <div className="p-4 space-y-3.5 bg-[#f8fafc] dark:bg-slate-900/50 text-xs flex-1">
                    {selectedTicket.conversation.map((msg) => {
                      const isCitizen = msg.sender === 'citizen';
                      const isBot = msg.sender === 'ai_bot';

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isCitizen ? 'items-start' : 'items-end'}`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              {msg.senderName || (isCitizen ? selectedTicket.citizenName : 'Cán bộ')}
                            </span>
                            <span>•</span>
                            <span>{msg.time}</span>
                            {isBot && <span className="px-1 bg-purple-100 text-purple-800 rounded text-[9px] font-bold">Auto Bot</span>}
                          </div>

                          <div
                            className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                              isCitizen
                                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-sm'
                                : isBot
                                ? 'bg-purple-50 text-purple-900 border border-purple-200 rounded-tr-sm'
                                : 'bg-[#004b91] text-white rounded-tr-sm'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Sticky Chat Form Container */}
                  <div className="sticky bottom-0 z-10 bg-white dark:bg-slate-800 rounded-b-xl shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] border-t border-slate-200 dark:border-slate-700">
                    {/* Quick Response Insert Bar */}
                    <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 flex items-center justify-between text-[11px] gap-2">
                      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
                        <span className="text-slate-500 dark:text-slate-400 shrink-0 font-bold text-[10px]">Mẫu nhanh:</span>
                        <button
                          onClick={() => setMessageInput('Kính gửi Quý công dân, chuyên viên đã tiếp nhận hồ sơ và đang kiểm tra trên hệ thống Cổng DVC. Kết quả sẽ được phản hồi trong ít phút.')}
                          className="shrink-0 px-2 py-0.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 text-[10px] font-medium transition-colors"
                        >
                          Đã nhận hồ sơ
                        </button>
                        <button
                          onClick={() => setMessageInput('Kính mời Quý công dân mang bản gốc Giấy chứng nhận và CCCD đến Quầy số 04 - Bộ phận Một cửa để hoàn tất đối chiếu.')}
                          className="shrink-0 px-2 py-0.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 text-[10px] font-medium transition-colors"
                        >
                          Hẹn đến quầy
                        </button>
                      </div>
                      <button
                        onClick={handleInsertAISuggestion}
                        className="shrink-0 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-[#a81c1c] rounded-lg border border-red-200 text-[10px] font-bold flex items-center gap-1 transition-colors"
                        title="Chèn toàn bộ câu trả lời do AI soạn thảo vào ô nhập"
                      >
                        
                        <span>Dùng gợi ý AI</span>
                      </button>
                    </div>

                    {/* Message Input & Dispatch Form */}
                    <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder={`Gửi phản hồi chính thức qua ${selectedTicket.channelName}...`}
                      className="flex-1 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-[#a81c1c] focus:bg-white dark:bg-slate-800 outline-none text-xs"
                    />
                    <button
                      type="submit"
                      disabled={!messageInput.trim()}
                      className="px-4 py-2 bg-[#a81c1c] hover:bg-[#8b0000] disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <span>Gửi tin</span>
                      
                    </button>
                  </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                  
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Chọn một tin nhắn từ danh sách bên trái để mở hội thoại.</p>
                </div>
              )}
            </div>

            {/* COLUMN 3: RIGHT AI ASSISTANT & LEGAL CITATIONS PANEL (4 Cols) */}
            <div className="lg:col-span-4 xl:col-span-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col h-full shadow-xs relative">
              {selectedTicket ? (
                <>
                  {/* Panel Header */}
                  <div className="p-3.5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-red-50 to-slate-50 flex items-center justify-between sticky top-0 z-10 rounded-t-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-red-100 border border-red-300 flex items-center justify-center text-[#a81c1c] text-xs">
                        
                      </div>
                      <div>
                        <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">Trợ Lý AI</h3>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-4 text-xs flex-1">
                    
                    {/* Summary & Intent */}
                    <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        
                        <span>Tóm tắt nhu cầu công dân</span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        {selectedTicket.aiAnalysis.summary}
                      </p>
                      <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2 text-[10px]">
                        <span className="text-slate-500 dark:text-slate-400 font-semibold">Mục đích:</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                          {selectedTicket.aiAnalysis.intent}
                        </span>
                      </div>
                    </div>

                    {/* AI Suggested Response Box */}
                    <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                          
                          <span>Đề xuất câu trả lời chuẩn hành chính</span>
                        </span>
                        <button
                          onClick={handleInsertAISuggestion}
                          className="text-[10px] text-[#a81c1c] hover:underline font-bold"
                        >
                          Dùng mẫu này
                        </button>
                      </div>
                      <div className="p-2.5 bg-white dark:bg-slate-800 border border-amber-200 rounded text-slate-800 dark:text-slate-200 text-xs leading-relaxed whitespace-pre-wrap font-medium">
                        {selectedTicket.aiAnalysis.suggestedReply}
                      </div>
                    </div>

                    {/* Official Legal Basis / Căn cứ pháp lý */}
                    <div className="bg-red-50/40 border border-red-200 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#a81c1c] flex items-center gap-1.5">
                          
                          <span>Căn cứ pháp lý & Văn bản áp dụng</span>
                        </span>
                        <button
                          onClick={handleCopyLegalCitation}
                          className="text-[10px] text-blue-700 hover:underline font-bold flex items-center gap-1"
                        >
                          
                          <span>{copiedToast ? 'Đã sao chép!' : 'Sao chép luật'}</span>
                        </button>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-800 border border-red-100 rounded text-slate-800 dark:text-slate-200 text-[11px] font-semibold flex items-center gap-2">
                        
                        <span>{selectedTicket.aiAnalysis.lawCitation}</span>
                      </div>
                    </div>

                    {/* Quick Cross-Module Action Shortcuts */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        
                        <span>Liên kết nghiệp vụ nhanh</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {onNavigateToFAQ && (
                          <button
                            onClick={() => onNavigateToFAQ(selectedTicket.category)}
                            className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center"
                          >
                            
                            <span>Tra CSDL Thủ Tục</span>
                          </button>
                        )}
                        {onCreateBroadcastFromTicket && (
                          <button
                            onClick={() => onCreateBroadcastFromTicket(selectedTicket)}
                            className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center"
                          >
                            
                            <span>Phát Sóng TTHC Này</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sticky Footer: Internal Case Note (Ghi chú ca trực) */}
                  <div className="sticky bottom-0 z-10 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 rounded-b-xl shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        
                        <span>Ghi chú nội bộ ca trực (Lưu vết xử lý)</span>
                      </label>
                      <textarea
                        value={internalNoteInput}
                        onChange={(e) => setInternalNoteInput(e.target.value)}
                        placeholder="Ghi lại tiến độ đối chiếu hoặc yêu cầu bổ sung giấy tờ..."
                        rows={2}
                        className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-[#a81c1c] focus:bg-white dark:bg-slate-800 text-xs outline-none"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={() => onUpdateInternalNote(selectedTicket.id, internalNoteInput)}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-[11px] font-bold transition-colors"
                        >
                          Lưu ghi chú
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                  
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Trợ lý AI sẽ tự động phân tích và trích dẫn luật khi bạn chọn một hồ sơ.</p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
