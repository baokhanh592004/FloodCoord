import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { rescueTeamApi } from "../../services/rescueTeamApi";
import MissionMap from "../../components/rescueteam/MissionMap";
import toast from "react-hot-toast";
import { CheckCircle2, Users, X, UserCheck, UserX, Search, AlertTriangle } from "lucide-react";

export default function MissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const waitingStateKey = `mission_waiting_coordinator_${id}`;

  const [currentUser, setCurrentUser] = useState(null);
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendanceDone, setAttendanceDone] = useState(false);
  const [waitingCoordinatorDecision, setWaitingCoordinatorDecision] = useState(false);
  const [latestIncident, setLatestIncident] = useState(null);
  // State khi nhiệm vụ đã bị hủy và giao đội khác (đội cũ vào lại trang)
  const [missionAborted, setMissionAborted] = useState(false);
  const lastAbortIncidentToastRef = useRef(null);

  // --- PHẦN THÊM MỚI: State cho điểm danh ---
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);

  // --- State cho báo cáo sự cố trên đường ---
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentForm, setIncidentForm] = useState({ title: "", description: "", files: [] });

  // --- State cho modal xác nhận cập nhật tiến độ ---
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const persistedWaitingState = localStorage.getItem(waitingStateKey) === "1";
      if (persistedWaitingState) {
        setWaitingCoordinatorDecision(true);
      }

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

        const members = await rescueTeamApi.getTeamMembers().catch(() => []);
        setTeamMembers(members || []);

        const attStatus = await rescueTeamApi.checkAttendance(id).catch(() => []);
        const presentCount = Array.isArray(attStatus)
          ? attStatus.filter((entry) => entry.status === "PRESENT").length
          : 0;
        const hasAttendanceRecord = Array.isArray(attStatus) && attStatus.length > 0;
        const totalMembers = (members || []).length;

        if (totalMembers > 0 && presentCount >= totalMembers) {
          setAttendanceDone(true);
          setWaitingCoordinatorDecision(false);
          setLatestIncident(null);
          localStorage.removeItem(waitingStateKey);
        } else if (hasAttendanceRecord) {
          setAttendanceDone(false);
          await checkCoordinatorDecision();
        } else if (persistedWaitingState) {
          setAttendanceDone(false);
          await checkCoordinatorDecision();
        } else {
          setAttendanceDone(false);
          setWaitingCoordinatorDecision(false);
          setLatestIncident(null);
          localStorage.removeItem(waitingStateKey);
        }
      } else {
        // Nhiệm vụ không thuộc đội này nữa (có thể đã bị ABORT + reassign)
        // Thử kiểm tra xem có incident ABORT nào không
        try {
          const incident = await rescueTeamApi.getLatestIncidentByRequest(id);
          if (incident && incident.status === "RESOLVED" && incident.coordinatorAction === "ABORT") {
            setLatestIncident(incident);
            setMissionAborted(true);
            localStorage.removeItem(waitingStateKey);
          } else {
            toast.error("Không tìm thấy thông tin nhiệm vụ!");
          }
        } catch {
          toast.error("Không tìm thấy thông tin nhiệm vụ!");
        }
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

  const checkCoordinatorDecision = async () => {
    try {
      const incident = await rescueTeamApi.getLatestIncidentByRequest(id);
      setLatestIncident(incident || null);

      if (!incident) {
        const persistedWaitingState = localStorage.getItem(waitingStateKey) === "1";
        setWaitingCoordinatorDecision(persistedWaitingState);
        setAttendanceDone(false);
        return;
      }

      if (incident.status === "PENDING") {
        localStorage.setItem(waitingStateKey, "1");
        setWaitingCoordinatorDecision(true);
        setAttendanceDone(false);
        return;
      }

      if (incident.status === "RESOLVED" && incident.coordinatorAction === "CONTINUE") {
        localStorage.removeItem(waitingStateKey);
        setWaitingCoordinatorDecision(false);
        setAttendanceDone(true);
        return;
      }

      if (incident.status === "RESOLVED" && incident.coordinatorAction === "ABORT") {
        localStorage.removeItem(waitingStateKey);
        setWaitingCoordinatorDecision(false);
        setAttendanceDone(false);
        // latestIncident đã set rồi, component sẽ hiện banner ABORT
        return;
      }

      localStorage.setItem(waitingStateKey, "1");
      setWaitingCoordinatorDecision(true);
      setAttendanceDone(false);
    } catch (err) {
      const persistedWaitingState = localStorage.getItem(waitingStateKey) === "1";
      setWaitingCoordinatorDecision(persistedWaitingState);
      if (persistedWaitingState) {
        setAttendanceDone(false);
      }
    }
  };

  // --- PHẦN THÊM MỚI: Hàm xử lý điểm danh ---
  const openAttendance = async () => {
    try {
      const members = await rescueTeamApi.getTeamMembers(); // Bạn cần thêm hàm này vào rescueTeamApi.js
      setTeamMembers(members);
      setAttendanceList(members.map(m => ({ memberId: m.id, status: "PRESENT", fullName: m.fullName })));
      setShowAttendanceModal(true);
    } catch (err) {
      toast.error("Không lấy được danh sách đội!");
    }
  };

  const submitAttendance = async () => {
    try {
      const presentMembers = attendanceList.filter((item) => item.status === "PRESENT");
      const totalMembers = attendanceList.length;

      const data = {
        requestId: id,
        attendanceList: presentMembers.map(({ memberId }) => ({ memberId, status: "PRESENT" }))
      };

      await rescueTeamApi.markAttendance(data);
      setShowAttendanceModal(false);

      if (presentMembers.length < totalMembers) {
        const absentMembers = attendanceList
          .filter((item) => item.status !== "PRESENT")
          .map((item) => item.fullName)
          .join(", ");

        const description = `Điểm danh thiếu người: ${presentMembers.length}/${totalMembers} có mặt. ${absentMembers ? `Vắng: ${absentMembers}.` : ""} Xin chỉ thị từ Điều phối viên.`;

        await rescueTeamApi.createIncidentReport({
          rescueRequestId: id,
          title: "Thiếu quân số khi điểm danh",
          description,
          files: [],
        });

        localStorage.setItem(waitingStateKey, "1");
        setAttendanceDone(false);
        setWaitingCoordinatorDecision(true);
        toast("Số lượng thành viên không đủ. Đã gửi báo cáo sự cố cho Coordinator.", { icon: "⚠️" });
        await checkCoordinatorDecision();
      } else {
        localStorage.removeItem(waitingStateKey);
        setAttendanceDone(true);
        setWaitingCoordinatorDecision(false);
        toast.success("Điểm danh đủ quân số. Có thể tiếp tục nhiệm vụ!");
      }
    } catch (err) {
      toast.error("Điểm danh thất bại!");
    }
  };

  // --- Hàm báo cáo sự cố trên đường ---
  const openIncidentModal = () => {
    setIncidentForm({ title: "", description: "", files: [] });
    setShowIncidentModal(true);
  };

  const submitIncidentReport = async () => {
    if (!incidentForm.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề sự cố!");
      return;
    }
    if (!incidentForm.description.trim()) {
      toast.error("Vui lòng mô tả sự cố!");
      return;
    }
    try {
      await rescueTeamApi.createIncidentReport({
        rescueRequestId: id,
        title: incidentForm.title.trim(),
        description: incidentForm.description.trim(),
        files: incidentForm.files,
      });
      setShowIncidentModal(false);
      localStorage.setItem(waitingStateKey, "1");
      setWaitingCoordinatorDecision(true);
      toast("Đã gửi báo cáo sự cố. Đang chờ quyết định từ Coordinator.", { icon: "⚠️" });
      await checkCoordinatorDecision();
    } catch (err) {
      toast.error("Gửi báo cáo sự cố thất bại!");
    }
  };

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

  // Khi nhiệm vụ đã bị hủy (ABORT) và giao cho đội khác
  if (!mission && missionAborted && latestIncident) {
    return (
      <div className="p-8 max-w-xl mx-auto">
        <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-6 space-y-4">
          <div className="flex items-start gap-4">
            <span className="text-4xl">🚫</span>
            <div>
              <h2 className="text-xl font-black text-red-900">Nhiệm vụ đã bị hủy</h2>
              <p className="text-sm text-red-700 mt-1">
                Điều phối viên đã hủy nhiệm vụ này và đã được giao lại cho đội khác.<br />
                Đội bạn đã được giải phóng và chuyển về trạng thái sẵn sàng.
              </p>
              {latestIncident.coordinatorResponse && (
                <div className="mt-3 rounded-lg bg-white border border-red-200 px-4 py-3">
                  <p className="text-xs font-bold text-gray-500 mb-1">Lý do từ Coordinator:</p>
                  <p className="text-sm text-gray-800">{latestIncident.coordinatorResponse}</p>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate("/rescue-team/missions")}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-95"
          >
            Quay về danh sách nhiệm vụ
          </button>
        </div>
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
{showAttendanceModal && (
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-60 flex items-center justify-center p-4 animate-in fade-in duration-200">
    <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
      
      {/* Header: Thiết kế dàn hàng ngang rộng */}
      <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
        <div className="flex items-center gap-4">
          <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Bảng điểm danh nhiệm vụ</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Mã nhiệm vụ: #{id}</p>
          </div>
        </div>

        {/* Thanh tìm kiếm nhanh cho Desktop */}
        <div className="hidden md:flex items-center bg-slate-100 px-4 py-2 rounded-xl w-64 border border-transparent focus-within:border-blue-300 focus-within:bg-white transition-all">
          <Search size={16} className="text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Tìm tên thành viên..." 
            className="bg-transparent border-none outline-none text-sm w-full"
          />
        </div>

        <button 
          onClick={() => setShowAttendanceModal(false)}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
        >
          <X size={20} />
        </button>
      </div>

      {/* Body: Chia cột (Grid) để tận dụng chiều ngang của máy tính */}
      <div className="p-8 overflow-y-auto bg-slate-50/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attendanceList.map((item) => {
            const isPresent = item.status === "PRESENT";
            return (
              <div 
                key={item.memberId} 
                className={`group flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
                  isPresent 
                    ? "bg-white border-slate-200 shadow-sm hover:border-blue-200" 
                    : "bg-red-50 border-red-100 shadow-none"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-colors ${
                    isPresent ? "bg-blue-100 text-blue-600" : "bg-red-200 text-red-700"
                  }`}>
                    {item.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${isPresent ? "text-slate-700" : "text-red-900"}`}>
                      {item.fullName}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">Thành viên chính thức</p>
                  </div>
                </div>

                {/* Nút bấm gọn gàng cho Desktop (Hover effect) */}
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setAttendanceList(prev => prev.map(a => a.memberId === item.memberId ? {...a, status: "PRESENT"} : a))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      isPresent 
                        ? "bg-white text-emerald-600 shadow-sm" 
                        : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                    }`}
                  >
                    <UserCheck size={14} />
                    CÓ MẶT
                  </button>
                  <button
                    onClick={() => setAttendanceList(prev => prev.map(a => a.memberId === item.memberId ? {...a, status: "ABSENT"} : a))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      !isPresent 
                        ? "bg-red-600 text-white shadow-md shadow-red-100" 
                        : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                    }`}
                  >
                    <UserX size={14} />
                    VẮNG
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer: Dàn hàng ngang cuối trang */}
      <div className="px-8 py-6 bg-white border-t border-slate-100 flex justify-between items-center">
        <div className="text-sm">
          <span className="text-slate-400 font-medium">Tổng số: </span>
          <span className="font-bold text-slate-700">{attendanceList.length} người</span>
          <span className="mx-3 text-slate-200">|</span>
          <span className="text-emerald-500 font-medium">Hiện diện: </span>
          <span className="font-bold text-emerald-600">{attendanceList.filter(a => a.status === "PRESENT").length}</span>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => setShowAttendanceModal(false)} 
            className="px-6 py-2.5 border border-slate-200 text-slate-500 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
          >
            Đóng
          </button>
          <button 
            onClick={submitAttendance} 
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center gap-2"
          >
            <CheckCircle2 size={18} />
            LƯU ĐIỂM DANH
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* ===== MODAL BÁO CÁO SỰ CỐ TRÊN ĐƯỜNG ===== */}
{showIncidentModal && (
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-60 flex items-center justify-center p-4 animate-in fade-in duration-200">
    <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
        <div className="flex items-center gap-3">
          <div className="bg-orange-50 p-2.5 rounded-xl text-orange-500">
            <AlertTriangle size={22} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Báo cáo sự cố trên đường</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Mã nhiệm vụ: #{id}</p>
          </div>
        </div>
        <button
          onClick={() => setShowIncidentModal(false)}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
        >
          <X size={20} />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Tiêu đề sự cố <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="VD: Xe bị hỏng, đường bị ngập, sạt lở..."
            value={incidentForm.title}
            onChange={e => setIncidentForm(prev => ({ ...prev, title: e.target.value }))}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Mô tả chi tiết <span className="text-red-500">*</span></label>
          <textarea
            rows={4}
            placeholder="Mô tả tình huống sự cố, mức độ ảnh hưởng và yêu cầu hỗ trợ..."
            value={incidentForm.description}
            onChange={e => setIncidentForm(prev => ({ ...prev, description: e.target.value }))}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Hình ảnh (tùy chọn)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={e => setIncidentForm(prev => ({ ...prev, files: Array.from(e.target.files) }))}
            className="block w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 transition-all"
          />
          {incidentForm.files.length > 0 && (
            <p className="text-xs text-slate-400 mt-1">{incidentForm.files.length} ảnh được chọn</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-end gap-3">
        <button
          onClick={() => setShowIncidentModal(false)}
          className="px-5 py-2.5 border border-slate-200 text-slate-500 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
        >
          Đóng
        </button>
        <button
          onClick={submitIncidentReport}
          className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-sm shadow-lg shadow-orange-100 transition-all active:scale-95 flex items-center gap-2"
        >
          <AlertTriangle size={16} />
          GỬI BÁO CÁO
        </button>
      </div>
    </div>
  </div>
)}

{/* ===== MODAL XÁC NHẬN CẬP NHẬT TIẾN ĐỘ ===== */}
{showConfirmModal && pendingStatus && (
  <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] z-60 flex items-center justify-center p-4 animate-in fade-in duration-200">
    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
        <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
          <CheckCircle2 size={22} />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-800 tracking-tight">Xác nhận cập nhật</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Vui lòng kiểm tra trước khi xác nhận</p>
        </div>
      </div>
      {/* Body */}
      <div className="px-6 py-5 space-y-3">
        <p className="text-sm text-slate-600">
          Bạn có chắc muốn cập nhật trạng thái sang:
        </p>
        <div className={`text-center py-2.5 px-4 rounded-xl font-black text-base ring-1 ${
          pendingStatus === 'MOVING' ? 'bg-amber-50 text-amber-700 ring-amber-300' :
          pendingStatus === 'ARRIVED' ? 'bg-indigo-50 text-indigo-700 ring-indigo-300' :
          pendingStatus === 'RESCUING' ? 'bg-blue-50 text-blue-700 ring-blue-300' :
          'bg-emerald-50 text-emerald-700 ring-emerald-300'
        }`}>
          {{
            MOVING: '🚗 Đang di chuyển',
            ARRIVED: '📍 Đã đến nơi',
            RESCUING: '🛟 Đang cứu hộ',
            COMPLETED: '✅ Hoàn thành nhiệm vụ',
          }[pendingStatus]}
        </div>
        <p className="text-xs text-slate-400 text-center">Hành động này sẽ được ghi nhận và thông báo đến Điều phối viên.</p>
      </div>
      {/* Footer */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
        <button
          onClick={() => { setShowConfirmModal(false); setPendingStatus(null); }}
          className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all"
        >
          Huỷ
        </button>
        <button
          onClick={async () => {
            setShowConfirmModal(false);
            await updateStatus(pendingStatus);
            setPendingStatus(null);
          }}
          className={`flex-1 px-4 py-2.5 text-white rounded-xl font-black text-sm shadow-md transition-all active:scale-95 ${
            pendingStatus === 'MOVING' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' :
            pendingStatus === 'ARRIVED' ? 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-100' :
            pendingStatus === 'RESCUING' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' :
            'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'
          }`}
        >
          Xác nhận
        </button>
      </div>
    </div>
  </div>
)}

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
          {/* HÌNH ẢNH HIỆN TRƯỜNG - GIỮ NGUYÊN */}
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

          {/* THÔNG TIN CHUNG - GIỮ NGUYÊN */}
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

          {/* THÔNG TIN LIÊN HỆ - GIỮ NGUYÊN */}
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

          {/* PHƯƠNG TIỆN - GIỮ NGUYÊN */}
          {mission.vehicle && (
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <h2 className="text-lg font-bold border-b pb-2 mb-3">🚗 Phương tiện được cấp</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-500"><span>Tên xe:</span><span className="font-semibold text-slate-900">{mission.vehicle.name}</span></div>
                {mission.vehicle.licensePlate && (
                  <div className="flex justify-between text-slate-500"><span>Biển số:</span><span className="font-mono font-semibold text-blue-700">{mission.vehicle.licensePlate}</span></div>
                )}
              </div>
            </div>
          )}

          {/* VẬT TƯ - GIỮ NGUYÊN */}
          {mission.supplies && mission.supplies.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <h2 className="text-lg font-bold border-b pb-2 mb-3">📦 Vật tư được cấp</h2>
              <div className="space-y-2">
                {mission.supplies.map((s, i) => (
                  <div key={s.supplyId ?? i} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-50 last:border-0">
                    <span className="text-slate-700 font-medium">{s.supplyName}</span>
                    <span className="text-slate-500 font-mono">{s.quantity} {s.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PHẦN CẬP NHẬT TIẾN TRÌNH - SỬA LOGIC Ở ĐÂY */}
          {mission.status !== "COMPLETED" ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <h2 className="font-bold mb-3 text-sm text-slate-700">Cập nhật tiến trình thực tế</h2>
              {currentUser?.isTeamLeader ? (
                <div className="flex gap-2 flex-wrap">
                  {/* LUỒNG MỚI: Chỉ hiện Điểm danh nếu chưa làm */}
                  {mission.status === "IN_PROGRESS" && !attendanceDone && !waitingCoordinatorDecision && (
                    <button onClick={openAttendance} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-sm">Điểm danh đội</button>
                  )}

                  {/* ===== BANNER KHI COORDINATOR ĐÃ HỦY NHIỆM VỤ (ABORT) ===== */}
                  {latestIncident?.status === "RESOLVED" && latestIncident?.coordinatorAction === "ABORT" && (
                    <div className="w-full rounded-xl border-2 border-red-300 bg-red-50 p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🚫</span>
                        <div>
                          <p className="font-bold text-red-800 text-sm">Nhiệm vụ đã bị hủy bởi Điều phối viên</p>
                          <p className="text-xs text-red-700 mt-0.5">
                            Đội bạn đã được giải phóng. Nhiệm vụ này đã được giao lại hoặc đưa vào hàng chờ.
                          </p>
                          {latestIncident.coordinatorResponse && (
                            <p className="mt-2 text-xs text-gray-700 bg-white border border-red-200 rounded-lg px-3 py-2">
                              <span className="font-semibold">Phản hồi của Coordinator:</span> {latestIncident.coordinatorResponse}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => navigate("/rescue-team/missions")}
                        className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-4 py-2.5 rounded-lg shadow-sm transition-all active:scale-95"
                      >
                        Quay về danh sách nhiệm vụ
                      </button>
                    </div>
                  )}

                  {/* ===== BANNER KHI ĐANG CHỜ QUYẾT ĐỊNH COORDINATOR ===== */}
                  {waitingCoordinatorDecision && !(latestIncident?.status === "RESOLVED" && latestIncident?.coordinatorAction === "ABORT") && (
                    <>
                      <div className="w-full rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-800 space-y-1">
                        <p className="font-bold text-amber-900 flex items-center gap-1.5">
                          <span>⏳</span>
                          Đã gửi báo cáo. Đang chờ quyết định từ Điều phối viên.
                        </p>
                        {latestIncident?.coordinatorResponse && (
                          <p className="text-amber-700">Phản hồi: {latestIncident.coordinatorResponse}</p>
                        )}
                      </div>
                      <button
                        onClick={checkCoordinatorDecision}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold shadow-sm"
                      >
                        Kiểm tra quyết định Coordinator
                      </button>
                    </>
                  )}

                  {/* CHỈ HIỆN CÁC NÚT NÀY SAU KHI ĐÃ ĐIỂM DANH */}
                  {attendanceDone && !waitingCoordinatorDecision && (
                    <>
                      {mission.status === "IN_PROGRESS" && (
                        <button onClick={() => { setPendingStatus("MOVING"); setShowConfirmModal(true); }} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold shadow-sm">Đang di chuyển</button>
                      )}
                      {mission.status === "MOVING" && (
                        <button onClick={() => { setPendingStatus("ARRIVED"); setShowConfirmModal(true); }} className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold shadow-sm">Đã đến nơi</button>
                      )}
                      {mission.status === "ARRIVED" && (
                        <button onClick={() => { setPendingStatus("RESCUING"); setShowConfirmModal(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm">Đang cứu hộ</button>
                      )}
                      {mission.status === "RESCUING" && (
                        <button onClick={() => { setPendingStatus("COMPLETED"); setShowConfirmModal(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-all active:scale-95">Hoàn thành nhiệm vụ</button>
                      )}

                      {/* NÚT BÁO CÁO SỰ CỐ TRÊN ĐƯỜNG — hiện ở mọi trạng thái sau điểm danh (trừ COMPLETED) */}
                      {["IN_PROGRESS", "MOVING", "ARRIVED", "RESCUING"].includes(mission.status) && (
                        <button
                          onClick={openIncidentModal}
                          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold shadow-sm transition-all active:scale-95"
                        >
                          <AlertTriangle size={16} />
                          Báo cáo sự cố
                        </button>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-100 text-amber-700 text-xs p-3 rounded-lg">Chỉ Đội trưởng mới có quyền cập nhật tiến độ.</div>
              )}
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center animate-in fade-in zoom-in duration-500">
               {/* Phần Báo cáo - GIỮ NGUYÊN */}
               <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-200">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-xl font-black text-emerald-900 mb-2 uppercase tracking-tight">Nhiệm vụ đã hoàn tất!</h2>
              <button onClick={() => navigate(`/rescue-team/missions/${mission.requestId}/report`)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg flex items-center justify-center mx-auto gap-3">
                <span>Tạo báo cáo tổng kết</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}