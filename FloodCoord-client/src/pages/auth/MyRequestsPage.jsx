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

/* ─── Status / Emergency config — updated to color system ─── */
const STATUS_CONFIG = {
    PENDING: { label: 'Chờ xác minh', color: 'bg-[#fefce8] text-[#78350f] border-[#fde047]', dot: 'bg-[#ca8a04]', icon: ClockIcon },
    VERIFIED: { label: 'Đã xác minh', color: 'bg-[#eff6ff] text-[#1e3a8a] border-[#bfdbfe]', dot: 'bg-[#2563eb]', icon: CheckCircleIcon },
    REJECTED: { label: 'Không duyệt', color: 'bg-[#fff0ed] text-[#9a3a10] border-[#ffd5c2]', dot: 'bg-[#e85d26]', icon: XCircleIcon },
    IN_PROGRESS: { label: 'Đang thực hiện', color: 'bg-[#eff6ff] text-[#1e3a8a] border-[#bfdbfe]', dot: 'bg-[#2563eb]', icon: TruckIcon },
    MOVING: { label: 'Đội đang di chuyển', color: 'bg-[#f0f9f4] text-[#0f4c35] border-[#a7f3d0]', dot: 'bg-[#0f4c35]', icon: TruckIcon },
    ARRIVED: { label: 'Đội đã đến nơi', color: 'bg-[#f0f9f4] text-[#0f4c35] border-[#a7f3d0]', dot: 'bg-[#1a7a52]', icon: MapPinIcon },
    RESCUING: { label: 'Đang cứu hộ', color: 'bg-[#fff0ed] text-[#9a3a10] border-[#ffd5c2]', dot: 'bg-[#e85d26]', icon: UserGroupIcon },
    COMPLETED: { label: 'Hoàn thành', color: 'bg-[#edfbf3] text-[#14532d] border-[#86efac]', dot: 'bg-[#16a34a]', icon: CheckCircleIcon },
    REPORTED: { label: 'Đã báo cáo', color: 'bg-[#edfbf3] text-[#14532d] border-[#86efac]', dot: 'bg-[#16a34a]', icon: CheckCircleIcon },
    CANCELLED: { label: 'Đã hủy', color: 'bg-[#f4f6fa] text-[#64748b] border-[#e2e8f0]', dot: 'bg-[#64748b]', icon: XCircleIcon },
}

const EMERGENCY_CONFIG = {
    HIGH: { label: 'Khẩn cấp', color: 'text-[#9a3a10] bg-[#fff0ed] border-[#ffd5c2]' },
    MEDIUM: { label: 'Trung bình', color: 'text-[#78350f] bg-[#fefce8] border-[#fde047]' },
    LOW: { label: 'Thấp', color: 'text-[#14532d] bg-[#edfbf3] border-[#86efac]' },
}

const getStatus = k =>
    STATUS_CONFIG[k?.toUpperCase()] ||
    {
        label: k || '—',
        color: 'bg-[#f4f6fa] text-[#64748b] border-[#e2e8f0]',
        dot: 'bg-[#64748b]',
        icon: ClockIcon
    }
const getEmergency = k =>
    EMERGENCY_CONFIG[k?.toUpperCase()] ||
    {
        label: k || '—',
        color: 'text-[#64748b] bg-[#f4f6fa] border-[#e2e8f0]'
    }

const formatDate = dt => {
    if (!dt) return '—'
    return new Intl.DateTimeFormat('vi-VN',
        {
            day: '2-digit', month: '2-digit',
            year: 'numeric', hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dt))
}

/* ─── Status stepper — navy/green/orange ─── */
const STEPS = [
    { key: 'PENDING', label: 'Gửi yêu cầu' },
    { key: 'VERIFIED', label: 'Xác minh' },
    { key: 'IN_PROGRESS', label: 'Phân công' },
    { key: 'MOVING', label: 'Di chuyển' },
    { key: 'ARRIVED', label: 'Đến nơi' },
    { key: 'RESCUING', label: 'Cứu hộ' },
    { key: 'COMPLETED', label: 'Hoàn thành' },
]
const STEP_ORDER = STEPS.map(s => s.key)

