import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { coordinatorApi } from '../../services/coordinatorApi';
import { getCurrentWeather, getFloodRisk, getActiveAlerts, getWeatherLabel } from '../../services/weatherService';
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
    const WEATHER_LOCATION = { name: 'Hồ Chí Minh', lat: 10.823, lon: 106.63 };

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [weatherError, setWeatherError] = useState('');
    const [currentWeather, setCurrentWeather] = useState(null);
    const [floodRisk, setFloodRisk] = useState(null);
    const [activeAlerts, setActiveAlerts] = useState([]);
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

    const loadWeatherData = useCallback(async () => {
        setWeatherLoading(true);
        setWeatherError('');
        try {
            const [currentData, riskData, alertsData] = await Promise.all([
                getCurrentWeather(WEATHER_LOCATION.lat, WEATHER_LOCATION.lon),
                getFloodRisk(WEATHER_LOCATION.lat, WEATHER_LOCATION.lon),
                getActiveAlerts(24),
            ]);

            setCurrentWeather(currentData);
            setFloodRisk(riskData);
            setActiveAlerts(alertsData || []);
        } catch (error) {
            console.error('Failed to load operations weather data:', error);
            setWeatherError('Không thể tải dữ liệu thời tiết.');
        } finally {
            setWeatherLoading(false);
        }
    }, [WEATHER_LOCATION.lat, WEATHER_LOCATION.lon]);

    const handleRefresh = async () => {
        await Promise.all([loadData(), loadWeatherData()]);
    };

    // Auto-refresh mỗi 15 giây
    useEffect(() => {
        loadData();
        loadWeatherData();
        const interval = setInterval(loadData, 15000);
        const weatherInterval = setInterval(loadWeatherData, 10 * 60 * 1000);
        return () => {
            clearInterval(interval);
            clearInterval(weatherInterval);
        };
    }, [loadData, loadWeatherData]);

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

    // Đảm bảo toàn bộ trang có thể cuộn nếu nội dung vượt quá chiều cao màn hình
    // Sử dụng overflow-auto ở root div để tránh bị che mất nội dung trên màn hình nhỏ
    return (
        <div className="h-full flex flex-col p-4 gap-3 overflow-auto">
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
                        onClick={handleRefresh}
                        disabled={loading || weatherLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white text-xs font-medium rounded-md hover:bg-teal-700 disabled:opacity-60 transition-colors"
                    >
                        <ArrowPathIcon className={`h-3.5 w-3.5 ${(loading || weatherLoading) ? 'animate-spin' : ''}`} />
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
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden relative z-0">
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
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {req.title || 'Yêu cầu cứu hộ'}
                                        </p>
                                        {req.trackingCode && (
                                            <span className="flex-shrink-0 text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                                {req.trackingCode}
                                            </span>
                                        )}
                                    </div>
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
                            {`🌊 Thời tiết & Mực nước (${WEATHER_LOCATION.name})`}
                        </h3>

                        {weatherError && (
                            <div className="mb-2 text-[10px] text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
                                {weatherError}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-blue-50 border border-blue-100 rounded p-2">
                                <p className="text-[10px] text-blue-600 font-medium">Lượng mưa</p>
                                <p className="text-sm font-bold text-blue-800">
                                    {currentWeather?.current?.precipitation != null
                                        ? `${Number(currentWeather.current.precipitation).toFixed(1)} mm`
                                        : currentWeather?.current?.rain != null
                                            ? `${Number(currentWeather.current.rain).toFixed(1)} mm`
                                            : '--'}
                                </p>
                                <p className="text-[10px] text-blue-500">
                                    {currentWeather?.current?.weatherCode != null
                                        ? getWeatherLabel(currentWeather.current.weatherCode)
                                        : 'Chưa có dữ liệu'}
                                </p>
                            </div>
                            <div className="bg-amber-50 border border-amber-100 rounded p-2">
                                <p className="text-[10px] text-amber-600 font-medium">Lưu lượng sông</p>
                                <p className="text-sm font-bold text-amber-800">
                                    {floodRisk?.riverDischarge != null ? `${floodRisk.riverDischarge.toFixed(0)} m³/s` : '--'}
                                </p>
                                <p className="text-[10px] text-amber-500">
                                    {floodRisk?.riskLevel ? `Mức ${floodRisk.riskLevel}` : 'Chưa có cảnh báo'}
                                </p>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 text-center">
                            {weatherLoading
                                ? 'Đang cập nhật dữ liệu thời tiết...'
                                : activeAlerts.length > 0
                                    ? `${activeAlerts.length} cảnh báo nguy cơ cao trong 24h`
                                    : 'Dữ liệu thời tiết được đồng bộ từ API'}
                        </p>
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
