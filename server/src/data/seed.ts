import { TicketItem, AfterHoursRule, NightShiftLog, FAQItem, CannedSnippet, BroadcastCampaign, BroadcastReply, AppNotification, UserProfile } from '../models/domain.js';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-001',
    username: 'tam.le',
    fullName: 'Lê Minh Tâm',
    email: 'tam.le@chinhphu.gov.vn',
    phone: '0912 345 678',
    idCard: '001092008821',
    role: 'team_lead',
    title: 'Trưởng ca Tiếp nhận TTHC',
    department: 'Bộ phận Tiếp nhận & Trả kết quả (Một Cửa)',
    badgeNumber: 'CB-8821',
    avatarInitials: 'MT',
    avatarColor: 'from-[#a81c1c] to-red-700',
    status: 'available',
    createdAt: '01/01/2024',
    lastLogin: 'Hôm nay lúc 07:45',
    isVNeIDVerified: true
  },
  {
    id: 'user-002',
    username: 'hung.nguyen',
    fullName: 'Nguyễn Văn Hùng',
    email: 'hung.nguyen@chinhphu.gov.vn',
    phone: '0983 456 789',
    idCard: '001089004512',
    role: 'officer',
    title: 'Chuyên viên Thụ lý Đất đai',
    department: 'Chi nhánh Văn phòng Đăng ký Đất đai',
    badgeNumber: 'CB-4512',
    avatarInitials: 'VH',
    avatarColor: 'from-blue-700 to-indigo-800',
    status: 'available',
    createdAt: '15/03/2024',
    lastLogin: 'Hôm nay lúc 08:00',
    isVNeIDVerified: true
  },
  {
    id: 'user-003',
    username: 'mai.tran',
    fullName: 'Trần Thị Mai',
    email: 'mai.tran@govtech.gov.vn',
    phone: '0909 888 777',
    idCard: '079195009988',
    role: 'admin',
    title: 'Quản trị viên Hệ thống CNTT',
    department: 'Trung tâm Chuyển đổi số & Dịch vụ công',
    badgeNumber: 'AD-0001',
    avatarInitials: 'TM',
    avatarColor: 'from-emerald-700 to-teal-900',
    status: 'available',
    createdAt: '10/10/2023',
    lastLogin: 'Hôm nay lúc 07:30',
    isVNeIDVerified: true
  },
  {
    id: 'user-004',
    username: 'ha.pham',
    fullName: 'Phạm Thu Hà',
    email: 'ha.pham@chinhphu.gov.vn',
    phone: '0934 112 233',
    idCard: '038198006655',
    role: 'receptionist',
    title: 'Tiếp nhận viên Tổng đài 1022',
    department: 'Tổ Tiếp nhận Đa kênh & Hotline 1022',
    badgeNumber: 'CB-6655',
    avatarInitials: 'TH',
    avatarColor: 'from-amber-600 to-orange-800',
    status: 'busy',
    createdAt: '01/06/2024',
    lastLogin: 'Hôm nay lúc 08:10',
    isVNeIDVerified: true
  }
];

