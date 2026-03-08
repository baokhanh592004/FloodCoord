import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { rescueTeamApi } from "../../services/rescueTeamApi";
import MissionMap from "../../components/rescueteam/MissionMap";

export default function MissionDetail() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    try {

      const res = await rescueTeamApi.getAssignedMissions();

      const missionData = res.find(
        (m) => String(m.requestId) === String(id)
      );

      if (missionData) {
        setMission(missionData);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

const updateStatus = async (status) => {
  try {

    await rescueTeamApi.updateProgress(id, {
      status: status
    });

    setMission((prev) => ({
      ...prev,
      status: status
    }));

  } catch (err) {
    console.error("Update status failed:", err.response?.data);
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
      case "COMPLETED":
        return "bg-green-100 text-green-700";
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

  if (loading) {
    return <p className="p-6">Đang tải...</p>;
  }

  if (!mission) {
    return <p className="p-6">Không tìm thấy nhiệm vụ</p>;
  }

  
  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      <h1 className="text-3xl font-bold mb-6">
        Chi tiết nhiệm vụ cứu hộ
      </h1>

      {/* MAP */}
      <div className="bg-white shadow rounded-xl p-6 mb-6">

        <h2 className="text-lg font-semibold mb-2">
          Địa điểm cần cứu trợ
        </h2>

        <p className="text-gray-600 mb-3">
          {mission.location?.addressText}
        </p>

        <MissionMap location={mission.location} />

      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* Thông tin nhiệm vụ */}
        <div className="bg-white shadow rounded-xl p-6 space-y-4">

          <h2 className="text-lg font-semibold border-b pb-2">
            Thông tin nhiệm vụ
          </h2>

    

          <p>
            <span className="font-medium text-gray-600">Tiêu đề:</span>{" "}
            {mission.title}
          </p>

          <p>
            <span className="font-medium text-gray-600">Mô tả:</span>{" "}
            {mission.description}
          </p>

          <p>
            <span className="font-medium text-gray-600">Số người cần cứu:</span>{" "}
            {mission.peopleCount}
          </p>

          <p>
            <span className="font-medium text-gray-600">
              Mức độ khẩn cấp:
            </span>

            <span className={`ml-2 px-3 py-1 rounded-full text-sm ${emergencyColor(mission.emergencyLevel)}`}>
              {emergencyMap[mission.emergencyLevel]}
            </span>
          </p>

        </div>

        {/* Thông tin liên hệ */}
        <div className="bg-white shadow rounded-xl p-6 space-y-4">

          <h2 className="text-lg font-semibold border-b pb-2">
            Thông tin liên hệ
          </h2>

          <p>
            <span className="font-medium text-gray-600">
              Người liên hệ:
            </span>{" "}
            {mission.contactName}
          </p>

          <p>
            <span className="font-medium text-gray-600">
              Số điện thoại:
            </span>{" "}
            {mission.contactPhone}
          </p>

          <p>
            <span className="font-medium text-gray-600">
              Trạng thái:
            </span>

            <span className={`ml-2 px-3 py-1 rounded-full text-sm ${statusColor(mission.status)}`}>
              {statusMap[mission.status]}
            </span>

          </p>

        </div>

      </div>

      {/* UPDATE STATUS */}
{/* UPDATE STATUS */}
{mission.status !== "COMPLETED" &&  ( 

  <div className="bg-white shadow rounded-xl p-6 mt-6">

    <h2 className="font-semibold mb-4">
      Cập nhật tiến độ cứu hộ
    </h2>

    <div className="flex gap-3 flex-wrap">

      {mission.status === "IN_PROGRESS" && (
        <button
          onClick={() => updateStatus("MOVING")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
        >
          Đang di chuyển
        </button>
      )}

      {mission.status === "MOVING" && (
        <button
          onClick={() => updateStatus("ARRIVED")}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
        >
          Đã đến nơi
        </button>
      )}

      {mission.status === "ARRIVED" && (
        <button
          onClick={() => updateStatus("RESCUING")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Đang cứu hộ
        </button>
      )}

      {mission.status === "RESCUING" && (
        <button
          onClick={() => updateStatus("COMPLETED")}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Hoàn thành
        </button>
      )}

    </div>

  </div>

)}

      {/* REPORT */}
      {mission.status === "COMPLETED" && (

        <div className="bg-white shadow rounded-xl p-6 mt-6 text-center">

          <p className="mb-4 text-green-600 font-semibold">
            Nhiệm vụ đã hoàn thành
          </p>

          <button
            onClick={() =>
              navigate(`/rescue-team/missions/${mission.requestId}/report`)
            }
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
          >
            Tạo báo cáo cứu hộ
          </button>

        </div>

      )}

    </div>
  );
}