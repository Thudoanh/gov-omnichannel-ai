import React, { useState, useRef, useEffect } from 'react';
import { TabKey, SoundSettings, UserProfile } from '../types';
import { ROLE_CONFIGS, hasTabAccess } from '../utils/rbac';

interface HeaderProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  pendingCount: number;
  isAfterHoursMode: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onToggleAfterHoursMode: () => void;
  soundSettings: SoundSettings;
  unreadNotificationCount: number;
  onOpenNotificationModal: (tab?: 'notifications' | 'sound') => void;
  currentUser: UserProfile | null;
  onOpenAuthModal: (view?: 'login' | 'register' | 'forgot' | 'profile' | 'channels') => void;
  onLogout: () => void;
  onStatusChange: (status: 'available' | 'busy' | 'away') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  pendingCount,
  isAfterHoursMode,
  isDarkMode,
  onToggleDarkMode,
  onToggleAfterHoursMode,
  unreadNotificationCount,
  onOpenNotificationModal,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onStatusChange,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user dropdown on click outside or ESC
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isUserMenuOpen) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isUserMenuOpen]);

  const userStatus = currentUser?.status || 'available';

  return (
    <header className="relative z-40 bg-white dark:bg-slate-800 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 dark:border-slate-800 shadow-md">
      
      {/* 1. Top Utility Bar (Hotline & Trực Ca) */}
      <div className="bg-[#8b0000] text-white border-b border-red-900/40 text-xs">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-2">
          
          {/* Hotline 18XX XXXX / XXXX */}
          <div className="flex items-center gap-1.5 bg-red-950/60 px-2.5 py-0.5 rounded border border-red-800/60 text-amber-300 font-semibold text-[11px] truncate">
            
            <span className="truncate">
              Tổng đài: <strong className="text-white font-mono">18XX XXXX</strong> / <strong className="text-white font-mono">XXXX</strong>
            </span>
          </div>

          {/* Controls: Shift Switcher + Notification Bell + Dark Mode */}
          <div className="flex items-center gap-2 text-[11px] shrink-0">

            {/* Dark Mode Switcher */}
            <div
              onClick={onToggleDarkMode}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggleDarkMode(); }}
              className="flex items-center bg-red-950/80 p-0.5 rounded-full border border-red-800/80 cursor-pointer select-none transition-all shadow-inner hover:border-amber-400/50"
              title={
                isDarkMode
                  ? 'Giao diện tối (Bấm để chuyển sang Giao diện sáng)'
                  : 'Giao diện sáng (Bấm để chuyển sang Giao diện tối)'
              }
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-200 ${
                  !isDarkMode
                    ? 'bg-amber-500 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-red-300/60 hover:text-white'
                }`}
              >
                Sáng
              </div>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'text-red-300/60 hover:text-white'
                }`}
              >
                Tối
              </div>
            </div>

            {/* Icon-Only Shift Switcher (Human vs Bot) */}
            <div
              onClick={onToggleAfterHoursMode}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggleAfterHoursMode(); }}
              className="flex items-center bg-red-950/80 p-0.5 rounded-full border border-red-800/80 cursor-pointer select-none transition-all shadow-inner hover:border-amber-400/50"
              title={
                isAfterHoursMode
                  ? 'Đang bật: Bot AI trực tự động (Bấm để chuyển sang Ca Cán bộ)'
                  : 'Đang bật: Cán bộ trực hành chính (Bấm để chuyển sang Bot AI)'
              }
            >
              {/* Human Icon */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all duration-200 ${
                  !isAfterHoursMode
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-red-300/60 hover:text-white'
                }`}
              >
                
              </div>

              {/* Bot Icon */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all duration-200 ${
                  isAfterHoursMode
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-red-300/60 hover:text-white'
                }`}
              >
                
              </div>
            </div>

            {/* Notification Bell Button (Icon Only with Badge) */}
            <button
              type="button"
              onClick={() => onOpenNotificationModal('notifications')}
              className="relative w-7 h-7 rounded-full flex items-center justify-center bg-red-950/80 hover:bg-red-900 border border-red-800/80 text-amber-300 hover:text-white transition-all cursor-pointer shadow-inner active:scale-95"
              title="Xem thông báo & Cài đặt chuông"
              aria-label="Thông báo và cài đặt chuông"
            >
              
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1 min-w-[16px] h-4 bg-amber-400 text-slate-900 dark:text-slate-100 text-[9px] font-black rounded-full flex items-center justify-center shadow-xs animate-pulse border border-red-950">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

          </div>

        </div>
      </div>

      {/* 2. Main Brand Header (Logo Quốc Huy + Tiêu đề Cổng DVC + Avatar & User Menu / Login Buttons) */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Emblem & Portal Title */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            {/* National Emblem Visual Crest */}
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-red-600 via-red-700 to-red-800 border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-md shrink-0">
              
              <div className="absolute inset-0 rounded-full border border-amber-300/40 pointer-events-none"></div>
            </div>

            {/* Typography Branding */}
            <div className="min-w-0">
              <h1 className="text-sm sm:text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight truncate">
                GOVTECH
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 font-semibold truncate">
                Hệ thống quản lý đa kênh
              </p>
            </div>
          </div>

          {/* Officer Profile & User Dropdown Menu OR Login/Register CTA */}
          {currentUser ? (
            <div className="relative shrink-0" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:border-slate-700 transition-all cursor-pointer select-none text-left"
                title="Mở menu tài khoản cán bộ"
                aria-expanded={isUserMenuOpen}
              >
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center justify-end gap-1.5">
                    <span>{currentUser.fullName}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-red-100 text-[#a81c1c] border border-red-200">
                      {ROLE_CONFIGS[currentUser.role]?.shortLabel || currentUser.role}
                    </span>
                    
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center justify-end gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      userStatus === 'available' ? 'bg-emerald-500' : userStatus === 'busy' ? 'bg-red-500' : 'bg-amber-500'
                    }`}></span>
                    <span>{userStatus === 'available' ? 'Sẵn sàng tiếp nhận' : userStatus === 'busy' ? 'Bận xử lý' : 'Tạm vắng'}</span>
                  </span>
                </div>

                <div className="relative">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr ${currentUser.avatarColor || 'from-[#a81c1c] to-red-700'} border-2 border-amber-400 flex items-center justify-center text-white font-extrabold text-xs sm:text-sm shadow-md`}>
                    {currentUser.avatarInitials}
                  </div>
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    userStatus === 'available' ? 'bg-emerald-500' : userStatus === 'busy' ? 'bg-red-500' : 'bg-amber-500'
                  }`}></span>
                </div>
              </button>

              {/* Dropdown Menu Popup */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* Header User Card */}
                  <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-[#7a1212] text-white">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${currentUser.avatarColor || 'from-[#a81c1c] to-red-700'} border-2 border-amber-400 flex items-center justify-center text-white font-black text-base shadow-md shrink-0`}>
                        {currentUser.avatarInitials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-sm text-white truncate">{currentUser.fullName}</span>
                          <span className="text-[9px] bg-amber-400 text-slate-900 dark:text-slate-100 font-extrabold px-1.5 py-0.2 rounded uppercase">
                            {ROLE_CONFIGS[currentUser.role]?.shortLabel || currentUser.role}
                          </span>
                        </div>
                        <div className="text-[11px] text-amber-300 font-semibold truncate">{currentUser.title}</div>
                        <div className="text-[10px] text-slate-300 font-mono mt-0.5">Mã CC: {currentUser.badgeNumber}</div>
                      </div>
                    </div>

                    {/* Status Picker Pills */}
                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-1 text-[11px]">
                      <span className="text-slate-300 text-[10px]">Trạng thái:</span>
                      <div className="flex items-center gap-1 bg-black/30 p-0.5 rounded-lg">
                        <button
                          type="button"
                          onClick={() => onStatusChange('available')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                            userStatus === 'available' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                          }`}
                        >
                          Sẵn sàng
                        </button>
                        <button
                          type="button"
                          onClick={() => onStatusChange('busy')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                            userStatus === 'busy' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                          }`}
                        >
                          Bận
                        </button>
                        <button
                          type="button"
                          onClick={() => onStatusChange('away')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                            userStatus === 'away' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                          }`}
                        >
                          Vắng
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items List */}
                  <div className="p-2 divide-y divide-slate-100 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenAuthModal('profile');
                        }}
                        className="w-full px-3 py-2 rounded-lg hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer text-left font-bold text-slate-800 dark:text-slate-200"
                      >
                        
                        <span>Hồ sơ cán bộ & Cài đặt</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onSelectTab('inbox');
                        }}
                        className="w-full px-3 py-2 rounded-lg hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer text-left"
                      >
                        
                        <span>Hồ sơ đang phụ trách ({pendingCount})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenNotificationModal('sound');
                        }}
                        className="w-full px-3 py-2 rounded-lg hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer text-left"
                      >
                        
                        <span>Cài đặt âm thanh & chuông báo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenAuthModal('channels');
                        }}
                        className="w-full px-3 py-2 rounded-lg hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer text-left"
                      >
                        
                        <span>Kết nối các kênh & Mạng xã hội</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onSelectTab('analytics');
                        }}
                        className="w-full px-3 py-2 rounded-lg hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer text-left"
                      >
                        
                        <span>Hiệu suất & Giám sát SLA ca trực</span>
                      </button>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenAuthModal('login');
                        }}
                        className="w-full px-3 py-2 rounded-lg hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer text-left"
                      >
                        
                        <span>Đổi tài khoản cán bộ khác</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenAuthModal('register');
                        }}
                        className="w-full px-3 py-2 rounded-lg hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer text-left"
                      >
                        
                        <span>Đăng ký thêm tài khoản mới</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onToggleAfterHoursMode();
                        }}
                        className="w-full px-3 py-2 rounded-lg hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-800 flex items-center justify-between transition-colors cursor-pointer text-left"
                      >
                        <span className="flex items-center gap-2.5">
                          
                          <span>Chế độ trực</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                          {isAfterHoursMode ? 'Bot AI 24/7' : 'Ca hành chính'}
                        </span>
                      </button>
                    </div>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full px-3 py-2 rounded-lg hover:bg-red-50 text-red-700 font-bold flex items-center gap-2.5 transition-colors cursor-pointer text-left"
                      >
                        
                        <span>Bàn giao ca & Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onOpenAuthModal('login')}
                className="px-3 py-1.5 rounded-lg border border-[#a81c1c] text-[#a81c1c] hover:bg-red-50 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                
                <span>Đăng nhập</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenAuthModal('register')}
                className="px-3 py-1.5 rounded-lg bg-[#a81c1c] hover:bg-red-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                
                <span className="hidden sm:inline">Đăng ký</span>
              </button>
            </div>
          )}

        </div>
      </div>

      {/* 3. Official Red Ribbon Navigation Bar (Dải Menu Đỏ Truyền Thống của Cổng DVC) */}
      <div className="bg-[#a81c1c] text-white shadow-md">
        <div className="max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6">
          <nav className="grid grid-cols-5 gap-1 sm:gap-1.5 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            
            {/* Tab 1: Omnichannel Inbox */}
            <button
              onClick={() => onSelectTab('inbox')}
              className={`px-1.5 sm:px-2.5 py-2 rounded-md flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer text-center truncate ${
                currentTab === 'inbox'
                  ? 'bg-[#7a1212] text-amber-300 border-b-2 border-amber-300 shadow-inner'
                  : 'text-white hover:bg-red-800 hover:text-amber-200'
              }`}
              title="1. Hộp thư"
            >
              <span className="truncate">1. Hộp thư</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-400 text-slate-900 dark:text-slate-100 text-[10px] font-black rounded-full shadow-xs shrink-0">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Tab 2: After Hours Auto-Pilot / Nhật ký trực tự động */}
            <button
              onClick={() => onSelectTab('afterhours')}
              className={`px-1.5 sm:px-2.5 py-2 rounded-md flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer text-center truncate ${
                currentTab === 'afterhours'
                  ? 'bg-[#7a1212] text-amber-300 border-b-2 border-amber-300 shadow-inner'
                  : 'text-white hover:bg-red-800 hover:text-amber-200'
              }`}
              title="2. Nhật ký trực tự động"
            >
              <span className="truncate">2. Nhật ký trực tự động</span>
            </button>

            {/* Tab 3: FAQ & AI Knowledge Base */}
            <button
              onClick={() => onSelectTab('faq')}
              className={`px-1.5 sm:px-2.5 py-2 rounded-md flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer text-center truncate ${
                currentTab === 'faq'
                  ? 'bg-[#7a1212] text-amber-300 border-b-2 border-amber-300 shadow-inner'
                  : 'text-white hover:bg-red-800 hover:text-amber-200'
              }`}
              title="3. CSDL"
            >
              <span className="truncate">3. CSDL</span>
            </button>

            {/* Tab 4: Mass Omnichannel Broadcast */}
            <button
              onClick={() => onSelectTab('broadcast')}
              className={`px-1.5 sm:px-2.5 py-2 rounded-md flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer text-center truncate ${
                currentTab === 'broadcast'
                  ? 'bg-[#7a1212] text-amber-300 border-b-2 border-amber-300 shadow-inner'
                  : 'text-white hover:bg-red-800 hover:text-amber-200'
              }`}
              title="4. Thông báo"
            >
              <span className="truncate">4. Thông báo</span>
            </button>

            {/* Tab 5: SLA Analytics */}
            <button
              onClick={() => onSelectTab('analytics')}
              className={`px-1.5 sm:px-2.5 py-2 rounded-md flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer text-center truncate ${
                currentTab === 'analytics'
                  ? 'bg-[#7a1212] text-amber-300 border-b-2 border-amber-300 shadow-inner'
                  : 'text-white hover:bg-red-800 hover:text-amber-200'
              }`}
              title="5. Báo cáo"
            >
              <span className="truncate">5. Báo cáo</span>
            </button>

          </nav>
        </div>
      </div>

    </header>
  );
};
