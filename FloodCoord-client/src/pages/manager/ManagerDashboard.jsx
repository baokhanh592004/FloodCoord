
import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { managerDashboardApi } from '../../services/managerDashboardApi';
import { importApi } from '../../services/importApi'; 
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
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { toast } from 'react-hot-toast';

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const supplyFileRef = useRef(null);

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

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    try {
      await importApi.supply.importExcel(file);
      toast.success("Import vật tư thành công!");
      loadData();
    } catch (error) {
      toast.error(error.response?.data || "Lỗi import file");
    } finally {
      setImporting(false);
      e.target.value = null;
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await importApi.supply.getTemplate();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', "Mau_Import_Vat_Tu.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error(error.response?.data ||"Không thể tải file mẫu!");
    }
  };

  if (!stats && loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <ArrowPathIcon className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="text-gray-500">Đang tải dữ liệu hệ thống...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-10 overflow-y-auto h-full bg-gray-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan Quản trị</h1>
          <p className="text-sm text-gray-500">Giám sát nguồn lực và điều phối cứu hộ thời gian thực.</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="file" ref={supplyFileRef} className="hidden" accept=".xlsx, .xls" onChange={handleImport} />
          <button 
            onClick={() => supplyFileRef.current.click()} 
            disabled={importing}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-semibold hover:bg-emerald-100 transition-colors"
          >
            <DocumentArrowUpIcon className="h-4 w-4" /> Add file Excel
          </button>
          <button onClick={handleDownloadTemplate} className="p-2 text-gray-500 hover:bg-gray-100 rounded-md border border-gray-200">
            <DocumentArrowDownIcon className="h-4 w-4" />
          </button>
          <button onClick={loadData} disabled={loading} className="p-2 bg-blue-600 text-white rounded-md shadow-sm">
            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 1. STAT CARDS SECTION */}
      <div className="space-y-8">
        {/* Phương tiện */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <TruckIcon className="h-4 w-4" /> Tình hình Phương tiện
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<TruckIcon className="h-6 w-6" />} count={stats?.vehicleFleet?.totalVehicles || 0} label="Tổng phương tiện" color="blue" />
            <StatCard icon={<CheckCircleIcon className="h-6 w-6" />} count={stats?.vehicleFleet?.availableCount || 0} label="Sẵn sàng" color="green" />
            <StatCard icon={<ArrowRightIcon className="h-6 w-6" />} count={stats?.vehicleFleet?.inUseCount || 0} label="Đang hoạt động" color="yellow" />
            <StatCard icon={<WrenchScrewdriverIcon className="h-6 w-6" />} count={stats?.vehicleFleet?.maintenanceCount || 0} label="Đang bảo trì" color="red" />
          </div>
        </section>

        {/* Đội cứu hộ */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <UserGroupIcon className="h-4 w-4" /> Trạng thái Đội cứu hộ
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<UserGroupIcon className="h-6 w-6" />} count={stats?.teamReadiness?.totalTeams || 0} label="Tổng số đội" color="blue" />
            <StatCard icon={<CheckCircleIcon className="h-6 w-6" />} count={stats?.teamReadiness?.availableCount || 0} label="Đội sẵn sàng" color="green" />
            <StatCard icon={<ArrowRightIcon className="h-6 w-6" />} count={stats?.teamReadiness?.busyCount || 0} label="Đang nhiệm vụ" color="yellow" />
            <StatCard icon={<ExclamationTriangleIcon className="h-6 w-6" />} count={stats?.teamReadiness?.offDutyCount || 0} label="Đội đang nghỉ" color="red" />
          </div>
        </section>

        {/* Vật tư */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <ArchiveBoxIcon className="h-4 w-4" /> Tình trạng Vật tư cứu trợ
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<ArchiveBoxIcon className="h-6 w-6" />} count={stats?.supplyHealth?.totalSupplyTypes || 0} label="Tổng loại vật tư" color="blue" />
            <StatCard icon={<ExclamationTriangleIcon className="h-6 w-6" />} count={stats?.supplyHealth?.lowStockCount || 0} label="Sắp hết hàng" color="yellow" />
            <StatCard icon={<ExclamationTriangleIcon className="h-6 w-6" />} count={stats?.supplyHealth?.outOfStockCount || 0} label="Đã hết hàng" color="red" />
            <StatCard icon={<CheckCircleIcon className="h-6 w-6" />} 
              count={(stats?.supplyHealth?.totalSupplyTypes || 0) - (stats?.supplyHealth?.lowStockCount || 0) - (stats?.supplyHealth?.outOfStockCount || 0)} 
              label="Tồn kho an toàn" color="green" />
          </div>
        </section>
      </div>

      {/* 2. BIỂU ĐỒ CỘT (BAR CHARTS) SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BarChartContainer title="Biểu đồ Phương tiện" data={vehicleBarData} />
        <BarChartContainer title="Biểu đồ Đội cứu hộ" data={teamBarData} />
        <BarChartContainer title="Biểu đồ Vật tư" data={supplyBarData} />
      </div>

      {/* 3. LỐI TẮT QUẢN LÝ (QUICK NAV) SECTION */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Lối tắt quản lý</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ActionCard
            icon={<TruckIcon className="h-6 w-6 text-blue-600" />}
            title="Quản lý phương tiện"
            description="Cập nhật trạng thái và danh sách xe"
            badge={`${stats?.vehicleFleet?.availableCount || 0} sẵn sàng`}
            badgeColor="green"
            onClick={() => navigate('/manager/vehicles')}
          />
          <ActionCard
            icon={<UserGroupIcon className="h-6 w-6 text-teal-600" />}
            title="Quản lý đội cứu hộ"
            description="Điều phối nhân lực và phân công đội"
            badge={`${stats?.teamReadiness?.availableCount || 0} sẵn sàng`}
            badgeColor="teal"
            onClick={() => navigate('/manager/rescue-teams')}
          />
          <ActionCard
            icon={<ArchiveBoxIcon className="h-6 w-6 text-emerald-600" />}
            title="Quản lý vật tư"
            description="Theo dõi kho hàng và nhập file Excel"
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
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{fontSize: 11}} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
            <Tooltip cursor={{fill: '#f3f4f6'}} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={35}>
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