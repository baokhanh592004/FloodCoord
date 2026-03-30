import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import FloodRiskPanel from '../components/weather/FloodRiskPanel';
import {
  getCurrentWeather,
  getWeatherForecast,
  getActiveAlerts,
  getWeatherLabel,
} from '../services/weatherService';

// Register Chart.js components
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
);

// Fix Leaflet default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
L.Marker.prototype.options.icon = L.icon({
  iconUrl: icon, shadowUrl: iconShadow,
  iconSize: [25, 41], iconAnchor: [12, 41],
});

const PRESET_LOCATIONS = [
  { name: 'TP. Hồ Chí Minh', lat: 10.823, lon: 106.630 },
  { name: 'TP. Đà Nẵng',     lat: 16.047, lon: 108.206 },
  { name: 'TP. Huế',          lat: 16.463, lon: 107.585 },
  { name: 'TP. Hà Nội',       lat: 21.028, lon: 105.834 },
  { name: 'TP. Cần Thơ',      lat: 10.045, lon: 105.746 },
];

// How many hourly data points to show — 7 days = 168 hours
// We sample every 3 hours to keep charts readable: 168 / 3 = 56 points
const SAMPLE_EVERY = 3;

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => { map.setView(center, 13); }, [center, map]);
  return null;
}

