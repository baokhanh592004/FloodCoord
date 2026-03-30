import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { coordinatorDashboardApi } from '../../services/coordinatorDashboardApi';
import { getActiveAlerts } from '../../services/weatherService';

const PRESETS = [
  { key: '7d', label: '7 ngày', days: 7 },
  { key: '30d', label: '30 ngày', days: 30 },
  { key: '90d', label: '90 ngày', days: 90 },
  { key: '1y', label: '1 năm', days: 365 },
];

const STATUS_LABELS = {
  PENDING: 'Chờ duyệt',
  VERIFIED: 'Đã xác thực',
  VALIDATED: 'Đã xác thực',
  IN_PROGRESS: 'Đang thực thi',
  MOVING: 'Đang thực thi',
  ARRIVED: 'Đang thực thi',
  RESCUING: 'Đang thực thi',
  COMPLETED: 'Hoàn thành',
  REJECTED: 'Từ chối',
  ASSIGNED: 'Đã phân công',
};

const STATUS_COLORS = ['#639922', '#E24B4A', '#BA7517', '#378ADD', '#D4537E'];

function toDateOnly(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const cloned = new Date(date);
  cloned.setDate(cloned.getDate() + days);
  return cloned;
}

function formatInputDate(date) {
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function parseInputDate(dateString) {
  if (!dateString) return null;

  if (dateString.includes('/')) {
    const [day, month, year] = dateString.split('/').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  }

  if (dateString.includes('-')) {
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  }

  return null;
}

function formatShortDate(date, includeYear = false) {
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    ...(includeYear ? { year: 'numeric' } : {}),
  });
}

function formatDateRangeLabel(startDate, endDate, includeYear = false) {
  return `${formatShortDate(startDate, includeYear)} - ${formatShortDate(endDate, includeYear)}`;
}

function formatGrowth(growthRate) {
  const value = Number(growthRate || 0);
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

function getSeverityClass(severity) {
  if (severity === 'high') return 'bg-danger-50 text-danger-dark border-danger-100';
  if (severity === 'medium') return 'bg-warning-50 text-warning-dark border-warning-100';
  return 'bg-info-50 text-info-dark border-info-100';
}

function buildRange(days) {
  const today = toDateOnly(new Date());
  const endDate = addDays(today, 1);
  const startDate = addDays(endDate, -(days || 30));

  const compareEndDate = startDate;
  const compareStartDate = addDays(compareEndDate, -(days || 30));

  return {
    startDate,
    endDate,
    compareStartDate,
    compareEndDate,
  };
}

function getBucketDays(presetDays) {
  if (presetDays > 180) return 30;
  if (presetDays > 45) return 7;
  return 1;
}

function bucketLabel(date, bucketDays) {
  if (bucketDays === 30) {
    return date.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });
  }
  if (bucketDays === 7) {
    return `T${date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`;
  }
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

function bucketIndex(date, startDate, bucketDays) {
  const diffDays = Math.floor((toDateOnly(date).getTime() - toDateOnly(startDate).getTime()) / 86400000);
  return Math.floor(diffDays / bucketDays);
}

function ComparisonTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="rounded-md border border-neutral-100 bg-white p-2.5 shadow-sm">
      <p className="mb-1 text-xs font-semibold text-neutral-800">Mốc so sánh</p>
      <p className="text-xs text-coordinator-dark">
        Kỳ này (mốc {point.currentBucketStartLabel}): <strong>{point.current}</strong>
      </p>
      <p className="text-xs text-info-dark">
        Kỳ trước (mốc {point.previousBucketStartLabel}): <strong>{point.previous}</strong>
      </p>
      <p className="mt-1 text-[11px] text-neutral-400">
        Window: {point.currentRangeLabel} vs {point.previousRangeLabel}
      </p>
    </div>
  );
}

