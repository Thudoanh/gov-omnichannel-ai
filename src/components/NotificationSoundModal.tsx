import React, { useState, useEffect, useRef } from 'react';
import { AppNotification, SoundSettings, SoundPreset, TabKey } from '../types';
import { playSoundByPreset } from '../utils/audio';

interface NotificationSoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAllNotifications: () => void;
  onSelectNotification: (targetTab?: TabKey, ticketId?: string) => void;
  soundSettings: SoundSettings;
  onUpdateSoundSettings: (newSettings: Partial<SoundSettings>) => void;
  initialTab?: 'notifications' | 'sound';
}

export const NotificationSoundModal: React.FC<NotificationSoundModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAllNotifications,
  onSelectNotification,
  soundSettings,
  onUpdateSoundSettings,
  initialTab = 'notifications'
}) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'sound'>(initialTab);
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'urgent'>('all');
  const [testingPreset, setTestingPreset] = useState<SoundPreset | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Handle ESC and click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(n => {
    if (filterType === 'unread') return !n.isRead;
    if (filterType === 'urgent') return n.type === 'urgent' || n.type === 'sla';
    return true;
  });

  const handleTestSound = (preset: SoundPreset) => {
    setTestingPreset(preset);
    playSoundByPreset(preset, soundSettings.volume, preset === 'urgent-alert');
    setTimeout(() => {
      setTestingPreset(null);
    }, 600);
  };

  const soundPresets: {
    id: SoundPreset;
    name: string;
    description: string;
    icon: string;
    badge: string;
  }[] = [
    {
      id: 'gov-standard',
      name: 'Chuông Dịch Vụ Công Tiêu Chuẩn',
      description: 'Âm sắc 2 nốt trang trọng, rõ ràng cho môi trường hành chính',
      icon: 'fa-landmark',
      badge: 'Mặc định'
    },
    {
      id: 'urgent-alert',
      name: 'Báo Động Khẩn Cấp & Hỏa Tốc',
      description: '3 nốt cao tần dồn dập, cảnh báo hồ sơ gấp & vi phạm SLA',
      icon: 'fa-triangle-exclamation',
      badge: 'Ưu tiên'
    },
    {
      id: 'crystal-ding',
      name: 'Chuông Ding Tinh Tế',
      description: 'Âm thanh trong vắt, nhẹ nhàng và thanh lịch',
      icon: 'fa-gem',
      badge: 'Thanh lịch'
    },
    {
      id: 'modern-beep',
      name: 'Xung Nhịp Kỹ Thuật Số (Digital Beep)',
      description: 'Âm xung điện tử công nghệ hiện đại, phản hồi dứt khoát',
      icon: 'fa-bolt',
      badge: 'Hiện đại'
    },
    {
      id: 'soft-chime',
      name: 'Giai Điệu Hòa Âm Nhẹ Nhàng',
      description: 'Chuỗi hòa âm êm dịu, không gây phân tâm khi đang thụ lý',
      icon: 'fa-music',
      badge: 'Êm dịu'
    }
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-2xs z-50 transition-opacity" />

      {/* Popover / Modal Window */}
      <div className="fixed top-12 sm:top-14 right-2 sm:right-6 md:right-12 z-50 w-[calc(100vw-1rem)] sm:w-[480px] max-h-[85vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150" ref={modalRef}>
        
        {/* Header with Navigation Tabs */}
        <div className="bg-[#8b0000] text-white p-3 sm:p-3.5 flex items-center justify-between border-b border-red-950 select-none shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-700 flex items-center justify-center text-amber-300">
              <i className={activeTab === 'notifications' ? 'fa-solid fa-bell text-sm' : 'fa-solid fa-sliders text-sm'}></i>
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <span>{activeTab === 'notifications' ? 'Trung Tâm Thông Báo' : 'Cài Đặt Âm Thanh & Chuông Báo'}</span>
                {activeTab === 'notifications' && unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-amber-400 text-slate-900 text-[10px] font-black rounded-full">
                    {unreadCount} mới
                  </span>
                )}
              </h3>
              <p className="text-[10px] text-red-200">
                GOVTECH • Quản lý Đa kênh
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-red-900/60 hover:bg-red-950 active:scale-95 text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
              title="Đóng (ESC)"
              aria-label="Đóng cửa sổ"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="bg-slate-100 p-1.5 border-b border-slate-200 flex items-center gap-1 text-xs shrink-0 font-bold">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-white text-[#a81c1c] shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="fa-solid fa-bell text-xs"></i>
            <span>Xem thông báo</span>
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('sound')}
            className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'sound'
                ? 'bg-white text-[#a81c1c] shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="fa-solid fa-volume-high text-xs"></i>
            <span>Cài đặt tiếng chuông</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: NOTIFICATIONS LIST                                                 */}
        {/* ========================================================================= */}
        {activeTab === 'notifications' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Filter and Actions Bar */}
            <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 text-xs shrink-0">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                    filterType === 'all'
                      ? 'bg-slate-800 text-white'
                      : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Tất cả ({notifications.length})
                </button>
                <button
                  onClick={() => setFilterType('unread')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                    filterType === 'unread'
                      ? 'bg-red-700 text-white'
                      : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Chưa đọc ({unreadCount})
                </button>
                <button
                  onClick={() => setFilterType('urgent')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                    filterType === 'urgent'
                      ? 'bg-amber-600 text-white'
                      : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Khẩn cấp
                </button>
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-[#a81c1c] hover:underline font-bold cursor-pointer"
                  >
                    Đã đọc hết
                  </button>
                )}
                <button
                  onClick={onClearAllNotifications}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                  title="Xóa danh sách thông báo"
                >
                  <i className="fa-regular fa-trash-can"></i>
                </button>
              </div>
            </div>

            {/* Notification Stream */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar bg-slate-50/40">
              {filteredNotifications.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <i className="fa-regular fa-bell-slash text-3xl text-slate-300"></i>
                  <p className="text-xs font-semibold">Không có thông báo nào trong danh mục này</p>
                </div>
              ) : (
                filteredNotifications.map((notif) => {
                  const getIconAndStyle = () => {
                    switch (notif.type) {
                      case 'urgent':
                        return {
                          icon: 'fa-solid fa-triangle-exclamation',
                          bg: 'bg-red-50 text-[#a81c1c] border-red-200'
                        };
                      case 'sla':
                        return {
                          icon: 'fa-solid fa-clock-rotate-left',
                          bg: 'bg-amber-50 text-amber-800 border-amber-200'
                        };
                      case 'bot':
                        return {
                          icon: 'fa-solid fa-robot',
                          bg: 'bg-purple-50 text-purple-800 border-purple-200'
                        };
                      default:
                        return {
                          icon: 'fa-solid fa-envelope',
                          bg: 'bg-blue-50 text-blue-800 border-blue-200'
                        };
                    }
                  };

                  const style = getIconAndStyle();

                  return (
                    <div
                      key={notif.id}
                      onClick={() => {
                        onMarkAsRead(notif.id);
                        if (notif.targetTab) {
                          onSelectNotification(notif.targetTab, notif.ticketId);
                          onClose();
                        }
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer hover:shadow-sm ${
                        !notif.isRead
                          ? 'bg-white border-red-200 ring-1 ring-red-100 shadow-2xs'
                          : 'bg-white/80 border-slate-200 opacity-80'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 border ${style.bg}`}>
                          <i className={style.icon}></i>
                        </div>

                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className={`text-xs font-bold truncate ${!notif.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                              {notif.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 shrink-0 font-medium">{notif.time}</span>
                          </div>

                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>

                          {notif.ticketId && (
                            <div className="pt-1 flex items-center justify-between text-[10px]">
                              <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200 font-semibold">
                                {notif.ticketId}
                              </span>
                              <span className="text-[#a81c1c] font-bold flex items-center gap-1 hover:underline">
                                <span>Xem chi tiết</span>
                                <i className="fa-solid fa-arrow-right text-[8px]"></i>
                              </span>
                            </div>
                          )}
                        </div>

                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-red-600 shrink-0 mt-1"></span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SOUND SETTINGS                                                     */}
        {/* ========================================================================= */}
        {activeTab === 'sound' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
            
            {/* Master Toggle */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${
                  soundSettings.isEnabled ? 'bg-amber-400 text-slate-900' : 'bg-slate-200 text-slate-500'
                }`}>
                  <i className={`fa-solid ${soundSettings.isEnabled ? 'fa-bell' : 'fa-bell-slash'}`}></i>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Âm thanh chuông báo</h4>
                  <p className="text-[11px] text-slate-500">Phát âm thanh khi có tin nhắn hoặc sự kiện mới</p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => onUpdateSoundSettings({ isEnabled: !soundSettings.isEnabled })}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors flex items-center shrink-0 cursor-pointer ${
                  soundSettings.isEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <span className="w-4.5 h-4.5 rounded-full bg-white shadow-md"></span>
              </button>
            </div>

            {/* Volume Control Slider */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <i className="fa-solid fa-volume-high text-[#a81c1c]"></i>
                  <span>Âm lượng chuông</span>
                </span>
                <span className="text-[#a81c1c] font-mono text-xs">{soundSettings.volume}%</span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="5"
                disabled={!soundSettings.isEnabled}
                value={soundSettings.volume}
                onChange={(e) => onUpdateSoundSettings({ volume: Number(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#a81c1c] disabled:opacity-40"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-semibold pt-0.5">
                <span>0% (Tắt)</span>
                <span>50%</span>
                <span>100% (Tối đa)</span>
              </div>
            </div>

            {/* Sound Preset Picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <i className="fa-solid fa-music text-purple-700"></i>
                  <span>Lựa chọn kiểu chuông thông báo</span>
                </label>
                <span className="text-[10px] text-slate-500">Bấm loa để nghe thử</span>
              </div>

              <div className="space-y-2">
                {soundPresets.map((preset) => {
                  const isSelected = soundSettings.preset === preset.id;
                  const isTesting = testingPreset === preset.id;

                  return (
                    <div
                      key={preset.id}
                      onClick={() => onUpdateSoundSettings({ preset: preset.id })}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-50/70 border-amber-400 ring-1 ring-amber-300 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                          isSelected ? 'bg-amber-400 text-slate-900 font-bold' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <i className={`fa-solid ${preset.icon}`}></i>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">{preset.name}</span>
                            <span className="text-[9px] bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded font-semibold text-slate-600">
                              {preset.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">{preset.description}</p>
                        </div>
                      </div>

                      {/* Test Sound Play Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTestSound(preset.id);
                        }}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all cursor-pointer ${
                          isTesting
                            ? 'bg-amber-500 text-white scale-110 shadow-sm'
                            : 'bg-slate-100 hover:bg-red-50 hover:text-[#a81c1c] text-slate-700'
                        }`}
                        title="Nghe thử âm thanh này"
                      >
                        <i className={`fa-solid ${isTesting ? 'fa-spinner fa-spin' : 'fa-play'}`}></i>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notification Event Triggers Configuration */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
              <span className="font-bold text-slate-900 text-xs block">Phát chuông cho các sự kiện:</span>

              <div className="space-y-2 text-[11px] text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={soundSettings.playOnNewMessage}
                    onChange={(e) => onUpdateSoundSettings({ playOnNewMessage: e.target.checked })}
                    className="w-4 h-4 rounded text-[#a81c1c] accent-[#a81c1c] cursor-pointer"
                  />
                  <span>Tin nhắn / Phản ánh mới từ Zalo, Facebook, Cổng DVC, 1022</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={soundSettings.playOnUrgentOnly}
                    onChange={(e) => onUpdateSoundSettings({ playOnUrgentOnly: e.target.checked })}
                    className="w-4 h-4 rounded text-[#a81c1c] accent-[#a81c1c] cursor-pointer"
                  />
                  <span>Yêu cầu khẩn cấp & Cảnh báo sắp quá hạn xử lý (SLA)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={soundSettings.playOnAutoResolved}
                    onChange={(e) => onUpdateSoundSettings({ playOnAutoResolved: e.target.checked })}
                    className="w-4 h-4 rounded text-[#a81c1c] accent-[#a81c1c] cursor-pointer"
                  />
                  <span>Khi Trợ lý AI tự động thụ lý xong hồ sơ TTHC</span>
                </label>
              </div>
            </div>

          </div>
        )}

        {/* Footer */}
        <div className="p-2.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span className="flex items-center gap-1">
            <i className="fa-solid fa-circle-check text-emerald-600"></i>
            Tự động lưu cài đặt
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-white hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-md font-bold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </>
  );
};