function MapClickHandler({ onLocationPick }) {
  useMapEvents({ click: (e) => onLocationPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

// ─── Shared chart options factory ─────────────────────────────────────────────
const makeChartOptions = (title, yLabel, tooltipSuffix = '') => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
    title: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y}${tooltipSuffix}`,
      },
    },
  },
  scales: {
    x: {
      ticks: {
        maxTicksLimit: 14,
        font: { size: 10 },
        maxRotation: 0,
      },
      grid: { display: false },
    },
    y: {
      title: { display: true, text: yLabel, font: { size: 10 } },
      ticks: { font: { size: 10 } },
      grid: { color: 'rgba(0,0,0,0.05)' },
    },
  },
});

export default function WeatherDashboard() {
  const [location, setLocation]         = useState({ lat: 10.823, lon: 106.630 });
  const [locationLabel, setLocationLabel] = useState('TP. Hồ Chí Minh');
  const [activeTab, setActiveTab]       = useState('weather');
  const [chartTab, setChartTab]         = useState('temp'); // 'temp' | 'rain' | 'wind'

  const [searchQuery, setSearchQuery]     = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching]         = useState(false);

  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast]             = useState(null);
  const [alerts, setAlerts]                 = useState([]);
  const [loading, setLoading]               = useState(true);

  // Fetch weather when location changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cur, fc, al] = await Promise.all([
          getCurrentWeather(location.lat, location.lon),
          // 7 days of hourly data
          getWeatherForecast(location.lat, location.lon, 7),
          getActiveAlerts(24),
        ]);
        setCurrentWeather(cur);
        setForecast(fc);
        setAlerts(al);
      } catch (e) {
        console.error('Dashboard fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location.lat, location.lon]);

  const reverseGeocode = useCallback(async (lat, lon) => {
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
      const data = await res.json();
      const label =
        data.address?.city || data.address?.town || data.address?.village ||
        data.display_name?.split(',')[0] || `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
      setLocationLabel(label);
    } catch {
      setLocationLabel(`${lat.toFixed(3)}, ${lon.toFixed(3)}`);
    }
  }, []);

  const handleMapClick = useCallback((lat, lon) => {
    setLocation({ lat, lon });
    reverseGeocode(lat, lon);
  }, [reverseGeocode]);

  const handlePresetClick = (preset) => {
    setLocation({ lat: preset.lat, lon: preset.lon });
    setLocationLabel(preset.name);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=vn`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err) { console.error('Search error:', err); }
    finally { setSearching(false); }
  };

  const handleSelectSearchResult = (result) => {
    setLocation({ lat: parseFloat(result.lat), lon: parseFloat(result.lon) });
    setLocationLabel(result.display_name.split(',')[0]);
    setSearchQuery('');
    setSearchResults([]);
  };

  // ── Build chart data from hourly forecast ─────────────────────────────────
  // Sample every SAMPLE_EVERY hours so charts aren't too dense
  const chartData = useCallback(() => {
    if (!forecast?.hourly) return null;
    const h = forecast.hourly;
    const total = h.time?.length ?? 0;
    const indices = [];
    for (let i = 0; i < total; i += SAMPLE_EVERY) indices.push(i);

    // Format label: "Mon 14:00"
    const labels = indices.map(i => {
      const d = new Date(h.time[i]);
      return d.toLocaleDateString('vi-VN', { weekday: 'short' }) + ' ' +
             d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    });

    const pick = (arr) => arr ? indices.map(i => arr[i] ?? null) : [];

    return {
      labels,
      temperature_2m:             pick(h.temperature_2m),
      apparent_temperature:       pick(h.apparent_temperature),
      relative_humidity_2m:       pick(h.relative_humidity_2m),
      precipitation:              pick(h.precipitation),
      rain:                       pick(h.rain),
      precipitation_probability:  pick(h.precipitation_probability),
      wind_speed_10m:             pick(h.wind_speed_10m),
      wind_gusts_10m:             pick(h.wind_gusts_10m),
    };
  }, [forecast]);

  const cd = chartData();
  const cur = currentWeather?.current;

  // ── Temperature chart dataset ───────────────────────────────────────────
  const tempChartData = cd ? {
    labels: cd.labels,
    datasets: [
      {
        label: 'Nhiệt độ (°C)',
        data: cd.temperature_2m,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        borderWidth: 2,
      },
      {
        label: 'Cảm giác như (°C)',
        data: cd.apparent_temperature,
        borderColor: '#f97316',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 1.5,
        borderDash: [4, 4],
      },
    ],
  } : null;

  // ── Rain & Humidity chart dataset ───────────────────────────────────────
  const rainChartData = cd ? {
    labels: cd.labels,
    datasets: [
      {
        label: 'Mưa (mm)',
        data: cd.rain,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.15)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        borderWidth: 2,
        yAxisID: 'y',
      },
      {
        label: 'Lượng mưa (mm)',
        data: cd.precipitation,
        borderColor: '#06b6d4',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 1.5,
        borderDash: [4, 4],
        yAxisID: 'y',
      },
      {
        label: 'Xác suất mưa (%)',
        data: cd.precipitation_probability,
        borderColor: '#8b5cf6',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 1.5,
        yAxisID: 'y1',
      },
      {
        label: 'Độ ẩm (%)',
        data: cd.relative_humidity_2m,
        borderColor: '#10b981',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 1.5,
        yAxisID: 'y1',
      },
    ],
  } : null;

  const rainChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const suffix = ctx.datasetIndex <= 1 ? ' mm' : '%';
            return ` ${ctx.dataset.label}: ${ctx.parsed.y}${suffix}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { maxTicksLimit: 14, font: { size: 10 }, maxRotation: 0 },
        grid: { display: false },
      },
      // Left axis: mm
      y: {
        type: 'linear', position: 'left',
        title: { display: true, text: 'mm', font: { size: 10 } },
        ticks: { font: { size: 10 } },
        grid: { color: 'rgba(0,0,0,0.05)' },
        min: 0,
      },
      // Right axis: %
      y1: {
        type: 'linear', position: 'right',
        title: { display: true, text: '%', font: { size: 10 } },
        ticks: { font: { size: 10 } },
        grid: { drawOnChartArea: false },
        min: 0, max: 100,
      },
    },
  };

  // ── Wind chart dataset ──────────────────────────────────────────────────
  const windChartData = cd ? {
    labels: cd.labels,
    datasets: [
      {
        label: 'Tốc độ gió (km/h)',
        data: cd.wind_speed_10m,
        borderColor: '#64748b',
        backgroundColor: 'rgba(100,116,139,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        borderWidth: 2,
      },
      {
        label: 'Gió giật (km/h)',
        data: cd.wind_gusts_10m,
        borderColor: '#dc2626',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 1.5,
        borderDash: [4, 4],
      },
    ],
  } : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Theo dõi thời tiết và lũ lụt</h1>
        {alerts.length > 0 && (
          <span className="text-xs font-medium bg-red-100 text-red-700 border border-red-300 rounded-full px-3 py-1">
            {alerts.length} cảnh báo đang hoạt động {alerts.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Main tab switcher */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {[['weather', 'Dữ liệu thời tiết'], ['map', 'Chọn trên bản đồ']].map(([val, label]) => (
          <button key={val} onClick={() => setActiveTab(val)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Location indicator */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
        </svg>
        <span>
          Đang hiển thị thời tiết cho {' '}
          <span className="font-medium text-gray-800">{locationLabel}</span>
          <span className="text-gray-400 ml-1">({location.lat.toFixed(3)}°N, {location.lon.toFixed(3)}°E)</span>
        </span>
        {loading && (
          <svg className="animate-spin h-4 w-4 text-blue-500 ml-1" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        )}
      </div>

      {/* ── MAP TAB ──────────────────────────────────────────────────────────── */}
      {activeTab === 'map' && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text" value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                  placeholder="Tìm kiếm địa điểm ở Việt Nam..."
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition pr-8 text-sm"
                />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">✕</button>
                )}
              </div>
              <button onClick={handleSearch} disabled={searching || !searchQuery.trim()}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-xl transition text-sm flex items-center gap-2">
                {searching
                  ? <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                }
                Tìm kiếm
              </button>
            </div>
            {searchResults.length > 0 && (
              <div className="mt-1 border-2 border-blue-200 rounded-xl shadow-lg overflow-hidden bg-white">
                {searchResults.map((r, i) => (
                  <button key={i} onClick={() => handleSelectSearchResult(r)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition border-b border-gray-100 last:border-0 flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5 shrink-0 text-sm">📍</span>
                    <span className="text-sm text-gray-800 leading-snug">{r.display_name}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              {PRESET_LOCATIONS.map(loc => (
                <button key={loc.name} onClick={() => handlePresetClick(loc)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    locationLabel === loc.name
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  }`}>
                  {loc.name}
                </button>
              ))}
            </div>
          </div>

          <div className="relative" style={{ height: '440px' }}>
            <div className="absolute top-3 left-3 z-1000 bg-white rounded-lg shadow px-3 py-2 text-xs text-gray-600 pointer-events-none">
              Chọn vị trí để xem dự báo thời tiết và cảnh báo lũ lụt tại đó. Bạn có thể tìm kiếm địa điểm hoặc nhấp trực tiếp trên bản đồ.
            </div>
            <MapContainer center={[location.lat, location.lon]} zoom={13}
              style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[location.lat, location.lon]} />
              <MapClickHandler onLocationPick={handleMapClick} />
              <ChangeView center={[location.lat, location.lon]} />
            </MapContainer>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Vị trí: <span className="font-medium text-gray-800">{locationLabel}</span>
            </span>
            <button onClick={() => setActiveTab('weather')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition">
              Hiển thị thời tiết →
            </button>
          </div>
        </div>
      )}

      {/* ── WEATHER TAB ──────────────────────────────────────────────────────── */}
      {activeTab === 'weather' && (
        <div className="space-y-6">

          {/* Top row: current conditions + risk panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Current conditions */}
            <div className="lg:col-span-1 space-y-4">
              <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Thời tiết hiện tại — {locationLabel}
                </h2>
                {loading ? <LoadingSkeleton lines={4} /> : cur ? (
                  <>
                    <div className="flex items-end gap-2">
                      <span className="text-5xl font-light text-gray-900">
                        {cur.temperature_2m != null ? cur.temperature_2m.toFixed(1) : '—'}°C
                      </span>
                      <span className="text-sm text-gray-500 mb-2">
                        cảm giác như {cur.apparent_temperature != null
                          ? `${cur.apparent_temperature.toFixed(1)}°C` : '—'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{getWeatherLabel(cur.weather_code)}</p>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-sm">
                      <WeatherStat label="Độ ẩm"      value={cur.relative_humidity_2m != null ? `${cur.relative_humidity_2m}%` : '—'} />
                      <WeatherStat label="Mưa"          value={cur.rain != null ? `${cur.rain.toFixed(1)} mm` : '—'} />
                      <WeatherStat label="Gió"          value={cur.wind_speed_10m != null ? `${cur.wind_speed_10m.toFixed(1)} km/h` : '—'} />
                      <WeatherStat label="Gió giật"         value={cur.wind_gusts_10m != null ? `${cur.wind_gusts_10m.toFixed(1)} km/h` : '—'} />
                      <WeatherStat label="Mây"   value={cur.cloud_cover != null ? `${cur.cloud_cover}%` : '—'} />
                      <WeatherStat label="Lượng mưa" value={cur.precipitation != null ? `${cur.precipitation.toFixed(1)} mm` : '—'} />
                    </div>
                  </>
                ) : <p className="text-sm text-gray-400">Hiện không có dữ liệu</p>}
              </div>

              <FloodRiskPanel lat={location.lat} lon={location.lon} locationName={locationLabel} />
            </div>

            {/* Right: 7-day charts */}
            <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Dự báo trong 7 ngày — {locationLabel}
                </h2>
                {/* Chart tab switcher */}
                <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                  {[
                    ['temp', 'Nhiệt độ'],
                    ['rain', 'Mưa & Độ ẩm'],
                    ['wind', 'Gió'],
                  ].map(([val, label]) => (
                    <button key={val} onClick={() => setChartTab(val)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        chartTab === val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="h-64"><LoadingSkeleton lines={5} /></div>
              ) : !cd ? (
                <p className="text-sm text-gray-400">Hiện không có dữ liệu dự báo</p>
              ) : (
                <div style={{ height: '280px' }}>
                  {chartTab === 'temp' && tempChartData && (
                    <Line
                      data={tempChartData}
                      options={makeChartOptions('Temperature', '°C', '°C')}
                    />
                  )}
                  {chartTab === 'rain' && rainChartData && (
                    <Line data={rainChartData} options={rainChartOptions} />
                  )}
                  {chartTab === 'wind' && windChartData && (
                    <Line
                      data={windChartData}
                      options={makeChartOptions('Wind', 'km/h', ' km/h')}
                    />
                  )}
                </div>
              )}

              {/* Chart legend note */}
              {!loading && cd && (
                <p className="text-xs text-gray-400 mt-3">
                  Cập nhật mỗi 3 tiếng · Dữ liệu dự báo có thể không hoàn hảo, vui lòng sử dụng làm tham khảo chung và theo dõi các cảnh báo lũ lụt để đảm bảo an toàn.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active alerts — shown on both tabs */}
      {alerts.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-sm font-semibold text-red-700 mb-3 uppercase tracking-wide">
            Cảnh báo rủi ro cao đang hoạt động — 24 giờ qua
          </h2>
          <div className="space-y-2">
            {alerts.slice(0, 10).map((alert) => (
              <div key={alert.id}
                className="flex justify-between items-center text-sm bg-white rounded-lg border border-red-200 px-4 py-2">
                <span className="text-gray-700">{alert.latitude}°N, {alert.longitude}°E</span>
                <span className="font-medium text-red-600">{alert.riskLevel}</span>
                <span className="text-gray-400 text-xs">
                  {new Date(alert.recordedAt).toLocaleString('vi-VN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WeatherStat({ label, value }) {
  return (
    <div>
      <span className="text-gray-400 text-xs">{label}</span>
      <p className="font-medium text-gray-700">{value ?? '—'}</p>
    </div>
  );
}

function LoadingSkeleton({ lines = 3 }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-100 rounded"
             style={{ width: `${70 + (i % 3) * 10}%` }} />
      ))}
    </div>
  );
}