export const INITIAL_TICKETS: TicketItem[] = [
  {
    id: 'REQ-2026-8821',
    citizenName: 'Hoàng Minh Quân',
    phone: '0988 123 456',
    email: 'quan.hoang@gmail.com',
    channel: 'zalo',
    channelName: 'Zalo Official Account',
    category: 'Đất đai & Nhà ở',
    urgency: 'urgent',
    status: 'pending',
    createdAt: '10 phút trước',
    updatedAt: '10 phút trước',
    assignedOfficer: 'Lê Minh Tâm',
    lastMessage: 'Tôi cần xin trích lục bản đồ địa chính gấp trong sáng nay để kịp công chứng hợp đồng mua bán nhà đất tại VP Đăng ký đất đai.',
    unreadCount: 1,
    tags: ['Trích lục đất đai', 'Khẩn cấp', 'Zalo OA'],
    slaDeadlineMinutes: 120,
    aiAnalysis: {
      summary: 'Công dân yêu cầu cấp trích lục bản đồ địa chính khẩn trong buổi sáng để kịp làm thủ tục công chứng chuyển nhượng.',
      category: 'Đất đai (Trích lục thửa đất)',
      intent: 'Yêu cầu cấp trích lục bản đồ địa chính',
      urgencyReason: 'Có lịch hẹn công chứng giao dịch bất động sản trong ngày.',
      lawCitation: 'Điều 120 Luật Đất đai 2024 & Thông tư 25/2014/TT-BTNMT.',
      suggestedReply: 'Kính gửi Ông Hoàng Minh Quân, thủ tục trích lục thửa đất có thể nộp trực tuyến qua Cổng DVC hoặc tiếp nhận trực tiếp tại Quầy Đất đai. Bộ phận Tiếp nhận Một cửa có thể hỗ trợ xuất bản trích lục số hóa có chữ ký số trong vòng 02 giờ làm việc.',
      confidenceScore: 96,
      autoResolvable: true
    },
    internalNote: 'Đã báo bộ phận VP Đăng ký đất đai trích xuất dữ liệu địa chính số.',
    conversation: [
      {
        id: 'msg-1',
        sender: 'citizen',
        senderName: 'Hoàng Minh Quân',
        text: 'Chào cán bộ, tôi là chủ thửa đất số 45 tờ bản đồ số 12 phường Tân Phú.',
        time: '08:15'
      },
      {
        id: 'msg-2',
        sender: 'citizen',
        senderName: 'Hoàng Minh Quân',
        text: 'Tôi cần xin trích lục bản đồ địa chính gấp trong sáng nay để kịp công chứng hợp đồng mua bán nhà đất tại VP Đăng ký đất đai. Thủ tục cần những gì ạ?',
        time: '08:18'
      }
    ]
  },
  {
    id: 'REQ-2026-8819',
    citizenName: 'Công ty TNHH Smart Logistics',
    phone: '0903 889 911',
    email: 'admin@smartlogistics.vn',
    channel: 'dvc',
    channelName: 'Cổng Dịch Vụ Công Quốc Gia',
    category: 'Đăng ký kinh doanh',
    urgency: 'normal',
    status: 'processing',
    createdAt: '35 phút trước',
    updatedAt: '20 phút trước',
    assignedOfficer: 'Trần Thảo Vy',
    lastMessage: 'Hồ sơ thay đổi ngành nghề kinh doanh mã số thuế 0317892233 đã nộp trực tuyến 3 ngày trước, xin kiểm tra tiến độ duyệt chữ ký số.',
    tags: ['ĐKKD', 'Chữ ký số', 'Cổng DVC'],
    slaDeadlineMinutes: 240,
    aiAnalysis: {
      summary: 'Doanh nghiệp hỏi tiến độ thẩm định hồ sơ thay đổi nội dung ĐKKD đã nộp qua cổng DVC trực tuyến.',
      category: 'Đăng ký kinh doanh trực tuyến',
      intent: 'Tra cứu tiến độ hồ sơ doanh nghiệp',
      urgencyReason: 'Hồ sơ đang trong quy trình xử lý 03 ngày làm việc theo luật định.',
      lawCitation: 'Nghị định 01/2021/NĐ-CP về đăng ký doanh nghiệp.',
      suggestedReply: 'Kính gửi Quý Doanh nghiệp, hồ sơ mã 0317892233 đã được chuyên viên Phòng ĐKKD hoàn tất thẩm định hợp lệ và đang trình Lãnh đạo ký số phê duyệt. Kết quả sẽ tự động gửi về email của doanh nghiệp trước 17h00 hôm nay.',
      confidenceScore: 98,
      autoResolvable: true
    },
    internalNote: 'Đã qua vòng kiểm tra chuyên viên, đang đợi trưởng phòng ký duyệt token.',
    conversation: [
      {
        id: 'msg-3',
        sender: 'citizen',
        senderName: 'Smart Logistics Rep',
        text: 'Hồ sơ thay đổi ngành nghề kinh doanh mã số thuế 0317892233 đã nộp trực tuyến 3 ngày trước, xin kiểm tra tiến độ duyệt chữ ký số.',
        time: '07:50'
      },
      {
        id: 'msg-4',
        sender: 'officer',
        senderName: 'Trần Thảo Vy (Cán bộ)',
        text: 'Chào Quý công ty, chuyên viên đang kiểm tra lại mã hồ sơ trên hệ thống xử lý nội bộ.',
        time: '08:05'
      }
    ]
  },
  {
    id: 'REQ-2026-8815',
    citizenName: 'Phan Thu Hà',
    phone: '0971 445 678',
    channel: 'facebook',
    channelName: 'Facebook Fanpage DVC',
    category: 'Căn cước & Cư trú',
    urgency: 'normal',
    status: 'auto_resolved',
    createdAt: '1 giờ trước',
    updatedAt: '58 phút trước',
    assignedOfficer: 'AI Night-Shift Bot',
    lastMessage: 'Chào cán bộ, bé nhà em 8 tuổi thì làm thẻ Căn cước mới cần đem theo giấy tờ gì và có phải lấy vân tay không ạ?',
    resolutionType: 'ai_auto',
    tags: ['Căn cước trẻ em', 'Tự động giải quyết', 'Fanpage'],
    aiAnalysis: {
      summary: 'Công dân hỏi thủ tục cấp thẻ Căn cước cho trẻ em 8 tuổi theo Luật Căn cước 2023.',
      category: 'Căn cước công dân cho trẻ em',
      intent: 'Hỏi thủ tục cấp Căn cước trẻ em 6-14 tuổi',
      urgencyReason: 'Hướng dẫn chuẩn bị hồ sơ tiêu chuẩn.',
      lawCitation: 'Khoản 2 Điều 19 & Điều 23 Luật Căn cước số 26/2023/QH15.',
      suggestedReply: 'Chào bạn Thu Hà, theo Luật Căn cước 2023, trẻ em từ 6 đến dưới 14 tuổi khi làm thẻ Căn cước cần có cha/mẹ/người đại diện hợp pháp đi cùng để thực hiện thủ tục. KHÔNG bắt buộc thu nhận vân tay và mống mắt nếu phụ huynh không có yêu cầu.',
      confidenceScore: 99,
      autoResolvable: true
    },
    conversation: [
      {
        id: 'msg-5',
        sender: 'citizen',
        senderName: 'Phan Thu Hà',
        text: 'Chào cán bộ, bé nhà em 8 tuổi thì làm thẻ Căn cước mới cần đem theo giấy tờ gì và có phải lấy vân tay không ạ?',
        time: '07:20'
      },
      {
        id: 'msg-6',
        sender: 'ai_bot',
        senderName: 'Trợ Lý AI Tự Động',
        text: 'Chào bạn Thu Hà! Theo Luật Căn cước 2023 có hiệu lực: Trẻ em từ 6 đến dưới 14 tuổi khi làm Căn cước chỉ cần cha/mẹ/người đại diện hợp pháp đưa đến Công an cấp huyện hoặc nộp kê khai trước trên VNeID. Hệ thống KHÔNG bắt buộc thu nhận vân tay, ảnh mống mắt (chỉ thu nhận ảnh chân dung). Lệ phí: Miễn phí cấp lần đầu.',
        time: '07:21'
      }
    ]
  },
  {
    id: 'REQ-2026-8804',
    citizenName: 'Trịnh Đình Dũng',
    phone: '0912 678 901',
    channel: 'hotline',
    channelName: 'Tổng Đài 1022',
    category: 'Hộ tịch & Khai sinh',
    urgency: 'urgent',
    status: 'scheduled_callback',
    createdAt: 'Hôm qua, 22:40 (Ngoài giờ)',
    updatedAt: 'Hôm nay, 08:00',
    assignedOfficer: 'Nguyễn Văn Hùng',
    lastMessage: 'Tôi không thể đăng nhập được VNeID mức 2 để làm liên thông Đăng ký khai sinh và BHYT cho con mới sinh.',
    resolutionType: 'after_hours_bot',
    tags: ['Ngoài giờ 24/7', 'Hẹn gọi lại', 'Liên thông DVC'],
    aiAnalysis: {
      summary: 'Công dân gặp sự cố đăng nhập VNeID mức 2 khi làm dịch vụ công liên thông Đăng ký khai sinh và BHYT lúc nửa đêm.',
      category: 'Dịch vụ công liên thông Đề án 06',
      intent: 'Hỗ trợ sự cố VNeID dịch vụ công liên thông',
      urgencyReason: 'Cần làm giấy khai sinh và thẻ BHYT sơ sinh cho trẻ trong thời hạn 60 ngày.',
      lawCitation: 'Nghị định 63/2024/NĐ-CP về dịch vụ công liên thông.',
      suggestedReply: 'Chào Ông Dũng, hệ thống Trực Ngoài Giờ đã tạo lịch hẹn gọi lại lúc 08h30 sáng nay. Cán bộ Hộ tịch sẽ hướng dẫn trực tiếp qua số 0912678901 và hỗ trợ tiếp nhận dự phòng.',
      confidenceScore: 94,
      autoResolvable: false
    },
    internalNote: 'Đã hẹn cán bộ Hùng gọi lại trước 09h00 sáng.',
    conversation: [
      {
        id: 'msg-7',
        sender: 'citizen',
        text: 'Tôi không thể đăng nhập được VNeID mức 2 để làm liên thông Đăng ký khai sinh và BHYT cho con mới sinh lúc 22h đêm.',
        time: '22:40'
      },
      {
        id: 'msg-8',
        sender: 'ai_bot',
        senderName: 'Hệ Thống Trực Ngoài Giờ 24/7',
        text: 'Kính chào Ông Trịnh Đình Dũng, hiện tại ngoài giờ hành chính. Hệ thống tự động ghi nhận sự cố mã #REQ-2026-8804 và đã đặt lịch cho Cán bộ Hộ tịch liên hệ hỗ trợ trực tiếp vào 08h30 sáng nay.',
        time: '22:41'
      }
    ]
  },
  {
    id: 'REQ-2026-8798',
    citizenName: 'Bà Nguyễn Thị Mai Lan',
    phone: '0938 776 543',
    email: 'mailan.law@gmail.com',
    channel: 'email',
    channelName: 'Hòm thư điện tử Công DVC',
    category: 'Xây dựng & Quy hoạch',
    urgency: 'high',
    status: 'pending',
    createdAt: 'Hôm qua, 18:15',
    updatedAt: 'Hôm qua, 18:15',
    assignedOfficer: 'Lê Minh Tâm',
    lastMessage: 'Gửi hồ sơ thẩm định xin phép xây dựng nhà ở riêng lẻ tại số 120 đường Nguyễn Trãi, xin hỏi thời hạn thụ lý hồ sơ.',
    tags: ['GPXD', 'Email DVC', 'Thẩm định'],
    slaDeadlineMinutes: 360,
    aiAnalysis: {
      summary: 'Công dân gửi email hỏi thời hạn và quy trình thụ lý cấp giấy phép xây dựng nhà ở đô thị.',
      category: 'Cấp phép xây dựng',
      intent: 'Hỏi quy trình cấp GPXD nhà ở riêng lẻ',
      urgencyReason: 'Hồ sơ đã nộp file scan đính kèm.',
      lawCitation: 'Luật Xây dựng 2014 (sửa đổi 2020) & Nghị định 15/2021/NĐ-CP.',
      suggestedReply: 'Kính gửi Bà Nguyễn Thị Mai Lan, thời gian thẩm định và cấp Giấy phép xây dựng nhà ở riêng lẻ đô thị là không quá 15 ngày làm việc kể từ ngày nhận đủ hồ sơ hợp lệ. Bộ phận Tiếp nhận đã chuyển hồ sơ sang Phòng Quản lý Đô thị để kiểm tra thực địa.',
      confidenceScore: 97,
      autoResolvable: true
    },
    conversation: [
      {
        id: 'msg-9',
        sender: 'citizen',
        senderName: 'Nguyễn Thị Mai Lan',
        text: 'Kính gửi Bộ phận Một cửa, tôi đã gửi đầy đủ bản vẽ xin phép xây dựng qua email. Nhờ cán bộ phản hồi thời gian thụ lý.',
        time: '18:15'
      }
    ]
  }
];

