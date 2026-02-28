import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { coordinatorApi } from '../../services/coordinatorApi';
import StatusBadge from '../../components/coordinator/StatusBadge';
import PriorityBadge from '../../components/coordinator/PriorityBadge';
import RequestDetailModal from '../../components/coordinator/RequestDetailModal';
import { MapIcon, ArrowPathIcon, ClockIcon, SignalIcon } from '@heroicons/react/24/outline';

// Fix Leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

/**
 * Operations — Trang giám sát hoạt động cứu hộ
 *
 * Tính năng:
 * - Bản đồ real-time: vị trí các nhiệm vụ đang diễn ra
 * - Bảng theo dõi nhiệm vụ: đội phân công, trạng thái, thời gian
 * - Timeline hoạt động: cập nhật gần nhất
 * - Auto-refresh mỗi 15 giây
 */
export default function Operations() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await coordinatorApi.getAllRequests();
            setRequests(data || []);
            setLastRefresh(new Date());
        } catch (error) {
            console.error('Failed to load operations data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Auto-refresh mỗi 15 giây
    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 15000);
        return () => clearInterval(interval);
    }, [loadData]);

    // Nhiệm vụ đang active (IN_PROGRESS, MOVING, ARRIVED, RESCUING)
    const activeRequests = useMemo(
        () =>
            requests
                .filter((r) => ['IN_PROGRESS', 'MOVING', 'ARRIVED', 'RESCUING', 'ASSIGNED'].includes(r.status))
                .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)),
        [requests]
    );

    // Hoạt động gần nhất (completed + active, sort theo thời gian)
    const recentActivity = useMemo(() => {
        return requests
            .filter((r) => r.status !== 'PENDING')
            .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
            .slice(0, 10);
    }, [requests]);

    const formatTime = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return '—';
        const diffMin = Math.floor((new Date() - new Date(dateString)) / 60000);
        if (diffMin < 1) return 'Vừa xong';
        if (diffMin < 60) return `${diffMin} phút trước`;
        const diffHour = Math.floor(diffMin / 60);
        if (diffHour < 24) return `${diffHour} giờ trước`;
        return `${Math.floor(diffHour / 24)} ngày trước`;
    };

    const statusLabel = (status) => {
        const map = {
            VERIFIED: 'Đã xác thực',
            VALIDATED: 'Đã xác thực',
            IN_PROGRESS: 'Đang thực thi',
            MOVING: 'Đang di chuyển',
            ARRIVED: 'Đã đến nơi',
            RESCUING: 'Đang cứu hộ',
            ASSIGNED: 'Đã phân công',
            COMPLETED: 'Hoàn thành',
        };
        return map[status] || status;
    };

    return (
        <div className="h-full flex flex-col p-4 gap-3">
            {/* Header — compact */}
            <div className="flex-shrink-0 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Giám sát hoạt động</h1>
                    <p className="text-xs text-gray-500">
                        Theo dõi các nhiệm vụ cứu hộ đang diễn ra theo thời gian thực.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {lastRefresh && (
                        <span className="text-xs text-gray-400">
                            Cập nhật: {lastRefresh.toLocaleTimeString('vi-VN')}
                        </span>
                    )}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-full">
                        <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs text-green-700 font-medium">
                            {activeRequests.length} đang hoạt động
                        </span>
                    </div>
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white text-xs font-medium rounded-md hover:bg-teal-700 disabled:opacity-60 transition-colors"
                    >
                        <ArrowPathIcon className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </button>
                </div>
            </div>

            {/* Summary cards */}
            <div className="flex-shrink-0 grid grid-cols-4 gap-3">
                {[
                    { label: 'Đang hoạt động', value: activeRequests.length, color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
                    { label: 'Chờ duyệt', value: requests.filter(r => r.status === 'PENDING').length, color: 'text-blue-700 bg-blue-50 border-blue-200' },
                    { label: 'Đã xác thực', value: requests.filter(r => r.status === 'VERIFIED' || r.status === 'VALIDATED').length, color: 'text-teal-700 bg-teal-50 border-teal-200' },
                    { label: 'Hoàn thành', value: requests.filter(r => r.status === 'COMPLETED').length, color: 'text-green-700 bg-green-50 border-green-200' },
                ].map((stat, i) => (
                    <div key={i} className={`px-3 py-2 rounded-lg border ${stat.color}`}>
                        <p className="text-xs font-medium opacity-80">{stat.label}</p>
                        <p className="text-lg font-bold">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Main content — fills remaining viewport */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* ===== BẢN ĐỒ ===== */}
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden">
                    <div className="flex-shrink-0 flex items-center gap-2 text-gray-700 px-4 py-2.5 border-b border-gray-100">
                        <MapIcon className="h-4 w-4" />
                        <span className="text-xs font-semibold">Bản đồ hoạt động</span>
                    </div>
                    <div className="flex-1 min-h-0">
                        <MapContainer
                            center={[10.8231, 106.6297]}
                            zoom={12}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            {activeRequests.map((req) => {
                                const loc = req.location;
                                if (!loc?.latitude || !loc?.longitude) return null;
                                return (
                                    <Marker
                                        key={req.requestId || req.id}
                                        position={[loc.latitude, loc.longitude]}
                                        eventHandlers={{
                                            click: () => {
                                                setSelectedRequest(req);
                                                setShowDetailModal(true);
                                            },
                                        }}
                                    >
                                        <Popup>
                                            <div className="text-sm">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <PriorityBadge priority={req.emergencyLevel} />
                                                    <StatusBadge status={req.status} />
                                                </div>
                                                <p className="font-semibold text-gray-900">{req.title || 'Yêu cầu cứu hộ'}</p>
                                                <p className="text-xs text-gray-600 mt-1">{loc.addressText}</p>
                                                {req.assignedTeamName && (
                                                    <p className="text-xs text-green-700 mt-2">
                                                        🚨 Đội: {req.assignedTeamName}
                                                    </p>
                                                )}
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}
                        </MapContainer>
                    </div>
                </div>

                {/* ===== SIDEBAR: TIMELINE + WEATHER ===== */}
                <div className="flex flex-col gap-3 min-h-0">
                    {/* Timeline */}
                    <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden">
                        <div className="flex-shrink-0 flex items-center gap-2 text-gray-700 px-4 py-2.5 border-b border-gray-100">
                            <ClockIcon className="h-4 w-4" />
                            <span className="text-xs font-semibold">Hoạt động gần đây</span>
                        </div>
                        <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
                        {recentActivity.map((req) => (
                            <div
                                key={req.requestId || req.id}
                                className="flex gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => {
                                    setSelectedRequest(req);
                                    setShowDetailModal(true);
                                }}
                            >
                                <div className="flex-shrink-0 mt-1">
                                    <div className={`w-2 h-2 rounded-full ${
                                        req.status === 'COMPLETED' ? 'bg-green-500' :
                                        ['IN_PROGRESS', 'MOVING', 'ARRIVED', 'RESCUING'].includes(req.status) ? 'bg-yellow-500' :
                                        'bg-blue-500'
                                    }`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {req.title || req.trackingCode}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {statusLabel(req.status)}
                                        {req.assignedTeamName && ` • ${req.assignedTeamName}`}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {formatTimeAgo(req.updatedAt || req.createdAt)}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {recentActivity.length === 0 && !loading && (
                            <div className="text-sm text-gray-400 text-center py-4">
                                Chưa có hoạt động nào
                            </div>
                        )}
                    </div>
                </div>

                    {/* Thời tiết & Lũ lụt */}
                    <div className="flex-shrink-0 bg-white border border-gray-200 rounded-lg p-3">
                        <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                            🌊 Thời tiết & Mực nước
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-blue-50 border border-blue-100 rounded p-2">
                                <p className="text-[10px] text-blue-600 font-medium">Lượng mưa</p>
                                <p className="text-sm font-bold text-blue-800">45 mm/h</p>
                                <p className="text-[10px] text-blue-500">Mưa vừa đến to</p>
                            </div>
                            <div className="bg-amber-50 border border-amber-100 rounded p-2">
                                <p className="text-[10px] text-amber-600 font-medium">Mực nước</p>
                                <p className="text-sm font-bold text-amber-800">2.1 m</p>
                                <p className="text-[10px] text-amber-500">Trên mức cảnh báo</p>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 text-center">⚠️ Dữ liệu mẫu — sẽ tích hợp API thời tiết sau</p>
                    </div>
                </div>
            </div>

            <RequestDetailModal
                request={selectedRequest}
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
            />
        </div>
    );
}
