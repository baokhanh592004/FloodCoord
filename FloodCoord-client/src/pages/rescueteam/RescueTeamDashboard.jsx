// src/pages/rescueteam/RescueTeamDashboard.jsx
import React from "react";
import { useAuth } from "../../context/AuthContext";

export default function RescueTeamDashboard() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">
        Rescue Team
      </h2>
      <p className="text-slate-500 text-sm mb-6">
        Welcome, {user?.fullName || "Rescue Member"}!
      </p>

      {/* Nội dung bảng điều khiển */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Nhiệm vụ đang thực hiện</h3>
          <p className="text-sm text-gray-500">Xem danh sách nhiệm vụ hiện tại của bạn.</p>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Lịch sử hoạt động</h3>
          <p className="text-sm text-gray-500">Kiểm tra lại các nhiệm vụ đã hoàn thành.</p>
        </div>
      </div>
    </div>
  );
}