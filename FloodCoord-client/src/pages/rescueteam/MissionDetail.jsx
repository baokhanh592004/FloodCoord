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
      await rescueTeamApi.updateProgress(id, { status });
      setMission((prev) => ({ ...prev, status }));
      toast.success("Cập nhật trạng thái thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra!");
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
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
      case "RESCUING":
        return "bg-blue-50 text-blue-700 ring-blue-600/20";
      case "ARRIVED":
        return "bg-indigo-50 text-indigo-700 ring-indigo-600/20";
      case "MOVING":
        return "bg-amber-50 text-amber-700 ring-amber-600/20";
      default:
        return "bg-slate-50 text-slate-700 ring-slate-600/20";
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
      case "CRITICAL":
        return "bg-red-50 text-red-700 ring-red-600/20";
      case "HIGH":
        return "bg-orange-50 text-orange-700 ring-orange-600/20";
      case "MEDIUM":
        return "bg-amber-50 text-amber-700 ring-amber-600/20";
      default:
        return "bg-slate-50 text-slate-700 ring-slate-600/20";
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
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 h-[calc(100vh-80px)]">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Chi tiết nhiệm vụ cứu hộ
          </h1>
          <p className="text-slate-500 text-sm">Mã NV: #{mission.requestId}</p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="text-sm font-semibold text-slate-500 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          Quay lại
        </button>
      </div>

      {/* MAIN GRID */}
      <div className="grid lg:grid-cols-2 gap-6 h-full">

        {/* MAP */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col">

          <h2 className="text-lg font-bold text-slate-800 mb-2">
            Địa điểm cần cứu trợ
          </h2>

          <p className="text-slate-500 text-sm mb-3">
            {mission.location?.addressText}
          </p>

          <div className="flex-1 rounded-xl overflow-hidden border">
            <MissionMap location={mission.location} />
          </div>

        </div>


        {/* RIGHT SIDE */}
        <div className="flex flex-col gap-4">

          {/* Thông tin chung */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4">

            <h2 className="text-lg font-bold border-b pb-2 mb-3">
              Thông tin chung
            </h2>

            <div className="space-y-3 text-sm">

              <p className="flex justify-between">
                <span>Tiêu đề:</span>
                <span className="font-semibold">{mission.title}</span>
              </p>

              <div>
                <span>Mô tả:</span>
                <div className="bg-slate-50 p-2 rounded mt-1">
                  {mission.description}
                </div>
              </div>

              <p className="flex justify-between">
                <span>Số người cần cứu:</span>
                <span>{mission.peopleCount} người</span>
              </p>

              <p className="flex justify-between">
                <span>Mức độ khẩn cấp:</span>

                <span className={`px-2 py-1 text-xs rounded-full ring-1 ${emergencyColor(mission.emergencyLevel)}`}>
                  {emergencyMap[mission.emergencyLevel]}
                </span>
              </p>

            </div>
          </div>


          {/* Thông tin liên hệ */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4">

            <h2 className="text-lg font-bold border-b pb-2 mb-3">
              Thông tin liên hệ
            </h2>

            <div className="space-y-3 text-sm">

              <p className="flex justify-between">
                <span>Người liên hệ:</span>
                <span className="font-semibold">{mission.contactName}</span>
              </p>

              <p className="flex justify-between">
                <span>Số điện thoại:</span>
                <span className="text-blue-600 font-semibold">
                  {mission.contactPhone}
                </span>
              </p>

              <p className="flex justify-between">
                <span>Tiến độ:</span>

                <span className={`px-2 py-1 text-xs rounded-full ring-1 ${statusColor(mission.status)}`}>
                  {statusMap[mission.status]}
                </span>
              </p>

            </div>
          </div>


          {/* UPDATE STATUS */}
          {mission.status !== "COMPLETED" && (
            <div className="bg-white border border-slate-100 rounded-2xl p-4">

              <h2 className="font-bold mb-3">
                Cập nhật tiến độ cứu hộ
              </h2>

              {currentUser?.isTeamLeader ? (
                <div className="flex gap-2 flex-wrap">

                  {mission.status === "IN_PROGRESS" && !attendanceDone && (
                    <button
                      onClick={() => {
                        setAttendanceDone(true);
                        toast.success("Điểm danh đội thành công!");
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                    >
                      Điểm danh đội
                    </button>
                  )}

                  {mission.status === "IN_PROGRESS" && attendanceDone && (
                    <button
                      onClick={() => updateStatus("MOVING")}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg"
                    >
                      Đang di chuyển
                    </button>
                  )}

                  {mission.status === "MOVING" && (
                    <button
                      onClick={() => updateStatus("ARRIVED")}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg"
                    >
                      Đã đến nơi
                    </button>
                  )}

                  {mission.status === "ARRIVED" && (
                    <button
                      onClick={() => updateStatus("RESCUING")}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                      Đang cứu hộ
                    </button>
                  )}

                  {mission.status === "RESCUING" && (
                    <button
                      onClick={() => updateStatus("COMPLETED")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
                    >
                      Hoàn thành nhiệm vụ
                    </button>
                  )}

                </div>
              ) : (
                <p className="text-sm text-amber-700">
                  Chỉ đội trưởng mới có quyền cập nhật tiến độ.
                </p>
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

      </div>

    </div>
  );
}