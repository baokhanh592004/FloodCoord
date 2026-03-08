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

  const active = missions.filter((m) => m.status !== "COMPLETED").length;
  const completed = missions.filter((m) => m.status === "COMPLETED").length;

  return (
    <div className="p-8 lg:p-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Xin chào, {profileName || "Đội cứu hộ"} 👋
        </h1>
        <p className="text-slate-500 mt-2 text-sm md:text-base">
          Đây là tổng quan tình hình các nhiệm vụ cứu hộ của bạn hôm nay.
        </p>
      </div>

      {/* Statistic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Card 1 */}
        <div className="bg-white shadow-sm border border-slate-100 rounded-2xl p-6 transition-transform hover:-translate-y-1 duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xl">
              📋
            </div>
            <div>
              <h2 className="text-slate-500 text-sm font-medium">Tổng nhiệm vụ</h2>
              <p className="text-3xl font-bold text-slate-800 mt-1">{missions.length}</p>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white shadow-sm border border-slate-100 rounded-2xl p-6 transition-transform hover:-translate-y-1 duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 text-xl">
              ⚡
            </div>
            <div>
              <h2 className="text-slate-500 text-sm font-medium">Đang thực hiện</h2>
              <p className="text-3xl font-bold text-slate-800 mt-1">{active}</p>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white shadow-sm border border-slate-100 rounded-2xl p-6 transition-transform hover:-translate-y-1 duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 text-xl">
              ✅
            </div>
            <div>
              <h2 className="text-slate-500 text-sm font-medium">Đã hoàn thành</h2>
              <p className="text-3xl font-bold text-slate-800 mt-1">{completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-sm border border-slate-100 rounded-2xl p-8">
        <h2 className="text-lg font-bold text-slate-800 mb-5">Truy cập nhanh</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/rescue-team/missions"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
          >
            Xem danh sách nhiệm vụ
          </Link>
          <Link
            to="/rescue-team/map"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-white text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
          >
            Mở bản đồ cứu hộ
          </Link>
        </div>
      </div>
    </div>
  );
}