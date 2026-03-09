import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom'
import {
  HomeIcon,
  UserGroupIcon,
  UsersIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  TruckIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'

export default function AdminLayout() {
  const { logout, user, profileName } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menu = [
    { name: 'Tổng quan',     path: '/admin/dashboard',  icon: HomeIcon },
    { name: 'Đội cứu hộ',  path: '/admin/rescue-teams', icon: UserGroupIcon },
    { name: 'Người dùng',  path: '/admin/users',       icon: UsersIcon },
    { name: 'Phương tiện', path: '/admin/vehicles',    icon: TruckIcon },
  ]

  return (
    <div className="flex overflow-hidden min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white text-gray-900 flex flex-col border-r border-gray-200 shadow-sm">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className="text-xl font-bold text-blue-600">FloodRescue</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <Link to="/profile" className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 hover:bg-blue-50 transition-colors group">
          <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
            {user?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-600">
              {profileName || user?.fullName || 'Admin'}
            </p>
            <p className="text-xs text-blue-400">Xem hồ sơ cá nhân</p>
          </div>
          <UserCircleIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-500 shrink-0" />
        </Link>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {menu.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-blue-500'}`} />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="m-4 flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-md transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Đăng xuất
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
