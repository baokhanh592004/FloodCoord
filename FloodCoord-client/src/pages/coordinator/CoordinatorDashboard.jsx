import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { coordinatorDashboardApi } from '../../services/coordinatorDashboardApi';
import {
  getCurrentWeather,
  getFloodRisk,
  getActiveAlerts,
  getWeatherLabel,
} from '../../services/weatherService';
import StatCard from '../../components/coordinator/StatCard';
import VerifyRequestModal from '../../components/coordinator/VerifyRequestModal';
import AssignTaskModal from '../../components/coordinator/AssignTaskModal';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  CheckBadgeIcon,
  XCircleIcon,
  BoltIcon,
  ChartBarIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const WEATHER_LOCATION = { name: 'Hồ Chí Minh', lat: 10.823, lon: 106.63 };
const LINE_TIME_RANGES = [
  { key: 'day', label: 'Ngày' },
  { key: 'week', label: 'Tuần' },
  { key: 'month', label: 'Tháng' },
  { key: 'year', label: 'Năm' },
];

const HCM_BOUNDS = {
  minLat: 10.65,
  maxLat: 10.93,
  minLon: 106.52,
  maxLon: 106.83,
};

const EMERGENCY_WEIGHT = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
  P1: 4,
  P2: 3,
  P3: 2,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function hashText(input = '') {
  return [...String(input)].reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function toMapPoint(req, index) {
  const lat = Number(req?.location?.latitude);
  const lon = Number(req?.location?.longitude);

  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    const x = ((lon - HCM_BOUNDS.minLon) / (HCM_BOUNDS.maxLon - HCM_BOUNDS.minLon)) * 100;
    const y = (1 - (lat - HCM_BOUNDS.minLat) / (HCM_BOUNDS.maxLat - HCM_BOUNDS.minLat)) * 100;
    return {
      x: clamp(x, 8, 92),
      y: clamp(y, 10, 88),
      hasRealCoordinates: true,
    };
  }

  const seed = hashText(req?.trackingCode || req?.requestId || index);
  return {
    x: 14 + (seed % 72),
    y: 18 + ((seed * 7) % 60),
    hasRealCoordinates: false,
  };
}