export default function AnalyticsPage() {

  const [preset, setPreset] = useState('30d');
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [kpiError, setKpiError] = useState('');
  const [chartError, setChartError] = useState('');
  const [remarksError, setRemarksError] = useState('');
  const [kpiLoading, setKpiLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [remarksLoading, setRemarksLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [rangeMode, setRangeMode] = useState('preset');
  const [customDateInput, setCustomDateInput] = useState(() => {
    const today = toDateOnly(new Date());
    return {
      startDate: formatInputDate(addDays(today, -29)),
      endDate: formatInputDate(today),
    };
  });
  const [customRange, setCustomRange] = useState(null);
  const [customRangeError, setCustomRangeError] = useState('');

  const selectedPreset = useMemo(
    () => PRESETS.find((p) => p.key === preset) || PRESETS[1],
    [preset]
  );

  const presetRange = useMemo(() => buildRange(selectedPreset.days), [selectedPreset.days]);

  const activeRange = useMemo(() => {
    if (rangeMode === 'custom' && customRange) {
      return customRange;
    }
    return {
      ...presetRange,
      days: selectedPreset.days,
    };
  }, [rangeMode, customRange, presetRange, selectedPreset.days]);

  const activeDays = useMemo(() => {
    if (rangeMode === 'custom' && customRange?.days) return customRange.days;
    return selectedPreset.days;
  }, [rangeMode, customRange, selectedPreset.days]);

  const applyCustomRange = () => {
    const parsedStartDate = parseInputDate(customDateInput.startDate);
    const parsedEndDate = parseInputDate(customDateInput.endDate);

    if (!parsedStartDate || !parsedEndDate) {
      setCustomRangeError('Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc.');
      return;
    }

    if (parsedStartDate > parsedEndDate) {
      setCustomRangeError('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.');
      return;
    }

    const inclusiveDays = Math.floor((parsedEndDate.getTime() - parsedStartDate.getTime()) / 86400000) + 1;
    const exclusiveEndDate = addDays(parsedEndDate, 1);
    const compareEndDate = parsedStartDate;
    const compareStartDate = addDays(compareEndDate, -inclusiveDays);

    setCustomRange({
      startDate: parsedStartDate,
      endDate: exclusiveEndDate,
      compareStartDate,
      compareEndDate,
      days: inclusiveDays,
    });
    setCustomRangeError('');
    setRangeMode('custom');
  };

  const resetToPresetRange = () => {
    setRangeMode('preset');
    setCustomRangeError('');
  };

  const currentPeriodEnd = useMemo(() => addDays(activeRange.endDate, -1), [activeRange.endDate]);
  const previousPeriodEnd = useMemo(() => addDays(activeRange.compareEndDate, -1), [activeRange.compareEndDate]);

  const shouldIncludeYearInRange = useMemo(() => {
    if (selectedPreset.days >= 365) return true;
    return (
      activeRange.startDate.getFullYear() !== currentPeriodEnd.getFullYear()
      || activeRange.compareStartDate.getFullYear() !== previousPeriodEnd.getFullYear()
    );
  }, [selectedPreset.days, activeRange.startDate, activeRange.compareStartDate, currentPeriodEnd, previousPeriodEnd]);

  const periodLabels = useMemo(
    () => ({
      current: formatDateRangeLabel(activeRange.startDate, currentPeriodEnd, shouldIncludeYearInRange),
      previous: formatDateRangeLabel(activeRange.compareStartDate, previousPeriodEnd, shouldIncludeYearInRange),
    }),
    [activeRange.startDate, activeRange.compareStartDate, currentPeriodEnd, previousPeriodEnd, shouldIncludeYearInRange]
  );

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setGlobalError('');
    setKpiError('');
    setChartError('');
    setRemarksError('');
    setKpiLoading(true);
    setChartLoading(true);
    setRemarksLoading(true);

    const params = {
      startDate: toIsoDate(activeRange.startDate),
      endDate: toIsoDate(addDays(activeRange.endDate, -1)),
      compareStartDate: toIsoDate(activeRange.compareStartDate),
      compareEndDate: toIsoDate(addDays(activeRange.compareEndDate, -1)),
    };

    const [statsResult, requestsResult, alertsResult] = await Promise.allSettled([
      coordinatorDashboardApi.getStats(params),
      coordinatorDashboardApi.getRequests(),
      getActiveAlerts(24),
    ]);

    if (statsResult.status === 'fulfilled') {
      setStats(statsResult.value || null);
    } else {
      console.error('Failed to load KPI stats:', statsResult.reason);
      setStats(null);
      setKpiError('Không thể tải KPI cho khoảng thời gian đã chọn.');
    }
    setKpiLoading(false);

    if (requestsResult.status === 'fulfilled') {
      setRequests(requestsResult.value || []);
    } else {
      console.error('Failed to load requests for analytics:', requestsResult.reason);
      setRequests([]);
      setChartError('Không thể tải dữ liệu biểu đồ so sánh.');
      setRemarksError('Không thể tính nhận xét hệ thống do thiếu dữ liệu yêu cầu.');
    }
    setChartLoading(false);
    setRemarksLoading(false);

    if (alertsResult.status === 'fulfilled') {
      setAlerts(alertsResult.value || []);
    } else {
      console.warn('Failed to load alert pins:', alertsResult.reason);
      setAlerts([]);
    }

    if (statsResult.status === 'rejected' && requestsResult.status === 'rejected') {
      setGlobalError('Không thể tải dữ liệu phân tích. Vui lòng thử lại.');
    }

    setLastRefresh(new Date());
    setLoading(false);
  }, [activeRange]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      fetchAnalytics();
    }, 0);

    return () => clearTimeout(timerId);
  }, [fetchAnalytics]);

  const currentPeriodRequests = useMemo(() => {
    return requests.filter((req) => {
      if (!req.createdAt) return false;
      const createdAt = new Date(req.createdAt);
      return createdAt >= activeRange.startDate && createdAt < activeRange.endDate;
    });
  }, [requests, activeRange]);

  const comparePeriodRequests = useMemo(() => {
    return requests.filter((req) => {
      if (!req.createdAt) return false;
      const createdAt = new Date(req.createdAt);
      return createdAt >= activeRange.compareStartDate && createdAt < activeRange.compareEndDate;
    });
  }, [requests, activeRange]);

  const lineData = useMemo(() => {
    const bucketDays = getBucketDays(activeDays);
    const totalBuckets = Math.max(1, Math.ceil(activeDays / bucketDays));

    const currentCounts = Array(totalBuckets).fill(0);
    const compareCounts = Array(totalBuckets).fill(0);

    currentPeriodRequests.forEach((req) => {
      const index = bucketIndex(new Date(req.createdAt), activeRange.startDate, bucketDays);
      if (index >= 0 && index < totalBuckets) {
        currentCounts[index] += 1;
      }
    });

    comparePeriodRequests.forEach((req) => {
      const index = bucketIndex(new Date(req.createdAt), activeRange.compareStartDate, bucketDays);
      if (index >= 0 && index < totalBuckets) {
        compareCounts[index] += 1;
      }
    });

    return Array.from({ length: totalBuckets }).map((_, index) => {
      const currentDate = addDays(activeRange.startDate, index * bucketDays);
      const currentBucketEnd = addDays(currentDate, bucketDays - 1);
      const safeCurrentBucketEnd = currentBucketEnd > currentPeriodEnd ? currentPeriodEnd : currentBucketEnd;

      const previousDate = addDays(activeRange.compareStartDate, index * bucketDays);
      const previousBucketEnd = addDays(previousDate, bucketDays - 1);
      const safePreviousBucketEnd = previousBucketEnd > previousPeriodEnd ? previousPeriodEnd : previousBucketEnd;

      return {
        label: bucketLabel(currentDate, bucketDays),
        current: currentCounts[index],
        previous: compareCounts[index],
        currentBucketStartLabel: formatShortDate(currentDate, shouldIncludeYearInRange),
        previousBucketStartLabel: formatShortDate(previousDate, shouldIncludeYearInRange),
        currentRangeLabel: formatDateRangeLabel(currentDate, safeCurrentBucketEnd, shouldIncludeYearInRange),
        previousRangeLabel: formatDateRangeLabel(previousDate, safePreviousBucketEnd, shouldIncludeYearInRange),
      };
    });
  }, [currentPeriodRequests, comparePeriodRequests, activeRange, activeDays, currentPeriodEnd, previousPeriodEnd, shouldIncludeYearInRange]);

  const statusPieData = useMemo(() => {
    const groups = {
      completed: 0,
      pending: 0,
      inProgress: 0,
      validated: 0,
      rejected: 0,
    };

    currentPeriodRequests.forEach((req) => {
      if (req.status === 'COMPLETED') groups.completed += 1;
      else if (req.status === 'PENDING') groups.pending += 1;
      else if (['IN_PROGRESS', 'MOVING', 'ARRIVED', 'RESCUING', 'ASSIGNED'].includes(req.status)) groups.inProgress += 1;
      else if (['VERIFIED', 'VALIDATED'].includes(req.status)) groups.validated += 1;
      else if (req.status === 'REJECTED') groups.rejected += 1;
    });

    return [
      { name: 'Hoàn thành', value: groups.completed },
      { name: 'Chờ duyệt', value: groups.pending },
      { name: 'Đang thực thi', value: groups.inProgress },
      { name: 'Đã xác thực', value: groups.validated },
      { name: 'Từ chối', value: groups.rejected },
    ];
  }, [currentPeriodRequests]);

  const eventPins = useMemo(() => {
    if (!lineData.length) return [];

    const average = lineData.reduce((sum, p) => sum + p.current, 0) / lineData.length;
    const spikePins = lineData
      .filter((point) => point.current >= Math.max(3, average * 1.8))
      .slice(0, 3)
      .map((point) => ({ ...point, tag: 'Spike' }));

    if (alerts.length > 0 && lineData.length > 1) {
      spikePins.push({
        ...lineData[lineData.length - 2],
        tag: 'Mưa lớn',
      });
    }

    return spikePins;
  }, [lineData, alerts]);

  const systemRemarks = useMemo(() => {
    const total = Math.max(1, currentPeriodRequests.length);
    const pendingRatio = statusPieData.find((x) => x.name === 'Chờ duyệt')?.value / total;
    const rejectedRatio = statusPieData.find((x) => x.name === 'Từ chối')?.value / total;

    const remarks = [];

    if (pendingRatio > 0.35) {
      remarks.push({
        severity: 'high',
        text: `Tỷ lệ chờ duyệt đang ở ${(pendingRatio * 100).toFixed(1)}%, cao hơn ngưỡng 35%.`,
        basis: 'Pending ratio',
      });
    }

    if (rejectedRatio > 0.15) {
      remarks.push({
        severity: 'medium',
        text: `Tỷ lệ từ chối ${(rejectedRatio * 100).toFixed(1)}% vượt ngưỡng an toàn 15%.`,
        basis: 'Rejected ratio',
      });
    }

    const resolvedGrowth = Number(stats?.resolvedRequests?.growthRate || 0);
    if (resolvedGrowth < 0) {
      remarks.push({
        severity: 'high',
        text: `Số ca hoàn thành giảm ${Math.abs(resolvedGrowth).toFixed(2)}% so với kỳ trước.`,
        basis: 'Resolved trend',
      });
    }

    const maxPoint = lineData.reduce((max, p) => Math.max(max, p.current), 0);
    const avgPoint = lineData.length
      ? lineData.reduce((sum, p) => sum + p.current, 0) / lineData.length
      : 0;

    if (lineData.length > 0 && maxPoint > avgPoint * 1.8) {
      remarks.push({
        severity: 'medium',
        text: `Phát hiện đỉnh yêu cầu bất thường (${maxPoint} ca) so với trung bình ${avgPoint.toFixed(1)}.`,
        basis: 'Spike detector',
      });
    }

    const supplyGrowth = Number(stats?.supplyUsage?.growthRate || 0);
    if (supplyGrowth > 20) {
      remarks.push({
        severity: 'medium',
        text: `Mức sử dụng vật tư tăng ${supplyGrowth.toFixed(2)}%, cần kiểm tra dự trữ kho.`,
        basis: 'Supply usage growth',
      });
    }

    if (!remarks.length) {
      remarks.push({
        severity: 'low',
        text: 'Hệ thống vận hành ổn định, chưa phát hiện dấu hiệu bất thường nổi bật.',
        basis: 'Rule baseline',
      });
    }

    return remarks.slice(0, 4);
  }, [currentPeriodRequests, lineData, stats, statusPieData]);

  const topStatuses = useMemo(() => {
    const map = {};
    currentPeriodRequests.forEach((req) => {
      const key = STATUS_LABELS[req.status] || req.status || 'Khác';
      map[key] = (map[key] || 0) + 1;
    });

    return Object.entries(map)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [currentPeriodRequests]);

  const handleExportCSV = () => {
    const rows = [
      ['Metric', 'Current', 'Last', 'Growth'],
      ['Resolved Requests', stats?.resolvedRequests?.currentMonthValue ?? 0, stats?.resolvedRequests?.lastMonthValue ?? 0, stats?.resolvedRequests?.growthRate ?? 0],
      ['Incident Reports', stats?.incidentReports?.currentMonthValue ?? 0, stats?.incidentReports?.lastMonthValue ?? 0, stats?.incidentReports?.growthRate ?? 0],
      ['Supply Usage', stats?.supplyUsage?.currentMonthValue ?? 0, stats?.supplyUsage?.lastMonthValue ?? 0, stats?.supplyUsage?.growthRate ?? 0],
    ];

    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${preset}-${toIsoDate(new Date())}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const metricCards = [
    {
      label: 'Yêu cầu hoàn thành',
      stat: stats?.resolvedRequests,
      accent: 'text-success-dark bg-success-50 border-success-100',
    },
    {
      label: 'Báo cáo sự cố',
      stat: stats?.incidentReports,
      accent: 'text-info-dark bg-info-50 border-info-100',
    },
    {
      label: 'Vật tư đã sử dụng',
      stat: stats?.supplyUsage,
      accent: 'text-warning-dark bg-warning-50 border-warning-100',
    },
  ];

  return (
    <div className="h-full overflow-auto bg-neutral-50 p-4 sm:p-5">
      <div className="mx-auto max-w-330 space-y-4">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Phân tích điều phối</h1>
            <p className="text-xs text-neutral-400">
              Cập nhật: {lastRefresh ? lastRefresh.toLocaleString('vi-VN') : '--'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg bg-neutral-100 p-1">
              {PRESETS.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setPreset(item.key);
                    setRangeMode('preset');
                    setCustomRangeError('');
                  }}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                    preset === item.key && rangeMode === 'preset'
                      ? 'bg-white text-coordinator-dark shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-neutral-100 bg-white px-2 py-1">
              <input
                type="text"
                value={customDateInput.startDate}
                onChange={(event) => setCustomDateInput((prev) => ({ ...prev, startDate: event.target.value }))}
                placeholder="dd/MM/yyyy"
                className="rounded border border-neutral-100 px-2 py-1 text-xs text-neutral-600"
              />
              <span className="text-xs text-neutral-400">-</span>
              <input
                type="text"
                value={customDateInput.endDate}
                onChange={(event) => setCustomDateInput((prev) => ({ ...prev, endDate: event.target.value }))}
                placeholder="dd/MM/yyyy"
                className="rounded border border-neutral-100 px-2 py-1 text-xs text-neutral-600"
              />
              <button
                onClick={applyCustomRange}
                className="rounded border border-info-100 bg-info-50 px-2 py-1 text-xs font-semibold text-info-dark hover:bg-info-100"
              >
                Áp dụng
              </button>
              {rangeMode === 'custom' && (
                <button
                  onClick={resetToPresetRange}
                  className="rounded border border-neutral-100 bg-neutral-50 px-2 py-1 text-xs font-semibold text-neutral-600 hover:bg-neutral-100"
                >
                  Dùng preset
                </button>
              )}
            </div>

            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-md border border-coordinator bg-coordinator px-3 py-2 text-xs font-semibold text-white hover:bg-coordinator-dark disabled:opacity-60"
            >
              <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </button>

            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-1.5 rounded-md border border-manager-100 bg-white px-3 py-2 text-xs font-semibold text-manager hover:bg-manager-50"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              Xuất PDF
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-md border border-success-100 bg-white px-3 py-2 text-xs font-semibold text-success-dark hover:bg-success-50"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Xuất CSV
            </button>
          </div>
        </header>

        {globalError && (
          <div className="rounded-lg border border-danger-100 bg-danger-50 px-3 py-2 text-sm text-danger-dark">
            {globalError}
          </div>
        )}

        {customRangeError && (
          <div className="rounded-lg border border-warning-100 bg-warning-50 px-3 py-2 text-sm text-warning-dark">
            {customRangeError}
          </div>
        )}

        <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {kpiError && (
            <div className="md:col-span-3 rounded-lg border border-warning-100 bg-warning-50 px-3 py-2 text-sm text-warning-dark">
              {kpiError}
            </div>
          )}
          {metricCards.map((card) => {
            const growth = Number(card.stat?.growthRate || 0);
            return (
              <article key={card.label} className={`rounded-xl border p-4 ${card.accent}`}>
                <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{card.label}</p>
                <p className="mt-2 text-3xl font-bold">{kpiLoading ? '...' : (card.stat?.currentMonthValue ?? 0)}</p>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className={growth >= 0 ? 'text-success-dark' : 'text-danger-dark'}>
                    {growth >= 0 ? '▲' : '▼'} {formatGrowth(growth)}
                  </span>
                  <span className="opacity-80">so với kỳ trước</span>
                </div>
              </article>
            );
          })}
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
          <div className="rounded-xl border border-neutral-100 bg-white p-4">
            {chartError && (
              <div className="mb-3 rounded-md border border-warning-100 bg-warning-50 px-3 py-2 text-sm text-warning-dark">
                {chartError}
              </div>
            )}
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-neutral-900">Resolved Requests - So sánh kỳ</h2>
                <p className="text-xs text-neutral-400">Đường liền: kỳ này • Đường đứt: kỳ trước (so sánh theo cùng vị trí thời gian)</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">
                  <span className="rounded-full border border-coordinator-100 bg-coordinator-50 px-2 py-0.5 text-coordinator-dark">
                    Kỳ này: {periodLabels.current}
                  </span>
                  <span className="rounded-full border border-info-100 bg-info-50 px-2 py-0.5 text-info-dark">
                    Kỳ trước: {periodLabels.previous}
                  </span>
                </div>
              </div>
              <span className="rounded-full bg-success-50 px-2.5 py-1 text-xs font-semibold text-success-dark">
                {formatGrowth(stats?.resolvedRequests?.growthRate || 0)}
              </span>
            </div>

            <div className="h-72">
              {chartLoading ? (
                <div className="flex h-full items-center justify-center text-sm text-neutral-400">Đang tải biểu đồ...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip content={<ComparisonTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1 }} />
                    <Legend />
                    <Line
                      type="linear"
                      dataKey="current"
                      name={`Kỳ này (${periodLabels.current})`}
                      stroke="#0d9488"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="linear"
                      dataKey="previous"
                      name={`Kỳ trước (${periodLabels.previous})`}
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      strokeDasharray="6 4"
                      dot={{ r: 2 }}
                      activeDot={{ r: 4 }}
                    />
                    {eventPins.map((pin, idx) => (
                      <ReferenceDot
                        key={`${pin.label}-${idx}`}
                        x={pin.label}
                        y={pin.current}
                        r={4}
                        fill="#f97316"
                        stroke="#fff"
                        label={{ value: `⚑ ${pin.tag}`, position: 'top', fontSize: 10 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-100 bg-white p-4">
            <h2 className="text-base font-semibold text-neutral-900">Phân bổ trạng thái</h2>
            <p className="mb-3 text-xs text-neutral-400">Tỷ trọng trạng thái trong kỳ đã chọn</p>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusPieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={88} paddingAngle={2}>
                    {statusPieData.map((entry, index) => (
                      <Cell key={`${entry.name}-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
          <div className="rounded-xl border border-neutral-100 bg-white p-4">
            <h2 className="text-base font-semibold text-neutral-900">Nhận xét hệ thống</h2>
            <p className="mb-3 text-xs text-neutral-400">Tổng hợp từ dữ liệu kỳ hiện tại, tự động cập nhật theo bộ lọc.</p>

            {remarksError && (
              <div className="mb-3 rounded-md border border-warning-100 bg-warning-50 px-3 py-2 text-sm text-warning-dark">
                {remarksError}
              </div>
            )}

            <div className="space-y-2">
              {remarksLoading ? (
                <div className="rounded-lg border border-dashed border-neutral-100 py-6 text-center text-sm text-neutral-400">
                  Đang tính nhận xét hệ thống...
                </div>
              ) : systemRemarks.map((remark, idx) => (
                <div key={`${remark.basis}-${idx}`} className="flex items-start justify-between gap-3 rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2">
                  <p className="text-sm text-neutral-800">{remark.text}</p>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getSeverityClass(remark.severity)}`}>
                    {remark.severity.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-100 bg-white p-4">
            <h3 className="mb-2 text-sm font-semibold text-neutral-900">Top trạng thái trong kỳ</h3>
            <div className="space-y-2">
              {topStatuses.map((item) => (
                <div key={item.status} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 text-sm">
                  <span className="text-neutral-600">{item.status}</span>
                  <span className="font-semibold text-neutral-900">{item.count}</span>
                </div>
              ))}
              {topStatuses.length === 0 && (
                <div className="rounded-lg border border-dashed border-neutral-100 py-6 text-center text-sm text-neutral-400">
                  Chưa có dữ liệu trạng thái.
                </div>
              )}
            </div>

            <div className="mt-4 rounded-lg border border-info-100 bg-info-50 px-3 py-2 text-xs text-info-dark">
              <div className="mb-1 inline-flex items-center gap-1.5 font-semibold">
                <ChartBarIcon className="h-3.5 w-3.5" />
                Event Pins
              </div>
              <p>{eventPins.length > 0 ? `${eventPins.length} mốc sự kiện được gắn trên biểu đồ.` : 'Không có mốc sự kiện bất thường trong kỳ này.'}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