export const INITIAL_AFTER_HOURS_RULES: AfterHoursRule[] = [
  {
    id: 'rule-night',
    title: 'Kịch bản Trực Ca Đêm & Ngoài Giờ Hành Chính',
    scheduleType: 'night_shift',
    activeTimeWindow: '17:00 - 07:30 (Thứ 2 đến Thứ 6)',
    autoReplyTemplate: 'Kính chào Quý công dân, hiện tại cơ quan đang ngoài giờ tiếp nhận trực tiếp. Trợ lý AI đang sẵn sàng giải đáp tự động thủ tục 24/7 hoặc tạo phiếu hẹn cán bộ liên hệ lại vào 08h00 sáng ngày làm việc tiếp theo.',
    createCallbackTicket: true,
    smsZaloConfirmation: true,
    aiBotEnabled: true,
    isActive: true
  },
  {
    id: 'rule-weekend',
    title: 'Kịch bản Cuối Tuần & Nghỉ Lễ Quốc Gia',
    scheduleType: 'weekend',
    activeTimeWindow: 'Thứ 7, Chủ Nhật & Các ngày Lễ Tết theo quy định',
    autoReplyTemplate: 'Chào Quý công dân, hệ thống Dịch vụ công trực tuyến vẫn mở tiếp nhận hồ sơ 24/7. Yêu cầu của bạn đã được lưu tự động và cán bộ trực ca đầu tuần sẽ thụ lý giải quyết.',
    createCallbackTicket: true,
    smsZaloConfirmation: true,
    aiBotEnabled: true,
    isActive: true
  },
  {
    id: 'rule-busy',
    title: 'Kịch bản Nhân sự vắng mặt / Giờ cao điểm quá tải',
    scheduleType: 'all_officers_busy',
    activeTimeWindow: 'Khi tất cả cán bộ quầy đang bận xử lý hồ sơ quá 15 phút',
    autoReplyTemplate: 'Hiện các chuyên viên đang phục vụ tiếp nhận trực tiếp tại quầy. Trợ lý AI đã ghi nhận câu hỏi của bạn và hệ thống sẽ gửi câu trả lời qua tin nhắn trong vòng 15 phút.',
    createCallbackTicket: true,
    smsZaloConfirmation: false,
    aiBotEnabled: true,
    isActive: true
  }
];

