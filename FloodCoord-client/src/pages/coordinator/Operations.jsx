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
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Giám sát hoạt động</h1>
                    <p className="text-sm text-gray-500">
                        Theo dõi các nhiệm vụ cứu hộ đang diễn ra theo thời gian thực.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {lastRefresh && (
                        <span className="text-xs text-gray-400">
                            Cập nhật: {lastRefresh.toLocaleTimeString('vi-VN')}
                        </span>
                    )}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                        <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs text-green-700 font-medium">
                            {activeRequests.length} nhiệm vụ đang hoạt động
                        </span>
                    </div>
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 disabled:opacity-60"
                    >
                        <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ===== BẢN ĐỒ ===== */}
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center gap-2 text-gray-700 mb-4">
                        <MapIcon className="h-5 w-5" />
                        <span className="text-sm font-semibold">Bản đồ hoạt động</span>
                    </div>
                    <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
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

                {/* ===== TIMELINE HOẠT ĐỘNG ===== */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center gap-2 text-gray-700 mb-4">
                        <ClockIcon className="h-5 w-5" />
                        <span className="text-sm font-semibold">Hoạt động gần đây</span>
                    </div>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
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
            </div>

            {/* ===== BẢNG THEO DÕI NHIỆM VỤ ĐANG HOẠT ĐỘNG ===== */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
                    <SignalIcon className="h-5 w-5 text-teal-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Nhiệm vụ đang hoạt động</h2>
                    <span className="text-xs text-gray-400 ml-auto">Tự động cập nhật mỗi 15 giây</span>
                </div>

                {activeRequests.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Yêu cầu</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Đội cứu hộ</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Địa điểm</th>
                                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Trạng thái</th>
                                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Mức độ</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Bắt đầu lúc</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {activeRequests.map((req) => (
                                    <tr
                                        key={req.requestId || req.id}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => {
                                            setSelectedRequest(req);
                                            setShowDetailModal(true);
                                        }}
                                    >
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900 line-clamp-1">{req.title || 'Yêu cầu cứu hộ'}</p>
                                            <p className="text-xs text-gray-400">{req.trackingCode || `#${req.requestId || req.id}`}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-gray-700">{req.assignedTeamName || '—'}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-gray-700 line-clamp-1">{req.location?.addressText || '—'}</p>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <StatusBadge status={req.status} />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <PriorityBadge priority={req.emergencyLevel} />
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {formatTime(req.updatedAt || req.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-400">
                        <SignalIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Hiện không có nhiệm vụ nào đang hoạt động.</p>
                    </div>
                )}
            </div>

            <RequestDetailModal
                request={selectedRequest}
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
            />
        </div>
    );
}
