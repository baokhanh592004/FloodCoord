import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicleApi } from '../../services/vehicleApi';
import { teamApi } from '../../services/teamApi';
import { supplyApi } from '../../services/supplyApi';
import StatCard from '../../components/coordinator/StatCard';
import {
  TruckIcon,
  UserGroupIcon,
  ArchiveBoxIcon,
  CheckCircleIcon,
  WrenchScrewdriverIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [teams, setTeams] = useState([]);
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [v, t, s] = await Promise.allSettled([
        vehicleApi.getAllVehicles(),
        teamApi.getAllTeams(),
        supplyApi.getAllSupplies(),
      ]);
      setVehicles(v.status === 'fulfilled' ? (v.value || []) : []);
      setTeams(t.status === 'fulfilled' ? (t.value || []) : []);
      setSupplies(s.status === 'fulfilled' ? (s.value || []) : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  // ===== STATS =====
  const vehicleStats = useMemo(() => ({
    total: vehicles.length,
    available: vehicles.filter(v => v.status === 'AVAILABLE').length,
    inUse: vehicles.filter(v => v.status === 'IN_USE').length,
    maintenance: vehicles.filter(v => ['MAINTENANCE', 'UNAVAILABLE'].includes(v.status)).length,
  }), [vehicles]);

  const teamStats = useMemo(() => ({
    total: teams.length,
    totalMembers: teams.reduce((acc, t) => acc + (t.members?.length || 0), 0),
  }), [teams]);

  const supplyStats = useMemo(() => ({
    total: supplies.length,
    expiringSoon: supplies.filter(s => {
      if (!s.expiryDate) return false;
      const days = Math.ceil((new Date(s.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      return days <= 30 && days > 0;
    }).length,
    expired: supplies.filter(s => s.expiryDate && new Date(s.expiryDate) < new Date()).length,
  }), [supplies]);

  // ===== CHART: Vehicle status distribution =====
  const vehiclePieData = useMemo(() => [
    { name: 'Sẵn sàng', value: vehicleStats.available, color: '#10b981' },
    { name: 'Đang dùng', value: vehicleStats.inUse, color: '#3b82f6' },
    { name: 'Bảo trì', value: vehicleStats.maintenance, color: '#f97316' },
  ].filter(d => d.value > 0), [vehicleStats]);

  // ===== CHART: Supply type distribution =====
  const supplyBarData = useMemo(() => {
    const types = { FOOD_WATER: 0, MEDICAL: 0, EQUIPMENT: 0, OTHER: 0 };
    supplies.forEach(s => { if (types[s.type] !== undefined) types[s.type]++; });
    return [
      { label: 'Đồ ăn & Nước', count: types.FOOD_WATER },
      { label: 'Y tế', count: types.MEDICAL },
      { label: 'Thiết bị', count: types.EQUIPMENT },
      { label: 'Khác', count: types.OTHER },
    ];
  }, [supplies]);

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
          <p className="text-sm text-gray-500">Thống kê tình hình phương tiện, đội cứu hộ và vật tư.</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
        >
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {/* ===== STAT CARDS: Vehicles ===== */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <TruckIcon className="h-4 w-4" /> Phương tiện
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<TruckIcon className="h-6 w-6" />} count={vehicleStats.total} label="Tổng phương tiện" color="blue" />
          <StatCard icon={<CheckCircleIcon className="h-6 w-6" />} count={vehicleStats.available} label="Sẵn sàng" color="green" />
          <StatCard icon={<ArrowRightIcon className="h-6 w-6" />} count={vehicleStats.inUse} label="Đang hoạt động" color="yellow" />
          <StatCard icon={<WrenchScrewdriverIcon className="h-6 w-6" />} count={vehicleStats.maintenance} label="Cần bảo trì" color="red" />
        </div>
      </div>

      {/* ===== STAT CARDS: Teams & Supplies ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <UserGroupIcon className="h-4 w-4" /> Đội cứu hộ
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <StatCard icon={<UserGroupIcon className="h-6 w-6" />} count={teamStats.total} label="Tổng số đội" color="blue" />
            <StatCard icon={<CheckCircleIcon className="h-6 w-6" />} count={teamStats.totalMembers} label="Tổng nhân lực" color="green" />
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <ArchiveBoxIcon className="h-4 w-4" /> Vật tư
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <StatCard icon={<ArchiveBoxIcon className="h-6 w-6" />} count={supplyStats.total} label="Tổng lô hàng" color="blue" />
            <StatCard icon={<ExclamationTriangleIcon className="h-6 w-6" />} count={supplyStats.expiringSoon + supplyStats.expired} label="Cần xử lý" color="red" />
          </div>
        </div>
      </div>

      {/* ===== CHARTS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pie chart: Vehicle status */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Trạng thái phương tiện</h2>
            <p className="text-xs text-gray-500">Phân bổ theo trạng thái hiện tại</p>
          </div>
          <div className="h-64">
            {vehiclePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vehiclePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {vehiclePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">
                Chưa có dữ liệu phương tiện
              </div>
            )}
          </div>
        </div>

        {/* Bar chart: Supply types */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Phân loại vật tư</h2>
            <p className="text-xs text-gray-500">Số lô hàng theo từng loại vật tư</p>
          </div>
          <div className="h-64">
            {supplies.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={supplyBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Số lô" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">
                Chưa có dữ liệu vật tư
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== Quick navigation ===== */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Lối tắt quản lý</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ActionCard
            icon={<TruckIcon className="h-6 w-6 text-blue-600" />}
            title="Quản lý phương tiện"
            description="Xem, thêm và cập nhật phương tiện cứu hộ"
            badge={`${vehicleStats.available} sẵn sàng`}
            badgeColor="green"
            onClick={() => navigate('/manager/vehicles')}
          />
          <ActionCard
            icon={<UserGroupIcon className="h-6 w-6 text-teal-600" />}
            title="Quản lý đội cứu hộ"
            description="Điều phối nhân lực và phân công đội ngũ"
            badge={`${teamStats.total} đội`}
            badgeColor="teal"
            onClick={() => navigate('/manager/rescue-teams')}
          />
          <ActionCard
            icon={<ArchiveBoxIcon className="h-6 w-6 text-emerald-600" />}
            title="Quản lý vật tư"
            description="Theo dõi và cập nhật kho vật tư cứu trợ"
            badge={`${supplyStats.total} lô hàng`}
            badgeColor="emerald"
            onClick={() => navigate('/manager/supplies')}
          />
        </div>
      </div>

    </div>
  );
}

function ActionCard({ icon, title, description, badge, badgeColor, onClick }) {
  const badgeColors = {
    green: 'bg-green-100 text-green-700',
    teal: 'bg-teal-100 text-teal-700',
    emerald: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <div
      onClick={onClick}
      className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 group"
    >
      <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-50 transition-colors shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">{title}</h3>
          {badge && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColors[badgeColor] || 'bg-gray-100 text-gray-600'}`}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-500 shrink-0 mt-1 transition-colors" />
    </div>
  );
}