export const INITIAL_NIGHT_SHIFT_LOGS: NightShiftLog[] = [
  {
    id: 'NIGHT-901',
    citizenName: 'Trịnh Đình Dũng',
    phone: '0912 678 901',
    channel: 'hotline',
    receivedAt: '22:40 (Hôm qua)',
    questionSnippet: 'Không đăng nhập được VNeID làm khai sinh liên thông',
    actionTaken: 'scheduled_morning_callback',
    ticketCode: 'REQ-2026-8804',
    callbackAssignedTo: 'Nguyễn Văn Hùng',
    callbackTimeTarget: '08:30 Sáng nay',
    status: 'pending_morning'
  },
  {
    id: 'NIGHT-902',
    citizenName: 'Vũ Thị Thanh Thảo',
    phone: '0966 332 114',
    channel: 'zalo',
    receivedAt: '23:15 (Hôm qua)',
    questionSnippet: 'Thủ tục cấp đổi hộ chiếu phổ thông trực tuyến có cần gửi lại hộ chiếu cũ không?',
    actionTaken: 'ai_instant_answered',
    ticketCode: 'AUTO-2026-4412',
    callbackAssignedTo: 'AI Bot',
    callbackTimeTarget: 'Đã giải quyết tức thì',
    status: 'completed'
  },
  {
    id: 'NIGHT-903',
    citizenName: 'Đặng Quốc Bảo',
    phone: '0944 887 766',
    channel: 'facebook',
    receivedAt: '05:45 (Sáng nay)',
    questionSnippet: 'Biểu mẫu kê khai thuế trước bạ khi mua xe máy cũ',
    actionTaken: 'ai_instant_answered',
    ticketCode: 'AUTO-2026-4413',
    callbackAssignedTo: 'AI Bot',
    callbackTimeTarget: 'Đã gửi file mẫu',
    status: 'completed'
  }
];

