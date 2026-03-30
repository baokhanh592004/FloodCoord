import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { managerDashboardApi } from '../../services/managerDashboardApi';
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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await managerDashboardApi.getDashboardStats();
      console.log("Dữ liệu Dashboard nhận được từ API:", data);
      setStats(data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  // ===== DỮ LIỆU BIỂU ĐỒ: Ánh xạ từ DTO Backend =====
  const vehiclePieData = useMemo(() => {
    if (!stats?.vehicleFleet) return [];
    // Sử dụng VehicleFleetDTO
    const { availableCount, inUseCount, maintenanceCount } = stats.vehicleFleet;
    return [
      { name: 'Sẵn sàng', value: availableCount, color: '#10b981' },
      { name: 'Đang dùng', value: inUseCount, color: '#3b82f6' },
      { name: 'Bảo trì', value: maintenanceCount, color: '#f97316' },
    ].filter(d => d.value > 0);
  }, [stats]);

  const supplyBarData = useMemo(() => {
    if (!stats?.supplyHealth) return [];
    // Sử dụng SupplyHealthDTO
    const { lowStockCount, outOfStockCount, totalSupplyTypes } = stats.supplyHealth;
    return [
      { label: 'Sắp hết hàng', count: lowStockCount },
      { label: 'Hết hàng', count: outOfStockCount },
      { label: 'Tổng loại', count: totalSupplyTypes },
    ];
  }, [stats]);

  if (!stats && loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <ArrowPathIcon className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium">Đang tải dữ liệu quản trị...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full bg-gray-50">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan Quản trị</h1>
          <p className="text-sm text-gray-500">Thống kê nguồn lực dựa trên dữ liệu hệ thống thời gian thực.</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-60 shadow-sm"
        >
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Đang cập nhật...' : 'Làm mới dữ liệu'}
        </button>
      </div>

      {/* ===== STAT CARDS: Phương tiện (VehicleFleetDTO) ===== */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <TruckIcon className="h-4 w-4" /> Tình hình Phương tiện
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<TruckIcon className="h-6 w-6" />} count={stats?.vehicleFleet?.totalVehicles || 0} label="Tổng phương tiện" color="blue" />
          <StatCard icon={<CheckCircleIcon className="h-6 w-6" />} count={stats?.vehicleFleet?.availableCount || 0} label="Sẵn sàng" color="green" />
          <StatCard icon={<ArrowRightIcon className="h-6 w-6" />} count={stats?.vehicleFleet?.inUseCount || 0} label="Đang hoạt động" color="yellow" />
          <StatCard icon={<WrenchScrewdriverIcon className="h-6 w-6" />} count={stats?.vehicleFleet?.maintenanceCount || 0} label="Cần bảo trì" color="red" />
        </div>
      </div>

      {/* ===== STAT CARDS: Đội cứu hộ (TeamReadinessDTO) ===== */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <UserGroupIcon className="h-4 w-4" /> Trạng thái Đội cứu hộ
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<UserGroupIcon className="h-6 w-6" />} count={stats?.teamReadiness?.totalTeams || 0} label="Tổng số đội" color="blue" />
          <StatCard icon={<CheckCircleIcon className="h-6 w-6" />} count={stats?.teamReadiness?.availableCount || 0} label="Đội sẵn sàng" color="green" />
          <StatCard icon={<ArrowRightIcon className="h-6 w-6" />} count={stats?.teamReadiness?.busyCount || 0} label="Đang làm nhiệm vụ" color="yellow" />
          <StatCard icon={<ExclamationTriangleIcon className="h-6 w-6" />} count={stats?.teamReadiness?.offDutyCount || 0} label="Đội đang nghỉ" color="red" />
        </div>
      </div>

      {/* ===== STAT CARDS: Vật tư (SupplyHealthDTO) ===== */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <ArchiveBoxIcon className="h-4 w-4" /> Tình trạng Vật tư cứu trợ
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<ArchiveBoxIcon className="h-6 w-6" />} count={stats?.supplyHealth?.totalSupplyTypes || 0} label="Tổng chủng loại" color="blue" />
          <StatCard icon={<ExclamationTriangleIcon className="h-6 w-6" />} count={stats?.supplyHealth?.lowStockCount || 0} label="Sắp hết hàng" color="yellow" />
          <StatCard icon={<ExclamationTriangleIcon className="h-6 w-6" />} count={stats?.supplyHealth?.outOfStockCount || 0} label="Đã hết hàng" color="red" />
          <StatCard 
            icon={<CheckCircleIcon className="h-6 w-6" />} 
            count={(stats?.supplyHealth?.totalSupplyTypes || 0) - (stats?.supplyHealth?.lowStockCount || 0) - (stats?.supplyHealth?.outOfStockCount || 0)} 
            label="Tồn kho an toàn" 
            color="green" 
          />
        </div>
      </div>

      {/* ===== BIỂU ĐỒ ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Phân bổ Xe</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={vehiclePieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {vehiclePieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sức khỏe kho Vật tư</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplyBarData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ===== LỐI TẮT QUẢN LÝ ===== */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Lối tắt quản lý</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ActionCard
            icon={<TruckIcon className="h-6 w-6 text-blue-600" />}
            title="Quản lý phương tiện"
            description="Xem, thêm và cập nhật phương tiện"
            badge={`${stats?.vehicleFleet?.availableCount || 0} sẵn sàng`}
            badgeColor="green"
            onClick={() => navigate('/manager/vehicles')}
          />
          <ActionCard
            icon={<UserGroupIcon className="h-6 w-6 text-teal-600" />}
            title="Quản lý đội cứu hộ"
            description="Điều phối nhân lực và phân công"
            badge={`${stats?.teamReadiness?.totalTeams || 0} đội`}
            badgeColor="teal"
            onClick={() => navigate('/manager/rescue-teams')}
          />
          <ActionCard
            icon={<ArchiveBoxIcon className="h-6 w-6 text-emerald-600" />}
            title="Quản lý vật tư"
            description="Theo dõi kho vật tư cứu trợ"
            badge={`${stats?.supplyHealth?.totalSupplyTypes || 0} chủng loại`}
            badgeColor="emerald"
            onClick={() => navigate('/manager/supplies')}
          />
        </div>
      </div>
    </div>
  );
}

// COMPONENT CON: ActionCard (BẮT BUỘC PHẢI CÓ)
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
      <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-50 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-700">{title}</h3>
          {badge && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColors[badgeColor] || 'bg-gray-100 text-gray-600'}`}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-500 mt-1" />
    </div>
  );
}