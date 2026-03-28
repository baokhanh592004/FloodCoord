import { useCallback, useEffect, useState } from 'react';
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

  const fetchRisk = useCallback(async () => {
    try {
      setError(null);
      const data = await getFloodRisk(lat, lon);
      setRisk(data);
    } catch {
      setError('Failed to load risk data');
    } finally {
      setLoading(false);
    }
  }, [lat, lon]);

  useEffect(() => {
    fetchRisk();
    // Auto-refresh every 15 minutes
    const interval = setInterval(fetchRisk, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchRisk]);

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
      <div className="animate-pulse rounded-lg border border-neutral-100 bg-neutral-50 p-4">
        <div className="mb-2 h-4 w-1/3 rounded bg-neutral-100" />
        <div className="h-8 w-1/2 rounded bg-neutral-100" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-accent-100 bg-accent-50 p-4 text-sm text-accent">
        {error}
      </div>
    );
  }

  const labelClass = getRiskLabel(risk?.riskLevel);
  const riskColor = getRiskColor(risk?.riskLevel);

  if (compact) {
    return (
      <div className={`flex items-center justify-between rounded-lg border px-4 py-3 ${riskColor}`}>
        <span className="text-sm font-medium">{locationName || `${lat}, ${lon}`}</span>
        <span className="rounded px-2 py-1 text-xs font-semibold uppercase tracking-wide">
          {labelClass}
        </span>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border-2 p-5 ${riskColor}`}>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold">
            {locationName || `${lat}°N, ${lon}°E`}
          </h3>
          <p className="mt-0.5 text-xs opacity-70">
            Phân tích {risk?.evaluatedAt
              ? new Date(risk.evaluatedAt).toLocaleTimeString('vi-VN')
              : '—'}
          </p>
        </div>
        {/* Risk badge */}
        <span className="rounded-full border-2 px-3 py-1.5 text-sm font-bold uppercase tracking-wider">
          {labelClass}
        </span>
      </div>

      {/* Metrics row */}
      <div className="mb-4 grid grid-cols-3 gap-3">
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
      <div className="mb-4 border-t border-current border-opacity-20 pt-3 text-sm leading-relaxed">
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