export const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    intentCode: 'INTENT_CAP_CAN_CUOC_2024',
    title: 'Cấp đổi, cấp lại thẻ Căn cước mới theo Luật 2023',
    category: 'Căn cước & Cư trú',
    sampleQuestions: [
      'Làm lại thẻ căn cước bị mất cần những giấy tờ gì?',
      'Thủ tục cấp căn cước cho trẻ em dưới 14 tuổi',
      'Đổi từ CCCD gắn chip sang thẻ Căn cước mới ở đâu?',
      'Lệ phí làm lại thẻ căn cước năm 2026'
    ],
    keywords: ['căn cước', 'cccd', 'mất cccd', 'làm lại căn cước', 'trẻ em', 'mống mắt', 'chip'],
    officialAnswer: 'Công dân có thể đăng ký lịch hẹn qua ứng dụng VNeID hoặc đến trực tiếp Công an cấp huyện/tỉnh. Hồ sơ gồm: Phiếu thu nhận thông tin (kê khai trên VNeID hoặc tại quầy), thẻ CCCD cũ (nếu có). Trẻ từ 6-14 tuổi cần có cha/mẹ đi cùng. Thời gian trả thẻ: Không quá 07 ngày làm việc.',
    legalBasis: 'Luật Căn cước số 26/2023/QH15 & Thông tư 16/2024/TT-BCA.',
    requiredDocuments: ['Phiếu thông tin căn cước (VNeID)', 'CCCD cũ (trường hợp cấp đổi)'],
    processingDays: '07 ngày làm việc',
    fee: 'Cấp mới: Miễn phí; Cấp lại do mất: 50.000 VNĐ',
    autoResolutionEnabled: true,
    usageCount: 412,
    accuracyRate: 99.4
  },
  {
    id: 'faq-2',
    intentCode: 'INTENT_SANG_TEN_SO_DO',
    title: 'Thủ tục Đăng ký sang tên chuyển nhượng Quyền sử dụng đất (Sổ đỏ)',
    category: 'Đất đai & Nhà ở',
    sampleQuestions: [
      'Thủ tục sang tên sổ đỏ mua bán nhà đất cần giấy tờ gì?',
      'Thời gian sang tên sổ hồng bao nhiêu ngày?',
      'Phí và thuế thu nhập cá nhân khi chuyển nhượng đất đai',
      'Nộp hồ sơ sang tên đất tại Chi nhánh VP Đăng ký đất đai'
    ],
    keywords: ['sổ đỏ', 'sổ hồng', 'sang tên đất', 'chuyển nhượng', 'thuế trước bạ', 'đất đai'],
    officialAnswer: 'Hồ sơ nộp tại Bộ phận Một cửa hoặc Cổng DVC gồm: Hợp đồng mua bán/tặng cho đã công chứng, Giấy chứng nhận QSD đất (bản gốc), Tờ khai thuế TNCN và Lệ phí trước bạ, Bản trích lục thửa đất. Thời gian giải quyết: 10 ngày làm việc (không tính thời gian thực hiện nghĩa vụ tài chính).',
    legalBasis: 'Luật Đất đai 2024, Nghị định 101/2024/NĐ-CP & Thông tư 25/2014/TT-BTNMT.',
    requiredDocuments: ['Hợp đồng công chứng', 'Sổ đỏ gốc', 'Tờ khai thuế TNCN & Lệ phí trước bạ', 'CCCD 2 bên'],
    processingDays: '10 ngày làm việc',
    fee: 'Thuế TNCN: 2%; Lệ phí trước bạ: 0.5%; Phí thẩm định hồ sơ: 500.000 VNĐ',
    autoResolutionEnabled: true,
    usageCount: 388,
    accuracyRate: 98.7
  },
  {
    id: 'faq-3',
    intentCode: 'INTENT_DANG_KY_KINH_DOANH_HO_CA_THE',
    title: 'Đăng ký thành lập Hộ kinh doanh cá thể trực tuyến',
    category: 'Đăng ký kinh doanh',
    sampleQuestions: [
      'Đăng ký hộ kinh doanh cá thể cần bao nhiêu vốn?',
      'Mở cửa hàng tạp hóa cần đăng ký giấy phép gì?',
      'Nộp hồ sơ hộ kinh doanh qua Cổng DVC cấp huyện',
      'Thời gian cấp giấy chứng nhận hộ kinh doanh'
    ],
    keywords: ['hộ kinh doanh', 'kinh doanh cá thể', 'mở tiệm', 'giấy phép kinh doanh', 'uỷ ban quận'],
    officialAnswer: 'Nộp hồ sơ trực tuyến qua Cổng DVC cấp huyện/thành phố hoặc trực tiếp tại Phòng Tài chính - Kế hoạch. Hồ sơ gồm: Giấy đề nghị đăng ký hộ kinh doanh, Bản sao Căn cước chủ hộ, Hợp đồng thuê mặt bằng/Sổ đỏ địa điểm kinh doanh. Thời hạn cấp phép: 03 ngày làm việc.',
    legalBasis: 'Nghị định 01/2021/NĐ-CP về đăng ký doanh nghiệp.',
    requiredDocuments: ['Giấy đề nghị ĐKKD', 'Bản sao CCCD', 'Hợp đồng thuê địa điểm/Sổ đỏ'],
    processingDays: '03 ngày làm việc',
    fee: '100.000 VNĐ / lần cấp',
    autoResolutionEnabled: true,
    usageCount: 295,
    accuracyRate: 99.1
  },
  {
    id: 'faq-4',
    intentCode: 'INTENT_DANG_KY_KET_HON',
    title: 'Đăng ký kết hôn trực tuyến trong nước & có yếu tố nước ngoài',
    category: 'Hộ tịch & Hôn nhân',
    sampleQuestions: [
      'Đăng ký kết hôn cần giấy xác nhận tình trạng hôn nhân không?',
      'Thủ tục làm giấy đăng ký kết hôn trực tuyến',
      'Đăng ký kết hôn với người nước ngoài cần chuẩn bị gì?'
    ],
    keywords: ['kết hôn', 'đăng ký kết hôn', 'giấy độc thân', 'tình trạng hôn nhân', 'hộ tịch'],
    officialAnswer: 'Đăng ký tại UBND cấp xã nơi cư trú của một trong hai bên. Hồ sơ gồm: Tờ khai đăng ký kết hôn, Giấy xác nhận tình trạng hôn nhân (nếu không cùng nơi thường trú hoặc hệ thống VNeID chưa liên thông dữ liệu), CCCD hai bên. Cả hai bên bắt buộc có mặt ký vào Sổ hộ tịch khi nhận Giấy chứng nhận.',
    legalBasis: 'Luật Hộ tịch 2014 & Nghị định 123/2015/NĐ-CP.',
    requiredDocuments: ['Tờ khai kết hôn', 'Giấy xác nhận tình trạng hôn nhân', 'CCCD 2 bên'],
    processingDays: 'Trong ngày làm việc (ngay sau khi nhận đủ hồ sơ)',
    fee: 'Miễn phí với công dân Việt Nam cư trú trong nước',
    autoResolutionEnabled: true,
    usageCount: 240,
    accuracyRate: 99.8
  }
];

