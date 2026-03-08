import { useEffect, useState } from "react";
import { rescueTeamApi } from "../../services/rescueTeamApi";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function RescueTeamDashboard() {

  const { profileName } = useAuth();

  const [missions, setMissions] = useState([]);

  useEffect(() => {

    const fetchMissions = async () => {
      try {

        const res = await rescueTeamApi.getAssignedMissions();

        setMissions(res || []);

      } catch (error) {
        console.error("Load missions failed:", error);
      }
    };

    fetchMissions();

  }, []);

  const active = missions.filter(
    (m) => m.status !== "COMPLETED"
  ).length;

  const completed = missions.filter(
    (m) => m.status === "COMPLETED"
  ).length;

  return (

    <div className="p-8">

      {/* Header */}
      <div className="mb-8">

        <h1 className="text-3xl font-bold text-gray-800">
          {profileName || "Rescue Team"} 👋
        </h1>

        <p className="text-gray-500 mt-1">
          Tổng quan nhiệm vụ cứu hộ
        </p>

      </div>


      {/* Statistic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        <div className="bg-white shadow rounded-lg p-6 border-l-4 border-blue-500">

          <h2 className="text-gray-500 text-sm">
            Tổng nhiệm vụ
          </h2>

          <p className="text-3xl font-bold text-gray-800">
            {missions.length}
          </p>

        </div>

        <div className="bg-white shadow rounded-lg p-6 border-l-4 border-yellow-500">

          <h2 className="text-gray-500 text-sm">
            Đang thực hiện
          </h2>

          <p className="text-3xl font-bold text-gray-800">
            {active}
          </p>

        </div>

        <div className="bg-white shadow rounded-lg p-6 border-l-4 border-green-500">

          <h2 className="text-gray-500 text-sm">
            Hoàn thành
          </h2>

          <p className="text-3xl font-bold text-gray-800">
            {completed}
          </p>

        </div>

      </div>


      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">

        <h2 className="text-lg font-semibold mb-4">
          Truy cập nhanh
        </h2>

        <div className="flex gap-4">

          <Link
            to="/rescue-team/missions"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Xem nhiệm vụ
          </Link>

          <Link
            to="/rescue-team/map"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Bản đồ cứu hộ
          </Link>

        </div>

      </div>

    </div>
  );
}