function StatusStepper({ status }) {
    const upper = status?.toUpperCase()
    if (['REJECTED', 'CANCELLED'].includes(upper)) {
        return (
            <div className="flex items-center gap-2 text-sm font-medium" style={{ color: '#e85d26' }}>
                <XCircleIcon className="w-5 h-5" />
                {upper === 'REJECTED' ? 'Yêu cầu không được duyệt' : 'Yêu cầu đã bị hủy'}
            </div>
        )
    }
    const currentIdx = STEP_ORDER.indexOf(upper === 'REPORTED' ? 'COMPLETED' : upper)

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

/* ─── Star rating ─── */
function StarDisplay({ value }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(s => s <= value
                ? <StarSolid key={s} className="w-4 h-4 text-warning" />
                : <StarIcon key={s} className="w-4 h-4 text-[#c8d8ec]" />
            )}
        </div>
    )
}

//* ─── Detail modal ─── */
function DetailModal({ request, onClose }) {
    if (!request) return null
    const statusCfg = getStatus(request.status)
    const emergCfg = getEmergency(request.emergencyLevel)
    const StatusIcon = statusCfg.icon

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(13,34,64,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* header */}
                <div className="sticky top-0 bg-white border-b flex items-center justify-between px-6 py-4 rounded-t-2xl z-10"
                    style={{ borderColor: '#e2e8f0' }}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl" style={{ background: '#f0f6ff' }}>
                            <ShieldExclamationIcon className="w-5 h-5" style={{ color: '#1a3a5c' }} />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg leading-tight" style={{ color: '#0d2240' }}>{request.title || 'Yêu cầu cứu hộ'}</h2>
                            <p className="text-xs" style={{ color: '#9ab8d4' }}>ID: {request.requestId?.slice(0, 8).toUpperCase()}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-full transition-colors hover:bg-gray-100" style={{ color: '#9ab8d4' }}>
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* status stepper */}
                    <div className="rounded-xl p-4" style={{ background: '#f4f6fa' }}>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-3"
                            style={{ color: '#9ab8d4' }}>Tiến trình xử lý</p>
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
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border"
                            style={{ background: '#f4f6fa', color: '#64748b', borderColor: '#e2e8f0' }}>
                            <UserGroupIcon className="w-3.5 h-3.5" />
                            {request.peopleCount} người
                        </span>
                    </div>

                    {/* info grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoBlock label="Người liên hệ" value={request.contactName} />
                        <InfoBlock label="Số điện thoại">
                            {request.contactPhone
                                ? <a href={`tel:${request.contactPhone}`} className="flex items-center gap-1 font-medium text-sm hover:underline" style={{ color: '#1a3a5c' }}>
                                    <PhoneIcon className="w-4 h-4" /> {request.contactPhone}
                                </a>
                                : '—'}
                        </InfoBlock>
                        <InfoBlock label="Ngày gửi" value={formatDate(request.createdAt)} />
                        {request.status === 'COMPLETED' && <InfoBlock label="Hoàn thành lúc" value={formatDate(request.completedAt)} />}
                    </div>

                    {/* assigned team */}
                    {request.assignedTeamName && (
                        <div className="rounded-xl p-4 space-y-2" style={{ background: '#f0f6ff' }}>
                            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1a3a5c' }}>Đội cứu hộ được phân công</p>
                            <p className="font-semibold" style={{ color: '#0d2240' }}>{request.assignedTeamName}</p>
                            {request.assignedTeamPhone && (
                                <a href={`tel:${request.assignedTeamPhone}`} className="flex items-center gap-1.5 text-sm font-medium hover:underline" style={{ color: '#1a3a5c' }}>
                                    <PhoneIcon className="w-4 h-4" />{request.assignedTeamPhone} (Đội trưởng)
                                </a>
                            )}
                        </div>
                    )}

                    {/* coordinator note */}
                    {request.coordinatorNote && (
                        <div className="rounded-xl p-4 border" style={{ background: '#fefce8', borderColor: '#fde047' }}>
                            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#78350f' }}>Ghi chú từ điều phối viên</p>
                            <p className="text-sm" style={{ color: '#374151' }}>{request.coordinatorNote}</p>
                        </div>
                    )}

                    {/* citizen feedback */}
                    {request.citizenFeedback && (
                        <div className="rounded-xl p-4 space-y-2 border" style={{ background: '#edfbf3', borderColor: '#86efac' }}>
                            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#14532d' }}>Đánh giá của bạn</p>
                            <StarDisplay value={request.citizenRating} />
                            <p className="text-sm italic" style={{ color: '#374151' }}>"{request.citizenFeedback}"</p>
                        </div>
                    )}

                    {/* track link */}
                    <div className="pt-2 border-t" style={{ borderColor: '#e2e8f0' }}>
                        <Link to={`/track-rescue?code=${request.trackingCode || ''}`}
                            className="inline-flex items-center gap-2 text-sm font-medium hover:underline" style={{ color: '#1a3a5c' }}>
                            <ArrowPathIcon className="w-4 h-4" />
                            Theo dõi chi tiết bằng mã tra cứu
                            <ChevronRightIcon className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoBlock({ label, value, children }) {
    return (
        <div className="space-y-0.5">
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#9ab8d4' }}>{label}</p>
            {children ? children : <p className="text-sm font-semibold" style={{ color: '#374151' }}>{value || '—'}</p>}
        </div>
    )
}

