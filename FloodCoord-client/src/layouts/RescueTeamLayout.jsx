// src/layouts/RescueTeamLayout.jsx
import React from "react";
import { NavLink, Link, Outlet, useNavigate } from "react-router-dom";
import {
  ClipboardDocumentListIcon,
  MapIcon,
  DocumentTextIcon,
  ClockIcon,
  Cog6ToothIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  CheckCircleIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";

export default function RescueTeamLayout() {
  const { logout, user, profileName } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 🧭 Menu items — dùng path tương đối theo AppRoutes.jsx
  const menu = [
    { name: "Tổng quan", path: "dashboard", icon: HomeIcon },      // index route
    { name: "Thành viên", path: "members", icon: UserGroupIcon },
    { name: "Nhiệm vụ", path: "missions", icon: ClipboardDocumentListIcon },
    { name: "Lịch sử cứu hộ", path: "completed", icon: CheckCircleIcon },
    
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white text-gray-900 flex flex-col border-r border-gray-200 shadow-sm">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className="text-xl font-bold text-blue-600">FloodRescue</h1>
              <p className="text-xs text-gray-500">Quản lý nhiệm vụ cứu hộ</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <Link to="/profile" className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 hover:bg-blue-50 transition-colors group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
            {user?.email?.charAt(0).toUpperCase() || "R"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-600">
              {profileName || user?.fullName || "Rescue Team"}
            </p>
            <p className="text-xs text-blue-400">Xem hồ sơ cá nhân</p>
          </div>
          <UserCircleIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-500 shrink-0" />
        </Link>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {menu.map((item) => (
            <NavLink
              key={item.name}
              to={item.path} // dùng relative path
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                  ? "text-blue-700 font-semibold"
                  : "text-black hover:text-blue-600"
                }`
              }
            >
              <item.icon className="h-5 w-5 text-blue-600" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="m-4 flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-md transition-colors font-medium"
        >
          <ArrowRightOnRectangleIcon className="h-6 w-5" />
          Đăng xuất
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}