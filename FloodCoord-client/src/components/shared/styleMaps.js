export const ROLE_BADGE_BY_NAME = {
  'Quản Trị Viên': { color: 'bg-purple-100 text-purple-700', gradient: 'from-purple-500 to-purple-600' },
  'Quản Lý': { color: 'bg-blue-100 text-blue-700', gradient: 'from-blue-500 to-blue-600' },
  'Điều Phối Viên': { color: 'bg-orange-100 text-orange-700', gradient: 'from-orange-500 to-orange-600' },
  'Đội Cứu Hộ': { color: 'bg-green-100 text-green-700', gradient: 'from-green-500 to-green-600' },
  'Thành Viên': { color: 'bg-slate-100 text-slate-700', gradient: 'from-slate-500 to-slate-600' },
};

export const ROLE_BADGE_DEFAULT = {
  color: 'bg-gray-100 text-gray-700',
  gradient: 'from-gray-500 to-gray-600',
};

const TEAM_STATUS_ADMIN = {
  AVAILABLE: { label: 'Sẵn sàng', tone: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  IN_MISSION: { label: 'Đang nhiệm vụ', tone: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  RESTING: { label: 'Nghỉ ngơi', tone: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  INACTIVE: { label: 'Không hoạt động', tone: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500' },
};

const TEAM_STATUS_COORDINATOR = {
  AVAILABLE: { label: 'Sẵn sàng', tone: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  BUSY: { label: 'Đang nhiệm vụ', tone: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  OFF_DUTY: { label: 'Nghỉ ngơi', tone: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500' },
};

export function getTeamStatusMeta(team, mode = 'coordinator') {
  const status = team?.status?.toUpperCase();

  if (mode === 'admin') {
    return TEAM_STATUS_ADMIN[status] || {
      label: status || 'Không xác định',
      tone: 'bg-gray-100 text-gray-700',
      dot: 'bg-blue-500',
    };
  }

  if (!team?.isActive) {
    return {
      label: 'Không hoạt động',
      tone: 'bg-gray-100 text-gray-700',
      dot: 'bg-gray-500',
    };
  }

  return TEAM_STATUS_COORDINATOR[status] || {
    label: 'Sẵn sàng',
    tone: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-500',
  };
}

export const SUPPLY_TYPE_META = {
  FOOD_WATER: {
    label: 'Đồ ăn, nước uống',
    badge: 'bg-green-100 text-green-800',
    iconColor: 'text-green-600',
  },
  MEDICAL: {
    label: 'Thuốc men, y tế',
    badge: 'bg-red-100 text-red-800',
    iconColor: 'text-red-600',
  },
  EQUIPMENT: {
    label: 'Thiết bị cứu hộ',
    badge: 'bg-blue-100 text-blue-800',
    iconColor: 'text-blue-600',
  },
  OTHER: {
    label: 'Khác',
    badge: 'bg-gray-100 text-gray-800',
    iconColor: 'text-gray-600',
  },
};

export const SUPPLY_TYPE_DEFAULT = {
  label: 'Khác',
  badge: 'bg-gray-100 text-gray-800',
  iconColor: 'text-slate-600',
};

export function getSupplyTypeMeta(type) {
  return SUPPLY_TYPE_META[type] || { ...SUPPLY_TYPE_DEFAULT, label: type || SUPPLY_TYPE_DEFAULT.label };
}

export const SUPPLY_EXPIRY_META = {
  expired: {
    badgeClass: 'bg-red-100 text-red-700',
    dotClass: 'bg-red-500',
    label: 'Đã hết hạn',
    valueClass: 'text-red-600',
    iconClass: 'text-red-500',
  },
  expiring: {
    badgeClass: 'bg-yellow-100 text-yellow-700',
    dotClass: 'bg-yellow-500',
    label: 'Sắp hết hạn',
    valueClass: 'text-yellow-600',
    iconClass: 'text-yellow-500',
  },
  fresh: {
    badgeClass: 'bg-emerald-100 text-emerald-700',
    dotClass: 'bg-emerald-500',
    label: 'Còn hạn',
    valueClass: '',
    iconClass: 'text-green-500',
  },
};

export const VEHICLE_TYPE_META = {
  BOAT: {
    label: 'Tàu / Cano',
    managerBadge: 'bg-blue-100 text-blue-700',
    adminBg: '#eff6ff',
    adminColor: '#1e3a8a',
  },
  TRUCK: {
    label: 'Xe tải',
    managerBadge: 'bg-slate-100 text-slate-700',
    adminBg: '#f4f6fa',
    adminColor: '#374151',
  },
  HELICOPTER: {
    label: 'Trực thăng',
    managerBadge: 'bg-orange-100 text-orange-700',
    adminBg: '#fff0ed',
    adminColor: '#9a3a10',
  },
  AMBULANCE: {
    label: 'Xe cấp cứu',
    managerBadge: 'bg-red-100 text-red-700',
    adminBg: '#fff0ed',
    adminColor: '#9a3a10',
  },
  RESCUE_VAN: {
    label: 'Xe cứu hộ',
    managerBadge: 'bg-teal-100 text-teal-700',
    adminBg: '#f0f9f4',
    adminColor: '#0f4c35',
  },
};

export const VEHICLE_STATUS_META = {
  AVAILABLE: {
    label: 'Sẵn sàng',
    managerBadge: 'bg-emerald-100 text-emerald-700',
    managerDot: 'bg-emerald-500',
    adminBg: '#edfbf3',
    adminColor: '#14532d',
    adminDot: '#16a34a',
  },
  IN_USE: {
    label: 'Đang hoạt động',
    managerBadge: 'bg-blue-100 text-blue-700',
    managerDot: 'bg-blue-500',
    adminBg: '#eff6ff',
    adminColor: '#1e3a8a',
    adminDot: '#2563eb',
  },
  MAINTENANCE: {
    label: 'Bảo trì',
    managerBadge: 'bg-orange-100 text-orange-700',
    managerDot: 'bg-orange-500',
    adminBg: '#fefce8',
    adminColor: '#78350f',
    adminDot: '#ca8a04',
  },
  UNAVAILABLE: {
    label: 'Không khả dụng',
    managerBadge: 'bg-red-100 text-red-700',
    managerDot: 'bg-red-500',
    adminBg: '#fff0ed',
    adminColor: '#9a3a10',
    adminDot: '#e85d26',
  },
};

export const VEHICLE_TYPES = Object.keys(VEHICLE_TYPE_META);
export const VEHICLE_STATUSES = Object.keys(VEHICLE_STATUS_META);

const VEHICLE_TYPE_DEFAULT = {
  manager: { label: 'Không xác định', color: 'bg-gray-100 text-gray-600' },
  admin: { label: 'Không xác định', bg: '#f4f6fa', color: '#64748b' },
};

const VEHICLE_STATUS_DEFAULT = {
  manager: { label: 'Không xác định', color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500' },
  admin: { label: 'Không xác định', bg: '#f4f6fa', color: '#64748b', dot: '#64748b' },
};

export function getVehicleTypeMeta(type, mode = 'manager') {
  const meta = VEHICLE_TYPE_META[type];
  if (!meta) {
    const fallback = mode === 'admin' ? VEHICLE_TYPE_DEFAULT.admin : VEHICLE_TYPE_DEFAULT.manager;
    return { ...fallback, label: type || fallback.label };
  }

  if (mode === 'admin') {
    return { label: meta.label, bg: meta.adminBg, color: meta.adminColor };
  }

  return { label: meta.label, color: meta.managerBadge };
}

export function getVehicleStatusMeta(status, mode = 'manager') {
  const meta = VEHICLE_STATUS_META[status];
  if (!meta) {
    const fallback = mode === 'admin' ? VEHICLE_STATUS_DEFAULT.admin : VEHICLE_STATUS_DEFAULT.manager;
    return { ...fallback, label: status || fallback.label };
  }

  if (mode === 'admin') {
    return { label: meta.label, bg: meta.adminBg, color: meta.adminColor, dot: meta.adminDot };
  }

  return { label: meta.label, color: meta.managerBadge, dot: meta.managerDot };
}

export const COORDINATOR_STATUS_BADGE_BY_CODE = {
  PENDING:     { bg: '#fefce8', color: '#78350f', border: '#fde047', label: 'ĐANG CHỜ',        dot: '#ca8a04' },
  VERIFIED:    { bg: '#f0f9ff', color: '#0c4a6e', border: '#bae6fd', label: 'ĐÃ XÁC THỰC',     dot: '#0ea5e9' },
  IN_PROGRESS: { bg: '#f0f6ff', color: '#1e3a8a', border: '#bfdbfe', label: 'ĐANG THỰC HIỆN',  dot: '#2563eb' },
  MOVING:      { bg: '#f5f3ff', color: '#1a0f3d', border: '#ddd6fe', label: 'ĐANG DI CHUYỂN',  dot: '#312070' },
  ARRIVED:     { bg: '#f0f9f4', color: '#0f4c35', border: '#a7f3d0', label: 'ĐÃ ĐẾN NƠI',      dot: '#0f4c35' },
  RESCUING:    { bg: '#fff0ed', color: '#9a3a10', border: '#ffd5c2', label: 'ĐANG CỨU HỘ',     dot: '#e85d26' },
  COMPLETED:   { bg: '#edfbf3', color: '#14532d', border: '#86efac', label: 'HOÀN THÀNH',      dot: '#16a34a' },
  ASSIGNED:    { bg: '#edfbf3', color: '#14532d', border: '#86efac', label: 'ĐÃ PHÂN CÔNG',     dot: '#16a34a' },
  CANCELLED:   { bg: '#f4f6fa', color: '#64748b', border: '#e2e8f0', label: 'ĐÃ HỦY',           dot: '#64748b' },
  REJECTED:    { bg: '#fff0ed', color: '#9a3a10', border: '#ffd5c2', label: 'KHÔNG DUYỆT',      dot: '#e85d26' },
};

export const COORDINATOR_STATUS_BADGE_DEFAULT = {
  bg: '#f4f6fa',
  color: '#64748b',
  border: '#e2e8f0',
  dot: '#64748b',
};

export const COORDINATOR_PRIORITY_BADGE_BY_CODE = {
  CRITICAL: { bg: '#fff0ed', color: '#9a3a10', border: '#ffd5c2', label: 'NGHIÊM TRỌNG' },
  HIGH:     { bg: '#fff0ed', color: '#9a3a10', border: '#ffd5c2', label: 'CAO' },
  MEDIUM:   { bg: '#fefce8', color: '#78350f', border: '#fde047', label: 'TRUNG BÌNH' },
  NORMAL:   { bg: '#fefce8', color: '#78350f', border: '#fde047', label: 'TRUNG BÌNH' },
  LOW:      { bg: '#f0f6ff', color: '#1a3a5c', border: '#c8d8ec', label: 'THẤP' },
};

export const COORDINATOR_PRIORITY_BADGE_DEFAULT = {
  bg: '#f4f6fa',
  color: '#64748b',
  border: '#e2e8f0',
  label: '—',
};

export const MODAL_STYLE_MAP = {
  // Keep overlays above Leaflet panes/controls (which use high z-index values).
  overlaySoft: 'fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[2000] p-4',
  overlayDefault: 'fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[2000] p-4',
  overlayStrong: 'fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[2100] p-4',
  shell: 'bg-white rounded-lg shadow-xl w-full max-h-[90vh] flex flex-col',
  shellCompact: 'bg-white rounded-lg shadow-2xl max-w-md w-full p-6',
  header: 'shrink-0 flex items-center justify-between p-5 border-b border-neutral-100',
  headerStart: 'shrink-0 flex items-start justify-between p-5 border-b border-neutral-100',
  body: 'flex-1 min-h-0 overflow-y-auto p-5 space-y-5',
  footerEnd: 'shrink-0 flex items-center justify-end gap-3 px-5 py-4 border-t border-neutral-100 bg-neutral-50',
  closeButton: 'text-neutral-400 hover:text-neutral-600',
  secondaryButton: 'px-4 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-100 rounded-md hover:bg-neutral-50 disabled:opacity-50',
  dangerButton: 'inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50',
  primaryCoordinator: 'px-5 py-2 text-sm font-medium text-white bg-coordinator rounded-md hover:bg-coordinator-dark shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',
  primaryTeal: 'px-6 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed',
  secondarySolidWide: 'w-full px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition',
  secondarySolidFlex: 'flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition',
  primaryRescueFlex: 'flex-1 px-4 py-3 bg-rescue-medium text-white font-semibold rounded-xl hover:bg-rescue transition shadow-lg shadow-rescue-dark/20',
};
