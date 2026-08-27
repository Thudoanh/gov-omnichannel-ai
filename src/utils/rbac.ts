import { UserProfile, UserRole, TabKey } from '../types';

export interface RoleConfig {
  name: string;
  shortLabel: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  allowedTabs: TabKey[];
  canReassignTicket: boolean;
  canManageAfterHours: boolean;
  canCreateBroadcast: boolean;
  canManageFAQ: boolean;
  canExportReports: boolean;
  canChangeSystemSound: boolean;
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  admin: {
    name: 'Quản trị viên Hệ thống (Admin)',
    shortLabel: 'Quản trị viên',
    description: 'Toàn quyền quản trị hệ thống, phân quyền cán bộ, cấu hình bot AI 24/7 và giám sát SLA toàn cơ quan.',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-300',
    allowedTabs: ['inbox', 'afterhours', 'faq', 'broadcast', 'analytics'],
    canReassignTicket: true,
    canManageAfterHours: true,
    canCreateBroadcast: true,
    canManageFAQ: true,
    canExportReports: true,
    canChangeSystemSound: true,
  },
  team_lead: {
    name: 'Trưởng ca Tiếp nhận TTHC (Team Lead)',
    shortLabel: 'Trưởng ca',
    description: 'Điều phối ca trực, phân công hồ sơ cho chuyên viên, duyệt phát thanh và theo dõi SLA ca trực.',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-800',
    badgeBorder: 'border-red-300',
    allowedTabs: ['inbox', 'afterhours', 'faq', 'broadcast', 'analytics'],
    canReassignTicket: true,
    canManageAfterHours: true,
    canCreateBroadcast: true,
    canManageFAQ: true,
    canExportReports: true,
    canChangeSystemSound: true,
  },
  officer: {
    name: 'Chuyên viên Thụ lý Hồ sơ (Officer)',
    shortLabel: 'Chuyên viên',
    description: 'Tiếp nhận, thụ lý và phản hồi hồ sơ được phân công, tra cứu CSDL thủ tục và phản hồi công dân.',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
    badgeBorder: 'border-blue-300',
    allowedTabs: ['inbox', 'faq', 'analytics'],
    canReassignTicket: false,
    canManageAfterHours: false,
    canCreateBroadcast: false,
    canManageFAQ: false,
    canExportReports: false,
    canChangeSystemSound: false,
  },
  receptionist: {
    name: 'Tiếp nhận viên Một Cửa / Hotline (Receptionist)',
    shortLabel: 'Tiếp nhận viên',
    description: 'Tiếp nhận ban đầu từ Zalo, Hotline, DVC, phân loại hồ sơ sơ bộ và gửi thông báo tiếp nhận.',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-300',
    allowedTabs: ['inbox', 'faq', 'broadcast'],
    canReassignTicket: false,
    canManageAfterHours: false,
    canCreateBroadcast: true,
    canManageFAQ: false,
    canExportReports: false,
    canChangeSystemSound: false,
  }
};

/**
 * Check if a user has permission to access a specific tab
 */
export function hasTabAccess(user: UserProfile | null, tab: TabKey): boolean {
  if (!user) return true; // Default guest view
  const config = ROLE_CONFIGS[user.role];
  if (!config) return true;
  return config.allowedTabs.includes(tab);
}

/**
 * Check if a user can reassign tickets to other officers
 */
export function canReassignTicket(user: UserProfile | null): boolean {
  if (!user) return false;
  return ROLE_CONFIGS[user.role]?.canReassignTicket ?? false;
}

/**
 * Check if a user can manage after-hours rules
 */
export function canManageAfterHours(user: UserProfile | null): boolean {
  if (!user) return false;
  return ROLE_CONFIGS[user.role]?.canManageAfterHours ?? false;
}

/**
 * Check if a user can create broadcast campaigns
 */
export function canCreateBroadcast(user: UserProfile | null): boolean {
  if (!user) return false;
  return ROLE_CONFIGS[user.role]?.canCreateBroadcast ?? false;
}

/**
 * Check if a user can edit / manage FAQ knowledge base
 */
export function canManageFAQ(user: UserProfile | null): boolean {
  if (!user) return false;
  return ROLE_CONFIGS[user.role]?.canManageFAQ ?? false;
}

/**
 * Check if a user can export reports
 */
export function canExportReports(user: UserProfile | null): boolean {
  if (!user) return false;
  return ROLE_CONFIGS[user.role]?.canExportReports ?? false;
}