export const INITIAL_CANNED_SNIPPETS: CannedSnippet[] = [
  {
    id: 'can-1',
    title: 'Hướng dẫn nộp hồ sơ trực tuyến qua VNeID',
    shortcut: '#vneid_guide',
    category: 'Thủ tục chung',
    content: 'Kính gửi Ông/Bà {ten_cong_dan}, để thực hiện thủ tục {ten_thu_tuc} trực tuyến nhanh chóng, vui lòng mở ứng dụng VNeID (định danh mức 2) -> chọn mục "Dịch vụ công" -> nhập mã thủ tục để nộp hồ sơ điện tử mà không cần đến quầy trực tiếp.',
    variables: ['{ten_cong_dan}', '{ten_thu_tuc}']
  },
  {
    id: 'can-2',
    title: 'Thông báo kết quả hồ sơ đã hoàn thành ký số',
    shortcut: '#ho_so_xong',
    category: 'Trả kết quả',
    content: 'Kính gửi Ông/Bà {ten_cong_dan}, hồ sơ mã số {ma_ho_so} đã được hoàn tất phê duyệt ký số điện tử. Bản kết quả điện tử đã được gửi về tài khoản DVC của Quý khách. Nếu cần nhận bản giấy, Quý khách vui lòng mang CCCD đến Quầy số {so_quay} trước ngày {ngay_hen}.',
    variables: ['{ten_cong_dan}', '{ma_ho_so}', '{so_quay}', '{ngay_hen}']
  },
  {
    id: 'can-3',
    title: 'Hẹn bổ sung hồ sơ còn thiếu',
    shortcut: '#bo_sung_hs',
    category: 'Thẩm định',
    content: 'Kính gửi Ông/Bà {ten_cong_dan}, qua thẩm định hồ sơ {ma_ho_so}, bộ phận Tiếp nhận thông báo Quý khách cần bổ sung thêm: {tai_lieu_thieu}. Quý khách có thể chụp ảnh tải bổ sung trực tiếp trên Cổng DVC hoặc gửi qua Zalo này trước 17h00 ngày {han_bo_sung}.',
    variables: ['{ten_cong_dan}', '{ma_ho_so}', '{tai_lieu_thieu}', '{han_bo_sung}']
  }
];