/* ─── Request card ─── */
function RequestCard({ request, onClick }) {
    const statusCfg = getStatus(request.status)
    const emergCfg = getEmergency(request.emergencyLevel)
    const StatusIcon = statusCfg.icon

    return (
        <button onClick={() => onClick(request)}
            className="w-full text-left bg-white rounded-2xl border transition-all duration-200 group overflow-hidden"
            style={{ borderColor: '#e2e8f0', boxShadow: '0 1px 4px rgba(13,34,64,0.06)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#c8d8ec'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(13,34,64,0.10)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(13,34,64,0.06)' }}>

            {/* top accent bar — uses status dot color */}
            <div className={`h-1 w-full ${statusCfg.dot}`} />

            <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate transition-colors" style={{ color: '#0d2240' }}>{request.title || 'Yêu cầu cứu hộ'}</h3>
                        <div className="flex items-center gap-1.5 mt-1 text-xs" style={{ color: '#9ab8d4' }}>
                            <CalendarDaysIcon className="w-3.5 h-3.5 shrink-0" />
                            <span>{formatDate(request.createdAt)}</span>
                        </div>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 shrink-0 mt-0.5 transition-colors" style={{ color: '#c8d8ec' }} />
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
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border"
                        style={{ background: '#f4f6fa', color: '#64748b', borderColor: '#e2e8f0' }}>
                        <UserGroupIcon className="w-3 h-3" />
                        {request.peopleCount} người
                    </span>
                </div>

                {request.contactName && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs" style={{ color: '#9ab8d4' }}>
                        <PhoneIcon className="w-3.5 h-3.5" />
                        <span className="truncate">{request.contactName} – {request.contactPhone}</span>
                    </div>
                )}
            </div>
        </button>
    )
}

/* ─────────────────── filter tabs ─────────────────── */

/* ─── Filter tabs ─── */
const FILTER_TABS = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'ACTIVE', label: 'Đang xử lý' },
    { key: 'COMPLETED', label: 'Hoàn thành' },
    { key: 'CANCELLED', label: 'Đã hủy/Từ chối' },
]

const isActive = s => ['PENDING', 'VERIFIED', 'IN_PROGRESS', 'MOVING', 'ARRIVED', 'RESCUING'].includes(s?.toUpperCase())
const isCompleted = s => ['COMPLETED', 'REPORTED'].includes(s?.toUpperCase())
const isClosed = s => ['CANCELLED', 'REJECTED'].includes(s?.toUpperCase())

