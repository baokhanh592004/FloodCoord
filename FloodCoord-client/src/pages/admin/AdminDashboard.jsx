import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminDashboardApi } from '../../services/adminDashboardApi';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import {
  UsersIcon, ArrowPathIcon, ArrowRightIcon, TruckIcon,
  UserGroupIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- QUẢN LÝ KHOẢNG NGÀY ---
  const [currentRange, setCurrentRange] = useState([startOfMonth(new Date()), new Date()]);
  const [curStart, curEnd] = currentRange;

  const [compareRange, setCompareRange] = useState([
    startOfMonth(subMonths(new Date(), 1)),
    endOfMonth(subMonths(new Date(), 1))
  ]);
  const [compStart, compEnd] = compareRange;

  const loadData = useCallback(async () => {
    if (!curStart || !curEnd || !compStart || !compEnd) return;

    setLoading(true);
    try {
      const params = {
        startDate: format(curStart, 'yyyy-MM-dd'),
        endDate: format(curEnd, 'yyyy-MM-dd'),
        compareStartDate: format(compStart, 'yyyy-MM-dd'),
        compareEndDate: format(compEnd, 'yyyy-MM-dd'),
      };
      const data = await adminDashboardApi.getStats(params);
      setStats(data);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [curStart, curEnd, compStart, compEnd]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // UI tùy chỉnh cho ô nhập ngày
  const CustomDateInput = React.forwardRef(({ value, onClick, label }, ref) => (
    <div 
      className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-700 hover:border-blue-400 transition-all shadow-sm cursor-pointer min-w-[210px]"
      onClick={onClick}
      ref={ref}
    >
      <CalendarIcon className="h-4 w-4 text-blue-500 shrink-0" />
      <span className="text-gray-400 font-normal shrink-0">{label}:</span>
      <span className="truncate">{value || "Chọn khoảng..."}</span>
    </div>
  ));

  // --- LOGIC BIỂU ĐỒ ---
  const vehiclePieData = useMemo(() => {
    const v = stats?.vehicles;
    if (!v) return [];
    return [
      { name: 'Sẵn sàng', value: Number(v.availableCount) || 0, color: '#10b981' },
      { name: 'Đang dùng', value: Number(v.inUseCount) || 0, color: '#3b82f6' },
      { name: 'Bảo trì', value: Number(v.maintenanceCount) || 0, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [stats]);

  const comparisonData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Người dùng', 'Kỳ trước': stats.newUsers?.lastMonthValue || 0, 'Kỳ này': stats.newUsers?.currentMonthValue || 0 },
      { name: 'Cứu hộ', 'Kỳ trước': stats.rescueRequests?.lastMonthValue || 0, 'Kỳ này': stats.rescueRequests?.currentMonthValue || 0 }
    ];
  }, [stats]);

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full bg-gray-50">
      
      {/* --- HEADER & BỘ LỌC --- */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hệ thống Quản trị</h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black text-blue-600">Admin Dashboard Control</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-gray-100/60 p-2 rounded-2xl border border-gray-200">
          <DatePicker
            selectsRange={true}
            startDate={curStart}
            endDate={curEnd}
            onChange={(update) => setCurrentRange(update)}
            customInput={<CustomDateInput label="Kỳ này" />}
            dateFormat="dd/MM/yy"
          />
          
          <DatePicker
            selectsRange={true}
            startDate={compStart}
            endDate={compEnd}
            onChange={(update) => setCompareRange(update)}
            customInput={<CustomDateInput label="So với" />}
            dateFormat="dd/MM/yy"
          />

          <button 
            onClick={loadData} 
            disabled={loading}
            className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all shadow-md shadow-blue-100"
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* --- THẺ THỐNG KÊ --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatItem title="Người dùng mới" value={stats?.newUsers?.currentMonthValue} growth={stats?.newUsers?.growthRate} icon={<UsersIcon className="h-6 w-6 text-blue-600" />} bgColor="bg-blue-50" />
        <StatItem title="Yêu cầu cứu hộ" value={stats?.rescueRequests?.currentMonthValue} growth={stats?.rescueRequests?.growthRate} icon={<UserGroupIcon className="h-6 w-6 text-orange-600" />} bgColor="bg-orange-50" />
        <StatItem title="Xe sẵn sàng" value={stats?.vehicles?.availableCount} total={stats?.vehicles?.totalCount} icon={<TruckIcon className="h-6 w-6 text-teal-600" />} bgColor="bg-teal-50" isVehicle />
      </div>

      {/* --- BIỂU ĐỒ --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartBox title="So sánh hiệu suất" sub="Dựa trên 2 khoảng thời gian đã chọn">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.05)'}} />
              <Legend iconType="circle" />
              <Bar name="Kỳ trước" dataKey="Kỳ trước" fill="#cbd5e1" radius={[6, 6, 0, 0]} barSize={35} />
              <Bar name="Kỳ này" dataKey="Kỳ này" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={35} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="Trạng thái xe" sub="Phân bổ thực tế của đội xe">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={vehiclePieData} innerRadius={70} outerRadius={95} paddingAngle={8} dataKey="value">
                {vehiclePieData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </ChartBox>
      </div>

      {/* --- LỐI TẮT QUẢN LÝ --- */}
      <div className="bg-white border border-gray-200 rounded-[2.5rem] p-8 shadow-sm">
        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Quản lý nhanh</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <ActionCard icon={<UsersIcon className="text-indigo-600 h-6 w-6" />} title="Người dùng" to="/admin/users" />
          <ActionCard icon={<TruckIcon className="text-teal-600 h-6 w-6" />} title="Phương tiện" to="/admin/vehicles" />
          <ActionCard icon={<UserGroupIcon className="text-orange-600 h-6 w-6" />} title="Đội cứu hộ" to="/admin/rescue-teams" />
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---
function StatItem({ title, value, icon, growth, bgColor, total, isVehicle }) {
  const isPos = growth >= 0;
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm transition-all hover:shadow-xl">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 ${bgColor} rounded-2xl`}>{icon}</div>
        {growth !== undefined && (
          <div className={`flex items-center text-xs font-black ${isPos ? 'text-green-600' : 'text-red-600'}`}>
            {isPos ? <ArrowTrendingUpIcon className="h-3 w-3 mr-1" /> : <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />}
            {Math.abs(growth).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-black text-gray-900">{value ?? 0}</h3>
        {isVehicle && <span className="text-xs font-bold text-gray-400">/ {total ?? 0} tổng</span>}
      </div>
    </div>
  );
}

function ChartBox({ title, sub, children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col min-h-[420px]">
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{sub}</p>
      </div>
      <div className="flex-1 w-full">{children}</div>
    </div>
  );
}

function ActionCard({ icon, title, to }) {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(to)} className="flex items-center gap-4 p-5 border border-gray-50 rounded-2xl cursor-pointer bg-gray-50/50 hover:bg-white hover:shadow-2xl hover:border-blue-200 transition-all group">
      <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">{icon}</div>
      <div className="flex-1">
        <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Cấu hình hệ thống</p>
      </div>
      <ArrowRightIcon className="h-4 w-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
    </div>
  );
}