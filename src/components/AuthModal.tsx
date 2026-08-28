import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { ROLE_CONFIGS } from '../utils/rbac';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onRegister: (newUser: UserProfile) => void;
  onUpdateProfile: (updatedUser: UserProfile) => void;
  initialView?: 'login' | 'register' | 'forgot' | 'profile' | 'channels';
  registeredUsers?: UserProfile[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onRegister,
  onUpdateProfile,
  initialView = 'login',
  registeredUsers = []
}) => {
  const [view, setView] = useState<'login' | 'register' | 'forgot' | 'profile' | 'channels'>(initialView);
  const [loginMethod, setLoginMethod] = useState<'credentials' | 'vneid'>('credentials');
  
  // Login Form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRemember, setLoginRemember] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // VNeID Login state
  const [vneidMode, setVneidMode] = useState<'qr' | 'cccd'>('qr');
  const [vneidIdCard, setVneidIdCard] = useState('');
  const [vneidOtpSent, setVneidOtpSent] = useState(false);
  const [vneidOtp, setVneidOtp] = useState('');
  const [vneidCountdown, setVneidCountdown] = useState(60);
  const [vneidQrTimeLeft, setVneidQrTimeLeft] = useState(120);

  // Register Form state
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regIdCard, setRegIdCard] = useState('');
  const [regDepartment, setRegDepartment] = useState('Bộ phận Tiếp nhận & Trả kết quả (Một Cửa)');
  const [regRole, setRegRole] = useState<UserRole>('officer');
  const [regTitle, setRegTitle] = useState('Chuyên viên Thụ lý TTHC');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAgreed, setRegAgreed] = useState(true);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  // Forgot Password state
  const [forgotInput, setForgotInput] = useState('');
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Profile Edit state
  const [profileFullName, setProfileFullName] = useState(currentUser?.fullName || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [profileDepartment, setProfileDepartment] = useState(currentUser?.department || '');
  const [profileTitle, setProfileTitle] = useState(currentUser?.title || '');
  const [profileStatus, setProfileStatus] = useState<'available' | 'busy' | 'away'>(currentUser?.status || 'available');
  const [profileMessage, setProfileMessage] = useState('');

  // Channels state
  const [zaloConnected, setZaloConnected] = useState(false);
  const [fbConnected, setFbConnected] = useState(false);
  const [dvcConnected, setDvcConnected] = useState(true);

  // Synchronize view with initialView prop when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setView(currentUser ? (initialView === 'login' ? 'profile' : initialView) : initialView);
      setLoginError('');
      setRegError('');
      setRegSuccess(false);
      setForgotSuccess(false);
      setForgotOtpSent(false);
      setVneidOtpSent(false);
      setVneidQrTimeLeft(120);
      if (currentUser) {
        setProfileFullName(currentUser.fullName);
        setProfileEmail(currentUser.email);
        setProfilePhone(currentUser.phone);
        setProfileDepartment(currentUser.department);
        setProfileTitle(currentUser.title);
        setProfileStatus(currentUser.status);
      }
    }
  }, [isOpen, initialView, currentUser]);

  // VNeID Countdown timers
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && loginMethod === 'vneid' && vneidMode === 'qr' && vneidQrTimeLeft > 0) {
      timer = setInterval(() => setVneidQrTimeLeft(t => (t > 1 ? t - 1 : 120)), 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, loginMethod, vneidMode, vneidQrTimeLeft]);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (vneidOtpSent && vneidCountdown > 0) {
      timer = setInterval(() => setVneidCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [vneidOtpSent, vneidCountdown]);

  if (!isOpen) return null;

  // Handle Login Submit
  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    setTimeout(() => {
      const trimmed = loginUsername.trim().toLowerCase();
      // Find matching user from registered list
      const matched = registeredUsers.find(
        u => u.username.toLowerCase() === trimmed || 
             u.email.toLowerCase() === trimmed || 
             u.badgeNumber.toLowerCase() === trimmed ||
             u.idCard === trimmed
      );

      if (matched) {
        onLogin({
          ...matched,
          lastLogin: 'Vừa xong'
        });
        setIsSubmitting(false);
        onClose();
      } else {
        if (loginUsername && loginPassword) {
          // Create session for entered credentials
          const initials = loginUsername.slice(0, 2).toUpperCase();
          const fallbackUser: UserProfile = {
            id: `user-${Date.now()}`,
            username: loginUsername,
            fullName: loginUsername.includes('.') ? loginUsername.split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') : 'Cán bộ ' + loginUsername,
            email: loginUsername.includes('@') ? loginUsername : `${loginUsername}@chinhphu.gov.vn`,
            phone: '0988 999 000',
            idCard: '001092009999',
            role: 'officer',
            title: 'Chuyên viên Tiếp nhận TTHC',
            department: 'Bộ phận Một Cửa UBND',
            badgeNumber: `CB-${Math.floor(1000 + Math.random() * 9000)}`,
            avatarInitials: initials,
            avatarColor: 'from-[#a81c1c] to-red-700',
            status: 'available',
            createdAt: new Date().toLocaleDateString('vi-VN'),
            lastLogin: 'Vừa xong',
            isVNeIDVerified: true
          };
          onLogin(fallbackUser);
          setIsSubmitting(false);
          onClose();
        } else {
          setLoginError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
          setIsSubmitting(false);
        }
      }
    }, 400);
  };

  // VNeID Send OTP
  const handleSendVNeIDOtp = () => {
    const cccdRegex = /^\d{12}$/;
    if (!vneidIdCard || !cccdRegex.test(vneidIdCard.trim())) {
      setLoginError('Số CCCD / Mã định danh phải bao gồm đúng 12 chữ số.');
      return;
    }
    setLoginError('');
    setVneidOtpSent(true);
    setVneidCountdown(60);
    setVneidOtp('882199'); // Pre-fill mock OTP for smooth demo
  };

  // VNeID Login Verify
  const handleVNeIDVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vneidOtp || vneidOtp.length < 6) {
      setLoginError('Vui lòng nhập đầy đủ mã xác thực OTP 6 số từ ứng dụng VNeID.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      // Find matching by idCard or fallback to verified citizen / officer
      const matched = registeredUsers.find(u => u.idCard === vneidIdCard.trim()) || {
        id: `vneid-${Date.now()}`,
        username: `vneid_${vneidIdCard.trim().slice(-4)}`,
        fullName: 'Cán bộ Định danh VNeID Mức 2',
        email: `canbo.${vneidIdCard.trim().slice(-4)}@dichvucong.gov.vn`,
        phone: '0912 888 999',
        idCard: vneidIdCard.trim(),
        role: 'team_lead' as UserRole,
        title: 'Cán bộ Thụ lý - Định danh VNeID Cấp 2',
        department: 'Bộ phận Tiếp nhận & Trả kết quả (Một Cửa)',
        badgeNumber: `VN-${vneidIdCard.trim().slice(-4)}`,
        avatarInitials: 'VN',
        avatarColor: 'from-[#a81c1c] to-amber-700',
        status: 'available' as const,
        createdAt: new Date().toLocaleDateString('vi-VN'),
        lastLogin: 'Đăng nhập VNeID lúc ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        isVNeIDVerified: true
      };

      onLogin({
        ...matched,
        isVNeIDVerified: true,
        lastLogin: 'Đăng nhập VNeID lúc ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      });
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  // VNeID Quick QR Simulation Login
  const handleSimulateVNeIDQRScan = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const vneidUser = registeredUsers[0] || {
        id: 'user-vneid-qr',
        username: 'tam.le',
        fullName: 'Lê Minh Tâm (VNeID Mức 2)',
        email: 'tam.le@chinhphu.gov.vn',
        phone: '0912 345 678',
        idCard: '001092008821',
        role: 'team_lead' as UserRole,
        title: 'Trưởng ca Tiếp nhận TTHC',
        department: 'Bộ phận Tiếp nhận & Trả kết quả (Một Cửa)',
        badgeNumber: 'CB-8821',
        avatarInitials: 'MT',
        avatarColor: 'from-[#a81c1c] to-red-700',
        status: 'available' as const,
        createdAt: '01/01/2024',
        lastLogin: 'Đăng nhập qua QR VNeID lúc ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        isVNeIDVerified: true
      };

      onLogin({
        ...vneidUser,
        isVNeIDVerified: true,
        lastLogin: 'Đăng nhập qua QR VNeID lúc ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      });
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  // Handle Register Submit with full validation
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    // 1. Check required empty fields
    if (!regFullName.trim()) {
      setRegError('Vui lòng nhập Họ và tên cán bộ.');
      return;
    }
    if (!regUsername.trim()) {
      setRegError('Vui lòng nhập Tên đăng nhập.');
      return;
    }
    if (!regEmail.trim()) {
      setRegError('Vui lòng nhập Email.');
      return;
    }
    if (!regPhone.trim()) {
      setRegError('Vui lòng nhập Số điện thoại.');
      return;
    }
    if (!regIdCard.trim()) {
      setRegError('Vui lòng nhập Số CCCD.');
      return;
    }
    if (!regPassword) {
      setRegError('Vui lòng nhập Mật khẩu.');
      return;
    }
    if (!regConfirmPassword) {
      setRegError('Vui lòng nhập Xác nhận mật khẩu.');
      return;
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail.trim())) {
      setRegError('Email không đúng định dạng. Vui lòng nhập đúng định dạng email (ví dụ: canbo@chinhphu.gov.vn).');
      return;
    }

    // 3. Phone validation: exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(regPhone.trim())) {
      setRegError('Số điện thoại phải bao gồm đúng 10 chữ số.');
      return;
    }

    // 4. CCCD validation: exactly 12 digits
    const cccdRegex = /^\d{12}$/;
    if (!cccdRegex.test(regIdCard.trim())) {
      setRegError('Số CCCD phải bao gồm đúng 12 chữ số.');
      return;
    }

    // 5. Password validation:
    // - Phải bao gồm chữ cái in hoa (A-Z)
    // - Chữ cái in thường (a-z)
    // - Ký tự đặc biệt
    // - Chữ số (0-9)
    // - Độ dài tối thiểu 6 ký tự
    const hasUpperCase = /[A-Z]/.test(regPassword);
    const hasLowerCase = /[a-z]/.test(regPassword);
    const hasNumber = /[0-9]/.test(regPassword);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(regPassword);
    const hasMinLength = regPassword.length >= 6;

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar || !hasMinLength) {
      setRegError('Mật khẩu phải có ít nhất 6 ký tự, bao gồm cả: chữ cái in hoa, chữ cái in thường, chữ số và ký tự đặc biệt (!@#$%...).');
      return;
    }

    // 6. Confirm password must match
    if (regPassword !== regConfirmPassword) {
      setRegError('Mật khẩu đăng nhập và Xác nhận mật khẩu phải giống nhau.');
      return;
    }

    // 7. Regulation agreement
    if (!regAgreed) {
      setRegError('Vui lòng xác nhận đồng ý với Quy chế an toàn thông tin & bảo mật dữ liệu hành chính.');
      return;
    }

    // 8. Check existing username
    if (registeredUsers.some(u => u.username.toLowerCase() === regUsername.trim().toLowerCase())) {
      setRegError('Tên đăng nhập này đã tồn tại trong hệ thống. Vui lòng chọn tên khác.');
      return;
    }

    setIsSubmitting(true);

    const nameParts = regFullName.trim().split(' ');
    const initials = nameParts.length >= 2 
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : regFullName.slice(0, 2).toUpperCase();

    const roleColorMap: Record<UserRole, string> = {
      admin: 'from-emerald-700 to-teal-900',
      team_lead: 'from-[#a81c1c] to-red-700',
      officer: 'from-blue-700 to-indigo-800',
      receptionist: 'from-amber-600 to-orange-800'
    };

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      username: regUsername.trim().toLowerCase(),
      fullName: regFullName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim(),
      idCard: regIdCard.trim(),
      role: regRole,
      title: regTitle.trim() || ROLE_CONFIGS[regRole]?.shortLabel || 'Chuyên viên Thụ lý',
      department: regDepartment,
      badgeNumber: `${regRole === 'admin' ? 'AD' : 'CB'}-${Math.floor(1000 + Math.random() * 9000)}`,
      avatarInitials: initials,
      avatarColor: roleColorMap[regRole] || 'from-[#a81c1c] to-red-700',
      status: 'available',
      createdAt: new Date().toLocaleDateString('vi-VN'),
      lastLogin: 'Vừa xong',
      isVNeIDVerified: true
    };

    setTimeout(() => {
      onRegister(newUser);
      onLogin(newUser);
      setIsSubmitting(false);
      setRegSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    }, 600);
  };

  // Handle Forgot Password Submit
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotInput) return;

    if (!forgotOtpSent) {
      setForgotOtpSent(true);
      setForgotOtp('654321');
    } else {
      if (!forgotNewPassword || forgotNewPassword.length < 6) {
        setLoginError('Mật khẩu mới phải có tối thiểu 6 ký tự.');
        return;
      }
      setForgotSuccess(true);
      setTimeout(() => {
        setView('login');
        setForgotSuccess(false);
        setForgotOtpSent(false);
      }, 1500);
    }
  };

  // Handle Profile Update Submit
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const nameParts = profileFullName.trim().split(' ');
    const initials = nameParts.length >= 2 
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : profileFullName.slice(0, 2).toUpperCase();

    const updated: UserProfile = {
      ...currentUser,
      fullName: profileFullName.trim(),
      email: profileEmail.trim(),
      phone: profilePhone.trim(),
      department: profileDepartment.trim(),
      title: profileTitle.trim(),
      status: profileStatus,
      avatarInitials: initials || currentUser.avatarInitials
    };

    onUpdateProfile(updated);
    setProfileMessage('Đã cập nhật thông tin hồ sơ thành công!');
    setTimeout(() => {
      setProfileMessage('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Header (National Portal Gov Brand) */}
        <div className="bg-gradient-to-r from-[#8b0000] via-[#a81c1c] to-[#7a1212] px-5 py-3.5 text-white flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-800 border border-amber-300 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
              
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base leading-tight flex items-center gap-2">
                <span>GOVTECH</span>
                <span className="text-[10px] bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded font-black uppercase">Cán Bộ</span>
              </h2>
              <p className="text-[11px] text-amber-200/90 font-medium">Hệ thống Tiếp nhận & Quản trị TTHC Đa kênh</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer text-sm"
            title="Đóng cửa sổ"
          >
            
          </button>
        </div>

        {/* View Switcher Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1">
            {currentUser && (
              <button
                type="button"
                onClick={() => setView('profile')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  view === 'profile'
                    ? 'bg-white text-[#a81c1c] shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span>Hồ Sơ Cán Bộ</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => { setView('login'); setLoginError(''); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                view === 'login'
                  ? 'bg-white text-[#a81c1c] shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Đăng Nhập
            </button>

            <button
              type="button"
              onClick={() => { setView('register'); setRegError(''); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                view === 'register'
                  ? 'bg-white text-[#a81c1c] shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Đăng Ký
            </button>
          </div>

          {currentUser && (
            <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Đang đăng nhập: <strong className="text-slate-800">{currentUser.fullName}</strong>
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
          
          {/* ================= VIEW 1: ĐĂNG NHẬP (LOGIN) ================= */}
          {view === 'login' && (
            <div className="space-y-4">
              
              {/* Method Selector: Cán bộ vs VNeID */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => { setLoginMethod('credentials'); setLoginError(''); }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold text-center transition-all cursor-pointer ${
                    loginMethod === 'credentials'
                      ? 'bg-white text-[#a81c1c] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tài Khoản Cán Bộ
                </button>

                <button
                  type="button"
                  onClick={() => { setLoginMethod('vneid'); setLoginError(''); }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold text-center transition-all cursor-pointer ${
                    loginMethod === 'vneid'
                      ? 'bg-[#a81c1c] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Định Danh VNeID
                </button>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                  {loginError}
                </div>
              )}

              {/* Login Method A: Standard Credentials */}
              {loginMethod === 'credentials' && (
                <form onSubmit={handleCredentialsLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tên đăng nhập / Email công vụ / Mã cán bộ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={loginUsername}
                      onChange={e => setLoginUsername(e.target.value)}
                      placeholder=""
                      className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-[#a81c1c] rounded-xl outline-hidden focus:ring-2 focus:ring-red-100 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        Mật khẩu bảo mật <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => { setView('forgot'); setLoginError(''); }}
                        className="text-[11px] text-[#a81c1c] hover:underline font-semibold cursor-pointer"
                      >
                        Quên mật khẩu?
                      </button>
                    </div>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder=""
                      className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-[#a81c1c] rounded-xl outline-hidden focus:ring-2 focus:ring-red-100 transition-all font-medium"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={loginRemember}
                        onChange={e => setLoginRemember(e.target.checked)}
                        className="rounded text-[#a81c1c] focus:ring-red-500"
                      />
                      <span>Ghi nhớ phiên làm việc trên máy này</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-[#a81c1c] hover:bg-red-800 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Đang xác thực thông tin...' : 'Đăng Nhập Ca Trực'}
                  </button>
                </form>
              )}

              {/* Login Method B: VNeID QR & CCCD */}
              {loginMethod === 'vneid' && (
                <div className="space-y-4">
                  {/* VNeID Mode Switcher */}
                  <div className="flex items-center justify-center gap-2 border-b border-slate-200 pb-2.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setVneidMode('qr')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        vneidMode === 'qr'
                          ? 'bg-red-50 text-[#a81c1c] border border-red-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Quét Mã QR VNeID
                    </button>
                    <button
                      type="button"
                      onClick={() => setVneidMode('cccd')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        vneidMode === 'cccd'
                          ? 'bg-red-50 text-[#a81c1c] border border-red-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Số CCCD & Mã OTP
                    </button>
                  </div>

                  {/* Mode 1: QR Code Scanner Simulation */}
                  {vneidMode === 'qr' && (
                    <div className="space-y-3 text-center">
                      <div className="p-3 bg-red-50/70 rounded-xl border border-red-200 text-center">
                        <h3 className="font-extrabold text-xs text-red-950">Định Danh Điện Tử Quốc Gia VNeID (Mức 2)</h3>
                        <p className="text-[11px] text-slate-600 mt-1">
                          Mở ứng dụng <strong>VNeID</strong> trên điện thoại thông minh và thực hiện quét mã QR bảo mật dưới đây để đăng nhập tức thì.
                        </p>
                      </div>

                      {/* QR Display Frame */}
                      <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-red-300 max-w-xs mx-auto flex flex-col items-center">
                        <div className="relative w-44 h-44 bg-white p-3 rounded-xl shadow-md border border-slate-200 flex items-center justify-center">
                          {/* Mock Visual QR Matrix */}
                          <div className="w-full h-full bg-slate-900 rounded-lg p-2 flex flex-col justify-between">
                            <div className="flex justify-between">
                              <div className="w-8 h-8 bg-white rounded border-2 border-red-600 flex items-center justify-center">
                                <div className="w-3 h-3 bg-slate-900 rounded-xs"></div>
                              </div>
                              <div className="w-8 h-8 bg-white rounded border-2 border-red-600 flex items-center justify-center">
                                <div className="w-3 h-3 bg-slate-900 rounded-xs"></div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-center my-auto">
                              <div className="w-10 h-10 rounded-full bg-red-700 text-amber-300 flex items-center justify-center border-2 border-amber-300 shadow-sm text-xs font-black">
                                VNeID
                              </div>
                            </div>

                            <div className="flex justify-between">
                              <div className="w-8 h-8 bg-white rounded border-2 border-red-600 flex items-center justify-center">
                                <div className="w-3 h-3 bg-slate-900 rounded-xs"></div>
                              </div>
                              <div className="grid grid-cols-3 gap-0.5 w-8 h-8">
                                {Array.from({ length: 9 }).map((_, i) => (
                                  <div key={i} className={`rounded-xs ${i % 2 === 0 ? 'bg-amber-400' : 'bg-white'}`}></div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-2.5 text-[11px] text-slate-600 flex items-center justify-center gap-1.5">
                          <span>Mã QR tự làm mới sau:</span>
                          <span className="font-bold text-[#a81c1c]">{vneidQrTimeLeft}s</span>
                        </div>
                      </div>

                      {/* Fast Simulate Action Button */}
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleSimulateVNeIDQRScan}
                        className="w-full py-2.5 bg-[#a81c1c] hover:bg-red-800 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                      >
                        {isSubmitting ? 'Đang kiểm tra xác thực VNeID...' : 'Mô Phỏng Quét QR từ App VNeID'}
                      </button>
                    </div>
                  )}

                  {/* Mode 2: CCCD & OTP */}
                  {vneidMode === 'cccd' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-red-50/70 rounded-xl border border-red-200 text-center">
                        <h3 className="font-extrabold text-xs text-red-950">Xác thực qua Số CCCD & Mã OTP VNeID</h3>
                        <p className="text-[11px] text-slate-600 mt-1">
                          Nhập đúng 12 chữ số CCCD để nhận mã OTP gửi về ứng dụng VNeID đã kích hoạt mức 2.
                        </p>
                      </div>

                      {!vneidOtpSent ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Số CCCD / Mã định danh cá nhân 12 số <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              maxLength={12}
                              value={vneidIdCard}
                              onChange={e => setVneidIdCard(e.target.value.replace(/\D/g, ''))}
                              placeholder=""
                              className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-red-700 rounded-xl outline-hidden focus:ring-2 focus:ring-red-100"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={handleSendVNeIDOtp}
                            className="w-full py-2.5 bg-[#a81c1c] hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer"
                          >
                            Gửi Mã OTP Xác Thực VNeID
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleVNeIDVerify} className="space-y-3 animate-in fade-in">
                          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center justify-between">
                            <span>Đã gửi mã OTP tới ứng dụng VNeID</span>
                            <span className="font-bold">({vneidCountdown}s)</span>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Nhập mã OTP 6 số <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              maxLength={6}
                              value={vneidOtp}
                              onChange={e => setVneidOtp(e.target.value.replace(/\D/g, ''))}
                              placeholder=""
                              className="w-full px-3 py-2 text-base font-bold text-center tracking-widest bg-slate-50 focus:bg-white border border-slate-300 focus:border-emerald-600 rounded-xl outline-hidden"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer"
                          >
                            {isSubmitting ? 'Đang kiểm tra dữ liệu công dân...' : 'Xác Nhận & Đăng Nhập VNeID'}
                          </button>
                        </form>
                      )}
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* ================= VIEW 2: ĐĂNG KÝ (REGISTER) ================= */}
          {view === 'register' && (
            <div className="space-y-4">
              
              {regSuccess ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 animate-in fade-in">
                  <h3 className="font-black text-sm text-emerald-900">Đăng Ký Tài Khoản Cán Bộ Thành Công!</h3>
                  <p className="text-xs text-emerald-700">
                    Hệ thống đã tự động cấp mã định danh cán bộ và đăng nhập vào ca trực của bạn.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  
                  {regError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                      {regError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Họ và tên cán bộ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={regFullName}
                        onChange={e => setRegFullName(e.target.value)}
                        placeholder=""
                        className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-[#a81c1c] rounded-xl outline-hidden focus:ring-2 focus:ring-red-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tên đăng nhập (Username) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={regUsername}
                        onChange={e => setRegUsername(e.target.value)}
                        placeholder=""
                        className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-[#a81c1c] rounded-xl outline-hidden focus:ring-2 focus:ring-red-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email công vụ / liên hệ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder=""
                        className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-[#a81c1c] rounded-xl outline-hidden focus:ring-2 focus:ring-red-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Số điện thoại di động (10 số) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={regPhone}
                        onChange={e => setRegPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder=""
                        className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-[#a81c1c] rounded-xl outline-hidden focus:ring-2 focus:ring-red-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Số CCCD (12 số) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={12}
                        value={regIdCard}
                        onChange={e => setRegIdCard(e.target.value.replace(/\D/g, ''))}
                        placeholder=""
                        className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-[#a81c1c] rounded-xl outline-hidden focus:ring-2 focus:ring-red-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Vai trò / Phân quyền hệ thống <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={regRole}
                        onChange={e => {
                          const r = e.target.value as UserRole;
                          setRegRole(r);
                          if (r === 'team_lead') setRegTitle('Trưởng ca Tiếp nhận TTHC');
                          else if (r === 'admin') setRegTitle('Quản trị viên Hệ thống CNTT');
                          else if (r === 'receptionist') setRegTitle('Tiếp nhận viên Tổng đài');
                          else setRegTitle('Chuyên viên Thụ lý TTHC');
                        }}
                        className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-[#a81c1c] rounded-xl outline-hidden font-medium"
                      >
                        <option value="officer">Chuyên viên thụ lý hồ sơ (Officer)</option>
                        <option value="team_lead">Trưởng ca tiếp nhận Một Cửa (Team Lead)</option>
                        <option value="receptionist">Tiếp nhận viên Đa kênh / Tổng đài (Receptionist)</option>
                        <option value="admin">Quản trị viên hệ thống (Admin)</option>
                      </select>
                    </div>
                  </div>

                  {/* Role explanation banner */}
                  <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-600">
                    <span className="font-bold text-slate-800">Quyền hạn vai trò: </span>
                    <span>{ROLE_CONFIGS[regRole]?.description || 'Tiếp nhận và xử lý hồ sơ hành chính.'}</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Đơn vị / Phòng ban công tác
                    </label>
                    <select
                      value={regDepartment}
                      onChange={e => setRegDepartment(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-[#a81c1c] rounded-xl outline-hidden"
                    >
                      <option value="Bộ phận Tiếp nhận & Trả kết quả (Một Cửa)">Bộ phận Tiếp nhận & Trả kết quả (Một Cửa)</option>
                      <option value="Chi nhánh Văn phòng Đăng ký Đất đai">Chi nhánh Văn phòng Đăng ký Đất đai</option>
                      <option value="Phòng Đăng ký kinh doanh - Sở KH&ĐT">Phòng Đăng ký kinh doanh - Sở KH&ĐT</option>
                      <option value="Phòng Quản lý Đô thị & Xây dựng">Phòng Quản lý Đô thị & Xây dựng</option>
                      <option value="Tổ Tiếp nhận Đa kênh & Hotline 1022">Tổ Tiếp nhận Đa kênh & Hotline 1022</option>
                      <option value="Trung tâm Chuyển đổi số & Dịch vụ công">Trung tâm Chuyển đổi số & Dịch vụ công</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mật khẩu đăng nhập <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        placeholder=""
                        className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-[#a81c1c] rounded-xl outline-hidden focus:ring-2 focus:ring-red-100"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        Gồm chữ in hoa, in thường, ký tự đặc biệt, số và tối thiểu 6 ký tự.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Xác nhận mật khẩu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={regConfirmPassword}
                        onChange={e => setRegConfirmPassword(e.target.value)}
                        placeholder=""
                        className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-[#a81c1c] rounded-xl outline-hidden focus:ring-2 focus:ring-red-100"
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={regAgreed}
                        onChange={e => setRegAgreed(e.target.checked)}
                        className="mt-0.5 rounded text-[#a81c1c] focus:ring-red-500"
                      />
                      <span>
                        Tôi cam kết tuân thủ đúng <strong>Quy chế An toàn Thông tin</strong> và <strong>Bảo mật Dữ liệu Hành chính</strong> của cơ quan nhà nước.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-[#a81c1c] hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
                  </button>

                  <div className="text-center text-xs text-slate-500 pt-1">
                    Đã có tài khoản?{' '}
                    <button
                      type="button"
                      onClick={() => { setView('login'); setLoginError(''); }}
                      className="text-[#a81c1c] font-bold hover:underline cursor-pointer"
                    >
                      Đăng nhập ngay
                    </button>
                  </div>

                </form>
              )}

            </div>
          )}

          {/* ================= VIEW 3: QUÊN MẬT KHẨU (FORGOT PASSWORD) ================= */}
          {view === 'forgot' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="font-extrabold text-sm text-slate-800">Khôi Phục Mật Khẩu Truy Cập</h3>
                <p className="text-xs text-slate-500">
                  Nhập Email công vụ hoặc Mã số CCCD để nhận mã xác thực OTP cấp lại mật khẩu.
                </p>
              </div>

              {forgotSuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-1 animate-in fade-in">
                  <div className="font-bold text-xs text-emerald-900">Đã đổi mật khẩu thành công!</div>
                  <div className="text-[11px] text-emerald-700">Đang chuyển về màn hình đăng nhập...</div>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-3.5">
                  {!forgotOtpSent ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email công vụ / Số CCCD <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={forgotInput}
                        onChange={e => setForgotInput(e.target.value)}
                        placeholder=""
                        className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-[#a81c1c] rounded-xl outline-hidden focus:ring-2 focus:ring-red-100"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3 animate-in fade-in">
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-center justify-between">
                        <span>Đã gửi mã OTP đến: <strong>{forgotInput}</strong></span>
                        <span className="text-emerald-700 font-bold">Mã mẫu: 654321</span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Mã xác thực OTP 6 số <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={forgotOtp}
                          onChange={e => setForgotOtp(e.target.value)}
                          placeholder=""
                          className="w-full px-3 py-2 text-center text-sm font-bold tracking-widest bg-slate-50 border border-slate-300 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Mật khẩu mới <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          required
                          value={forgotNewPassword}
                          onChange={e => setForgotNewPassword(e.target.value)}
                          placeholder=""
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#a81c1c] hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer"
                  >
                    {!forgotOtpSent ? 'Gửi Mã Xác Thực OTP' : 'Đổi Mật Khẩu & Hoàn Tất'}
                  </button>

                  <div className="text-center text-xs text-slate-500 pt-1">
                    <button
                      type="button"
                      onClick={() => setView('login')}
                      className="text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                    >
                      Quay lại Đăng nhập
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ================= VIEW 4: HỒ SƠ CÁ NHÂN (PROFILE) ================= */}
          {view === 'profile' && currentUser && (
            <form onSubmit={handleProfileSave} className="space-y-3.5">
              {profileMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs animate-in fade-in">
                  {profileMessage}
                </div>
              )}

              {/* Profile Avatar Header */}
              <div className="p-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-[#7a1212] rounded-2xl text-white flex items-center gap-3.5 shadow-sm">
                <div className={`w-14 h-14 rounded-full bg-gradient-to-tr ${currentUser.avatarColor || 'from-[#a81c1c] to-red-700'} border-2 border-amber-400 flex items-center justify-center text-white font-black text-xl shadow-md shrink-0`}>
                  {currentUser.avatarInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-sm text-white truncate">{currentUser.fullName}</h3>
                    {currentUser.isVNeIDVerified && (
                      <span className="text-[10px] bg-red-600 text-amber-200 px-1.5 py-0.2 rounded font-bold border border-amber-400/40">
                        VNeID Mức 2
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-amber-300 font-medium truncate mt-0.5">{currentUser.title}</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Mã số cán bộ: <strong>{currentUser.badgeNumber}</strong> | Vai trò: <strong>{ROLE_CONFIGS[currentUser.role]?.shortLabel || currentUser.role}</strong>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Họ và tên cán bộ
                  </label>
                  <input
                    type="text"
                    required
                    value={profileFullName}
                    onChange={e => setProfileFullName(e.target.value)}
                    placeholder=""
                    className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-[#a81c1c] rounded-xl outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email công vụ
                  </label>
                  <input
                    type="email"
                    required
                    value={profileEmail}
                    onChange={e => setProfileEmail(e.target.value)}
                    placeholder=""
                    className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-[#a81c1c] rounded-xl outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={e => setProfilePhone(e.target.value)}
                    placeholder=""
                    className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-[#a81c1c] rounded-xl outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Trạng thái làm việc
                  </label>
                  <select
                    value={profileStatus}
                    onChange={e => setProfileStatus(e.target.value as 'available' | 'busy' | 'away')}
                    className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-[#a81c1c] rounded-xl outline-hidden font-medium"
                  >
                    <option value="available">Sẵn sàng tiếp nhận hồ sơ</option>
                    <option value="busy">Đang bận xử lý hồ sơ</option>
                    <option value="away">Tạm vắng / Nghỉ giữa ca</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Chức danh nghiệp vụ
                  </label>
                  <input
                    type="text"
                    value={profileTitle}
                    onChange={e => setProfileTitle(e.target.value)}
                    placeholder=""
                    className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-[#a81c1c] rounded-xl outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Đơn vị / Phòng ban
                  </label>
                  <input
                    type="text"
                    value={profileDepartment}
                    onChange={e => setProfileDepartment(e.target.value)}
                    placeholder=""
                    className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-[#a81c1c] rounded-xl outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#a81c1c] hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          )}

          {/* ----- CHANNELS VIEW ----- */}
          {view === 'channels' && (
            <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4 bg-slate-50">
              <div className="text-center mb-4">
                <h2 className="text-lg font-black text-slate-800">Quản lý Kênh Liên Lạc</h2>
                <p className="text-xs text-slate-500 mt-1">Kết nối các mạng xã hội và kênh tiếp nhận để quản lý đồng bộ</p>
              </div>

              <div className="space-y-3">
                {/* DVC */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                      
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Cổng Dịch Vụ Công</h4>
                      <p className="text-[10px] text-slate-500">Mặc định của hệ thống</p>
                    </div>
                  </div>
                  <div>
                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                       Đã kết nối
                    </span>
                  </div>
                </div>

                {/* Zalo OA */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Zalo Official Account</h4>
                      <p className="text-[10px] text-slate-500">Tiếp nhận chat từ người dân qua Zalo</p>
                    </div>
                  </div>
                  <div>
                    {zaloConnected ? (
                      <button onClick={() => setZaloConnected(false)} className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors">
                        Ngắt kết nối
                      </button>
                    ) : (
                      <button onClick={() => setZaloConnected(true)} className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-1.5">
                         Kết nối
                      </button>
                    )}
                  </div>
                </div>

                {/* Facebook Fanpage */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                      
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Facebook Fanpage</h4>
                      <p className="text-[10px] text-slate-500">Tiếp nhận tin nhắn Messenger</p>
                    </div>
                  </div>
                  <div>
                    {fbConnected ? (
                      <button onClick={() => setFbConnected(false)} className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors">
                        Ngắt kết nối
                      </button>
                    ) : (
                      <button onClick={() => setFbConnected(true)} className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors flex items-center gap-1.5">
                         Kết nối
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
