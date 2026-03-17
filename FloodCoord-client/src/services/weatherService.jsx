import weatherApi from '../api/weatherApi';

/**
 * All weather/flood API calls for the FloodCoord frontend.
 * Each function returns the response data directly (unwrapped from axios).
 */

// ─── Weather ──────────────────────────────────────────────────────────────────

/**
 * Current weather for a coordinate.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<WeatherCurrentDTO>}
 */
export const getCurrentWeather = async (lat, lon) => {
  const res = await weatherApi.get('/weather/current', { params: { lat, lon } });
  return res.data;
};

/**
 * Hourly forecast for up to 16 days.
 * @param {number} lat
 * @param {number} lon
 * @param {number} days - 1 to 16 (default 7)
 * @returns {Promise<WeatherForecastDTO>}
 */
export const getWeatherForecast = async (lat, lon, days = 7) => {
  const res = await weatherApi.get('/weather/forecast', { params: { lat, lon, days } });
  return res.data;
};

// ─── Flood ────────────────────────────────────────────────────────────────────

/**
 * River discharge data (m³/s) for up to 16 days.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<FloodDischargeDTO>}
 */
export const getRiverDischarge = async (lat, lon) => {
  const res = await weatherApi.get('/flood/discharge', { params: { lat, lon } });
  return res.data;
};

/**
 * Computed risk level + rescue recommendation.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<RiskLevelDTO>}
 */
export const getFloodRisk = async (lat, lon) => {
  const res = await weatherApi.get('/flood/risk', { params: { lat, lon } });
  return res.data;
};

// ─── History & Alerts ─────────────────────────────────────────────────────────

/**
 * Last 24 weather snapshots for a location (for trend charts).
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<WeatherSnapshot[]>}
 */
export const getWeatherHistory = async (lat, lon) => {
  const res = await weatherApi.get('/weather/history', { params: { lat, lon } });
  return res.data;
};

/**
 * All HIGH/CRITICAL alerts across all locations in the last N hours.
 * @param {number} hours - default 24
 * @returns {Promise<WeatherSnapshot[]>}
 */
export const getActiveAlerts = async (hours = 24) => {
  const res = await weatherApi.get('/weather/alerts', { params: { hours } });
  return res.data;
};

// ─── Cache management ─────────────────────────────────────────────────────────

/**
 * Force-evict cache for a location. Use during active emergencies.
 */
export const evictLocationCache = async (lat, lon) => {
  const res = await weatherApi.delete('/cache/evict', { params: { lat, lon } });
  return res.data;
};

/**
 * Check whether Redis is reachable.
 * @returns {Promise<{ redisAvailable: boolean, checkedAt: string }>}
 */
export const getCacheStatus = async () => {
  const res = await weatherApi.get('/cache/status');
  return res.data;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Map Open-Meteo WMO weather code to a human-readable label */
export const getWeatherLabel = (code) => {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 49) return 'Foggy';
  if (code <= 67) return 'Rainy';
  if (code <= 77) return 'Snowy';
  if (code <= 82) return 'Rain showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
};

/** Risk level → Tailwind color class */
export const getRiskColor = (level) => {
  switch (level) {
    case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-300';
    case 'HIGH':     return 'text-orange-600 bg-orange-50 border-orange-300';
    case 'MEDIUM':   return 'text-yellow-600 bg-yellow-50 border-yellow-300';
    case 'LOW':      return 'text-green-600 bg-green-50 border-green-300';
    default:         return 'text-gray-600 bg-gray-50 border-gray-300';
  }
};