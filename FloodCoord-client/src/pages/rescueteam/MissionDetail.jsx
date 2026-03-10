MissionDetail


import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { rescueTeamApi } from "../../services/rescueTeamApi";
import MissionMap from "../../components/rescueteam/MissionMap";
import toast from "react-hot-toast";

export default function MissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendanceDone, setAttendanceDone] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const [activeRes, completedRes] = await Promise.all([
        rescueTeamApi.getAssignedMissions().catch(() => []),
        rescueTeamApi.getCompletedMissions().catch(() => []),
      ]);

      const allMissions = [...(activeRes || []), ...(completedRes || [])];
      const missionData = allMissions.find((m) => String(m.requestId) === String(id));

      if (missionData) {
        setMission(missionData);
        if (missionData.status === "COMPLETED") {
          setAttendanceDone(true);
        }
      } else {
        toast.error("Không tìm thấy thông tin nhiệm vụ!");
      }
    } catch (err) {
      console.error("Lỗi fetch detail:", err);
      toast.error("Có lỗi xảy ra khi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const updateStatus = async (status) => {
    try {
      await rescueTeamApi.updateProgress(id, { status });
      setMission((prev) => ({ ...prev, status }));
      if (status === "COMPLETED") {
        toast.success("Nhiệm vụ cứu hộ kết thúc thành công!");
      } else {
        toast.success("Cập nhật tiến độ thành công!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể cập nhật trạng thái!");
    }
  };

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
      case "RESCUING": return "bg-blue-50 text-blue-700 ring-blue-600/20";
      case "ARRIVED": return "bg-indigo-50 text-indigo-700 ring-indigo-600/20";
      case "MOVING": return "bg-amber-50 text-amber-700 ring-amber-600/20";
      default: return "bg-slate-50 text-slate-700 ring-slate-600/20";
    }
  };

  const emergencyMap = {
    LOW: "Thấp", MEDIUM: "Trung bình", HIGH: "Cao", CRITICAL: "Nghiêm trọng",
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
    <div className="p-6 h-[calc(100vh-80px)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Chi tiết nhiệm vụ cứu hộ</h1>
          <p className="text-slate-500 text-sm italic">Mã yêu cầu: #{mission.requestId}</p>
        </div>
        <button onClick={() => navigate(-1)} className="text-sm font-semibold text-slate-500 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-all active:scale-95">
          Quay lại
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 h-full">
        <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Địa điểm cứu trợ</h2>
          <p className="text-slate-500 text-sm mb-3">{mission.location?.addressText || "Địa chỉ chưa cập nhật"}</p>
          <div className="flex-1 rounded-xl overflow-hidden border bg-slate-50">
            {mission.location?.latitude && mission.location?.longitude ? (
              <MissionMap location={mission.location} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic">Vị trí bản đồ không khả dụng</div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto pr-1">
          {/* HÌNH ẢNH HIỆN TRƯỜNG - MỚI THÊM */}
          {mission.media && mission.media.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <h2 className="text-lg font-bold border-b pb-2 mb-3">Hình ảnh hiện trường</h2>
              <div className="grid grid-cols-2 gap-2">
                {mission.media.map((item) => (
                  <div key={item.mediaId} className="aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                    <img 
                      src={item.mediaUrl} 
                      alt="Hiện trường cứu hộ" 
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => window.open(item.mediaUrl, '_blank')}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <h2 className="text-lg font-bold border-b pb-2 mb-3">Thông tin chung</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Tiêu đề:</span><span className="font-semibold">{mission.title}</span></div>
              <div><span>Mô tả:</span><div className="bg-slate-50 p-2 rounded mt-1 text-slate-600 leading-relaxed">{mission.description || "Không có mô tả"}</div></div>
              <div className="flex justify-between"><span>Số người cần cứu:</span><span className="font-bold text-red-600">{mission.peopleCount} người</span></div>
              <div className="flex justify-between"><span>Mức độ:</span>
                <span className={`px-2 py-1 text-xs rounded-full ring-1 font-bold ${emergencyColor(mission.emergencyLevel)}`}>
                  {emergencyMap[mission.emergencyLevel]}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <h2 className="text-lg font-bold border-b pb-2 mb-3">Thông tin liên hệ</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Người liên hệ:</span><span className="font-semibold">{mission.contactName}</span></div>
              <div className="flex justify-between"><span>Số điện thoại:</span><span className="text-blue-600 font-bold">{mission.contactPhone}</span></div>
              <div className="flex justify-between"><span>Tiến độ hiện tại:</span>
                <span className={`px-2 py-1 text-xs rounded-full ring-1 font-bold ${statusColor(mission.status)}`}>
                  {statusMap[mission.status]}
                </span>
              </div>
            </div>
          </div>

          {/* Phương tiện được cấp */}
          {mission.vehicle && (
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <h2 className="text-lg font-bold border-b pb-2 mb-3">🚗 Phương tiện được cấp</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tên xe:</span>
                  <span className="font-semibold">{mission.vehicle.name}</span>
                </div>
                {mission.vehicle.type && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Loại xe:</span>
                    <span className="font-medium">{mission.vehicle.type}</span>
                  </div>
                )}
                {mission.vehicle.licensePlate && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Biển số:</span>
                    <span className="font-mono font-semibold tracking-wide text-blue-700">{mission.vehicle.licensePlate}</span>
                  </div>
                )}
                {mission.vehicle.capacity && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sức chứa:</span>
                    <span className="font-medium">{mission.vehicle.capacity} người</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Vật tư được cấp */}
          {mission.supplies && mission.supplies.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <h2 className="text-lg font-bold border-b pb-2 mb-3">📦 Vật tư được cấp</h2>
              <div className="space-y-2">
                {mission.supplies.map((s, i) => (
                  <div key={s.supplyId ?? i} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-50 last:border-0">
                    <span className="text-slate-700 font-medium">{s.supplyName}</span>
                    <span className="text-slate-500 font-mono">
                      {s.quantity} <span className="text-xs text-slate-400">{s.unit}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mission.status !== "COMPLETED" ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <h2 className="font-bold mb-3 text-sm text-slate-700">Cập nhật tiến trình thực tế</h2>
              {currentUser?.isTeamLeader ? (
                <div className="flex gap-2 flex-wrap">
                  {mission.status === "IN_PROGRESS" && !attendanceDone && (
                    <button onClick={() => { setAttendanceDone(true); toast.success("Điểm danh thành công!"); }} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-sm">Điểm danh đội</button>
                  )}
                  {mission.status === "IN_PROGRESS" && attendanceDone && (
                    <button onClick={() => updateStatus("MOVING")} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold shadow-sm">Đang di chuyển</button>
                  )}
                  {mission.status === "MOVING" && (
                    <button onClick={() => updateStatus("ARRIVED")} className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold shadow-sm">Đã đến nơi</button>
                  )}
                  {mission.status === "ARRIVED" && (
                    <button onClick={() => updateStatus("RESCUING")} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm">Đang cứu hộ</button>
                  )}
                  {mission.status === "RESCUING" && (
                    <button onClick={() => updateStatus("COMPLETED")} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-all active:scale-95">Hoàn thành nhiệm vụ</button>
                  )}
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-100 text-amber-700 text-xs p-3 rounded-lg">Chỉ Đội trưởng (Leader) mới có quyền cập nhật tiến độ cứu hộ.</div>
              )}
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-200">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-xl font-black text-emerald-900 mb-2 uppercase tracking-tight">Nhiệm vụ đã hoàn tất!</h2>
              {currentUser?.isTeamLeader ? (
                <div className="mt-4">
                  <p className="text-emerald-700 text-xs mb-5 font-medium">Bạn có thể tạo báo cáo tổng kết ngay bây giờ để hoàn thiện hồ sơ.</p>
                  <button
                    onClick={() => navigate(`/rescue-team/missions/${mission.requestId}/report`)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center mx-auto gap-3"
                  >
                    <span>Tạo báo cáo tổng kết</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </button>
                </div>
              ) : (
                <p className="text-emerald-700/80 text-xs mt-2 italic">(Lưu ý: Báo cáo tổng kết sẽ do Đội trưởng thực hiện)</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}