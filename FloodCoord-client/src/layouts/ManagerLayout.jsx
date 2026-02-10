import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  HomeIcon,
  TruckIcon,
  UserGroupIcon,
  ArchiveBoxIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'

export default function ManagerLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menu = [
    { name: 'Dashboard', path: '/manager/dashboard', icon: HomeIcon },
    { name: 'Vehicles', path: '/manager/vehicles', icon: TruckIcon },
    { name: 'Rescue Teams', path: '/manager/rescue-teams', icon: UserGroupIcon },
    { name: 'Supplies', path: '/manager/supplies', icon: ArchiveBoxIcon },
  ]

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="px-6 py-5 border-b border-slate-700">
          <h1 className="text-xl font-bold">FloodRescue</h1>
          <p className="text-xs text-slate-400">Manager Panel</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {menu.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-md text-sm
                ${
                  isActive
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
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
          className="m-4 flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-md"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
