import { useEffect, useState, useMemo, useCallback } from "react";
import { rescueTeamApi } from "../../services/rescueTeamApi";
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  ClipboardDocumentListIcon,
  CheckBadgeIcon 
} from '@heroicons/react/24/outline';

export default function MyMissions() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const navigate = useNavigate();

  const fetchMissions = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setIsRefreshing(true);
    try {
      const [activeRes, completedRes] = await Promise.all([
        rescueTeamApi.getAssignedMissions().catch(() => []),
        rescueTeamApi.getCompletedMissions().catch(() => []),
      ]);
      
      const allMissions = [...(activeRes || []), ...(completedRes || [])];
      
      const mappedMissions = allMissions.map(m => ({
        ...m,
        // Logic kiểm tra báo cáo dựa trên dữ liệu Backend trả về
        isReported: m.status === 'COMPLETED' && (m.reportId || m.isReported || false)
      }));

      mappedMissions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setMissions(mappedMissions);
    } catch (err) {
      console.error("Lỗi fetch missions:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchMissions(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchMissions]);

  const filteredMissions = useMemo(() => {
    return (missions || []).filter((m) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        (m.title || "").toLowerCase().includes(term) ||
        (m.trackingCode || "").toLowerCase().includes(term) ||
        (m.location?.addressText || m.address || "").toLowerCase().includes(term);

      let matchesStatus = true;
      if (statusFilter === 'COMPLETED') {
        matchesStatus = m.status === 'COMPLETED';
      } else if (statusFilter === 'REPORTED') {
        matchesStatus = m.isReported === true;
      } else if (statusFilter === 'NOT_REPORTED') {
        matchesStatus = m.status !== 'COMPLETED' || (m.status === 'COMPLETED' && !m.isReported);
      }

      return matchesSearch && matchesStatus;
    });
  }, [missions, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredMissions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMissions = filteredMissions.slice(indexOfFirstItem, indexOfLastItem);

  const statusMap = {
    MOVING: "Đang di chuyển", ARRIVED: "Đã đến nơi",
    RESCUING: "Đang cứu hộ", COMPLETED: "Hoàn thành", IN_PROGRESS: "Đang thực hiện",
  };

  const statusColor = (s) => {
    if (s === "COMPLETED") return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20";
    return "bg-blue-100 text-blue-700 ring-1 ring-blue-600/20";
  };

  return (
    <div className="h-screen flex flex-col p-4 gap-3 bg-slate-50 overflow-hidden font-sans">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Danh sách nhiệm vụ</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Quản lý & Theo dõi báo cáo cứu trợ</p>
        </div>
        <button
          onClick={() => fetchMissions(false)}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-[11px] font-black rounded-xl hover:bg-black shadow-lg transition-all active:scale-95 disabled:opacity-70 uppercase tracking-widest"
        >
          <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          LÀM MỚI
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm mã hiệu, địa điểm..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none"
          />
        </div>
        
        <div className="flex gap-1 bg-slate-200/50 p-1 rounded-2xl border border-slate-200">
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'NOT_REPORTED', label: 'Chưa báo cáo' },
            { key: 'REPORTED', label: 'Đã báo cáo' },
            { key: 'COMPLETED', label: 'Đã xong' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setStatusFilter(tab.key); setCurrentPage(1); }}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                statusFilter === tab.key 
                ? 'bg-white text-blue-600 shadow-sm scale-105' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              <span className="ml-1 opacity-40 font-bold">
                ({
                  tab.key === 'ALL' ? missions.length :
                  tab.key === 'REPORTED' ? missions.filter(m => m.isReported).length :
                  tab.key === 'NOT_REPORTED' ? missions.filter(m => !m.isReported).length :
                  missions.filter(m => m.status === 'COMPLETED').length
                })
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="flex-1 min-h-0 bg-white border border-slate-200 rounded-[2rem] flex flex-col overflow-hidden shadow-sm">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-[11px] text-left border-separate border-spacing-0">
            <thead className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">#</th>
                <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Nhiệm vụ</th>
                {/* KHÔI PHỤC CỘT ĐỊA ĐIỂM */}
                <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Địa điểm cứu trợ</th>
                <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Trạng thái</th>
                <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Báo cáo</th>
                <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Xem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-20 text-center text-slate-400 animate-pulse font-bold uppercase tracking-widest">Đang đồng bộ dữ liệu...</td></tr>
              ) : currentMissions.map((m, index) => (
                <tr key={m.requestId || m.id} className={`hover:bg-blue-50/30 transition-colors group ${m.isReported ? 'opacity-70' : ''}`}>
                  <td className="px-6 py-5 text-slate-400 font-mono font-bold">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  
                  {/* Cột Nhiệm vụ & Liên hệ */}
                  <td className="px-6 py-5">
                    <p className="font-black text-slate-800 text-sm">{m.title || "Yêu cầu SOS"}</p>
                    <p className="text-slate-500 font-bold mb-0.5">{m.contactName}</p>
                    <span className="text-[13px] text-blue-500 font-mono font-bold">#{m.trackingCode || m.requestId?.slice(0,8)}</span>
                  </td>

                  {/* CỘT ĐỊA ĐIỂM CỨU TRỢ (ĐÃ KHÔI PHỤC) */}
                  <td className="px-6 py-5 max-w-xs">
                    <p className="text-slate-600 font-medium text-[13px] line-clamp-2 leading-relaxed italic" title={m.location?.addressText || m.address}>
                      {m.location?.addressText || m.address || "Chưa xác định vị trí"}
                    </p>
                    <div className="flex gap-2 mt-1.5">
                      {m.peopleCount > 0 && <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-bold text-[13px]">👥 {m.peopleCount} người</span>}
                      {m.floodDepth > 0 && <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md font-bold text-[9px]">🌊 {m.floodDepth}m</span>}
                    </div>
                  </td>
                  
                  <td className="px-6 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${statusColor(m.status)}`}>
                      {statusMap[m.status] || m.status}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-center">
                    {m.isReported ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 font-black text-[9px] uppercase tracking-tighter">
                        <CheckBadgeIcon className="h-3 w-3" />
                        Đã báo cáo
                      </div>
                    ) : (
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Chưa gửi</span>
                    )}
                  </td>

                  <td className="px-6 py-5 text-center">
                    <button 
                      onClick={() => navigate(`/rescue-team/missions/${m.requestId || m.id}`)} 
                      className="p-2.5 bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-90"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {!loading && filteredMissions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-slate-300">
              <ClipboardDocumentListIcon className="h-16 w-16 opacity-10 mb-4" />
              <p className="text-xs font-black uppercase tracking-[0.2em]">Không có dữ liệu phù hợp</p>
            </div>
          )}
        </div>

        {/* Footer Pagination */}
        <div className="flex-shrink-0 px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <p>Hiển thị <span className="text-blue-600">{filteredMissions.length > 0 ? indexOfFirstItem + 1 : 0}-{Math.min(indexOfLastItem, filteredMissions.length)}</span> / {filteredMissions.length}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 border border-slate-200 rounded-xl bg-white shadow-sm hover:bg-slate-50 disabled:opacity-30 transition-all font-black">Trước</button>
            <div className="flex gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 flex items-center justify-center rounded-xl font-black transition-all ${currentPage === page ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 scale-110' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{page}</button>
              ))}
            </div>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-4 py-2 border border-slate-200 rounded-xl bg-white shadow-sm hover:bg-slate-50 disabled:opacity-30 transition-all font-black">Sau</button>
          </div>
        </div>
      </div>
    </div>
  );
}