function formatTimeAgo(dateString) {
  if (!dateString) return '--';
  const diffMin = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
  if (diffMin < 1) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ`;
  return `${Math.floor(diffHour / 24)} ngày`;
}

function getPriorityLabel(priority) {
  const val = (priority || '').toUpperCase();
  if (!val) return 'P3';
  if (val.includes('CRITICAL') || val === 'P1' || val.includes('HIGH')) return 'P1';
  if (val === 'P2' || val.includes('MEDIUM')) return 'P2';
  return 'P3';
}

function getPriorityBadgeClass(priorityLabel) {
  if (priorityLabel === 'P1') return 'bg-danger-50 text-danger-dark border-danger-100';
  if (priorityLabel === 'P2') return 'bg-warning-50 text-warning-dark border-warning-100';
  return 'bg-info-50 text-info-dark border-info-100';
}

function DashboardMapViewportController({ points, selectedPoint }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();

    if (!points.length) return;

    if (points.length === 1) {
      const lat = Number(points[0]?.location?.latitude);
      const lon = Number(points[0]?.location?.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        map.setView([lat, lon], 13, { animate: false });
      }
      return;
    }

    const lats = points.map((p) => Number(p.location.latitude));
    const lons = points.map((p) => Number(p.location.longitude));

    map.fitBounds(
      [
        [Math.min(...lats), Math.min(...lons)],
        [Math.max(...lats), Math.max(...lons)],
      ],
      { padding: [24, 24], maxZoom: 14, animate: false }
    );
  }, [map, points]);

  useEffect(() => {
    const lat = Number(selectedPoint?.location?.latitude);
    const lon = Number(selectedPoint?.location?.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      map.panTo([lat, lon], { animate: true });
    }
  }, [map, selectedPoint?.requestId, selectedPoint?.location?.latitude, selectedPoint?.location?.longitude]);

  useEffect(() => {
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [map]);

  return null;
}

export default function CoordinatorDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertsError, setAlertsError] = useState('');
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState('');
  const [chartsLoading, setChartsLoading] = useState(false);
  const [chartsError, setChartsError] = useState('');
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState('');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [floodRisk, setFloodRisk] = useState(null);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [lineTimeRange, setLineTimeRange] = useState('day');
  const [lastRefresh, setLastRefresh] = useState(null);
  const [clockTick, setClockTick] = useState(Date.now());
  const [selectedMapRequestId, setSelectedMapRequestId] = useState(null);
  const [selectedActionRequest, setSelectedActionRequest] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setListLoading(true);
    setChartsLoading(true);
    setMapLoading(true);
    setListError('');
    setChartsError('');
    setMapError('');

    try {
      const reqData = await coordinatorDashboardApi.getRequestsWithDetails();
      setRequests(reqData || []);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load requests:', error);
      setRequests([]);
      setListError('Không thể tải danh sách yêu cầu ưu tiên.');
      setChartsError('Không thể tải dữ liệu biểu đồ nhịp độ yêu cầu.');
      setMapError('Không thể tải dữ liệu bản đồ yêu cầu.');
    } finally {
      setLoading(false);
      setListLoading(false);
      setChartsLoading(false);
      setMapLoading(false);
    }
  }, []);

  const loadWeatherData = useCallback(async () => {
    setAlertsLoading(true);
    setAlertsError('');

    const [currentResult, riskResult, alertsResult] = await Promise.allSettled([
      getCurrentWeather(WEATHER_LOCATION.lat, WEATHER_LOCATION.lon),
      getFloodRisk(WEATHER_LOCATION.lat, WEATHER_LOCATION.lon),
      getActiveAlerts(24),
    ]);

    if (currentResult.status === 'fulfilled') {
      setCurrentWeather(currentResult.value);
    } else {
      console.error('Failed to load current weather:', currentResult.reason);
    }

    if (riskResult.status === 'fulfilled') {
      setFloodRisk(riskResult.value);
    } else {
      console.error('Failed to load flood risk:', riskResult.reason);
    }

    if (alertsResult.status === 'fulfilled') {
      setActiveAlerts(alertsResult.value || []);
    } else {
      console.error('Failed to load active alerts:', alertsResult.reason);
      setActiveAlerts([]);
    }

    if (
      currentResult.status === 'rejected'
      && riskResult.status === 'rejected'
      && alertsResult.status === 'rejected'
    ) {
      setAlertsError('Không thể tải dữ liệu cảnh báo và thời tiết. Vui lòng thử lại sau.');
    }

    setAlertsLoading(false);
  }, []);

  useEffect(() => {
    loadRequests();
    loadWeatherData();

    const requestInterval = setInterval(loadRequests, 30000);
    const weatherInterval = setInterval(loadWeatherData, 10 * 60 * 1000);
    const heartbeat = setInterval(() => setClockTick(Date.now()), 10000);

    return () => {
      clearInterval(requestInterval);
      clearInterval(weatherInterval);
      clearInterval(heartbeat);
    };
  }, [loadRequests, loadWeatherData]);

  const handleRefresh = async () => {
    await Promise.all([loadRequests(), loadWeatherData()]);
  };

  const handleOpenVerify = (event, req) => {
    event.stopPropagation();
    setSelectedMapRequestId(req.requestId);
    setSelectedActionRequest(req);
    setShowVerifyModal(true);
  };

  const handleOpenAssign = (event, req) => {
    event.stopPropagation();
    setSelectedMapRequestId(req.requestId);
    setSelectedActionRequest(req);
    setShowAssignModal(true);
  };

  const handleActionSuccess = async () => {
    setShowVerifyModal(false);
    setShowAssignModal(false);
    setSelectedActionRequest(null);
    await loadRequests();
  };

  const stats = useMemo(
    () => ({
      pending: requests.filter((r) => r.status === 'PENDING').length,
      validated: requests.filter((r) => r.status === 'VERIFIED' || r.status === 'VALIDATED').length,
      inProgress: requests.filter((r) => ['IN_PROGRESS', 'MOVING', 'ARRIVED', 'RESCUING', 'ASSIGNED'].includes(r.status)).length,
      completed: requests.filter((r) => r.status === 'COMPLETED').length,
      rejected: requests.filter((r) => r.status === 'REJECTED').length,
    }),
    [requests]
  );

  const urgentOver15Count = useMemo(
    () =>
      requests.filter((r) => {
        if (r.status !== 'PENDING' || !r.createdAt) return false;
        const elapsedMin = (Date.now() - new Date(r.createdAt).getTime()) / 60000;
        return elapsedMin >= 15;
      }).length,
    [requests]
  );

  const highPriorityRequests = useMemo(() => {
    return [...requests]
      .filter((r) => ['PENDING', 'VERIFIED', 'VALIDATED'].includes(r.status))
      .sort((a, b) => {
        const weightA = EMERGENCY_WEIGHT[(a.emergencyLevel || '').toUpperCase()] || 0;
        const weightB = EMERGENCY_WEIGHT[(b.emergencyLevel || '').toUpperCase()] || 0;
        if (weightA !== weightB) return weightB - weightA;
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      })
      .slice(0, 10);
  }, [requests]);

  useEffect(() => {
    if (!highPriorityRequests.length) {
      setSelectedMapRequestId(null);
      return;
    }

    const stillExists = highPriorityRequests.some((req) => req.requestId === selectedMapRequestId);

    if (!stillExists) {
      setSelectedMapRequestId(highPriorityRequests[0].requestId);
    }
  }, [highPriorityRequests, selectedMapRequestId]);

  const mapPoints = useMemo(
    () =>
      highPriorityRequests.slice(0, 8).map((req, index) => ({
        ...req,
        ...toMapPoint(req, index),
      })),
    [highPriorityRequests]
  );

  const selectedMapPoint = useMemo(
    () => mapPoints.find((req) => req.requestId === selectedMapRequestId) || null,
    [mapPoints, selectedMapRequestId]
  );

  const realMapPoints = useMemo(
    () =>
      mapPoints.filter((req) => {
        const lat = Number(req?.location?.latitude);
        const lon = Number(req?.location?.longitude);
        return Number.isFinite(lat) && Number.isFinite(lon);
      }),
    [mapPoints]
  );

  const mapLegend = useMemo(() => {
    return mapPoints.reduce(
      (acc, req) => {
        const priority = getPriorityLabel(req.emergencyLevel);
        if (priority === 'P1') acc.p1 += 1;
        else if (priority === 'P2') acc.p2 += 1;
        else acc.p3 += 1;

        if (req.hasRealCoordinates) acc.real += 1;
        return acc;
      },
      { p1: 0, p2: 0, p3: 0, real: 0 }
    );
  }, [mapPoints]);

  const lineChartData = useMemo(() => {
    if (!requests.length) return [];

    const now = new Date();

    const rangeDays =
      lineTimeRange === 'day'
        ? 1
        : lineTimeRange === 'week'
          ? 7
          : lineTimeRange === 'month'
            ? 30
            : 365;
    const rangeStart = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000);

    const toBucketStart = (date) => {
      if (lineTimeRange === 'day') {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), 0, 0, 0);
      }
      if (lineTimeRange === 'year') {
        return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
      }
      return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    };

    const formatBucketLabel = (bucketStart) => {
      if (lineTimeRange === 'day') {
        return bucketStart.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      }
      if (lineTimeRange === 'year') {
        return bucketStart.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });
      }
      return bucketStart.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };

    const grouped = new Map();

    requests.forEach((r) => {
      if (!r.createdAt) return;
      const d = new Date(r.createdAt);
      if (Number.isNaN(d.getTime()) || d < rangeStart || d > now) return;

      const bucketStart = toBucketStart(d);
      const key = bucketStart.getTime();
      grouped.set(key, (grouped.get(key) || 0) + 1);
    });

    return [...grouped.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([bucketStartMs, requestsCount]) => ({
        label: formatBucketLabel(new Date(bucketStartMs)),
        requestsCount,
      }))
      .slice(-20);
  }, [requests, lineTimeRange]);

  const lastRefreshSeconds = lastRefresh
    ? Math.floor((clockTick - lastRefresh.getTime()) / 1000)
    : null;
  const isLiveStale = lastRefreshSeconds != null && lastRefreshSeconds > 75;

  const current = currentWeather?.current;
  const rainValue = current?.precipitation ?? current?.rain;
  const floodRiskLabel = floodRisk?.riskLevel || (activeAlerts.length > 0 ? 'CAO' : 'THẤP');

  return (
    <div className="h-full overflow-auto bg-neutral-50 p-4 sm:p-5">
      <div className="mx-auto max-w-330 space-y-4">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Tổng quan</h1>
            <p className="text-xs text-neutral-400">
              Tự động cập nhật: {lastRefresh ? lastRefresh.toLocaleString('vi-VN') : '--'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                isLiveStale
                  ? 'border-warning-100 bg-warning-50 text-warning-dark'
                  : 'border-success-100 bg-success-50 text-success-dark'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isLiveStale ? 'bg-warning' : 'bg-success animate-pulse'}`} />
              {isLiveStale ? 'Live chậm' : 'Live'}
              {lastRefreshSeconds != null && ` • ${lastRefreshSeconds}s`}
            </span>

            <button
              onClick={handleRefresh}
              disabled={loading || alertsLoading}
              className="inline-flex items-center gap-1.5 rounded-md border border-coordinator bg-coordinator px-3 py-2 text-xs font-semibold text-white hover:bg-coordinator-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ArrowPathIcon className={`h-4 w-4 ${(loading || alertsLoading) ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
          </div>
        </header>

        <section className="space-y-2">
          <div className="rounded-xl border border-danger-100 bg-danger-50 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-2 text-danger-dark">
                <ExclamationTriangleIcon className="mt-0.5 h-4 w-4" />
                <p className="text-sm">
                  <span className="font-semibold">KHẨN:</span>{' '}
                  {urgentOver15Count > 0
                    ? `${urgentOver15Count} yêu cầu chờ quá 15 phút`
                    : 'Không có yêu cầu chờ quá 15 phút'}
                </p>
              </div>
              <Link
                to="/coordinator/requests"
                className="rounded-md border border-danger-100 bg-white px-3 py-1.5 text-xs font-semibold text-danger-dark hover:bg-danger-100"
              >
                Xem chi tiết
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-warning-100 bg-warning-50 px-4 py-3 text-sm text-warning-900">
            <p>
              <span className="font-semibold">Cảnh báo lũ mức {floodRiskLabel}</span>
              {' · '}
              {floodRisk?.recommendation || 'Theo dõi mưa lớn và mực nước sông tăng nhanh.'}
              {' · '}
              {current?.temperature_2m != null ? `${current.temperature_2m.toFixed(1)}°C` : '--'}
              {' · '}
              {rainValue != null ? `${Number(rainValue).toFixed(1)}mm` : '--'}
            </p>
          </div>

          {alertsLoading && (
            <div className="rounded-md border border-info-100 bg-info-50 px-3 py-2 text-xs text-info-dark">
              Đang cập nhật dữ liệu cảnh báo và thời tiết...
            </div>
          )}

          {alertsError && (
            <div className="rounded-md border border-danger-100 bg-danger-50 px-3 py-2 text-xs text-danger-dark">
              {alertsError}
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard icon={<ExclamationTriangleIcon className="h-5 w-5" />} count={stats.pending} label="Chờ duyệt" color="red" />
          <StatCard icon={<CheckCircleIcon className="h-5 w-5" />} count={stats.validated} label="Đã xác thực" color="blue" />
          <StatCard icon={<ClockIcon className="h-5 w-5" />} count={stats.inProgress} label="Đang thực thi" color="yellow" />
          <StatCard icon={<CheckBadgeIcon className="h-5 w-5" />} count={stats.completed} label="Hoàn thành" color="green" />
          <StatCard icon={<XCircleIcon className="h-5 w-5" />} count={stats.rejected} label="Không duyệt" color="rose" />
        </section>

        <section className="rounded-xl border border-neutral-100 bg-white p-4">
          {listError && (
            <div className="mb-3 rounded-md border border-warning-100 bg-warning-50 px-3 py-2 text-sm text-warning-dark">
              {listError}
            </div>
          )}

          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-neutral-900">Yêu cầu ưu tiên cao</h2>
              <p className="text-xs text-neutral-400">Nhấp một dòng để làm nổi bật điểm trên bản đồ.</p>
            </div>
            <span className="rounded-full bg-danger-50 px-2.5 py-1 text-xs font-semibold text-danger-dark">
              {stats.pending} chờ
            </span>
          </div>

          <div className="space-y-1.5">
            {listLoading ? (
              <div className="rounded-lg border border-dashed border-neutral-100 py-8 text-center text-sm text-neutral-400">
                Đang tải danh sách ưu tiên...
              </div>
            ) : highPriorityRequests.slice(0, 5).map((req) => {
              const reqId = req.requestId;
              const priorityLabel = getPriorityLabel(req.emergencyLevel);
              const isSelected = selectedMapRequestId === reqId;
              const elapsed = formatTimeAgo(req.createdAt);
              const canVerify = req.status === 'PENDING';
              const canAssign = ['VERIFIED', 'VALIDATED'].includes(req.status);

              return (
                <div
                  role="button"
                  tabIndex={0}
                  key={reqId}
                  onClick={() => setSelectedMapRequestId(reqId)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      setSelectedMapRequestId(reqId);
                    }
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                    isSelected
                      ? 'border-coordinator-100 bg-coordinator-50'
                      : 'border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <div className="grid grid-cols-[82px_68px_1fr_auto_auto] items-center gap-2 text-sm">
                    <span className="font-mono text-neutral-600">#{req.trackingCode || reqId}</span>
                    <span className={`inline-flex w-fit items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${getPriorityBadgeClass(priorityLabel)}`}>
                      {priorityLabel}
                    </span>
                    <span className="truncate text-neutral-800">
                      {req.location?.addressText || req.title || 'Địa điểm chưa rõ'}
                    </span>
                    <span className="rounded-full bg-danger-50 px-2 py-0.5 text-[11px] font-semibold text-danger-dark">
                      +{elapsed}
                    </span>

                    <div className="flex items-center justify-end gap-1">
                      {canVerify && (
                        <button
                          type="button"
                          onClick={(event) => handleOpenVerify(event, req)}
                          className="rounded-md border border-coordinator-100 bg-coordinator-50 px-2.5 py-1 text-[11px] font-semibold text-coordinator-dark hover:bg-coordinator-100"
                        >
                          Duyệt
                        </button>
                      )}

                      {canAssign && (
                        <button
                          type="button"
                          onClick={(event) => handleOpenAssign(event, req)}
                          className="rounded-md border border-info-100 bg-info-50 px-2.5 py-1 text-[11px] font-semibold text-info-dark hover:bg-info-100"
                        >
                          Phân công
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {!listLoading && !highPriorityRequests.length && (
              <div className="rounded-lg border border-dashed border-neutral-100 py-8 text-center text-sm text-neutral-400">
                Không có yêu cầu ưu tiên cần xử lý.
              </div>
            )}
          </div>

          <div className="mt-3">
            <Link
              to="/coordinator/requests"
              className="inline-flex w-full items-center justify-center rounded-lg border border-neutral-100 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
            >
              Xem tất cả yêu cầu
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
          <div className="rounded-xl border border-neutral-100 bg-white p-4">
            {chartsError && (
              <div className="mb-3 rounded-md border border-warning-100 bg-warning-50 px-3 py-2 text-sm text-warning-dark">
                {chartsError}
              </div>
            )}

            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-neutral-900">Yêu cầu nhận được</h2>
                <p className="text-xs text-neutral-400">Nhịp độ yêu cầu theo thời gian thực.</p>
              </div>

              <div className="flex gap-1 rounded-lg bg-neutral-100 p-1">
                {LINE_TIME_RANGES.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setLineTimeRange(opt.key)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                      lineTimeRange === opt.key ? 'bg-white text-coordinator-dark shadow-sm' : 'text-neutral-400 hover:text-neutral-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-64">
              {chartsLoading ? (
                <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                  Đang tải biểu đồ yêu cầu...
                </div>
              ) : lineChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={lineChartData}>
                    <defs>
                      <linearGradient id="requestsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="requestsCount"
                      stroke="#0d9488"
                      strokeWidth={2}
                      fill="url(#requestsGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                  Chưa có dữ liệu cho khoảng thời gian này.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-100 bg-white p-4">
            {mapError && (
              <div className="mb-3 rounded-md border border-warning-100 bg-warning-50 px-3 py-2 text-sm text-warning-dark">
                {mapError}
              </div>
            )}

            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold text-neutral-900">Bản đồ yêu cầu</h2>
                <p className="text-xs text-neutral-400">Vị trí theo danh sách ưu tiên.</p>
              </div>
              <MapPinIcon className="h-5 w-5 text-coordinator" />
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 rounded-full border border-danger-100 bg-danger-50 px-2 py-0.5 font-semibold text-danger-dark">
                <span className="h-1.5 w-1.5 rounded-full bg-danger" />
                P1: {mapLegend.p1}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-warning-100 bg-warning-50 px-2 py-0.5 font-semibold text-warning-dark">
                <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                P2: {mapLegend.p2}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-info-100 bg-info-50 px-2 py-0.5 font-semibold text-info-dark">
                <span className="h-1.5 w-1.5 rounded-full bg-info" />
                P3: {mapLegend.p3}
              </span>
              <span className="ml-auto text-neutral-500">
                GPS chính xác: {mapLegend.real}/{mapPoints.length}
              </span>
            </div>

            {mapLoading ? (
              <div className="flex h-64 items-center justify-center rounded-xl border border-neutral-100 text-sm text-neutral-400">
                Đang tải bản đồ yêu cầu...
              </div>
            ) : mapPoints.length === 0 ? (
              <div className="flex h-72 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 text-center text-sm text-neutral-400">
                <MapPinIcon className="h-6 w-6 text-neutral-300" />
                <span>Chưa có điểm ưu tiên để hiển thị trên bản đồ.</span>
              </div>
            ) : realMapPoints.length === 0 ? (
              <div className="relative h-72 overflow-hidden rounded-xl border border-info-100 bg-linear-to-br from-info-50 via-success-50 to-neutral-50">
                <div className="pointer-events-none absolute inset-0 opacity-35">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[size:38px_38px]" />
                </div>

                <div className="absolute left-2 top-2 z-10 rounded-md border border-info-100 bg-white/90 px-2 py-1 text-[10px] font-medium text-info-dark">
                  Chế độ ước lượng vị trí (thiếu GPS)
                </div>

                {mapPoints.map((req) => {
                  const reqId = req.requestId;
                  const selected = selectedMapRequestId === reqId;
                  const priority = getPriorityLabel(req.emergencyLevel);
                  const colorClass =
                    priority === 'P1'
                      ? 'bg-danger'
                      : priority === 'P2'
                        ? 'bg-warning'
                        : 'bg-info';

                  return (
                    <button
                      key={reqId}
                      type="button"
                      title={req.location?.addressText || req.title || 'Yêu cầu cứu hộ'}
                      onClick={() => setSelectedMapRequestId(reqId)}
                      className="group absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
                      style={{ left: `${req.x}%`, top: `${req.y}%` }}
                    >
                      <span className={`absolute -inset-2 rounded-full ${selected ? 'animate-ping bg-white/80' : ''}`} />
                      <span
                        className={`relative block h-4 w-4 rounded-full border-2 border-white shadow-md ring-2 ring-white/70 transition-transform ${
                          selected ? 'scale-110' : 'group-hover:scale-105'
                        } ${colorClass}`}
                      />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="h-72 overflow-hidden rounded-xl border border-success-100">
                <MapContainer
                  center={[WEATHER_LOCATION.lat, WEATHER_LOCATION.lon]}
                  zoom={12}
                  className="h-full w-full"
                  scrollWheelZoom
                >
                  <DashboardMapViewportController points={realMapPoints} selectedPoint={selectedMapPoint} />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {realMapPoints.map((req) => {
                    const reqId = req.requestId;
                    const selected = selectedMapRequestId === reqId;
                    const priority = getPriorityLabel(req.emergencyLevel);
                    const fillColor =
                      priority === 'P1' ? '#dc2626' : priority === 'P2' ? '#ca8a04' : '#0ea5e9';

                    return (
                      <CircleMarker
                        key={reqId}
                        center={[Number(req.location.latitude), Number(req.location.longitude)]}
                        radius={selected ? 10 : 8}
                        pathOptions={{ color: '#ffffff', weight: selected ? 3 : 2, fillColor, fillOpacity: 1 }}
                        eventHandlers={{ click: () => setSelectedMapRequestId(reqId) }}
                      >
                        <Popup>
                          <div className="text-xs">
                            <p className="font-semibold text-neutral-800">
                              {req.location?.addressText || req.title || 'Điểm cứu hộ'}
                            </p>
                            <p className="text-neutral-600">Ưu tiên: {priority}</p>
                            <p className="text-neutral-500">Mã: #{req.trackingCode || reqId}</p>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })}
                </MapContainer>
              </div>
            )}

            {selectedMapPoint && (
              <div className="mt-2 rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2 text-[11px] text-neutral-600">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${getPriorityBadgeClass(
                      getPriorityLabel(selectedMapPoint.emergencyLevel)
                    )}`}
                  >
                    {getPriorityLabel(selectedMapPoint.emergencyLevel)}
                  </span>
                  <span className="font-medium text-neutral-700">
                    {selectedMapPoint.location?.addressText || selectedMapPoint.title || 'Địa điểm chưa rõ'}
                  </span>
                  <span className="ml-auto rounded-full bg-danger-50 px-2 py-0.5 font-semibold text-danger-dark">
                    +{formatTimeAgo(selectedMapPoint.createdAt)}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-2 text-[11px] text-neutral-400">
              {realMapPoints.length === 0
                ? 'Đang hiển thị vị trí ước lượng vì dữ liệu chưa có GPS chính xác.'
                : `Đang hiển thị ${realMapPoints.length}/${mapPoints.length} điểm có tọa độ GPS thực.`}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-coordinator-100 bg-linear-to-r from-coordinator-50 via-info-50 to-manager-50 px-4 py-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 md:gap-4">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-neutral-900">Xem phân tích chi tiết</h3>
                <p className="text-xs text-neutral-600">Dashboard tập trung điều phối thời gian thực.</p>
              </div>
              <Link
                to="/coordinator/analytics"
                className="inline-flex items-center gap-1.5 rounded-lg border border-coordinator-100 bg-white px-3 py-1.5 text-xs font-semibold text-coordinator-dark hover:bg-coordinator-50"
              >
                <ChartBarIcon className="h-4 w-4" />
                Watch Details Analytics
              </Link>
            </div>

            <div className="h-px w-full bg-coordinator-100 md:hidden" />

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-coordinator-100 text-xs text-neutral-600 md:ml-4 md:border-l md:pl-4">
              <span className="inline-flex items-center gap-1">
                <BoltIcon className="h-4 w-4 text-success" />
                <strong>{stats.inProgress}</strong> nhiệm vụ đang thực thi
              </span>
              <span>
                Cảnh báo hoạt động: <strong>{activeAlerts.length}</strong>
              </span>
              <span>
                Thời tiết: {current?.weatherCode != null ? getWeatherLabel(current.weatherCode) : 'Chưa có dữ liệu'}
              </span>
            </div>
          </div>
        </section>

        <VerifyRequestModal
          request={selectedActionRequest}
          isOpen={showVerifyModal}
          onClose={() => {
            setShowVerifyModal(false);
            setSelectedActionRequest(null);
          }}
          onSuccess={handleActionSuccess}
        />

        <AssignTaskModal
          request={selectedActionRequest}
          isOpen={showAssignModal}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedActionRequest(null);
          }}
          onSuccess={handleActionSuccess}
        />
      </div>
    </div>
  );
}