export const INITIAL_BROADCASTS: BroadcastCampaign[] = [
  {
    id: 'CAMP-2026-04',
    title: 'Thông báo áp dụng Bảng giá đất mới & Quy định thu phí cấp Giấy chứng nhận năm 2026',
    category: 'Chính sách & Pháp luật',
    targetGroup: 'Tất cả cá nhân & tổ chức có giao dịch đất đai trên địa bàn quận',
    recipientCount: 1450,
    channels: ['zalo', 'dvc', 'email'],
    scheduledAt: '25/08/2026 09:00',
    status: 'completed',
    contentSnippet: 'UBND Quận thông báo từ ngày 01/09/2026 sẽ chính thức áp dụng quy trình cấp đổi GCN quyền sử dụng đất số hóa theo Luật Đất đai mới, giảm 50% thời gian thụ lý.',
    deliveredCount: 1428,
    readCount: 1256,
    responseCount: 84,
    failedCount: 22,
    createdAt: '25/08/2026',
    senderOfficer: 'Lê Minh Tâm'
  },
  {
    id: 'CAMP-2026-03',
    title: 'Lịch tiếp công dân chuyên đề Giải quyết TTHC cấp Thẻ Căn Cước cho học sinh',
    category: 'Lịch làm việc & Tiếp dân',
    targetGroup: 'Phụ huynh có con từ 6-14 tuổi trên địa bàn 12 phường',
    recipientCount: 3200,
    channels: ['zalo', 'facebook', 'dvc'],
    scheduledAt: '20/08/2026 14:00',
    status: 'completed',
    contentSnippet: 'Công an Quận tổ chức cấp Căn cước lưu động tại các trường THCS và trụ sở UBND các phường vào thứ Bảy và Chủ nhật hàng tuần.',
    deliveredCount: 3180,
    readCount: 2890,
    responseCount: 142,
    failedCount: 20,
    createdAt: '20/08/2026',
    senderOfficer: 'Trần Thảo Vy'
  },
  {
    id: 'CAMP-2026-02',
    title: 'Cảnh báo nâng cấp hệ thống mạng và Cổng Dịch vụ công Quốc gia vào cuối tuần',
    category: 'Kỹ thuật & Cảnh báo',
    targetGroup: 'Doanh nghiệp và tổ chức có hồ sơ đang xử lý',
    recipientCount: 850,
    channels: ['email', 'dvc', 'zalo'],
    scheduledAt: '28/08/2026 20:00',
    status: 'scheduled',
    contentSnippet: 'Hệ thống hạ tầng số sẽ bảo trì định kỳ từ 22h00 thứ Bảy đến 04h00 Chủ nhật. Quý doanh nghiệp vui lòng chủ động nộp hồ sơ trước thời gian trên.',
    deliveredCount: 0,
    readCount: 0,
    responseCount: 0,
    failedCount: 0,
    createdAt: '26/08/2026',
    senderOfficer: 'Nguyễn Văn Hùng'
  }
];

