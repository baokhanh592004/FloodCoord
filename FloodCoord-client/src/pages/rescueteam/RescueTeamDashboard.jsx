RescueTeamDashboard


import { useEffect, useState, useMemo } from "react";
import { rescueTeamApi } from "../../services/rescueTeamApi";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { 
  ArrowPathIcon, 
  ClipboardDocumentIcon, 
  BoltIcon, 
  CheckCircleIcon, 
  DocumentTextIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
// Cài đặt biểu đồ: npm install recharts
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function RescueTeamDashboard() {
  const { profileName } = useAuth();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [active, completed] = await Promise.all([
        rescueTeamApi.getAssignedMissions().catch(() => []),
        rescueTeamApi.getCompletedMissions().catch(() => [])
      ]);
      setMissions([...active, ...completed]);
    } catch (error) {
      console.error("Lỗi tải dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Tính toán số liệu dựa trên logic code của bạn
  const stats = useMemo(() => {
    const total = missions.length;
    const active = missions.filter(m => m.status !== 'COMPLETED' && m.status !== 'REPORTED').length;
    const completed = missions.filter(m => m.status === 'COMPLETED' || m.status === 'REPORTED').length;
    const reported = missions.filter(m => m.status === 'REPORTED' || m.isReported).length;
    const notReported = completed - reported;

    return [
      { label: "Tổng nhiệm vụ", count: total, color: "bg-blue-50 text-blue-600", icon: <ClipboardDocumentIcon className="w-6 h-6" /> },
      { label: "Đang thực hiện", count: active, color: "bg-amber-50 text-amber-600", icon: <BoltIcon className="w-6 h-6" /> },
      { label: "Đã hoàn thành", count: completed, color: "bg-emerald-50 text-emerald-600", icon: <CheckCircleIcon className="w-6 h-6" /> },
      { label: "Đã báo cáo", count: reported, color: "bg-indigo-50 text-indigo-600", icon: <DocumentTextIcon className="w-6 h-6" /> },
      { label: "Chưa báo cáo", count: notReported, color: "bg-rose-50 text-rose-600", icon: <ExclamationCircleIcon className="w-6 h-6" /> },
    ];
  }, [missions]);

  // Dữ liệu mẫu cho biểu đồ giống hình ảnh mẫu
  const chartData = [
    { time: '01 giờ', requests: 3 }, { time: '05 giờ', requests: 5 },
    { time: '10 giờ', requests: 2 }, { time: '15 giờ', requests: 9 },
    { time: '20 giờ', requests: 4 }, { time: '23 giờ', requests: 1 },
  ];

  return (
    <div className="p-6 lg:p-8 bg-[#F8FAFC] min-h-screen font-sans text-slate-900">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Tổng quan hệ thống</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Chào Đội trưởng, {profileName || "Cứu hộ"}</p>
        </div>
        <button onClick={fetchData} className="bg-[#0D9488] hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-teal-100 transition-all">
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> LÀM MỚI
        </button>
      </div>

      {/* ROW 1: 5 STAT CARDS (Theo đúng bố cục mẫu) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="bg-white border border-slate-100 p-5 rounded-[1.5rem] shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-4 shadow-inner`}>
              {s.icon}
            </div>
            <p className="text-3xl font-black text-slate-800">{s.count}</p>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ROW 2: BIỂU ĐỒ (Giống mẫu của Coordinator) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div className="lg:col-span-7 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-800 text-sm mb-6 uppercase tracking-widest">Yêu cầu nhận được theo thời gian</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Line type="monotone" dataKey="requests" stroke="#0D9488" strokeWidth={4} dot={{ r: 4, fill: '#0D9488', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-800 text-sm mb-6 uppercase tracking-widest">So sánh nhiệm vụ thực tế</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip cursor={{fill: '#F8FAFC'}} />
                <Bar dataKey="requests" fill="#0D9488" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ROW 3: TRUY CẬP NHANH & THÔNG TIN (Tận dụng mẫu hình dơi/thời tiết) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group">
           <div>
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm mb-2">Bạn đang có nhiệm vụ cần báo cáo?</h3>
              <p className="text-slate-500 text-xs font-medium">Đảm bảo cập nhật số liệu chính xác để hỗ trợ công tác điều phối.</p>
           </div>
           <Link to="/rescue-team/missions" className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] tracking-[0.2em] group-hover:bg-blue-600 transition-all uppercase">
              Đi tới danh sách
           </Link>
        </div>
        
        <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
           <div className="relative z-10">
              <p className="text-[10px] font-black uppercase opacity-50 tracking-[0.2em] mb-1">Mực nước cảnh báo</p>
              <p className="text-3xl font-black text-blue-400">2.1 m</p>
              <p className="text-[10px] font-bold text-rose-400 mt-2 uppercase tracking-widest">⚠️ TRÊN MỨC CẢNH BÁO I</p>
           </div>
           <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
        </div>
      </div>

    </div>
  );
}