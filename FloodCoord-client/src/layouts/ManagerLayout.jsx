import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  HomeIcon,
  TruckIcon,
  UserGroupIcon,
  ArchiveBoxIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'

export default function ManagerLayout() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menu = [
    { name: 'Tổng quan', path: '/manager/dashboard', icon: HomeIcon },
    { name: 'Phương tiện', path: '/manager/vehicles', icon: TruckIcon },
    { name: 'Đội cứu hộ', path: '/manager/rescue-teams', icon: UserGroupIcon },
    { name: 'Vật tư', path: '/manager/supplies', icon: ArchiveBoxIcon },
  ]

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white text-gray-900 flex flex-col border-r border-gray-200 shadow-sm">
        
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className="h-7 w-7 text-blue-500" />
            <div>
              <h1 className="text-xl font-bold text-blue-600">FloodRescue</h1>
              <p className="text-xs text-gray-500">Trang quản lý</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'M'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {user?.fullName || 'Manager'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {menu.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
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

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}