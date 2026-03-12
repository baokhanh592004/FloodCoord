import React, { useEffect, useState, useCallback } from 'react';
import { rescueApi } from '../../services/rescueApi';
import { Link } from 'react-router-dom';
import {
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XCircleIcon,
    TruckIcon,
    UserGroupIcon,
    PhoneIcon,
    MapPinIcon,
    ArrowPathIcon,
    InboxIcon,
    CalendarDaysIcon,
    ChevronRightIcon,
    XMarkIcon,
    ShieldExclamationIcon,
    StarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

/* ─────────────────── helpers ─────────────────── */

const STATUS_CONFIG = {
    PENDING: {
        label: 'Chờ xác minh',
        color: 'bg-amber-50 text-amber-700 border-amber-300',
        dot: 'bg-amber-400',
        icon: ClockIcon,
    },
    VERIFIED: {
        label: 'Đã xác minh',
        color: 'bg-cyan-50 text-cyan-700 border-cyan-300',
        dot: 'bg-cyan-400',
        icon: CheckCircleIcon,
    },
    REJECTED: {
        label: 'Không duyệt',
        color: 'bg-rose-50 text-rose-700 border-rose-300',
        dot: 'bg-rose-400',
        icon: XCircleIcon,
    },
    IN_PROGRESS: {
        label: 'Đang thực hiện',
        color: 'bg-blue-50 text-blue-700 border-blue-300',
        dot: 'bg-blue-400',
        icon: TruckIcon,
    },
    MOVING: {
        label: 'Đội đang di chuyển',
        color: 'bg-purple-50 text-purple-700 border-purple-300',
        dot: 'bg-purple-400',
        icon: TruckIcon,
    },
    ARRIVED: {
        label: 'Đội đã đến nơi',
        color: 'bg-indigo-50 text-indigo-700 border-indigo-300',
        dot: 'bg-indigo-400',
        icon: MapPinIcon,
    },
    RESCUING: {
        label: 'Đang cứu hộ',
        color: 'bg-yellow-50 text-yellow-700 border-yellow-300',
        dot: 'bg-yellow-400',
        icon: UserGroupIcon,
    },
    COMPLETED: {
        label: 'Hoàn thành',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-300',
        dot: 'bg-emerald-400',
        icon: CheckCircleIcon,
    },
    REPORTED: {
        label: 'Đã báo cáo',
        color: 'bg-teal-50 text-teal-700 border-teal-300',
        dot: 'bg-teal-400',
        icon: CheckCircleIcon,
    },
    CANCELLED: {
        label: 'Đã hủy',
        color: 'bg-gray-100 text-gray-500 border-gray-300',
        dot: 'bg-gray-400',
        icon: XCircleIcon,
    },
};

const EMERGENCY_CONFIG = {
    HIGH: { label: 'Khẩn cấp', color: 'text-red-600 bg-red-50 border-red-300' },
    MEDIUM: { label: 'Trung bình', color: 'text-orange-600 bg-orange-50 border-orange-300' },
    LOW: { label: 'Thấp', color: 'text-green-600 bg-green-50 border-green-300' },
};

function getStatus(key) {
    return STATUS_CONFIG[key?.toUpperCase()] || {
        label: key || '—',
        color: 'bg-gray-100 text-gray-500 border-gray-300',
        dot: 'bg-gray-400',
        icon: ClockIcon,
    };
}

function getEmergency(key) {
    return EMERGENCY_CONFIG[key?.toUpperCase()] || {
        label: key || '—',
        color: 'text-gray-600 bg-gray-100 border-gray-300',
    };
}

function formatDate(dt) {
    if (!dt) return '—';
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    }).format(new Date(dt));
}

/* ─────────────────── status stepper ─────────────────── */

const STEPS = [
    { key: 'PENDING',     label: 'Gửi yêu cầu' },
    { key: 'VERIFIED',    label: 'Xác minh' },
    { key: 'IN_PROGRESS', label: 'Phân công' },
    { key: 'MOVING',      label: 'Di chuyển' },
    { key: 'ARRIVED',     label: 'Đến nơi' },
    { key: 'RESCUING',    label: 'Cứu hộ' },
    { key: 'COMPLETED',   label: 'Hoàn thành' },
];

