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
    <div className="h-full flex flex-col p-4 gap-3 overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Danh sách nhiệm vụ</h1>
          <p className="text-xs text-gray-500">Quản lý và theo dõi tiến độ báo cáo cứu trợ.</p>
        </div>
        <button
          onClick={() => fetchMissions(false)}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 disabled:opacity-70 transition-colors"
        >
          <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="shrink-0 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm mã hiệu, địa điểm..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex gap-0.5 bg-gray-100 p-0.5 rounded-lg flex-wrap">
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'NOT_REPORTED', label: 'Chưa báo cáo' },
            { key: 'REPORTED', label: 'Đã báo cáo' },
            { key: 'COMPLETED', label: 'Đã xong' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setStatusFilter(tab.key); setCurrentPage(1); }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === tab.key 
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className="ml-1 text-gray-400">
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
      <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 w-10 font-semibold text-gray-600 border-b border-gray-200">#</th>
                <th className="px-3 py-2 w-72 font-semibold text-gray-600 border-b border-gray-200">Nhiệm vụ</th>
                {/* KHÔI PHỤC CỘT ĐỊA ĐIỂM */}
                <th className="px-3 py-2 w-80 font-semibold text-gray-600 border-b border-gray-200">Địa điểm cứu trợ</th>
                <th className="px-3 py-2 w-32 font-semibold text-gray-600 border-b border-gray-200 text-center">Trạng thái</th>
                <th className="px-3 py-2 w-32 font-semibold text-gray-600 border-b border-gray-200 text-center">Báo cáo</th>
                <th className="px-3 py-2 w-20 font-semibold text-gray-600 border-b border-gray-200 text-center">Xem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="px-3 py-16 text-center text-gray-400">Đang đồng bộ dữ liệu...</td></tr>
              ) : currentMissions.map((m, index) => (
                <tr key={m.requestId || m.id} className={`hover:bg-gray-50 transition-colors ${m.isReported ? 'opacity-80' : ''}`}>
                  <td className="px-3 py-2 text-gray-400 font-mono">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  
                  {/* Cột Nhiệm vụ & Liên hệ */}
                  <td className="px-3 py-2 min-w-72">
                    <p className="font-medium text-gray-900 truncate" title={m.title || "Yêu cầu SOS"}>{m.title || "Yêu cầu SOS"}</p>
                    <p className="text-gray-500 mt-0.5 truncate" title={m.contactName}>{m.contactName}</p>
                    <span className="text-xs text-blue-600 font-mono">#{m.trackingCode || m.requestId?.slice(0,8)}</span>
                  </td>

                  {/* CỘT ĐỊA ĐIỂM CỨU TRỢ (ĐÃ KHÔI PHỤC) */}
                  <td className="px-3 py-2 min-w-80 max-w-xs">
                    <p className="text-gray-600 line-clamp-2" title={m.location?.addressText || m.address}>
                      {m.location?.addressText || m.address || "Chưa xác định vị trí"}
                    </p>
                    <div className="flex gap-1.5 mt-1">
                      {m.peopleCount > 0 && <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">👥 {m.peopleCount} người</span>}
                      {m.floodDepth > 0 && <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs">🌊 {m.floodDepth}m</span>}
                    </div>
                  </td>
                  
                  <td className="px-3 py-2 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(m.status)}`}>
                      {statusMap[m.status] || m.status}
                    </span>
                  </td>

                  <td className="px-3 py-2 text-center">
                    {m.isReported ? (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded border border-emerald-100 text-xs font-medium">
                        <CheckBadgeIcon className="h-3 w-3" />
                        Đã báo cáo
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Chưa gửi</span>
                    )}
                  </td>

                  <td className="px-3 py-2 text-center">
                    <button 
                      onClick={() => navigate(`/rescue-team/missions/${m.requestId || m.id}`)} 
                      className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {!loading && filteredMissions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-300">
              <ClipboardDocumentListIcon className="h-16 w-16 opacity-10 mb-4" />
              <p className="text-xs font-medium">Không có dữ liệu phù hợp</p>
            </div>
          )}
        </div>

        {/* Footer Pagination */}
        <div className="shrink-0 px-3 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <p>Hiển thị <span className="text-blue-600">{filteredMissions.length > 0 ? indexOfFirstItem + 1 : 0}-{Math.min(indexOfLastItem, filteredMissions.length)}</span> / {filteredMissions.length}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-2 py-1 border border-gray-200 rounded bg-white hover:bg-gray-100 disabled:opacity-30 transition-colors">Trước</button>
            <div className="flex gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)} className={`w-7 h-7 flex items-center justify-center rounded text-xs transition-colors ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-100'}`}>{page}</button>
              ))}
            </div>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-2 py-1 border border-gray-200 rounded bg-white hover:bg-gray-100 disabled:opacity-30 transition-colors">Sau</button>
          </div>
        </div>
      </div>
    </div>
  );
}