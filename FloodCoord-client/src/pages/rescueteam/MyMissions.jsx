import { useEffect, useState } from "react";
import { rescueTeamApi } from "../../services/rescueTeamApi";
import { useNavigate } from "react-router-dom";

export default function MyMissions() {
  const [missions, setMissions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const res = await rescueTeamApi.getAssignedMissions();
        setMissions(res || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMissions();
  }, []);

  const statusMap = {
    MOVING: "Đang di chuyển",
    ARRIVED: "Đã đến nơi",
    RESCUING: "Đang cứu hộ",
    COMPLETED: "Hoàn thành",
    IN_PROGRESS: "Đang thực hiện",
  };

  const statusColor = (status) => {
    switch (status) {
      case "COMPLETED": return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
      case "IN_PROGRESS":
      case "RESCUING": return "bg-blue-50 text-blue-700 ring-blue-600/20";
      case "ARRIVED": return "bg-indigo-50 text-indigo-700 ring-indigo-600/20";
      case "MOVING": return "bg-amber-50 text-amber-700 ring-amber-600/20";
      default: return "bg-slate-50 text-slate-700 ring-slate-600/20";
    }
  };

  const emergencyMap = {
    LOW: "Thấp",
    MEDIUM: "Trung bình",
    HIGH: "Cao",
    CRITICAL: "Nghiêm trọng",
  };

  const emergencyColor = (level) => {
    switch (level) {
      case "CRITICAL": return "bg-red-50 text-red-700 ring-red-600/20";
      case "HIGH": return "bg-orange-50 text-orange-700 ring-orange-600/20";
      case "MEDIUM": return "bg-amber-50 text-amber-700 ring-amber-600/20";
      default: return "bg-slate-50 text-slate-700 ring-slate-600/20";
    }
  };

  return (
    <div className="p-8 lg:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900">Danh sách yêu cầu cứu trợ</h1>
        <p className="text-slate-500 text-sm mt-1">Quản lý và theo dõi các điểm cần hỗ trợ</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Tiêu đề</th>
                <th className="px-6 py-4">Người liên hệ</th>
                <th className="px-6 py-4">Địa điểm</th>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4">Mức độ</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {missions.map((m, index) => (
                <tr key={m.requestId} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 text-slate-500">{index + 1}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{m.title}</td>
                  <td className="px-6 py-4">
                    <p className="text-slate-800 font-medium">{m.contactName}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{m.contactPhone}</p>
                  </td>
                  <td
                    className="px-6 py-4 text-slate-600 max-w-xs truncate"
                    title={m.location?.addressText}
                  >
                    {m.location?.addressText || "Chưa có địa chỉ"}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{m.createdAt}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${emergencyColor(m.emergencyLevel)}`}>
                      {emergencyMap[m.emergencyLevel]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${statusColor(m.status)}`}>
                      {statusMap[m.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      onClick={() => navigate(`/rescue-team/missions/${m.requestId}`)}
                      title="Xem chi tiết"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mx-auto">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              {missions.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-500">
                    Chưa có nhiệm vụ nào được giao.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}