import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { managerDashboardApi } from '../../services/managerDashboardApi';
import StatCard from '../../components/coordinator/StatCard';
import {
  TruckIcon,
  UserGroupIcon,
  ArchiveBoxIcon,
  ArrowPathIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { toast } from 'react-hot-toast';

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await managerDashboardApi.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu dashboard:", error);
      toast.error("Không thể tải dữ liệu thống kê");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  // ===== DATA CHO BIỂU ĐỒ CỘT =====
  const vehicleBarData = useMemo(() => {
    if (!stats?.vehicleFleet) return [];
    const { availableCount, inUseCount, maintenanceCount } = stats.vehicleFleet;
    return [
      { label: 'Sẵn sàng', count: availableCount, color: '#10b981' },
      { label: 'Đang dùng', count: inUseCount, color: '#3b82f6' },
      { label: 'Bảo trì', count: maintenanceCount, color: '#f97316' },
    ];
  }, [stats]);

  const teamBarData = useMemo(() => {
    if (!stats?.teamReadiness) return [];
    const { availableCount, busyCount, offDutyCount } = stats.teamReadiness;
    return [
      { label: 'Sẵn sàng', count: availableCount, color: '#10b981' },
      { label: 'Nhiệm vụ', count: busyCount, color: '#eab308' },
      { label: 'Đang nghỉ', count: offDutyCount, color: '#ef4444' },
    ];
  }, [stats]);

  const supplyBarData = useMemo(() => {
    if (!stats?.supplyHealth) return [];
    const { lowStockCount, outOfStockCount, totalSupplyTypes } = stats.supplyHealth;
    const healthyCount = totalSupplyTypes - lowStockCount - outOfStockCount;
    return [
      { label: 'An toàn', count: healthyCount > 0 ? healthyCount : 0, color: '#10b981' },
      { label: 'Sắp hết', count: lowStockCount, color: '#f59e0b' },
      { label: 'Hết hàng', count: outOfStockCount, color: '#ef4444' },
    ];
  }, [stats]);

  if (!stats && loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <ArrowPathIcon className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="text-gray-500">Đang tải dữ liệu hệ thống...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full bg-gray-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan Quản trị</h1>
          <p className="text-sm text-gray-500">Theo dõi nguồn lực và điều phối cứu hộ thời gian thực.</p>
        </div>
        <button 
          onClick={loadData} 
          disabled={loading} 
          className="p-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition-colors"
        >
          <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 1. THẺ THỐNG KÊ TỔNG QUÁT (CHỈ HIỆN TỔNG) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          icon={<TruckIcon className="h-6 w-6" />} 
          count={stats?.vehicleFleet?.totalVehicles || 0} 
          label="Tổng phương tiện" 
          color="blue" 
        />
        <StatCard 
          icon={<UserGroupIcon className="h-6 w-6" />} 
          count={stats?.teamReadiness?.totalTeams || 0} 
          label="Tổng số đội" 
          color="teal" 
        />
        <StatCard 
          icon={<ArchiveBoxIcon className="h-6 w-6" />} 
          count={stats?.supplyHealth?.totalSupplyTypes || 0} 
          label="Tổng loại vật tư" 
          color="emerald" 
        />
      </div>

      {/* 2. BIỂU ĐỒ CỘT CHI TIẾT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BarChartContainer title="Trạng thái Phương tiện" data={vehicleBarData} />
        <BarChartContainer title="Trạng thái Đội cứu hộ" data={teamBarData} />
        <BarChartContainer title="Sức khỏe Vật tư" data={supplyBarData} />
      </div>

      {/* 3. LỐI TẮT QUẢN LÝ */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Lối tắt quản lý</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ActionCard
            icon={<TruckIcon className="h-6 w-6 text-blue-600" />}
            title="Quản lý phương tiện"
            description="Xem danh sách và điều phối xe"
            badge={`${stats?.vehicleFleet?.availableCount || 0} sẵn sàng`}
            badgeColor="green"
            onClick={() => navigate('/manager/vehicles')}
          />
          <ActionCard
            icon={<UserGroupIcon className="h-6 w-6 text-teal-600" />}
            title="Quản lý đội cứu hộ"
            description="Điều phối nhân lực thời gian thực"
            badge={`${stats?.teamReadiness?.availableCount || 0} sẵn sàng`}
            badgeColor="teal"
            onClick={() => navigate('/manager/rescue-teams')}
          />
          <ActionCard
            icon={<ArchiveBoxIcon className="h-6 w-6 text-emerald-600" />}
            title="Quản lý vật tư"
            description="Theo dõi kho hàng cứu trợ"
            badge={`${stats?.supplyHealth?.totalSupplyTypes || 0} loại`}
            badgeColor="emerald"
            onClick={() => navigate('/manager/supplies')}
          />
        </div>
      </div>
    </div>
  );
}

// Component phụ hiển thị biểu đồ cột
function BarChartContainer({ title, data }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest">{title}</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fontSize: 10}} />
            <Tooltip cursor={{fill: '#f3f4f6'}} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={30}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Component phụ hiển thị thẻ lối tắt
function ActionCard({ icon, title, description, badge, badgeColor, onClick }) {
  const badgeColors = {
    green: 'bg-green-100 text-green-700',
    teal: 'bg-teal-100 text-teal-700',
    emerald: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <div
      onClick={onClick}
      className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 group"
    >
      <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 shrink-0 transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-700 transition-colors truncate">{title}</h3>
          {badge && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${badgeColors[badgeColor] || 'bg-gray-100 text-gray-600'}`}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 line-clamp-1">{description}</p>
      </div>
      <ArrowRightIcon className="h-4 w-4 text-gray-300 group-hover:text-blue-500 shrink-0 mt-1 transition-colors" />
    </div>
  );
}