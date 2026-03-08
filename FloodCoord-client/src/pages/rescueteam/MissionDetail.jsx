import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { rescueTeamApi } from "../../services/rescueTeamApi";
import MissionMap from "../../components/rescueteam/MissionMap";
import toast from 'react-hot-toast';

export default function MissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchDetail = async () => {
    try {
      const res = await rescueTeamApi.getAssignedMissions();
      const missionData = res.find((m) => String(m.requestId) === String(id));
      if (missionData) setMission(missionData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const updateStatus = async (status) => {
    try {
      await rescueTeamApi.updateProgress(id, { status: status });
      setMission((prev) => ({ ...prev, status: status }));
      toast.success("Cập nhật trạng thái thành công!");
    } catch (err) {
      console.error("Update status failed:", err.response?.data);
      toast.error(err.response?.data || "Có lỗi xảy ra khi cập nhật!");
    }
  };

  const statusMap = {
    MOVING: "Đang di chuyển",
    ARRIVED: "Đã đến nơi",
    RESCUING: "Đang cứu hộ",
    COMPLETED: "Hoàn thành",
    IN_PROGRESS: "Đang thực hiện"
  };

  const statusColor = (status) => {
    switch (status) {
      case "COMPLETED": return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
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

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p className="text-xl font-semibold mb-2">Không tìm thấy nhiệm vụ</p>
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">Quay lại</button>
      </div>
    );
  }
  
  return (
    <div className="p-8 lg:p-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Chi tiết nhiệm vụ cứu hộ</h1>
          <p className="text-slate-500 text-sm mt-1">Mã NV: #{mission.requestId}</p>
        </div>
        <button onClick={() => navigate(-1)} className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          Quay lại
        </button>
      </div>

      {/* MAP */}
      <div className="bg-white shadow-sm border border-slate-100 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-1">Địa điểm cần cứu trợ</h2>
        <p className="text-slate-500 text-sm mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
          {mission.location?.addressText}
        </p>
        <div className="rounded-xl overflow-hidden border border-slate-100">
          <MissionMap location={mission.location} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Thông tin nhiệm vụ */}
        <div className="bg-white shadow-sm border border-slate-100 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Thông tin chung</h2>
          <div className="space-y-4 text-sm">
            <p className="flex justify-between"><span className="font-medium text-slate-500">Tiêu đề:</span> <span className="text-slate-900 font-semibold">{mission.title}</span></p>
            <div className="flex justify-between flex-col gap-1">
              <span className="font-medium text-slate-500">Mô tả tình huống:</span> 
              <span className="text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">{mission.description}</span>
            </div>
            <p className="flex justify-between items-center"><span className="font-medium text-slate-500">Số người cần cứu:</span> <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">{mission.peopleCount} người</span></p>
            <p className="flex justify-between items-center">
              <span className="font-medium text-slate-500">Mức độ khẩn cấp:</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${emergencyColor(mission.emergencyLevel)}`}>
                {emergencyMap[mission.emergencyLevel]}
              </span>
            </p>
          </div>
        </div>

        {/* Thông tin liên hệ */}
        <div className="bg-white shadow-sm border border-slate-100 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Thông tin liên hệ</h2>
          <div className="space-y-4 text-sm">
            <p className="flex justify-between items-center"><span className="font-medium text-slate-500">Người liên hệ:</span> <span className="font-semibold text-slate-900">{mission.contactName}</span></p>
            <p className="flex justify-between items-center"><span className="font-medium text-slate-500">Số điện thoại:</span> <span className="font-semibold text-blue-600">{mission.contactPhone}</span></p>
            <p className="flex justify-between items-center pt-2">
              <span className="font-medium text-slate-500">Tiến độ hiện tại:</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${statusColor(mission.status)}`}>
                {statusMap[mission.status]}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* UPDATE STATUS SECTION */}
      {mission.status !== "COMPLETED" && ( 
        <div className="bg-white shadow-sm border border-slate-100 rounded-2xl p-6 mt-6">
          <h2 className="font-bold text-slate-800 mb-4">Cập nhật tiến độ cứu hộ</h2>
          {currentUser?.isTeamLeader ? (
            <div className="flex gap-3 flex-wrap">
              {mission.status === "IN_PROGRESS" && (
                <button onClick={() => updateStatus("MOVING")} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95">
                  Đang di chuyển
                </button>
              )}
              {mission.status === "MOVING" && (
                <button onClick={() => updateStatus("ARRIVED")} className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95">
                  Đã đến nơi
                </button>
              )}
              {mission.status === "ARRIVED" && (
                <button onClick={() => updateStatus("RESCUING")} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95">
                  Đang cứu hộ
                </button>
              )}
              {mission.status === "RESCUING" && (
                <button onClick={() => updateStatus("COMPLETED")} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95">
                  Hoàn thành nhiệm vụ
                </button>
              )}
            </div>
          ) : (
            <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl flex items-start gap-3 text-amber-800 text-sm">
              <svg className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <p>Bạn đang xem nhiệm vụ này với tư cách là <span className="font-semibold">Thành viên đội</span>. Chỉ Đội trưởng mới có quyền thao tác cập nhật tiến độ trên hệ thống.</p>
            </div>
          )}
        </div>
      )}

      {/* REPORT SECTION */}
      {mission.status === "COMPLETED" && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 mt-6 text-center shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-xl font-bold text-emerald-800 mb-2">Nhiệm vụ đã hoàn tất xuất sắc!</h2>
          
          {currentUser?.isTeamLeader ? (
            <div className="mt-6">
              <p className="text-emerald-700 text-sm mb-4">Vui lòng tạo báo cáo tổng kết để hoàn lưu hồ sơ cứu hộ.</p>
              <button
                onClick={() => navigate(`/rescue-team/missions/${mission.requestId}/report`)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-sm transition-all active:scale-95"
              >
                Tạo báo cáo ngay
              </button>
            </div>
          ) : (
             <p className="text-emerald-700/80 text-sm mt-2">
              (Đội trưởng chịu trách nhiệm tạo báo cáo tổng kết cho nhiệm vụ này)
            </p>
          )}
        </div>
      )}
    </div>
  );
}