import React from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  MapIcon,
  ExclamationTriangleIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  ChartBarIcon,
  TruckIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'

export default function CoordinatorLayout() {
  const { user, logout, profileName } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { name: 'Tổng quan', href: '/coordinator/dashboard', icon: HomeIcon },
    { name: 'Phân tích', href: '/coordinator/analytics', icon: ChartBarIcon },
    { name: 'Danh sách yêu cầu', href: '/coordinator/requests', icon: ClipboardDocumentListIcon },
    { name: 'Giám sát hoạt động', href: '/coordinator/operations', icon: MapIcon },
    { name: 'Đội cứu hộ', href: '/coordinator/teams', icon: ShieldCheckIcon },
    { name: 'Phương tiện', href: '/coordinator/vehicles', icon: TruckIcon },
    { name: 'Vật tư', href: '/coordinator/supplies', icon: ArchiveBoxIcon },
    { name: 'Báo cáo sự cố', href: '/coordinator/incident-reports', icon: ExclamationTriangleIcon },
    { name: 'Báo cáo cứu hộ hoàn thành', href: '/coordinator/rescue-reports', icon: ChartBarIcon },
  ]

  return (
    <div className="flex overflow-hidden min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white text-gray-900 flex flex-col border-r border-gray-200 shadow-sm">

        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className="text-xl font-bold text-blue-600">FloodRescue</h1>
              <p className="text-xs text-gray-500">Coordinator Panel</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <Link to="/profile" className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 hover:bg-blue-50 transition-colors group">
          <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
            {user?.email?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-600">
              {profileName || user?.fullName || 'Coordinator'}
            </p>
            <p className="text-xs text-blue-400">Xem hồ sơ cá nhân</p>
          </div>
          <UserCircleIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-500 shrink-0" />
        </Link>

        {/* Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
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

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="m-4 flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-md transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Đăng xuất
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}