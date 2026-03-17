import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { coordinatorApi } from '../../services/coordinatorApi';
import {
    getCurrentWeather,
    getWeatherForecast,
    getFloodRisk,
    getActiveAlerts,
    getWeatherLabel,
} from '../../services/weatherService';
import StatCard from '../../components/coordinator/StatCard';
import {
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    ArrowPathIcon,
    CheckBadgeIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

/**
 * CoordinatorDashboard — Trang tổng quan cho điều phối viên
 *
 * Hiển thị:
 * - 4 Stat cards: Pending / Validated / In Progress / Completed
 * - Line chart: Số yêu cầu nhận theo thời gian (ngày/tuần/tháng/năm)
 * - Bar chart: So sánh số yêu cầu giữa các khoảng thời gian theo trạng thái
 * - Auto-refresh mỗi 30 giây
 */
export default function CoordinatorDashboard() {
    const WEATHER_LOCATION = { name: 'Hồ Chí Minh', lat: 10.823, lon: 106.63 };

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [weatherError, setWeatherError] = useState('');
    const [currentWeather, setCurrentWeather] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [floodRisk, setFloodRisk] = useState(null);
    const [activeAlerts, setActiveAlerts] = useState([]);
    const [lineTimeRange, setLineTimeRange] = useState('day');    // day | week | month | year
    const [barTimeRange, setBarTimeRange] = useState('day');      // day | week | month | year
    const [barStatusFilter, setBarStatusFilter] = useState('all'); // all | validated | in_progress | completed

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const reqData = await coordinatorApi.getAllRequests();
            setRequests(reqData || []);
        } catch (error) {
            console.error('Failed to load requests:', error);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadWeatherData = useCallback(async () => {
        setWeatherLoading(true);
        setWeatherError('');
        try {
            const [currentData, forecastData, riskData, alertsData] = await Promise.all([
                getCurrentWeather(WEATHER_LOCATION.lat, WEATHER_LOCATION.lon),
                getWeatherForecast(WEATHER_LOCATION.lat, WEATHER_LOCATION.lon, 2),
                getFloodRisk(WEATHER_LOCATION.lat, WEATHER_LOCATION.lon),
                getActiveAlerts(24),
            ]);

            setCurrentWeather(currentData);
            setForecast(forecastData);
            setFloodRisk(riskData);
            setActiveAlerts(alertsData || []);
        } catch (error) {
            console.error('Failed to load weather dashboard data:', error);
            setWeatherError('Không thể tải dữ liệu thời tiết. Vui lòng thử lại sau.');
        } finally {
            setWeatherLoading(false);
        }
    }, [WEATHER_LOCATION.lat, WEATHER_LOCATION.lon]);

    useEffect(() => {
        loadData();
        loadWeatherData();
        const interval = setInterval(loadData, 30000);
        const weatherInterval = setInterval(loadWeatherData, 10 * 60 * 1000);
        return () => {
            clearInterval(interval);
            clearInterval(weatherInterval);
        };
    }, [loadData, loadWeatherData]);

    const handleRefresh = async () => {
        await Promise.all([loadData(), loadWeatherData()]);
    };

    // ====== STAT CARDS ======
    const stats = useMemo(() => ({
        pending: requests.filter((r) => r.status === 'PENDING').length,
        validated: requests.filter((r) => r.status === 'VERIFIED' || r.status === 'VALIDATED').length,
        inProgress: requests.filter((r) => ['IN_PROGRESS', 'MOVING', 'ARRIVED', 'RESCUING'].includes(r.status)).length,
        completed: requests.filter((r) => r.status === 'COMPLETED').length,
        rejected: requests.filter((r) => r.status === 'REJECTED').length,
    }), [requests]);

    // ====== LINE CHART: Số yêu cầu nhận theo thời gian ======
    const lineChartData = useMemo(() => {
        if (!requests.length) return [];

        const now = new Date();
        const groupBy = (dateStr) => {
            const d = new Date(dateStr);
            switch (lineTimeRange) {
                case 'day': return d.toLocaleDateString('vi-VN', { hour: '2-digit', hour12: false });
                case 'week': return d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
                case 'month': return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                case 'year': return d.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });
                default: return d.toLocaleDateString('vi-VN');
            }
        };

        // Lọc theo khoảng thời gian
        const filtered = requests.filter((r) => {
            if (!r.createdAt) return false;
            const d = new Date(r.createdAt);
            const diffMs = now - d;
            const diffDays = diffMs / (1000 * 60 * 60 * 24);
            switch (lineTimeRange) {
                case 'day': return diffDays <= 1;
                case 'week': return diffDays <= 7;
                case 'month': return diffDays <= 30;
                case 'year': return diffDays <= 365;
                default: return true;
            }
        });

        // Nhóm theo label
        const groups = {};
        filtered.forEach((r) => {
            const key = groupBy(r.createdAt);
            groups[key] = (groups[key] || 0) + 1;
        });

        return Object.entries(groups)
            .map(([label, count]) => ({ label, 'Yêu cầu': count }))
            .slice(-20); // Giới hạn 20 điểm
    }, [requests, lineTimeRange]);

    // ====== BAR CHART: So sánh số yêu cầu theo trạng thái ======
    const barChartData = useMemo(() => {
        if (!requests.length) return [];

        const now = new Date();
        const groupBy = (dateStr) => {
            const d = new Date(dateStr);
            switch (barTimeRange) {
                case 'day': return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                case 'week': {
                    // Tuần bắt đầu từ thứ 2
                    const weekStart = new Date(d);
                    weekStart.setDate(d.getDate() - d.getDay() + 1);
                    return `T${weekStart.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`;
                }
                case 'month': return d.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });
                case 'year': return d.getFullYear().toString();
                default: return d.toLocaleDateString('vi-VN');
            }
        };

        const statusMatch = (r) => {
            switch (barStatusFilter) {
                case 'validated': return r.status === 'VERIFIED' || r.status === 'VALIDATED';
                case 'in_progress': return ['IN_PROGRESS', 'MOVING', 'ARRIVED', 'RESCUING'].includes(r.status);
                case 'completed': return r.status === 'COMPLETED';
                case 'rejected': return r.status === 'REJECTED';
                default: return true;
            }
        };

        // Lọc thời gian
        const filtered = requests.filter((r) => {
            if (!r.createdAt) return false;
            const d = new Date(r.createdAt);
            const diffDays = (now - d) / (1000 * 60 * 60 * 24);
            switch (barTimeRange) {
                case 'day': return diffDays <= 14; // 14 ngày gần nhất
                case 'week': return diffDays <= 56; // 8 tuần
                case 'month': return diffDays <= 365;
                case 'year': return true;
                default: return true;
            }
        }).filter(statusMatch);

        const groups = {};
        filtered.forEach((r) => {
            const key = groupBy(r.createdAt);
            groups[key] = (groups[key] || 0) + 1;
        });

        return Object.entries(groups)
            .map(([label, count]) => ({ label, 'Số lượng': count }))
            .slice(-12);
    }, [requests, barTimeRange, barStatusFilter]);

    const timeRangeOptions = [
        { key: 'day', label: 'Ngày' },
        { key: 'week', label: 'Tuần' },
        { key: 'month', label: 'Tháng' },
        { key: 'year', label: 'Năm' },
    ];

    const current = currentWeather?.current;
    const rainValue = current?.precipitation ?? current?.rain;

    const shortForecastItems = useMemo(() => {
        const hourly = forecast?.hourly;
        if (!hourly?.time?.length) return [];

        const candidateIndexes = [0, 6, 12].filter((index) => index < hourly.time.length);
        return candidateIndexes.map((index) => ({
            time: hourly.time[index],
            rain: hourly.rain?.[index],
            temperature: hourly.temperature_2m?.[index],
            rainProbability: hourly.precipitationProbability?.[index],
            windSpeed: hourly.wind_speed_10m?.[index],
        }));
    }, [forecast]);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
                    <p className="text-sm text-gray-500">Thống kê tình hình yêu cầu cứu hộ hiện tại.</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700 disabled:opacity-60"
                >
                    <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Đang tải...' : 'Làm mới'}
                </button>
            </div>

            {/* 5 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                    icon={<ExclamationTriangleIcon className="h-6 w-6" />}
                    count={stats.pending}
                    label="Chờ duyệt"
                    color="red"
                />
                <StatCard
                    icon={<CheckCircleIcon className="h-6 w-6" />}
                    count={stats.validated}
                    label="Đã xác thực"
                    color="blue"
                />
                <StatCard
                    icon={<ClockIcon className="h-6 w-6" />}
                    count={stats.inProgress}
                    label="Đang thực thi"
                    color="yellow"
                />
                <StatCard
                    icon={<CheckBadgeIcon className="h-6 w-6" />}
                    count={stats.completed}
                    label="Hoàn thành"
                    color="green"
                />
                <StatCard
                    icon={<XCircleIcon className="h-6 w-6" />}
                    count={stats.rejected}
                    label="Không duyệt"
                    color="rose"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ===== LINE CHART ===== */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Yêu cầu nhận được</h2>
                            <p className="text-xs text-gray-500">Số yêu cầu theo thời gian</p>
                        </div>
                        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                            {timeRangeOptions.map((opt) => (
                                <button
                                    key={opt.key}
                                    onClick={() => setLineTimeRange(opt.key)}
                                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                                        lineTimeRange === opt.key
                                            ? 'bg-white text-teal-700 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-64">
                        {lineChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={lineChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="Yêu cầu"
                                        stroke="#0d9488"
                                        strokeWidth={2}
                                        dot={{ r: 3 }}
                                        activeDot={{ r: 5 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-sm text-gray-400">
                                Chưa có dữ liệu cho khoảng thời gian này
                            </div>
                        )}
                    </div>
                </div>

                {/* ===== BAR CHART ===== */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">So sánh yêu cầu</h2>
                            <p className="text-xs text-gray-500">So sánh theo khoảng thời gian</p>
                        </div>
                        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                            {timeRangeOptions.map((opt) => (
                                <button
                                    key={opt.key}
                                    onClick={() => setBarTimeRange(opt.key)}
                                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                                        barTimeRange === opt.key
                                            ? 'bg-white text-teal-700 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bộ lọc trạng thái cho bar chart */}
                    <div className="flex gap-1 mb-4 flex-wrap">
                        {[
                            { key: 'all', label: 'Tất cả' },
                            { key: 'validated', label: 'Đã xác thực' },
                            { key: 'in_progress', label: 'Đang thực thi' },
                            { key: 'completed', label: 'Hoàn thành' },
                            { key: 'rejected', label: 'Không duyệt' },
                        ].map((opt) => (
                            <button
                                key={opt.key}
                                onClick={() => setBarStatusFilter(opt.key)}
                                className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${
                                    barStatusFilter === opt.key
                                        ? 'bg-teal-50 text-teal-700 border-teal-300'
                                        : 'text-gray-500 border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    <div className="h-52">
                        {barChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Bar dataKey="Số lượng" fill="#0d9488" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-sm text-gray-400">
                                Chưa có dữ liệu cho khoảng thời gian này
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ===== WEATHER & FLOOD STATUS ===== */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">🌊 Thời tiết & Mực nước</h2>
                        <p className="text-xs text-gray-500">{`Thông tin thời tiết và cảnh báo lũ lụt tại ${WEATHER_LOCATION.name}`}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                        {weatherLoading ? 'Đang cập nhật...' : 'Live API'}
                    </span>
                </div>

                {weatherError && (
                    <div className="mb-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                        {weatherError}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Nhiệt độ */}
                    <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">🌡️</span>
                            <p className="text-xs font-semibold text-sky-700">Nhiệt độ</p>
                        </div>
                        <p className="text-2xl font-bold text-sky-900">
                            {current?.temperature_2m != null ? `${current.temperature_2m.toFixed(1)}°C` : '--'}
                        </p>
                        <p className="text-xs text-sky-600 mt-1">
                            {current?.weatherCode != null ? getWeatherLabel(current.weatherCode) : 'Chưa có dữ liệu'}
                        </p>
                    </div>

                    {/* Lượng mưa */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">🌧️</span>
                            <p className="text-xs font-semibold text-blue-700">Lượng mưa</p>
                        </div>
                        <p className="text-2xl font-bold text-blue-900">
                            {rainValue != null ? `${Number(rainValue).toFixed(1)} mm` : '--'}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                            {current?.relative_humidity_2m != null
                                ? `Độ ẩm ${current.relative_humidity_2m}%`
                                : 'Không có dữ liệu độ ẩm'}
                        </p>
                    </div>

                    {/* Mực nước */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">🌊</span>
                            <p className="text-xs font-semibold text-amber-700">Lưu lượng sông</p>
                        </div>
                        <p className="text-2xl font-bold text-amber-900">
                            {floodRisk?.riverDischarge != null ? `${floodRisk.riverDischarge.toFixed(0)} m³/s` : '--'}
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                            {floodRisk?.currentPrecipitation != null
                                ? `Mưa hiện tại ${floodRisk.currentPrecipitation.toFixed(1)} mm`
                                : 'Không có dữ liệu mưa hiện tại'}
                        </p>
                    </div>

                    {/* Cảnh báo */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">🚨</span>
                            <p className="text-xs font-semibold text-red-700">Cảnh báo</p>
                        </div>
                        <p className="text-sm font-bold text-red-900">
                            {floodRisk?.riskLevel ? `Mức ${floodRisk.riskLevel}` : 'Chưa có cảnh báo'}
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                            {floodRisk?.recommendation || (activeAlerts.length > 0
                                ? `${activeAlerts.length} cảnh báo nguy cơ cao trong 24h`
                                : 'Không có cảnh báo nguy cơ cao')}
                        </p>
                    </div>
                </div>

                {/* Dự báo ngắn hạn */}
                <div className="mt-4 bg-gray-50 rounded-lg p-3">
                    <h3 className="text-xs font-semibold text-gray-700 mb-2">📋 Dự báo 24h tới</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        {shortForecastItems.length > 0 ? shortForecastItems.map((item) => (
                            <div key={item.time} className="flex items-start gap-2">
                                <span className="text-gray-400 font-medium min-w-[60px]">
                                    {new Date(item.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="text-gray-700">
                                    {`🌧️ ${item.rainProbability ?? 0}% khả năng mưa, `}
                                    {`lượng mưa ${item.rain != null ? Number(item.rain).toFixed(1) : '0.0'}mm, `}
                                    {`nhiệt độ ${item.temperature != null ? Number(item.temperature).toFixed(1) : '--'}°C, `}
                                    {`gió ${item.windSpeed != null ? Number(item.windSpeed).toFixed(0) : '--'}km/h.`}
                                </span>
                            </div>
                        )) : (
                            <div className="sm:col-span-3 text-center text-gray-400">
                                Chưa có dữ liệu dự báo ngắn hạn
                            </div>
                        )}
                    </div>
                </div>

                <p className="text-[10px] text-gray-400 mt-3 text-center italic">
                    {floodRisk?.evaluatedAt
                        ? `Cập nhật gần nhất: ${new Date(floodRisk.evaluatedAt).toLocaleString('vi-VN')}`
                        : 'Dữ liệu thời tiết đang được cập nhật định kỳ từ API'}
                </p>
            </div>
        </div>
    );
}