export const INITIAL_BROADCAST_REPLIES: BroadcastReply[] = [
  {
    id: 'REP-01',
    campaignId: 'CAMP-2026-04',
    campaignTitle: 'Thông báo áp dụng Bảng giá đất mới 2026',
    citizenName: 'Ông Đỗ Quốc Tuấn',
    phone: '0908 112 334',
    channel: 'zalo',
    replyText: 'Cho tôi hỏi hồ sơ chuyển nhượng tôi nộp ngày 28/08 thì tính theo bảng giá cũ hay bảng giá mới vậy cán bộ?',
    receivedAt: '25/08/2026 10:14',
    status: 'routed_to_inbox',
    assignedOfficer: 'Lê Minh Tâm'
  },
  {
    id: 'REP-02',
    campaignId: 'CAMP-2026-03',
    campaignTitle: 'Lịch tiếp công dân cấp Thẻ Căn Cước cho học sinh',
    citizenName: 'Bà Mai Phương Thảo',
    phone: '0977 445 566',
    channel: 'zalo',
    replyText: 'Con tôi học trường THCS Lê Quý Đôn thì đăng ký làm căn cước vào ngày thứ 7 tuần này lúc mấy giờ?',
    receivedAt: '20/08/2026 15:30',
    status: 'replied',
    assignedOfficer: 'Trần Thảo Vy'
  },
  {
    id: 'REP-03',
    campaignId: 'CAMP-2026-04',
    campaignTitle: 'Thông báo áp dụng Bảng giá đất mới 2026',
    citizenName: 'Công ty XD An Thịnh',
    phone: '0918 554 998',
    channel: 'email',
    replyText: 'Đề nghị gửi file PDF quyết định ban hành bảng giá đất kèm biểu mẫu tờ khai thuế mới nhất.',
    receivedAt: '25/08/2026 11:20',
    status: 'new'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Hồ sơ khẩn cấp mới từ Zalo OA',
    message: 'Công dân Hoàng Minh Quân yêu cầu trích lục bản đồ địa chính gấp trong sáng nay.',
    time: '5 phút trước',
    type: 'urgent',
    isRead: false,
    targetTab: 'inbox',
    ticketId: 'REQ-2026-8821'
  },
  {
    id: 'notif-2',
    title: 'AI tự động hoàn tất tư vấn TTHC',
    message: 'Trợ lý AI vừa tự động tra cứu và phản hồi quy trình Cấp đổi GPLX trên Cổng DVC (Độ chính xác 98%).',
    time: '12 phút trước',
    type: 'bot',
    isRead: false,
    targetTab: 'inbox',
    ticketId: 'REQ-2026-8815'
  },
  {
    id: 'notif-3',
    title: 'Cảnh báo hạn xử lý SLA (Dưới 30 phút)',
    message: 'Hồ sơ #REQ-2026-8819 Đăng ký kinh doanh sắp tới hạn phản hồi theo quy định.',
    time: '25 phút trước',
    type: 'sla',
    isRead: false,
    targetTab: 'inbox',
    ticketId: 'REQ-2026-8819'
  },
  {
    id: 'notif-4',
    title: 'Báo cáo Ca trực Đêm hoàn tất',
    message: 'Đã tự động tiếp nhận 18 phản ánh ngoài giờ, 14 trường hợp AI giải đáp tức thì, 4 lịch hẹn gọi lại buổi sáng.',
    time: '07:30',
    type: 'system',
    isRead: true,
    targetTab: 'afterhours'
  },
  {
    id: 'notif-5',
    title: 'Chiến dịch Phát sóng hoàn thành',
    message: 'Chiến dịch "Bảng giá đất mới 2026" đã gửi thành công tới 14,200 công dân qua Zalo OA & SMS.',
    time: 'Hôm qua',
    type: 'system',
    isRead: true,
    targetTab: 'broadcast'
  }
];
