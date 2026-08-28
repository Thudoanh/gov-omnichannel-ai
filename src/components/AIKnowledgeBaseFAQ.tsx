import React, { useState } from 'react';
import { FAQItem, CannedSnippet, TabKey } from '../types';

interface AIKnowledgeBaseFAQProps {
  faqs: FAQItem[];
  cannedSnippets: CannedSnippet[];
  onToggleFAQAutoResolution: (faqId: string) => void;
  onAddFAQ: (newFaq: Omit<FAQItem, 'id' | 'usageCount' | 'accuracyRate'>) => void;
  onApplyToInbox?: (faq: FAQItem) => void;
  onCreateBroadcastFromFAQ?: (faq: FAQItem) => void;
  onTestWithRealTicket?: (faq: FAQItem, question: string) => void;
  onNavigateTab?: (tab: TabKey) => void;
}

export const AIKnowledgeBaseFAQ: React.FC<AIKnowledgeBaseFAQProps> = ({
  faqs,
  cannedSnippets,
  onToggleFAQAutoResolution,
  onAddFAQ,
  onApplyToInbox,
  onCreateBroadcastFromFAQ,
  onTestWithRealTicket,
  onNavigateTab,
}) => {
  const [activeTab, setActiveTab] = useState<'faqs' | 'snippets' | 'tester'>('faqs');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Interactive Intent Tester State
  const [testInput, setTestInput] = useState<string>('Làm lại thẻ căn cước bị mất có cần xin giấy xác nhận của công an phường không và lệ phí bao nhiêu?');
  const [testResult, setTestResult] = useState<{
    matchedFAQ: FAQItem | null;
    confidence: number;
    extractedKeywords: string[];
    isAutoResolved: boolean;
  } | null>(null);

  // New FAQ Form Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('Đất đai & Nhà ở');
  const [newSampleQuestions, setNewSampleQuestions] = useState<string>('');
  const [newKeywords, setNewKeywords] = useState<string>('');
  const [newAnswer, setNewAnswer] = useState<string>('');
  const [newLegalBasis, setNewLegalBasis] = useState<string>('');

  const categories = ['all', 'Căn cước & Cư trú', 'Đất đai & Nhà ở', 'Đăng ký kinh doanh', 'Hộ tịch & Hôn nhân'];

  const filteredFaqs = faqs.filter(faq => {
    if (selectedCategory !== 'all' && faq.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = faq.title.toLowerCase().includes(q);
      const matchKeywords = faq.keywords.some(k => k.toLowerCase().includes(q));
      const matchAnswer = faq.officialAnswer.toLowerCase().includes(q);
      if (!matchTitle && !matchKeywords && !matchAnswer) return false;
    }
    return true;
  });

  const handleTestIntent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim()) return;

    const lowerInput = testInput.toLowerCase();
    let bestMatch: FAQItem | null = null;
    let maxMatches = 0;

    faqs.forEach(faq => {
      let matches = 0;
      faq.keywords.forEach(kw => {
        if (lowerInput.includes(kw.toLowerCase())) matches += 2;
      });
      if (lowerInput.includes(faq.category.toLowerCase())) matches += 1;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = faq;
      }
    });

    const confidence = bestMatch ? Math.min(99, 75 + maxMatches * 8) : 45;
    const extracted = bestMatch ? bestMatch.keywords.slice(0, 3) : ['thủ tục', 'hồ sơ'];

    setTestResult({
      matchedFAQ: bestMatch || faqs[0],
      confidence: confidence,
      extractedKeywords: extracted,
      isAutoResolved: confidence >= 85 && (bestMatch ? bestMatch.autoResolutionEnabled : false)
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAnswer.trim()) return;

    onAddFAQ({
      intentCode: `INTENT_${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      sampleQuestions: newSampleQuestions.split('\n').filter(q => q.trim()),
      keywords: newKeywords.split(',').map(k => k.trim()).filter(Boolean),
      officialAnswer: newAnswer.trim(),
      legalBasis: newLegalBasis.trim() || 'Quy định pháp luật hiện hành',
      requiredDocuments: ['Đơn đề nghị theo mẫu', 'Bản sao CCCD/VNeID'],
      processingDays: '03-05 ngày làm việc',
      fee: 'Theo biểu mức thu quy định',
      autoResolutionEnabled: true
    });

    setShowAddModal(false);
    setNewTitle('');
    setNewSampleQuestions('');
    setNewKeywords('');
    setNewAnswer('');
    setNewLegalBasis('');
  };

  return (
    <div className="space-y-4">
      
      {/* Official Government Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 text-2xl shrink-0 shadow-inner">
            
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Cơ Sở Dữ Liệu TTHC & Trả Lời Tự Động Bằng AI</h2>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded font-extrabold uppercase">
                Tự động hóa 79.4%
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Giải quyết tình trạng cán bộ bị quá tải vì phải lặp lại câu trả lời các câu hỏi trùng lặp. AI tự động tra cứu căn cứ pháp lý và trả lời chuẩn xác.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-[#a81c1c] hover:bg-[#8b0000] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
        >
          
          <span>Thêm Thủ Tục & Mẫu Mới</span>
        </button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('faqs')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'faqs'
              ? 'bg-[#a81c1c] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
          }`}
        >
          
          <span>Kho 100+ Thủ Tục TTHC ({faqs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('snippets')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'snippets'
              ? 'bg-[#a81c1c] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
          }`}
        >
          
          <span>Mẫu Phản Hồi Nhanh ({cannedSnippets.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('tester')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'tester'
              ? 'bg-[#a81c1c] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
          }`}
        >
          
          <span>Trình Kiểm Tra & Khớp Ý Định AI</span>
        </button>
      </div>

      {/* TAB 1: FAQS DATABASE */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="relative flex-1 min-w-[240px]">
              
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo tên thủ tục, từ khóa, văn bản pháp luật..."
                className="w-full bg-slate-50 text-slate-900 pl-9 pr-3 py-2 rounded-lg text-xs border border-slate-300 focus:border-[#a81c1c] focus:bg-white outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg shrink-0 transition-colors ${
                    selectedCategory === cat
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'Tất cả lĩnh vực' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200">
                      {faq.category}
                    </span>

                    <button
                      onClick={() => onToggleFAQAutoResolution(faq.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                        faq.autoResolutionEnabled
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 text-slate-500 border-slate-300'
                      }`}
                    >
                      
                      <span>{faq.autoResolutionEnabled ? 'AI Tự động BẬT' : 'AI Tự động TẮT'}</span>
                    </button>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 leading-snug">
                    {faq.title}
                  </h3>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 leading-relaxed font-medium">
                    {faq.officialAnswer}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#a81c1c] font-semibold">
                    
                    <span>{faq.legalBasis}</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-500 gap-2">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">Từ khóa:</span>
                      {faq.keywords.slice(0, 3).map((kw, i) => (
                        <span key={i} className="bg-slate-100 px-1.5 py-0.2 rounded font-mono text-slate-700">
                          {kw}
                        </span>
                      ))}
                    </div>
                    <span className="text-emerald-700 font-bold">
                      Đã áp dụng: {faq.usageCount} lần ({faq.accuracyRate}%)
                    </span>
                  </div>

                  {/* Interconnection Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
                    {onCreateBroadcastFromFAQ && (
                      <button
                        onClick={() => onCreateBroadcastFromFAQ(faq)}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        title="Tạo bản tin phát sóng thông báo cho thủ tục này"
                      >
                        
                        <span>Phát sóng</span>
                      </button>
                    )}
                    {onApplyToInbox && (
                      <button
                        onClick={() => onApplyToInbox(faq)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        title="Chuyển đến Hộp Thư và áp dụng nội dung trả lời này"
                      >
                        
                        <span>Dùng Cho Hộp Thư</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 2: CANNED SNIPPETS */}
      {activeTab === 'snippets' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cannedSnippets.map((snip) => (
            <div key={snip.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">{snip.title}</span>
                <span className="text-[10px] font-mono bg-slate-100 text-blue-800 px-2 py-0.5 rounded font-bold border border-slate-200">
                  {snip.shortcut}
                </span>
              </div>
              <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200 leading-relaxed">
                {snip.content}
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                <span>Lĩnh vực: {snip.category}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(snip.content);
                  }}
                  className="text-blue-700 font-bold hover:underline"
                >
                  Sao chép
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: INTENT TESTER */}
      {activeTab === 'tester' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              
              <span>Trình Thử Nghiệm Tự Động Trích Xuất & Khớp Ý Định AI</span>
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Nhập bất kỳ câu hỏi hoặc tin nhắn tự do của công dân để kiểm tra khả năng nhận diện từ khóa và trích xuất căn cứ pháp luật.
            </p>
          </div>

          <form onSubmit={handleTestIntent} className="space-y-3">
            <textarea
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              rows={3}
              className="w-full bg-slate-50 text-slate-900 text-xs p-3 rounded-lg border border-slate-300 focus:border-emerald-600 focus:bg-white outline-none"
              placeholder="Nhập câu hỏi công dân gửi qua Zalo/Facebook..."
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              
              <span>Kiểm Tra Độ Khớp AI</span>
            </button>
          </form>

          {testResult && (
            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                  
                  Kết quả phân tích: Khớp {testResult.confidence}%
                </span>
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                  testResult.isAutoResolved
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {testResult.isAutoResolved ? 'Đủ điều kiện tự động trả lời' : 'Cần cán bộ kiểm duyệt trước khi gửi'}
                </span>
              </div>

              {testResult.matchedFAQ && (
                <div className="bg-white p-3.5 border border-emerald-200 rounded-lg space-y-3">
                  <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                    <span>Thủ tục khớp: {testResult.matchedFAQ.title}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                      {testResult.matchedFAQ.intentCode}
                    </span>
                  </div>
                  <div className="text-slate-800 leading-relaxed font-medium">
                    {testResult.matchedFAQ.officialAnswer}
                  </div>
                  <div className="text-[11px] text-[#a81c1c] font-semibold pt-1 border-t border-slate-100">
                    Căn cứ: {testResult.matchedFAQ.legalBasis}
                  </div>

                  {onTestWithRealTicket && (
                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => onTestWithRealTicket(testResult.matchedFAQ!, testInput)}
                        className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        
                        <span>Tạo Hồ Sơ Thử Nghiệm Gửi Vào Hộp Thư Tiếp Nhận</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ADD FAQ MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                
                Thêm Thủ Tục & Câu Trả Lời Chuẩn Mới
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-base"
              >
                
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên thủ tục hành chính:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="VD: Cấp đổi thẻ Căn cước công dân gắn chip..."
                  className="w-full bg-slate-50 text-slate-900 p-2 rounded-lg border border-slate-300 focus:border-[#a81c1c] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Lĩnh vực TTHC:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 p-2 rounded-lg border border-slate-300 outline-none"
                >
                  <option value="Đất đai & Nhà ở">Đất đai & Nhà ở</option>
                  <option value="Căn cước & Cư trú">Căn cước & Cư trú</option>
                  <option value="Đăng ký kinh doanh">Đăng ký kinh doanh</option>
                  <option value="Hộ tịch & Hôn nhân">Hộ tịch & Hôn nhân</option>
                  <option value="Xây dựng & Quy hoạch">Xây dựng & Quy hoạch</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nội dung hướng dẫn chính thức:</label>
                <textarea
                  rows={3}
                  required
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Nhập nội dung quy chuẩn để AI dùng trả lời công dân..."
                  className="w-full bg-slate-50 text-slate-900 p-2 rounded-lg border border-slate-300 focus:border-[#a81c1c] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Căn cứ pháp lý (Luật/Nghị định/Thông tư):</label>
                <input
                  type="text"
                  value={newLegalBasis}
                  onChange={(e) => setNewLegalBasis(e.target.value)}
                  placeholder="VD: Luật Căn cước số 26/2023/QH15"
                  className="w-full bg-slate-50 text-slate-900 p-2 rounded-lg border border-slate-300 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Từ khóa AI nhận diện (ngăn cách bởi dấu phẩy):</label>
                <input
                  type="text"
                  value={newKeywords}
                  onChange={(e) => setNewKeywords(e.target.value)}
                  placeholder="làm lại căn cước, mất cccd, cấp đổi thẻ"
                  className="w-full bg-slate-50 text-slate-900 p-2 rounded-lg border border-slate-300 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#a81c1c] hover:bg-[#8b0000] text-white rounded-lg font-bold shadow-xs"
                >
                  Lưu vào CSDL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