const STEP_ORDER = STEPS.map(s => s.key);

function StatusStepper({ status }) {
    const upper = status?.toUpperCase();
    if (['REJECTED', 'CANCELLED'].includes(upper)) {
        return (
            <div className="flex items-center gap-2 text-sm text-red-500 font-medium">
                <XCircleIcon className="w-5 h-5" />
                {upper === 'REJECTED' ? 'Yêu cầu không được duyệt' : 'Yêu cầu đã bị hủy'}
            </div>
        );
    }

    const currentIdx = STEP_ORDER.indexOf(upper === 'REPORTED' ? 'COMPLETED' : upper);

    return (
        <div className="w-full overflow-x-auto pb-1">
            <div className="flex items-center min-w-max gap-0">
                {STEPS.map((step, idx) => {
                    const done = idx < currentIdx;
                    const active = idx === currentIdx;
                    return (
                        <React.Fragment key={step.key}>
                            <div className="flex flex-col items-center gap-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                                    ${done ? 'bg-emerald-500 border-emerald-500 text-white'
                                        : active ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100'
                                            : 'bg-white border-gray-300 text-gray-400'}`}>
                                    {done ? '✓' : idx + 1}
                                </div>
                                <span className={`text-[10px] font-medium whitespace-nowrap
                                    ${done ? 'text-emerald-600' : active ? 'text-blue-600' : 'text-gray-400'}`}>
                                    {step.label}
                                </span>
                            </div>
                            {idx < STEPS.length - 1 && (
                                <div className={`h-0.5 w-8 sm:w-12 mb-4 transition-all
                                    ${idx < currentIdx ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}

/* ─────────────────── star rating ─────────────────── */

function StarDisplay({ value }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
                s <= value
                    ? <StarSolid key={s} className="w-4 h-4 text-yellow-400" />
                    : <StarIcon key={s} className="w-4 h-4 text-gray-300" />
            ))}
        </div>
    );
}

/* ─────────────────── detail modal ─────────────────── */

function DetailModal({ request, onClose }) {
    if (!request) return null;

    const statusCfg = getStatus(request.status);
    const emergCfg = getEmergency(request.emergencyLevel);
    const StatusIcon = statusCfg.icon;

    // close on backdrop
    const handleBackdrop = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={handleBackdrop}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 flex items-center justify-between px-6 py-4 rounded-t-2xl z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-xl">
                            <ShieldExclamationIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-800 text-lg leading-tight">{request.title || 'Yêu cầu cứu hộ'}</h2>
                            <p className="text-xs text-gray-400">ID: {request.requestId?.slice(0, 8).toUpperCase()}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* status stepper */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Tiến trình xử lý</p>
                        <StatusStepper status={request.status} />
                    </div>

                    {/* badges row */}
                    <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusCfg.color}`}>
                            <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusCfg.label}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${emergCfg.color}`}>
                            <ExclamationTriangleIcon className="w-3.5 h-3.5 mr-1" />
                            {emergCfg.label}
                        </span>
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                            <UserGroupIcon className="w-3.5 h-3.5" />
                            {request.peopleCount} người
                        </span>
                        {request.trackingCode && (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-slate-900 text-white border border-slate-900 tracking-[0.18em] uppercase">
                                {request.trackingCode}
                            </span>
                        )}
                    </div>

                    {/* info grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoBlock label="Mã tra cứu" value={request.trackingCode} />
                        <InfoBlock label="Người liên hệ" value={request.contactName} />
                        <InfoBlock label="Số điện thoại">
                            {request.contactPhone ? (
                                <a href={`tel:${request.contactPhone}`}
                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm">
                                    <PhoneIcon className="w-4 h-4" /> {request.contactPhone}
                                </a>
                            ) : '—'}
                        </InfoBlock>
                        <InfoBlock label="Ngày gửi" value={formatDate(request.createdAt)} />
                        {request.status === 'COMPLETED' && (
                            <InfoBlock label="Hoàn thành lúc" value={formatDate(request.completedAt)} />
                        )}
                    </div>

                    {/* assigned team */}
                    {(request.assignedTeamName) && (
                        <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Đội cứu hộ được phân công</p>
                            <p className="font-semibold text-gray-800">{request.assignedTeamName}</p>
                            {request.assignedTeamPhone && (
                                <a href={`tel:${request.assignedTeamPhone}`}
                                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium">
                                    <PhoneIcon className="w-4 h-4" />
                                    {request.assignedTeamPhone} (Đội trưởng)
                                </a>
                            )}
                        </div>
                    )}

                    {/* coordinator note */}
                    {request.coordinatorNote && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Ghi chú từ điều phối viên</p>
                            <p className="text-sm text-gray-700">{request.coordinatorNote}</p>
                        </div>
                    )}

                    {/* citizen feedback */}
                    {request.citizenFeedback && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
                            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Đánh giá của bạn</p>
                            <StarDisplay value={request.citizenRating} />
                            <p className="text-sm text-gray-700 italic">"{request.citizenFeedback}"</p>
                        </div>
                    )}

                    {/* track link */}
                    {request.trackingCode && (
                        <div className="pt-2 border-t border-gray-100">
                            <Link
                                to={`/track-rescue?code=${request.trackingCode}`}
                                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                            >
                                <ArrowPathIcon className="w-4 h-4" />
                                Theo dõi chi tiết bằng mã tra cứu
                                <ChevronRightIcon className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function InfoBlock({ label, value, children }) {
    return (
        <div className="space-y-0.5">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
            {children ? children : <p className="text-sm font-semibold text-gray-700">{value || '—'}</p>}
        </div>
    );
}

/* ─────────────────── request card ─────────────────── */

function RequestCard({ request, onClick }) {
    const statusCfg = getStatus(request.status);
    const emergCfg = getEmergency(request.emergencyLevel);
    const StatusIcon = statusCfg.icon;

    return (
        <button
            onClick={() => onClick(request)}
            className="w-full text-left bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200 group overflow-hidden"
        >
            {/* top accent bar */}
            <div className={`h-1 w-full ${statusCfg.dot}`} />

            <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate group-hover:text-blue-700 transition-colors">
                            {request.title || 'Yêu cầu cứu hộ'}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1 text-gray-400 text-xs">
                            <CalendarDaysIcon className="w-3.5 h-3.5 shrink-0" />
                            <span>{formatDate(request.createdAt)}</span>
                        </div>
                        {request.trackingCode && (
                            <div className="mt-2 inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-black">
                                Mã tra cứu: {request.trackingCode}
                            </div>
                        )}
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-gray-300 group-hover:text-blue-400 shrink-0 mt-0.5 transition-colors" />
                </div>

                <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusCfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        <StatusIcon className="w-3 h-3" />
                        {statusCfg.label}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${emergCfg.color}`}>
                        {emergCfg.label}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
                        <UserGroupIcon className="w-3 h-3" />
                        {request.peopleCount} người
                    </span>
                </div>

                {request.contactName && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
                        <PhoneIcon className="w-3.5 h-3.5" />
                        <span className="truncate">{request.contactName} – {request.contactPhone}</span>
                    </div>
                )}
            </div>
        </button>
    );
}

/* ─────────────────── filter tabs ─────────────────── */

const FILTER_TABS = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'ACTIVE', label: 'Đang xử lý' },
    { key: 'COMPLETED', label: 'Hoàn thành' },
    { key: 'CANCELLED', label: 'Đã hủy/Từ chối' },
];

function isActive(status) {
    return ['PENDING', 'VERIFIED', 'IN_PROGRESS', 'MOVING', 'ARRIVED', 'RESCUING'].includes(status?.toUpperCase());
}
function isCompleted(status) {
    return ['COMPLETED', 'REPORTED'].includes(status?.toUpperCase());
}
function isClosed(status) {
    return ['CANCELLED', 'REJECTED'].includes(status?.toUpperCase());
}

/* ─────────────────── main page ─────────────────── */

export default function MyRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [filter, setFilter] = useState('ALL');

    const fetchMyRequests = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await rescueApi.getMyRequests();
            // Sort: newest first
            const sorted = [...(data || [])].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setRequests(sorted);
        } catch (err) {
            console.error('Lỗi lấy danh sách:', err);
            setError('Không thể tải danh sách yêu cầu. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyRequests();
    }, [fetchMyRequests]);

    const filtered = requests.filter(r => {
        if (filter === 'ALL') return true;
        if (filter === 'ACTIVE') return isActive(r.status);
        if (filter === 'COMPLETED') return isCompleted(r.status);
        if (filter === 'CANCELLED') return isClosed(r.status);
        return true;
    });

    // counts for badges
    const counts = {
        ALL: requests.length,
        ACTIVE: requests.filter(r => isActive(r.status)).length,
        COMPLETED: requests.filter(r => isCompleted(r.status)).length,
        CANCELLED: requests.filter(r => isClosed(r.status)).length,
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-slate-50">
            {/* ── page header ── */}
            <div className="bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-600 rounded-2xl shadow-md shadow-blue-200">
                                <ShieldExclamationIcon className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Yêu cầu cứu hộ của tôi</h1>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {loading ? 'Đang tải...' : `${requests.length} yêu cầu`}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={fetchMyRequests}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
                            >
                                <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                Làm mới
                            </button>
                            <Link
                                to="/request-rescue"
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
                            >
                                <ShieldExclamationIcon className="w-4 h-4" />
                                Gửi yêu cầu mới
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                {/* ── filter tabs ── */}
                <div className="flex gap-2 flex-wrap">
                    {FILTER_TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border
                                ${filter === tab.key
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}
                        >
                            {tab.label}
                            {counts[tab.key] > 0 && (
                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold
                                    ${filter === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                    {counts[tab.key]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ── loading skeleton ── */}
                {loading && (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                                <div className="h-1 bg-gray-200" />
                                <div className="p-5 space-y-3">
                                    <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
                                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                                    <div className="flex gap-2 pt-1">
                                        <div className="h-6 w-24 bg-gray-100 rounded-full" />
                                        <div className="h-6 w-16 bg-gray-100 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── error state ── */}
                {!loading && error && (
                    <div className="bg-white rounded-2xl border border-red-200 p-6 text-center space-y-3">
                        <XCircleIcon className="w-12 h-12 text-red-400 mx-auto" />
                        <p className="text-gray-600 font-medium">{error}</p>
                        <button
                            onClick={fetchMyRequests}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                        >
                            <ArrowPathIcon className="w-4 h-4" />
                            Thử lại
                        </button>
                    </div>
                )}

                {/* ── empty state ── */}
                {!loading && !error && filtered.length === 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="p-4 bg-gray-50 rounded-full">
                                <InboxIcon className="w-14 h-14 text-gray-300" />
                            </div>
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-gray-700">
                                {filter === 'ALL' ? 'Chưa có yêu cầu nào' : 'Không có yêu cầu nào trong mục này'}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                {filter === 'ALL'
                                    ? 'Các yêu cầu cứu hộ bạn đã gửi (kể cả trước khi đăng ký) sẽ hiển thị ở đây.'
                                    : 'Thử chuyển sang tab khác để xem yêu cầu.'}
                            </p>
                        </div>
                        {filter === 'ALL' && (
                            <Link
                                to="/request-rescue"
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                            >
                                <ShieldExclamationIcon className="w-4 h-4" />
                                Gửi yêu cầu cứu hộ ngay
                            </Link>
                        )}
                    </div>
                )}

                {/* ── request list ── */}
                {!loading && !error && filtered.length > 0 && (
                    <div className="space-y-3">
                        {filtered.map(req => (
                            <RequestCard
                                key={req.requestId}
                                request={req}
                                onClick={setSelectedRequest}
                            />
                        ))}
                    </div>
                )}

                {/* ── phone sync notice ── */}
                {!loading && !error && requests.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
                        <div className="shrink-0 mt-0.5">
                            <PhoneIcon className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-blue-800">Đồng bộ tự động theo số điện thoại</p>
                            <p className="text-xs text-blue-600 mt-0.5">
                                Tất cả yêu cầu cứu hộ bạn đã gửi bằng số điện thoại này (kể cả khi chưa đăng nhập) đã được gộp vào tài khoản của bạn.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* ── detail modal ── */}
            {selectedRequest && (
                <DetailModal
                    request={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                />
            )}
        </div>
    );
}
