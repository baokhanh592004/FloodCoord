import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  HomeIcon,
  UserGroupIcon,
  UsersIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'

export default function AdminLayout() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menu = [
    { name: 'Tổng quan', path: '/admin/dashboard', icon: HomeIcon },
    { name: 'Đội cứu hộ', path: '/admin/rescue-teams', icon: UserGroupIcon },
  ]

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="px-6 py-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className="h-8 w-8 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold">FloodRescue</h1>
              <p className="text-xs text-slate-400">Quản trị hệ thống</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.fullName || 'Admin'}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {menu.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-colors
                ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="m-4 flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-md transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Đăng xuất
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
