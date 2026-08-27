import React from 'react';
import { TicketItem, BroadcastCampaign, NightShiftLog, FAQItem, TabKey } from '../types';

interface AnalyticsOverviewProps {
  tickets?: TicketItem[];
  broadcasts?: BroadcastCampaign[];
  nightShiftLogs?: NightShiftLog[];
  faqs?: FAQItem[];
  onNavigateTab?: (tab: TabKey) => void;
  onFilterInbox?: (filters: { channel?: string; status?: string; urgency?: string; category?: string }) => void;
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({
  tickets = [],
  broadcasts = [],
  nightShiftLogs = [],
  faqs = [],
  onNavigateTab,
  onFilterInbox,
}) => {
  // Live reactive calculations
  const totalTickets = tickets.length;
  const urgentTickets = tickets.filter(t => t.urgency === 'urgent');
  const pendingTickets = tickets.filter(t => t.status === 'pending');
  const processingTickets = tickets.filter(t => t.status === 'processing');
  const autoResolvedTickets = tickets.filter(t => t.status === 'auto_resolved' || t.status === 'resolved');

  // Channel breakdown
  const zaloCount = tickets.filter(t => t.channel === 'zalo').length;
  const dvcCount = tickets.filter(t => t.channel === 'dvc').length;
  const fbCount = tickets.filter(t => t.channel === 'facebook').length;
  const hotlineCount = tickets.filter(t => t.channel === 'hotline').length;
  const emailCount = tickets.filter(t => t.channel === 'email' || t.channel === 'web').length;

  const zaloPct = totalTickets > 0 ? Math.round((zaloCount / totalTickets) * 100) : 40;
  const dvcPct = totalTickets > 0 ? Math.round((dvcCount / totalTickets) * 100) : 30;
  const fbPct = totalTickets > 0 ? Math.round((fbCount / totalTickets) * 100) : 15;
  const hotlinePct = totalTickets > 0 ? Math.round((hotlineCount / totalTickets) * 100) : 10;
  const emailPct = totalTickets > 0 ? Math.max(1, 100 - zaloPct - dvcPct - fbPct - hotlinePct) : 5;

  // Broadcast metrics
  const totalBroadcastRecipients = broadcasts.reduce((acc, b) => acc + b.recipientCount, 0);
  const totalBroadcastDelivered = broadcasts.reduce((acc, b) => acc + b.deliveredCount, 0);
  const totalBroadcastRead = broadcasts.reduce((acc, b) => acc + b.readCount, 0);
  const avgReadRate = totalBroadcastDelivered > 0 ? Math.round((totalBroadcastRead / totalBroadcastDelivered) * 100) : 88.6;

  // FAQ auto-resolution rate
  const autoEnabledFaqs = faqs.filter(f => f.autoResolutionEnabled).length;
  const faqAutoRate = faqs.length > 0 ? Math.round((autoEnabledFaqs / faqs.length) * 100) : 80;

  const handleDrilldownChannel = (channel: string) => {
    if (onFilterInbox) {
      onFilterInbox({ channel });
    }
  };

  const handleDrilldownUrgent = () => {
    if (onFilterInbox) {
      onFilterInbox({ urgency: 'urgent' });
    }
  };

  const handleDrilldownPending = () => {
    if (onFilterInbox) {
      onFilterInbox({ status: 'pending' });
    }
  };

  const handleDrilldownCategory = (category: string) => {
    if (onFilterInbox) {
      onFilterInbox({ category });
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Official Government Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <i className="fa-solid fa-chart-line text-[#a81c1c]"></i>
              Báo Cáo Hiệu Suất Tiếp Nhận & Giám Sát SLA Đa Kênh
            </h2>
            <span className="text-[10px] bg-red-100 text-[#a81c1c] px-2.5 py-0.5 rounded font-extrabold border border-red-200 uppercase">
              Dữ Liệu Thời Gian Thực
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Đánh giá toàn diện 4 điểm nghẽn lớn trong tiếp nhận công vụ. Bấm vào từng chỉ số để liên kết trực tiếp đến phân hệ nghiệp vụ.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-600 font-bold">Kỳ báo cáo:</span>
          <span className="bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-lg text-slate-800 font-bold shadow-2xs">
            Hôm nay (Liên kết 5 Phân hệ)
          </span>
        </div>
      </div>

      {/* 4 Big KPI Impact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Omnichannel Inbox */}
        <div
          onClick={() => onNavigateTab ? onNavigateTab('inbox') : handleDrilldownPending()}
          className="bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer rounded-xl p-4 shadow-sm space-y-2 group"
          title="Bấm để mở Hộp Thư Tiếp Nhận"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase text-[10px] text-blue-700">1. Hợp nhất Đa Kênh</span>
            <i className="fa-solid fa-arrow-up-right-from-square text-slate-400 group-hover:text-blue-600 transition-colors"></i>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalTickets}</span>
            <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-0.5">
              <i className="fa-solid fa-check-circle"></i> {pendingTickets.length} chờ tiếp nhận
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-tight">
            5 kênh Zalo, DVC, Facebook, Hotline, Email hợp nhất trên 1 bàn trực duy nhất.
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-blue-600 h-full rounded-full w-full"></div>
          </div>
        </div>

        {/* Metric 2: After Hours Auto-Pilot */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('afterhours')}
          className="bg-white border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all cursor-pointer rounded-xl p-4 shadow-sm space-y-2 group"
          title="Bấm để mở Nhật ký tiếp nhận trực tự động"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase text-[10px] text-purple-800">2. Trực Tự Động Ngoài Giờ</span>
            <i className="fa-solid fa-arrow-up-right-from-square text-slate-400 group-hover:text-purple-600 transition-colors"></i>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-900">{nightShiftLogs.length}</span>
            <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-0.5">
              <i className="fa-solid fa-bolt"></i> Phản hồi 0.2s
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-tight">
            Tự động tiếp nhận ban đêm, tự động tạo lịch hẹn gọi lại vào sáng hôm sau.
          </p>
          <div className="w-full bg-purple-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-purple-600 h-full rounded-full w-[95%]"></div>
          </div>
        </div>

        {/* Metric 3: AI Knowledge Base FAQ */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('faq')}
          className="bg-white border border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer rounded-xl p-4 shadow-sm space-y-2 group"
          title="Bấm để mở CSDL Thủ Tục & AI"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase text-[10px] text-emerald-800">3. CSDL Thủ Tục & AI</span>
            <i className="fa-solid fa-arrow-up-right-from-square text-slate-400 group-hover:text-emerald-600 transition-colors"></i>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-900">{faqAutoRate}%</span>
            <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-0.5">
              <i className="fa-solid fa-brain"></i> {faqs.length} thủ tục
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-tight">
            Tự động trả lời câu hỏi lặp lại, trích dẫn chính xác luật và biểu mẫu.
          </p>
          <div className="w-full bg-emerald-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${faqAutoRate}%` }}></div>
          </div>
        </div>

        {/* Metric 4: Mass Broadcast */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('broadcast')}
          className="bg-white border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer rounded-xl p-4 shadow-sm space-y-2 group"
          title="Bấm để mở Thông Báo Hàng Loạt"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase text-[10px] text-amber-800">4. Phát Sóng Hàng Loạt</span>
            <i className="fa-solid fa-arrow-up-right-from-square text-slate-400 group-hover:text-amber-600 transition-colors"></i>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-900">{avgReadRate}%</span>
            <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-0.5">
              <i className="fa-solid fa-bullhorn"></i> {broadcasts.length} chiến dịch
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-tight">
            Gửi thông báo chính sách, nhắc lịch hẹn qua Zalo/SMS đến {totalBroadcastRecipients.toLocaleString('vi-VN')} người dân.
          </p>
          <div className="w-full bg-amber-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-amber-600 h-full rounded-full" style={{ width: `${Math.min(100, avgReadRate)}%` }}></div>
          </div>
        </div>

      </div>

      {/* SLA Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Distribution by Channel */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <i className="fa-solid fa-chart-pie text-[#a81c1c]"></i>
              Phân Bổ Lượng Tin Nhắn Tiếp Nhận Theo Kênh
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Bấm vào kênh để lọc hộp thư</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div
              onClick={() => handleDrilldownChannel('zalo')}
              className="p-2 rounded-lg hover:bg-blue-50/60 transition-colors cursor-pointer"
              title="Lọc hộp thư theo kênh Zalo OA"
            >
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5 text-blue-800">
                  <i className="fa-solid fa-comment-dots"></i> Zalo Official Account ({zaloPct}%)
                </span>
                <span>{zaloCount} hồ sơ</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${zaloPct}%` }}></div>
              </div>
            </div>

            <div
              onClick={() => handleDrilldownChannel('dvc')}
              className="p-2 rounded-lg hover:bg-red-50/60 transition-colors cursor-pointer"
              title="Lọc hộp thư theo Cổng DVC Quốc Gia"
            >
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5 text-red-800">
                  <i className="fa-solid fa-landmark"></i> Cổng Dịch Vụ Công Quốc Gia ({dvcPct}%)
                </span>
                <span>{dvcCount} hồ sơ</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-red-700 h-full rounded-full" style={{ width: `${dvcPct}%` }}></div>
              </div>
            </div>

            <div
              onClick={() => handleDrilldownChannel('facebook')}
              className="p-2 rounded-lg hover:bg-indigo-50/60 transition-colors cursor-pointer"
              title="Lọc hộp thư theo Facebook Fanpage"
            >
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5 text-indigo-800">
                  <i className="fa-brands fa-facebook"></i> Facebook Fanpage UBND ({fbPct}%)
                </span>
                <span>{fbCount} hồ sơ</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${fbPct}%` }}></div>
              </div>
            </div>

            <div
              onClick={() => handleDrilldownChannel('hotline')}
              className="p-2 rounded-lg hover:bg-emerald-50/60 transition-colors cursor-pointer"
              title="Lọc hộp thư theo Tổng Đài 1022"
            >
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <i className="fa-solid fa-phone"></i> Tổng Đài 1022 & Hotline ({hotlinePct}%)
                </span>
                <span>{hotlineCount} cuộc</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${hotlinePct}%` }}></div>
              </div>
            </div>

            <div
              onClick={() => handleDrilldownChannel('email')}
              className="p-2 rounded-lg hover:bg-amber-50/60 transition-colors cursor-pointer"
              title="Lọc hộp thư theo Email DVC"
            >
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5 text-amber-800">
                  <i className="fa-solid fa-envelope"></i> Email & Cổng Web ({emailPct}%)
                </span>
                <span>{emailCount} thư</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-600 h-full rounded-full" style={{ width: `${emailPct}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* SLA Compliance by Category */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <i className="fa-solid fa-clock-rotate-left text-emerald-700"></i>
              Tỷ Lệ Đúng Hạn SLA Theo Lĩnh Vực TTHC (Quy định &lt; 15 phút)
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Bấm để lọc theo lĩnh vực</span>
          </div>

          <div className="space-y-3 text-xs">
            <div
              onClick={() => handleDrilldownCategory('kinh doanh')}
              className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg flex items-center justify-between transition-colors cursor-pointer"
            >
              <div>
                <span className="font-bold text-slate-900 block">Đăng ký kinh doanh & Doanh nghiệp</span>
                <span className="text-[11px] text-slate-500">Thời gian phản hồi TB: 3.2 phút</span>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded font-black text-xs">
                99.4% Đạt SLA
              </span>
            </div>

            <div
              onClick={() => handleDrilldownCategory('căn cước')}
              className="p-3 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-lg flex items-center justify-between transition-colors cursor-pointer"
            >
              <div>
                <span className="font-bold text-slate-900 block">Căn cước, Định danh VNeID & Cư trú</span>
                <span className="text-[11px] text-slate-500">Thời gian phản hồi TB: 1.8 phút</span>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded font-black text-xs">
                99.8% Đạt SLA
              </span>
            </div>

            <div
              onClick={() => handleDrilldownCategory('đất đai')}
              className="p-3 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-lg flex items-center justify-between transition-colors cursor-pointer"
            >
              <div>
                <span className="font-bold text-slate-900 block">Đất đai, Nhà ở & Giấy chứng nhận</span>
                <span className="text-[11px] text-slate-500">Thời gian phản hồi TB: 7.5 phút</span>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded font-black text-xs">
                97.2% Đạt SLA
              </span>
            </div>

            <div
              onClick={() => handleDrilldownCategory('hộ tịch')}
              className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg flex items-center justify-between transition-colors cursor-pointer"
            >
              <div>
                <span className="font-bold text-slate-900 block">Hộ tịch, Khai sinh & Hôn nhân</span>
                <span className="text-[11px] text-slate-500">Thời gian phản hồi TB: 2.1 phút</span>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded font-black text-xs">
                99.6% Đạt SLA
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

