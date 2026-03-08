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
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "IN_PROGRESS":
      case "RESCUING":
        return "bg-blue-100 text-blue-700";
      case "ARRIVED":
        return "bg-purple-100 text-purple-700";
      case "MOVING":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
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
        return "bg-red-100 text-red-700";
      case "HIGH":
        return "bg-orange-100 text-orange-700";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h1 className="text-xl font-bold mb-6">Danh sách yêu cầu cứu trợ</h1>

      <table className="w-full text-sm">
        <thead className="border-b text-gray-600">
          <tr>
            <th className="p-3 text-left">#</th>
            <th className="p-3 text-left">Tiêu đề</th>
            <th className="p-3 text-left">Người gửi</th>
            <th className="p-3 text-left">Địa điểm cứu trợ</th>
            <th className="p-3 text-left">Thời gian</th>
            <th className="p-3 text-left">Mức độ</th>
            <th className="p-3 text-left">Trạng thái</th>
            <th className="p-3 text-left">Hành động</th>
          </tr>
        </thead>

        <tbody>
          {missions.map((m, index) => (
            <tr key={m.requestId} className="border-b hover:bg-gray-50">
              <td className="p-3">{index + 1}</td>

              <td className="p-3 font-medium">{m.title}</td>

              <td className="p-3">
                {m.contactName}
                <div className="text-gray-400 text-xs">{m.contactPhone}</div>
              </td>

              <td className="p-3 text-gray-600">{m.address}</td>

              <td className="p-3 text-gray-500">{m.createdAt}</td>

              <td className="p-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${emergencyColor(
                    m.emergencyLevel
                  )}`}
                >
                  {emergencyMap[m.emergencyLevel]}
                </span>
              </td>

              <td className="p-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(
                    m.status
                  )}`}
                >
                  {statusMap[m.status]}
                </span>
              </td>

              <td className="p-3 flex gap-2">
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() =>
                    navigate(`/rescue-team/missions/${m.requestId}`)
                  }
                >
                  👁
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}