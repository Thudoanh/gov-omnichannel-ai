import React, { useState, useEffect } from 'react';
import { BroadcastCampaign, BroadcastReply, ChannelType, TabKey } from '../types';

interface MassBroadcastCenterProps {
  campaigns: BroadcastCampaign[];
  replies: BroadcastReply[];
  onCreateCampaign: (campaign: Omit<BroadcastCampaign, 'id' | 'deliveredCount' | 'readCount' | 'responseCount' | 'failedCount' | 'createdAt'>) => void;
  onRouteReplyToInbox: (replyId: string) => void;
  onOpenTicketInInbox?: (ticketIdOrPhone: string) => void;
  onNavigateTab?: (tab: TabKey) => void;
  prefilledDraft?: {
    title?: string;
    category?: string;
    content?: string;
  } | null;
}

export const MassBroadcastCenter: React.FC<MassBroadcastCenterProps> = ({
  campaigns,
  replies,
  onCreateCampaign,
  onRouteReplyToInbox,
  onOpenTicketInInbox,
  onNavigateTab,
  prefilledDraft,
}) => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'replies'>('campaigns');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  
  // New Campaign Form State
  const [campaignTitle, setCampaignTitle] = useState<string>('');
  const [campaignCategory, setCampaignCategory] = useState<string>('Chính sách & Pháp luật');
  const [targetGroup, setTargetGroup] = useState<string>('Tất cả cá nhân & tổ chức có hồ sơ đang xử lý trong tháng');
  const [recipientCount, setRecipientCount] = useState<number>(1250);
  const [selectedChannels, setSelectedChannels] = useState<ChannelType[]>(['zalo', 'dvc', 'sms']);
  const [campaignContent, setCampaignContent] = useState<string>('UBND Quận thông báo: Lịch tiếp nhận và trả kết quả thủ tục Đất đai & ĐKKD trong tuần lễ Chuyển đổi số sẽ được ưu tiên tiếp nhận trực tuyến 100% qua Cổng DVC với thời gian rút ngắn 01 ngày.');

  useEffect(() => {
    if (prefilledDraft) {
      if (prefilledDraft.title) setCampaignTitle(prefilledDraft.title);
      if (prefilledDraft.category) setCampaignCategory(prefilledDraft.category);
      if (prefilledDraft.content) setCampaignContent(prefilledDraft.content);
      setShowCreateModal(true);
    }
  }, [prefilledDraft]);

  const toggleChannel = (channel: ChannelType) => {
    if (selectedChannels.includes(channel)) {
      if (selectedChannels.length > 1) {
        setSelectedChannels(selectedChannels.filter(c => c !== channel));
      }
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignTitle.trim() || !campaignContent.trim()) return;

    onCreateCampaign({
      title: campaignTitle.trim(),
      category: campaignCategory,
      targetGroup: targetGroup.trim(),
      recipientCount: Number(recipientCount) || 100,
      channels: selectedChannels,
      scheduledAt: 'Gửi ngay lập tức',
      status: 'completed',
      contentSnippet: campaignContent.trim(),
      senderOfficer: 'Lê Minh Tâm'
    });

    setShowCreateModal(false);
    setCampaignTitle('');
    setCampaignContent('');
  };

  const getChannelBadge = (ch: ChannelType) => {
    switch (ch) {
      case 'zalo':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Zalo OA</span>;
      case 'dvc':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">Cổng DVC</span>;
      case 'facebook':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Facebook</span>;
      case 'sms':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">SMS Brandname</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">{ch}</span>;
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Official Government Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 text-2xl shrink-0 shadow-inner">
            <i className="fa-solid fa-bullhorn"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Phát Sóng & Thông Báo Hàng Loạt Đến Công Dân</h2>
              <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded font-extrabold uppercase">
                Zalo OA / SMS / DVC
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Giải quyết tình trạng tin nhắn thông báo chính sách, lịch cắt điện nước, nhắc hẹn thủ tục bị phân tán hoặc tỉ lệ người dân đọc thấp.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-[#a81c1c] hover:bg-[#8b0000] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
        >
          <i className="fa-solid fa-paper-plane text-xs"></i>
          <span>Tạo Bản Tin Phát Sóng Mới</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'campaigns'
              ? 'bg-[#a81c1c] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
          }`}
        >
          <i className="fa-solid fa-tower-broadcast text-xs"></i>
          <span>Chiến Dịch Đã Phát Sóng ({campaigns.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('replies')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'replies'
              ? 'bg-[#a81c1c] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
          }`}
        >
          <i className="fa-solid fa-reply-all text-xs"></i>
          <span>Phản Hồi Trực Tiếp Của Người Dân ({replies.length})</span>
        </button>
      </div>

      {/* TAB 1: CAMPAIGNS LIST */}
      {activeTab === 'campaigns' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-3.5 border-b border-slate-200 bg-[#f8fafc] flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Danh Sách Bản Tin Phát Sóng Đa Kênh</h3>
            <span className="text-xs text-slate-500 font-semibold">Tỷ lệ mở đọc trung bình: 89.2%</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#f1f5f9] text-slate-700 uppercase text-[10px] font-black tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Mã & Tiêu đề bản tin</th>
                  <th className="py-3 px-4">Đối tượng nhận</th>
                  <th className="py-3 px-4">Kênh phát</th>
                  <th className="py-3 px-4">Số lượng</th>
                  <th className="py-3 px-4">Đã đọc</th>
                  <th className="py-3 px-4">Phản hồi</th>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {campaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono text-[10px] text-blue-700 font-bold">{camp.id}</div>
                      <div className="font-bold text-slate-900 text-xs">{camp.title}</div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{camp.contentSnippet}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs">
                      <span className="line-clamp-2">{camp.targetGroup}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {camp.channels.map((ch, idx) => (
                          <React.Fragment key={idx}>{getChannelBadge(ch)}</React.Fragment>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {camp.recipientCount.toLocaleString('vi-VN')} người
                    </td>
                    <td className="py-3 px-4 text-emerald-700 font-bold whitespace-nowrap">
                      {camp.readCount.toLocaleString('vi-VN')} (88%)
                    </td>
                    <td className="py-3 px-4 text-blue-700 font-bold whitespace-nowrap">
                      {camp.responseCount} ý kiến
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {camp.createdAt}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded text-[10px] font-bold">
                        Đã phát sóng
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CITIZEN REPLIES */}
      {activeTab === 'replies' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-3.5 border-b border-slate-200 bg-[#f8fafc] flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Phản Hồi & Thắc Mắc Sau Khi Nhận Bản Tin</h3>
            <span className="text-xs text-slate-500 font-semibold">Tự động đẩy về Hộp Thư Đa Kênh để chuyên viên hỗ trợ 1:1</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#f1f5f9] text-slate-700 uppercase text-[10px] font-black tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Công dân</th>
                  <th className="py-3 px-4">Bản tin gốc</th>
                  <th className="py-3 px-4">Nội dung công dân phản hồi</th>
                  <th className="py-3 px-4">Kênh</th>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Xử lý</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {replies.map((reply) => {
                  const isRouted = reply.status === 'routed_to_inbox';

                  return (
                    <tr key={reply.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{reply.citizenName}</div>
                        <div className="font-mono text-[11px] text-blue-700">{reply.phone}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {reply.campaignTitle}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="text-slate-900 font-semibold">{reply.replyText}</p>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getChannelBadge(reply.channel)}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {reply.receivedAt}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isRouted ? (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-300 rounded text-[10px] font-bold">
                            Đã chuyển Hộp Thư
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-300 rounded text-[10px] font-bold">
                            Chờ phân luồng
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {!isRouted ? (
                          <button
                            onClick={() => onRouteReplyToInbox(reply.id)}
                            className="px-3 py-1.5 bg-[#a81c1c] hover:bg-[#8b0000] text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <i className="fa-solid fa-inbox text-[10px]"></i>
                            <span>Chuyển Thành Hồ Sơ Hộp Thư</span>
                          </button>
                        ) : (
                          onOpenTicketInInbox && (
                            <button
                              onClick={() => onOpenTicketInInbox(reply.phone)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-blue-800 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                              <span>Mở trong Hộp Thư</span>
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE CAMPAIGN MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-bullhorn text-[#a81c1c]"></i>
                Tạo Bản Tin Phát Sóng Đa Kênh Mới
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 text-base"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tiêu đề thông báo / Công văn:</label>
                <input
                  type="text"
                  required
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  placeholder="VD: Thông báo lịch tiếp nhận thủ tục cấp đổi CCCD..."
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-lg border border-slate-300 focus:border-[#a81c1c] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Chủ đề:</label>
                  <select
                    value={campaignCategory}
                    onChange={(e) => setCampaignCategory(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 p-2 rounded-lg border border-slate-300 outline-none"
                  >
                    <option value="Chính sách & Pháp luật">Chính sách & Pháp luật</option>
                    <option value="Nhắc hạn nộp hồ sơ">Nhắc hạn nộp hồ sơ</option>
                    <option value="Thông báo lịch tiếp nhận">Thông báo lịch tiếp nhận</option>
                    <option value="Cảnh báo khẩn cấp">Cảnh báo khẩn cấp</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số lượng người dân dự kiến:</label>
                  <input
                    type="number"
                    value={recipientCount}
                    onChange={(e) => setRecipientCount(Number(e.target.value))}
                    className="w-full bg-slate-50 text-slate-900 p-2 rounded-lg border border-slate-300 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Đối tượng người nhận:</label>
                <input
                  type="text"
                  value={targetGroup}
                  onChange={(e) => setTargetGroup(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 p-2 rounded-lg border border-slate-300 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kênh phát sóng tích hợp:</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(['zalo', 'dvc', 'sms', 'facebook'] as ChannelType[]).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => toggleChannel(ch)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        selectedChannels.includes(ch)
                          ? 'bg-[#a81c1c] text-white border-[#a81c1c] shadow-xs'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {ch.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nội dung thông điệp phát sóng:</label>
                <textarea
                  rows={4}
                  required
                  value={campaignContent}
                  onChange={(e) => setCampaignContent(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-lg border border-slate-300 focus:border-[#a81c1c] outline-none"
                  placeholder="Nhập nội dung thông điệp gửi đến người dân..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#a81c1c] hover:bg-[#8b0000] text-white rounded-lg font-bold shadow-xs"
                >
                  Phát sóng ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