/* ─── Main page ─── */
export default function MyRequestsPage() {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedRequest, setSelectedRequest] = useState(null)
    const [filter, setFilter] = useState('ALL')

    const fetchMyRequests = useCallback(async () => {
        setLoading(true); setError(null)
        try {
            const data = await rescueApi.getMyRequests()
            setRequests([...(data || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
        } catch {
            setError('Không thể tải danh sách yêu cầu. Vui lòng thử lại.')
        } finally { setLoading(false) }
    }, [])

    useEffect(() => { fetchMyRequests() }, [fetchMyRequests])

    const filtered = requests.filter(r => {
        if (filter === 'ALL') return true
        if (filter === 'ACTIVE') return isActive(r.status)
        if (filter === 'COMPLETED') return isCompleted(r.status)
        if (filter === 'CANCELLED') return isClosed(r.status)
        return true
    })

    const counts = {
        ALL: requests.length,
        ACTIVE: requests.filter(r => isActive(r.status)).length,
        COMPLETED: requests.filter(r => isCompleted(r.status)).length,
        CANCELLED: requests.filter(r => isClosed(r.status)).length,
    }

    return (
        <div className="min-h-screen" style={{ background: '#f4f6fa' }}>

            {/* page header */}
            <div className="bg-white border-b shadow-sm" style={{ borderColor: '#e2e8f0' }}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl" style={{ background: '#1a3a5c' }}>
                                <ShieldExclamationIcon className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold" style={{ color: '#0d2240' }}>Yêu cầu cứu hộ của tôi</h1>
                                <p className="text-sm mt-0.5" style={{ color: '#9ab8d4' }}>
                                    {loading ? 'Đang tải...' : `${requests.length} yêu cầu`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={fetchMyRequests} disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                                style={{ color: '#64748b', background: '#f4f6fa', border: '1px solid #e2e8f0' }}>
                                <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                Làm mới
                            </button>
                            <Link to="/request-rescue"
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors"
                                style={{ background: '#e85d26' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#d14e1a'}
                                onMouseLeave={e => e.currentTarget.style.background = '#e85d26'}>
                                <ShieldExclamationIcon className="w-4 h-4" />
                                Gửi yêu cầu mới
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* filter tabs */}
                <div className="flex gap-2 flex-wrap">
                    {FILTER_TABS.map(tab => (
                        <button key={tab.key} onClick={() => setFilter(tab.key)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border"
                            style={filter === tab.key
                                ? { background: '#1a3a5c', color: '#fff', borderColor: '#1a3a5c' }
                                : { background: '#fff', color: '#64748b', borderColor: '#e2e8f0' }}>
                            {tab.label}
                            {counts[tab.key] > 0 && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                                    style={filter === tab.key
                                        ? { background: 'rgba(255,255,255,0.2)', color: '#fff' }
                                        : { background: '#f4f6fa', color: '#64748b' }}>
                                    {counts[tab.key]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* loading skeleton */}
                {loading && (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-2xl border overflow-hidden animate-pulse" style={{ borderColor: '#e2e8f0' }}>
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

                {/* error */}
                {!loading && error && (
                    <div className="bg-white rounded-2xl border p-6 text-center space-y-3" style={{ borderColor: '#ffd5c2' }}>
                        <XCircleIcon className="w-12 h-12 mx-auto" style={{ color: '#e85d26' }} />
                        <p className="font-medium" style={{ color: '#374151' }}>{error}</p>
                        <button onClick={fetchMyRequests}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl"
                            style={{ background: '#e85d26' }}>
                            <ArrowPathIcon className="w-4 h-4" />Thử lại
                        </button>
                    </div>
                )}

                {/* empty */}
                {!loading && !error && filtered.length === 0 && (
                    <div className="bg-white rounded-2xl border p-12 text-center space-y-4" style={{ borderColor: '#e2e8f0' }}>
                        <div className="flex justify-center">
                            <div className="p-4 rounded-full" style={{ background: '#f4f6fa' }}>
                                <InboxIcon className="w-14 h-14" style={{ color: '#c8d8ec' }} />
                            </div>
                        </div>
                        <div>
                            <p className="text-lg font-semibold" style={{ color: '#0d2240' }}>
                                {filter === 'ALL' ? 'Chưa có yêu cầu nào' : 'Không có yêu cầu nào trong mục này'}
                            </p>
                            <p className="text-sm mt-1" style={{ color: '#9ab8d4' }}>
                                {filter === 'ALL'
                                    ? 'Các yêu cầu cứu hộ bạn đã gửi sẽ hiển thị ở đây.'
                                    : 'Thử chuyển sang tab khác để xem yêu cầu.'}
                            </p>
                        </div>
                        {filter === 'ALL' && (
                            <Link to="/request-rescue"
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl"
                                style={{ background: '#e85d26' }}>
                                <ShieldExclamationIcon className="w-4 h-4" />
                                Gửi yêu cầu cứu hộ ngay
                            </Link>
                        )}
                    </div>
                )}

                {/* list */}
                {!loading && !error && filtered.length > 0 && (
                    <div className="space-y-3">
                        {filtered.map(req => <RequestCard key={req.requestId} request={req} onClick={setSelectedRequest} />)}
                    </div>
                )}

                {/* phone sync notice */}
                {!loading && !error && requests.length > 0 && (
                    <div className="rounded-2xl p-4 flex gap-3 border" style={{ background: '#f0f6ff', borderColor: '#c8d8ec' }}>
                        <div className="shrink-0 mt-0.5"><PhoneIcon className="w-5 h-5" style={{ color: '#1a3a5c' }} /></div>
                        <div>
                            <p className="text-sm font-semibold" style={{ color: '#0d2240' }}>Đồng bộ tự động theo số điện thoại</p>
                            <p className="text-xs mt-0.5" style={{ color: '#7a9abf' }}>
                                Tất cả yêu cầu cứu hộ bạn đã gửi bằng số điện thoại này (kể cả khi chưa đăng nhập) đã được gộp vào tài khoản của bạn.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* ── detail modal ── */}
            {selectedRequest && <DetailModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />}
        </div>
    );
}
