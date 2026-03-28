import React, { useEffect, useState, useCallback, useMemo, forwardRef } from "react";
import { rescueTeamApi } from "../../services/rescueTeamApi";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { 
  UsersIcon, 
  HandRaisedIcon, 
  CheckBadgeIcon, 
  ArrowPathIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Legend
} from 'recharts';
import { format, subDays, startOfMonth, subMonths, endOfMonth } from 'date-fns';

export default function RescueTeamDashboard() {
  const { profileName } = useAuth();
  const [statsData, setStatsData] = useState(null);
  const [chartData, setChartData] = useState([]); // Dữ liệu 7 ngày cho biểu đồ đường
  const [loading, setLoading] = useState(true);

  // --- QUẢN LÝ KHOẢNG NGÀY (Logic đồng bộ Admin) ---
  const [currentRange, setCurrentRange] = useState([startOfMonth(new Date()), new Date()]);
  const [curStart, curEnd] = currentRange;

  const [compareRange, setCompareRange] = useState([
    startOfMonth(subMonths(new Date(), 1)),
    endOfMonth(subMonths(new Date(), 1))
  ]);
  const [compStart, compEnd] = compareRange;

  // --- LOGIC BIẾN ĐỔI DỮ LIỆU BIỂU ĐỒ SO SÁNH (GIỐNG ADMIN) ---
  const comparisonData = useMemo(() => {
    if (!statsData) return [];
    return [
      { 
        name: 'Nhiệm vụ', 
        'Kỳ trước': statsData.completedMissions?.lastMonthValue || 0, 
        'Kỳ này': statsData.completedMissions?.currentMonthValue || 0 
      },
      { 
        name: 'Người cứu', 
        'Kỳ trước': statsData.rescuedPeople?.lastMonthValue || 0, 
        'Kỳ này': statsData.rescuedPeople?.currentMonthValue || 0 
      },
      { 
        name: 'Đánh giá', 
        'Kỳ trước': statsData.averageRating?.lastMonthValue || 0, 
        'Kỳ này': statsData.averageRating?.currentMonthValue || 0 
      }
    ];
  }, [statsData]);

  // UI tùy chỉnh cho ô nhập ngày
  const CustomDateInput = forwardRef(({ value, onClick, label }, ref) => (
    <div 
      className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-700 hover:border-blue-400 transition-all shadow-sm cursor-pointer min-w-[210px]"
      onClick={onClick}
      ref={ref}
    >
      <CalendarDaysIcon className="h-4 w-4 text-blue-500 shrink-0" />
      <span className="text-gray-400 font-normal shrink-0">{label}:</span>
      <span className="truncate">{value || "Chọn khoảng..."}</span>
    </div>
  ));

  // Logic xử lý biểu đồ xu hướng 7 ngày (Duy trì để hiện AreaChart)
  const processChartData = (missions) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), i), 'dd/MM')).reverse();
    const counts = missions.reduce((acc, m) => {
      const rawDate = m.createdAt || m.requestDate || new Date();
      const date = format(new Date(rawDate), 'dd/MM');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    return last7Days.map(date => ({ time: date, requests: counts[date] || 0 }));
  };

  const loadData = useCallback(async () => {
    if (!curStart || !curEnd || !compStart || !compEnd) return;

    try {
      setLoading(true);
      const params = {
        startDate: format(curStart, 'yyyy-MM-dd'),
        endDate: format(curEnd, 'yyyy-MM-dd'),
        compareStartDate: format(compStart, 'yyyy-MM-dd'),
        compareEndDate: format(compEnd, 'yyyy-MM-dd')
      };

      const [stats, activeMissions, completedMissions] = await Promise.all([
        rescueTeamApi.getDashboardStats(params.startDate, params.endDate, params.compareStartDate, params.compareEndDate),
        rescueTeamApi.getAssignedMissions().catch(() => []),
        rescueTeamApi.getCompletedMissions().catch(() => [])
      ]);

      setStatsData(stats);
      setChartData(processChartData([...activeMissions, ...completedMissions]));
    } catch (error) {
      console.error("Lỗi tải dữ liệu Dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [curStart, curEnd, compStart, compEnd]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="p-6 bg-[#F8FAFC] min-h-screen font-sans text-slate-900">
      
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-gray-200 pb-5 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Hệ thống Quản trị</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
            Chào Đội trưởng, {profileName || "Cứu hộ"}
          </p>
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
          <div className="h-5 w-[1px] bg-gray-300 mx-1 hidden sm:block" />
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
            className="ml-1 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all shadow-md shadow-blue-100"
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ROW 1: STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Nhiệm vụ hoàn thành" 
          value={statsData?.completedMissions?.currentMonthValue} 
          growth={statsData?.completedMissions?.growthRate} 
          icon={<HandRaisedIcon className="w-6 h-6 text-blue-600" />} 
          bgColor="bg-blue-50" 
        />
        <StatCard 
          title="Số người cứu được" 
          value={statsData?.rescuedPeople?.currentMonthValue} 
          growth={statsData?.rescuedPeople?.growthRate} 
          icon={<UsersIcon className="w-6 h-6 text-teal-600" />} 
          bgColor="bg-teal-50" 
        />
        <StatCard 
          title="Đánh giá trung bình" 
          value={statsData?.averageRating?.currentMonthValue} 
          growth={statsData?.averageRating?.growthRate} 
          icon={<CheckBadgeIcon className="w-6 h-6 text-orange-600" />} 
          bgColor="bg-orange-50" 
          isRating
        />
      </div>

      {/* ROW 2: BIỂU ĐỒ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* BIỂU ĐỒ SO SÁNH (GIỐNG ADMIN) */}
        <ChartContainer title="So sánh hiệu suất" sub="Kỳ hiện tại vs Kỳ trước">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 'bold'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 'bold'}} />
              <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.05)'}} />
              <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '12px', fontWeight: 'bold'}} />
              <Bar name="Kỳ trước" dataKey="Kỳ trước" fill="#CBD5E1" radius={[6, 6, 0, 0]} barSize={35} />
              <Bar name="Kỳ này" dataKey="Kỳ này" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={35} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* BIỂU ĐỒ XU HƯỚNG */}
        <ChartContainer title="Xu hướng cứu hộ" sub="Tần suất 7 ngày gần nhất">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
              <Tooltip />
              <Area type="monotone" dataKey="requests" name="Yêu cầu" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorReq)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* FOOTER */}
      <div className="bg-white border border-gray-200 rounded-[2.5rem] p-6 shadow-sm">
        <Link to="/rescue-team/missions" className="flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600 transition-transform group-hover:scale-110">
              <ClipboardDocumentListIcon className="w-6 h-6"/>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 tracking-tight">Danh sách nhiệm vụ</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cập nhật ngay</p>
            </div>
          </div>
          <ChevronRightIcon className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---
function StatCard({ title, value, growth, icon, bgColor, isRating }) {
  const isPos = growth >= 0;
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm transition-all hover:shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 ${bgColor} rounded-2xl`}>{icon}</div>
        <div className={`flex items-center text-xs font-black ${isPos ? 'text-green-600' : 'text-red-600'}`}>
          {isPos ? <ArrowTrendingUpIcon className="h-3 w-3 mr-1" /> : <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />}
          {Math.abs(growth || 0).toFixed(1)}%
        </div>
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-3xl font-black text-gray-900">
        {isRating ? (Number(value) || 0).toFixed(1) : (value ?? 0)}
        {isRating && <span className="text-sm ml-1">⭐</span>}
      </h3>
    </div>
  );
}

function ChartContainer({ title, sub, children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm h-[400px] flex flex-col">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{sub}</p>
      </div>
      <div className="flex-1 w-full">{children}</div>
    </div>
  );
}