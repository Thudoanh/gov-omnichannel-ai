import React, { useState } from 'react';
import { AfterHoursRule, NightShiftLog, ChannelType, TabKey } from '../types';

interface AfterHoursAutoPilotProps {
  isAfterHoursMode: boolean;
  onToggleAfterHoursMode: () => void;
  rules: AfterHoursRule[];
  onToggleRule: (ruleId: string) => void;
  nightShiftLogs: NightShiftLog[];
  onResolveNightLog: (logId: string) => void;
  onSimulateNightShift?: (data: { channel: ChannelType; question: string; citizenName?: string; phone?: string }) => { ticketCode: string; botAnswer: string; callbackTime: string };
  onOpenTicketInInbox?: (ticketCode: string) => void;
  onNavigateTab?: (tab: TabKey) => void;
}

export const AfterHoursAutoPilot: React.FC<AfterHoursAutoPilotProps> = ({
  isAfterHoursMode,
  onToggleAfterHoursMode,
  rules,
  onToggleRule,
  nightShiftLogs,
  onResolveNightLog,
  onSimulateNightShift,
  onOpenTicketInInbox,
  onNavigateTab,
}) => {
  const [simQuestion, setSimQuestion] = useState<string>('Tôi bị mất giấy phép lái xe và CCCD thì làm lại vào thứ 7 được không?');
  const [simCitizenName, setSimCitizenName] = useState<string>('Nguyễn Hữu Trí');
  const [simPhone, setSimPhone] = useState<string>('0918889999');
  const [simChannel, setSimChannel] = useState<ChannelType>('zalo');
  const [simResult, setSimResult] = useState<{
    botAnswer: string;
    ticketCode: string;
    callbackTime: string;
  } | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const handleRunSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simQuestion.trim()) return;

    setIsSimulating(true);
    setTimeout(() => {
      if (onSimulateNightShift) {
        const result = onSimulateNightShift({
          channel: simChannel,
          question: simQuestion.trim(),
          citizenName: simCitizenName.trim() || 'Công dân trực tuyến',
          phone: simPhone.trim() || '0918889999'
        });
        setSimResult(result);
      } else {
        setSimResult({
          botAnswer: `[AI TRỰC 24/7 PHẢN HỒI TỨC THÌ] Chào Quý công dân! Hiện tại ngoài giờ tiếp nhận trực tiếp của cơ quan (sau 17h00). Về câu hỏi của bạn:
1. Thẻ Căn cước: Thứ Bảy Công an quận có tổ chức ca trực cấp căn cước từ 07h30 đến 11h30.
2. GPLX: Quý công dân có thể nộp đổi lại trực tuyến 100% qua Cổng DVC Quốc gia (vpcp.dichvucong.gov.vn).
Hệ thống đã tự động lưu thông tin và tạo lịch hẹn cho Cán bộ Quản lý liên hệ lại vào 08h30 sáng ngày làm việc tiếp theo.`,
          ticketCode: `NIGHT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          callbackTime: '08:30 Sáng mai'
        });
      }
      setIsSimulating(false);
    }, 500);
  };

  return (
    <div className="space-y-4">
      
      {/* Official Government Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 text-2xl shrink-0 shadow-inner">
            
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Nhật Ký Tiếp Nhận Trực Tự Động & Trực Ngoài Giờ 24/7</h2>
              <span className="text-[10px] bg-purple-100 text-purple-800 border border-purple-300 px-2.5 py-0.5 rounded font-extrabold uppercase">
                AI Auto-Pilot
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Giải quyết hoàn toàn vấn đề công dân nhắn tin ban đêm hoặc ngày nghỉ không có người trả lời. Tự động phản hồi tức thì 100% và tạo lịch hẹn gọi lại.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('faq')}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              title="Xem CSDL Thủ tục mà AI sử dụng để trả lời"
            >
              
              <span>Xem CSDL Tri Thức AI</span>
            </button>
          )}

          {/* Master Switch with Icon-Only Human & Bot */}
          <div
            onClick={onToggleAfterHoursMode}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggleAfterHoursMode(); }}
            className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-300 cursor-pointer select-none shadow-inner hover:border-slate-400 transition-colors"
            title={
              isAfterHoursMode
                ? 'Đang bật: Bot AI 24/7 (Bấm để chuyển sang Ca Cán bộ)'
                : 'Đang bật: Ca cán bộ hành chính (Bấm để chuyển sang Bot AI)'
            }
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all duration-200 ${
                !isAfterHoursMode
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              
            </div>

            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all duration-200 ${
                isAfterHoursMode
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns (Rules & Live Simulator) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT: Rules Configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                
                <h3 className="font-bold text-sm text-slate-900">Kịch Bản Tự Động Phản Hồi Khi Ngoài Giờ Tiếp Nhận</h3>
              </div>
              <span className="text-xs text-slate-500 font-semibold">{rules.filter(r => r.isActive).length}/{rules.length} Kịch bản kích hoạt</span>
            </div>

            <div className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    rule.isActive
                      ? 'bg-purple-50/40 border-purple-200 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{rule.title}</span>
                        <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.2 rounded font-mono text-slate-600">
                          {rule.activeTimeWindow}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {rule.autoReplyTemplate}
                      </p>
                    </div>

                    {/* Switch */}
                    <button
                      onClick={() => onToggleRule(rule.id)}
                      className={`w-11 h-6 rounded-full p-1 transition-colors flex items-center shrink-0 ${
                        rule.isActive ? 'bg-purple-700 justify-end' : 'bg-slate-300 justify-start'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-white shadow-md"></span>
                    </button>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between text-[10px] text-slate-500 gap-2">
                    <div className="flex items-center gap-1.5">
                      
                      <span>Lên lịch gọi lại: <strong>{rule.createCallbackTicket ? 'Có (Tự động)' : 'Không'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">AI Hỗ trợ:</span>
                      <span className="text-emerald-700 font-bold">{rule.aiBotEnabled ? 'BẬT' : 'TẮT'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* RIGHT: Live Interactive Night Shift Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              
              <h3 className="font-bold text-sm text-slate-900">Mô Phỏng Tiếp Nhận Tức Thì 24/7</h3>
            </div>

            <p className="text-xs text-slate-600">
              Kiểm tra khả năng AI tự động trả lời đúng luật và tạo lịch hẹn khi công dân nhắn tin vào lúc 22h00 đêm hoặc Chủ Nhật.
            </p>

            <form onSubmit={handleRunSimulation} className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Tên công dân:
                  </label>
                  <input
                    type="text"
                    value={simCitizenName}
                    onChange={(e) => setSimCitizenName(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-300 outline-none"
                    placeholder="Tên công dân..."
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Số điện thoại:
                  </label>
                  <input
                    type="text"
                    value={simPhone}
                    onChange={(e) => setSimPhone(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-300 outline-none font-mono"
                    placeholder="Số điện thoại..."
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Kênh gửi tin mô phỏng:
                </label>
                <select
                  value={simChannel}
                  onChange={(e) => setSimChannel(e.target.value as ChannelType)}
                  className="w-full bg-slate-50 text-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-300 outline-none font-semibold"
                >
                  <option value="zalo">Zalo Official Account</option>
                  <option value="facebook">Facebook Fanpage UBND</option>
                  <option value="dvc">Cổng Dịch Vụ Công Quốc Gia</option>
                  <option value="hotline">Tổng đài 1022 tiếp nhận ngoài giờ</option>
                  <option value="email">Email Tiếp nhận DVC</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Câu hỏi của công dân (Đêm khuya):
                </label>
                <textarea
                  value={simQuestion}
                  onChange={(e) => setSimQuestion(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 text-slate-900 text-xs p-3 rounded-lg border border-slate-300 focus:border-purple-600 focus:bg-white outline-none"
                  placeholder="Nhập câu hỏi công dân gửi lúc 23h00..."
                />
              </div>

              <button
                type="submit"
                disabled={isSimulating}
                className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSimulating ? (
                  <>
                    
                    <span>AI đang phân tích & lên lịch hẹn...</span>
                  </>
                ) : (
                  <>
                    
                    <span>Chạy Thử Nghiệm Tiếp Nhận & Tạo Hồ Sơ</span>
                  </>
                )}
              </button>
            </form>

            {/* Simulation Output Card */}
            {simResult && (
              <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-2.5 text-xs animate-fadeIn">
                <div className="flex items-center justify-between text-purple-900 font-bold text-[11px]">
                  <span className="flex items-center gap-1.5 text-emerald-800">
                    
                    Đã lưu vào Hộp Thư (0.2s)
                  </span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-purple-200 text-purple-900 font-bold">
                    {simResult.ticketCode}
                  </span>
                </div>
                <div className="p-2.5 bg-white border border-purple-100 rounded text-slate-800 leading-relaxed whitespace-pre-wrap font-medium text-[11px]">
                  {simResult.botAnswer}
                </div>
                <div className="text-[11px] text-purple-900 font-bold flex items-center justify-between">
                  <span>Lịch hẹn gọi lại:</span>
                  <span className="text-emerald-700 font-extrabold">{simResult.callbackTime}</span>
                </div>

                {onOpenTicketInInbox && (
                  <button
                    onClick={() => onOpenTicketInInbox(simResult.ticketCode)}
                    className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    
                    <span>Xem Hồ Sơ Này Trong Hộp Thư Tiếp Nhận</span>
                  </button>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* BOTTOM: Night Shift Logs Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-3.5 border-b border-slate-200 bg-[#f8fafc] flex items-center justify-between">
          <div className="flex items-center gap-2">
            
            <h3 className="font-bold text-sm text-slate-900">Nhật Ký Tiếp Nhận Ban Đêm & Lịch Hẹn Liên Hệ Lại</h3>
          </div>
          <span className="text-xs text-slate-500 font-semibold">{nightShiftLogs.length} yêu cầu được AI tự động tiếp nhận đêm qua</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#f1f5f9] text-slate-700 uppercase text-[10px] font-black tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Thời gian nhận</th>
                <th className="py-3 px-4">Công dân</th>
                <th className="py-3 px-4">Mã hồ sơ</th>
                <th className="py-3 px-4">Kênh</th>
                <th className="py-3 px-4">Nội dung câu hỏi ban đêm</th>
                <th className="py-3 px-4">Lịch hẹn gọi lại</th>
                <th className="py-3 px-4">Trạng thái xử lý</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {nightShiftLogs.map((log) => {
                const isPending = log.status === 'pending_morning';

                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {log.receivedAt}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{log.citizenName}</div>
                      <div className="text-[11px] font-mono text-blue-700">{log.phone}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono text-[11px] font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {log.ticketCode}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-bold text-[10px] border border-slate-200">
                        {log.channel.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-slate-800 line-clamp-2">{log.questionSnippet}</p>
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-700 whitespace-nowrap">
                      
                      {log.callbackTimeTarget}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {isPending ? (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-300 rounded text-[10px] font-bold inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          Chờ cán bộ gọi lại
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded text-[10px] font-bold inline-flex items-center gap-1">
                          
                          Đã liên hệ hỗ trợ
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {onOpenTicketInInbox && (
                          <button
                            onClick={() => onOpenTicketInInbox(log.ticketCode)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[11px] font-bold transition-colors cursor-pointer"
                            title="Xem hồ sơ trong Hộp Thư"
                          >
                            
                            Hộp Thư
                          </button>
                        )}
                        {isPending ? (
                          <button
                            onClick={() => onResolveNightLog(log.id)}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Gọi lại xong
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Hoàn tất</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

