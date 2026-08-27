import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
  citations?: string[];
  suggestedAction?: string;
}

export const AIFloatingChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'bot-welcome',
      sender: 'bot',
      text: 'Xin kính chào! Tôi là Trợ Lý Ảo GOVTECH. Tôi có thể hỗ trợ Cán bộ và Công dân tra cứu quy trình TTHC, biểu mẫu, căn cứ pháp lý và tính lệ phí trực tuyến 24/7.',
      time: 'Vừa xong',
      citations: ['Cơ sở dữ liệu TTHC Quốc gia', 'Quyết định 06/QĐ-TTg']
    }
  ]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatModalRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Thủ tục cấp đổi Căn cước mới 2026',
    'Quy trình sang tên sổ đỏ & thuế TNCN',
    'Thời hạn cấp giấy phép kinh doanh hộ cá thể',
    'Liên thông Khai sinh - Thường trú - BHYT'
  ];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Handle ESC key and Click Outside to close chatbot
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        chatModalRef.current &&
        !chatModalRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let botReply = '';
      let citations: string[] = [];

      const lower = text.toLowerCase();
      if (lower.includes('căn cước') || lower.includes('cccd')) {
        botReply = `Theo Luật Căn cước số 26/2023/QH15 và hướng dẫn của Bộ Công an:
1. Thành phần hồ sơ: Không cần mang theo sổ hộ khẩu/giấy xác nhận cư trú; cơ quan Công an sẽ tra cứu trực tiếp trên Cơ sở dữ liệu quốc gia về dân cư.
2. Nơi tiếp nhận: Bộ phận Một cửa Công an cấp huyện hoặc Phòng Cảnh sát QLHC về TTXH Công an cấp tỉnh.
3. Thời hạn giải quyết: Tối đa 07 ngày làm việc kể từ ngày nhận đủ hồ sơ hợp lệ.
4. Lệ phí cấp đổi: Miễn phí cho công dân đủ 14 tuổi, 25 tuổi, 40 tuổi và 60 tuổi.`;
        citations = ['Luật Căn cước 2023', 'Thông tư 17/2024/TT-BCA'];
      } else if (lower.includes('đất') || lower.includes('sổ đỏ') || lower.includes('tách thửa')) {
        botReply = `Căn cứ Luật Đất đai 2024 và Nghị định 101/2024/NĐ-CP:
1. Hồ sơ sang tên/chuyển nhượng gồm: Hợp đồng chuyển nhượng công chứng/chứng thực, bản gốc Giấy chứng nhận QSDĐ, tờ khai thuế TNCN và lệ phí trước bạ.
2. Thời hạn xử lý: Không quá 10 ngày làm việc.
3. Thuế & Lệ phí: Thuế TNCN 2% trên giá chuyển nhượng; Lệ phí trước bạ 0.5%. Có thể nộp thuế điện tử qua Cổng DVC Quốc gia.`;
        citations = ['Luật Đất đai 2024', 'Nghị định 101/2024/NĐ-CP'];
      } else if (lower.includes('kinh doanh') || lower.includes('doanh nghiệp') || lower.includes('hộ')) {
        botReply = `Theo Nghị định 01/2021/NĐ-CP về Đăng ký doanh nghiệp:
1. Đăng ký thành lập Hộ kinh doanh: Nộp tại Bộ phận Một cửa UBND cấp huyện; thời hạn cấp Giấy chứng nhận là 03 ngày làm việc.
2. Đăng ký Doanh nghiệp trực tuyến: Nộp 100% qua Cổng thông tin quốc gia về đăng ký doanh nghiệp (dangkykinhdoanh.gov.vn), miễn 100% lệ phí đăng ký.`;
        citations = ['Luật Doanh nghiệp 2020', 'Nghị định 01/2021/NĐ-CP'];
      } else if (lower.includes('khai sinh') || lower.includes('liên thông') || lower.includes('bhyt')) {
        botReply = `Dịch vụ công liên thông 'Đăng ký khai sinh - Đăng ký thường trú - Cấp thẻ BHYT cho trẻ dưới 6 tuổi':
1. Thực hiện trực tuyến 100% trên Cổng DVC Quốc gia hoặc ứng dụng VNeID.
2. Thời gian trả kết quả đồng thời cả 3 thủ tục: Không quá 03 ngày làm việc.
3. Giấy khai sinh bản điện tử và Thẻ BHYT sẽ được tự động tích hợp vào tài khoản VNeID của cha/mẹ.`;
        citations = ['Đề án 06/CP', 'Nghị định 63/2024/NĐ-CP'];
      } else {
        botReply = `Yêu cầu của bạn đã được ghi nhận. Theo quy chuẩn TTHC của Văn phòng Chính phủ:
- Bạn có thể tra cứu mã hồ sơ hoặc nộp trực tuyến tại vpcp.dichvucong.gov.vn.
- Chuyên viên thụ lý sẽ tiếp nhận trong thời gian không quá 15 phút trong giờ hành chính.`;
        citations = ['Cổng Dịch Vụ Công Quốc Gia'];
      }

      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: botReply,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          citations
        }
      ]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <>
      {/* Backdrop overlay when open on mobile/small screen to easily tap outside to close */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/30 z-40 backdrop-blur-2xs transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50">
        
        {/* Floating Trigger Button */}
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2.5 px-4 py-3 bg-[#a81c1c] hover:bg-[#8b0000] active:scale-95 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform border-2 border-amber-400 cursor-pointer"
            title="Mở Trợ Lý Ảo GOVTECH (Phím tắt: ESC để đóng)"
          >
            <div className="relative w-8 h-8 rounded-full bg-red-800 flex items-center justify-center text-amber-300 border border-amber-300">
              <i className="fa-solid fa-star text-base"></i>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full animate-pulse"></span>
            </div>
            <div className="text-left pr-1">
              <div className="text-xs font-black text-white leading-tight">Trợ Lý AI GOVTECH</div>
              <div className="text-[10px] text-amber-200 font-medium">Hỗ trợ tra cứu 24/7</div>
            </div>
          </button>
        )}

        {/* Expanded Chatbot Modal */}
        {isOpen && (
          <div
            ref={chatModalRef}
            className="w-[calc(100vw-2rem)] sm:w-[420px] max-h-[calc(100vh-2rem)] sm:max-h-[600px] h-[560px] bg-white border border-slate-300 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
          >
            
            {/* Header */}
            <div className="bg-[#a81c1c] text-white p-3.5 flex items-center justify-between border-b border-red-900 shadow-md select-none shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-red-800 border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-xs">
                  <i className="fa-solid fa-star text-base"></i>
                </div>
                <div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-white flex items-center gap-1.5 leading-tight">
                    <span>Trợ Lý Ảo GOVTECH</span>
                    <span className="text-[9px] bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded font-black">AI 2026</span>
                  </h3>
                  <p className="text-[10px] text-amber-100 leading-tight mt-0.5">
                    Hệ thống Quản lý Đa kênh
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setMessages([messages[0]])}
                  className="w-8 h-8 rounded-lg bg-red-900/60 hover:bg-red-800 active:scale-95 text-amber-200 flex items-center justify-center text-xs transition-colors cursor-pointer"
                  title="Làm mới hội thoại"
                  aria-label="Làm mới hội thoại"
                >
                  <i className="fa-solid fa-rotate-right"></i>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                  className="w-8 h-8 rounded-lg bg-red-900/80 hover:bg-red-950 active:scale-95 text-white flex items-center justify-center text-base transition-colors cursor-pointer border border-red-700 shadow-xs"
                  title="Đóng / Thu nhỏ cửa sổ (ESC)"
                  aria-label="Đóng Trợ lý AI"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>

            {/* Quick Prompts Carousel */}
            <div className="bg-[#f8fafc] border-b border-slate-200 p-2 overflow-x-auto custom-scrollbar flex items-center gap-1.5 shrink-0">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-red-50 hover:text-[#a81c1c] text-slate-700 rounded-full border border-slate-300 text-[10px] font-semibold transition-colors shadow-2xs shrink-0 cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 custom-scrollbar text-xs bg-[#f8fafc]/50">
              {messages.map((msg) => {
                const isBot = msg.sender === 'bot';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
                  >
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-1 px-1 font-medium">
                      <span>{isBot ? '🤖 Trợ lý AI' : 'Bạn'}</span>
                      <span>•</span>
                      <span>{msg.time}</span>
                    </div>

                    <div
                      className={`max-w-[90%] p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                        isBot
                          ? 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'
                          : 'bg-[#a81c1c] text-white rounded-tr-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 space-y-1">
                          <span className="font-bold text-[#a81c1c] flex items-center gap-1">
                            <i className="fa-solid fa-gavel text-[9px]"></i>
                            Nguồn & Căn cứ pháp lý:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {msg.citations.map((c, i) => (
                              <span key={i} className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-2 text-slate-500 text-xs p-2 bg-white rounded-xl border border-slate-200 w-fit">
                  <i className="fa-solid fa-spinner fa-spin text-[#a81c1c]"></i>
                  <span className="font-medium text-[11px]">AI đang tra cứu văn bản pháp luật...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Box & Bottom Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi thủ tục hoặc mã hồ sơ..."
                className="flex-1 bg-slate-50 text-slate-900 px-3.5 py-2 rounded-lg border border-slate-300 focus:border-[#a81c1c] focus:bg-white text-xs outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="px-3.5 py-2 bg-[#a81c1c] hover:bg-[#8b0000] disabled:opacity-50 text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Gửi</span>
                <i className="fa-solid fa-paper-plane text-[10px]"></i>
              </button>
            </form>

            {/* Compact Bottom Close Bar */}
            <div className="px-3 py-1 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 shrink-0">
              <span>Bấm phím <strong>ESC</strong> hoặc nhấp ra ngoài để đóng</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[#a81c1c] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-[9px]"></i>
                <span>Thu nhỏ</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </>
  );
};
