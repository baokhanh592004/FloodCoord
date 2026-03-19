import { useEffect, useState } from 'react';
import { getFloodRisk, evictLocationCache, getRiskLabel, getRiskColor } from '../../services/weatherService';

/**
 * Reusable flood risk panel component.
 * Shows risk level badge, river discharge, and rescue recommendation.
 *
 * Props:
 *   lat       {number}  - latitude
 *   lon       {number}  - longitude
 *   locationName {string} - display name for the location
 *   compact   {boolean} - if true, renders a condensed card (for list views)
 */
export default function FloodRiskPanel({ lat, lon, locationName = '', compact = false }) {
  const [risk, setRisk]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRisk = async () => {
    try {
      setError(null);
      const data = await getFloodRisk(lat, lon);
      setRisk(data);
    } catch (e) {
      setError('Failed to load risk data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisk();
    // Auto-refresh every 15 minutes
    const interval = setInterval(fetchRisk, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [lat, lon]);

  const handleForceRefresh = async () => {
    setRefreshing(true);
    try {
      await evictLocationCache(lat, lon);
      await fetchRisk();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
        <div className="h-8 bg-gray-200 rounded w-1/2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 text-sm">
        {error}
      </div>
    );
  }

  const labelClass = getRiskLabel(risk?.riskLevel);
  const riskColor = getRiskColor(risk?.riskLevel);

  if (compact) {
    return (
      <div className={`flex items-center justify-between rounded-lg border px-4 py-3 ${riskColor}`}>
        <span className="font-medium text-sm">{locationName || `${lat}, ${lon}`}</span>
        <span className="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded">
          {labelClass}
        </span>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border-2 p-5 ${riskColor}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-base">
            {locationName || `${lat}°N, ${lon}°E`}
          </h3>
          <p className="text-xs opacity-70 mt-0.5">
            Phân tích {risk?.evaluatedAt
              ? new Date(risk.evaluatedAt).toLocaleTimeString('vi-VN')
              : '—'}
          </p>
        </div>
        {/* Risk badge */}
        <span className="text-sm font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border-2">
          {labelClass}
        </span>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Metric
          label="Lưu lượng sông"
          value={risk?.riverDischarge != null
            ? `${risk.riverDischarge.toFixed(0)} m³/s`
            : 'N/A'}
        />
        <Metric
          label="Lượng mưa"
          value={risk?.currentPrecipitation != null
            ? `${risk.currentPrecipitation.toFixed(1)} mm`
            : 'N/A'}
        />
        <Metric
          label="Tốc độ gió"
          value={risk?.windSpeed != null
            ? `${risk.windSpeed.toFixed(1)} km/h`
            : 'N/A'}
        />
      </div>

      {/* Recommendation */}
      <div className="text-sm leading-relaxed border-t border-current border-opacity-20 pt-3 mb-4">
        {risk?.recommendation}
      </div>

      {/* Force refresh */}
      <button
        onClick={handleForceRefresh}
        disabled={refreshing}
        className="text-xs opacity-60 hover:opacity-100 underline transition-opacity disabled:cursor-not-allowed"
      >
        {refreshing ? 'Đang làm mới...' : 'Buộc làm mới dữ liệu'}
      </button>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="text-center">
      <div className="text-xs opacity-60 mb-0.5">{label}</div>
      <div className="font-semibold text-sm">{value}</div>
    </div>
  );
}