'use client'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
} from '@headlessui/react'
import {
  Bars3Icon,
  XMarkIcon,
  MapIcon,
  ShieldExclamationIcon,
  UserGroupIcon,
  InformationCircleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import { ChevronDownIcon, PhoneIcon } from '@heroicons/react/20/solid'
import { loginApi } from '../services/authApi'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import logo from '../assets/images/logo.png'

const services = [
  { name: 'Bản đồ lũ lụt', description: 'Xem bản đồ theo dõi tình hình lũ', href: '/map', icon: MapIcon },
  { name: 'Gửi yêu cầu cứu hộ', description: 'Gửi tín hiệu SOS khẩn cấp', href: '/request-rescue', icon: ShieldExclamationIcon },
  { name: 'Đội cứu hộ', description: 'Thông tin các đội cứu hộ', href: '/rescue-teams', icon: UserGroupIcon },
  { name: 'Hướng dẫn', description: 'Hướng dẫn sử dụng hệ thống', href: '/guide', icon: InformationCircleIcon },
  { name: 'Tra cứu yêu cầu cứu hộ', description: 'Theo dõi trạng thái yêu cầu cứu hộ', href: '/track-rescue', icon: ShieldExclamationIcon },
]

const callsToAction = [
  { name: 'Hotline cứu hộ', href: 'tel:113', icon: PhoneIcon },
]

export default function Header() {
  const navigate = useNavigate()
  const [setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { profileName, role } = useAuth()

  const getDashboardPathByRole = (userRole) => {
    const normalizedRole = userRole?.toUpperCase()

    const dashboardMap = {
      ADMIN: '/admin/dashboard',
      MANAGER: '/manager/dashboard',
      COORDINATOR: '/coordinator/dashboard',
      RESCUE_TEAM: '/rescue-team/dashboard',
    }

    return dashboardMap[normalizedRole] || null
  }

  const dashboardPath = getDashboardPathByRole(role)
  const isMemberRole = ['MEMBER', 'TEAM_MEMBER'].includes(role?.toUpperCase())
  const canOpenDashboard = Boolean(dashboardPath) && !isMemberRole

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken')
      setIsLoggedIn(!!token)
    }

    checkAuth()
    window.addEventListener('storage', checkAuth)
    window.addEventListener('authChange', checkAuth)

    return () => {
      window.removeEventListener('storage', checkAuth)
      window.removeEventListener('authChange', checkAuth)
    }
  }, [])

  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken')
      if (accessToken) {
        await loginApi.logout(accessToken)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setIsLoggedIn(false)
      window.dispatchEvent(new Event('authChange'))
      toast.success('Đăng xuất thành công!')
      navigate('/login')
      setMobileMenuOpen(false)
    }
  }

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md border-b border-gray-200 z-50">
  <nav className="flex items-center justify-between p-4 lg:px-16 w-full">
        {/* Logo */}
        <div className="flex lg:flex-1 ">
          <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <span className="sr-only">Flood Rescue System</span>
            <img
              alt="Logo"
              src={logo}
              className="w-13 h-13 rounded-full border-2 border-white shadow-lg"
            />
            <span className="text-black font-bold text-lg hidden sm:block drop-shadow-md">Trung tâm cứu trợ lũ lụt TP.HCM</span>
          </Link>
        </div>


        {/* Desktop menu */}
        <PopoverGroup className="hidden lg:flex lg:gap-x-13 ">
          <Popover className="relative">
            <PopoverButton className="flex items-center gap-x-1 text-sm/6 font-semibold text-black hover:text-blue-600 transition-colors">
              Dịch vụ
              <ChevronDownIcon aria-hidden="true" className="size-5 flex-none text-blue-400" />
            </PopoverButton>

            <PopoverPanel
              transition
              className="absolute left-1/2 z-10 mt-3 w-screen max-w-md -translate-x-1/2 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200 transition data-closed:translate-y-1 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in"
            >
              <div className="p-4">
                {services.map((item) => (
                  <div
                    key={item.name}
                    className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-teal-50 transition-all"
                  >
                    <div className="flex size-11 flex-none items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-teal-400 group-hover:from-blue-500 group-hover:to-teal-500 transition-all shadow-md">
                      <item.icon aria-hidden="true" className="size-6 text-white" />
                    </div>
                    <div className="flex-auto">
                      <Link to={item.href} className="block font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {item.name}
                        <span className="absolute inset-0" />
                      </Link>
                      <p className="mt-1 text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-teal-50 border-t border-gray-200">
                {callsToAction.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="flex items-center justify-center gap-x-2.5 p-3 text-sm/6 font-semibold text-blue-600 hover:bg-blue-100 transition-colors"
                  >
                    <item.icon aria-hidden="true" className="size-5 flex-none text-teal-500" />
                    {item.name}
                  </a>
                ))}
              </div>
            </PopoverPanel>
          </Popover>

          <Link to="/" className="text-sm/6 font-semibold text-black hover:text-blue-600 transition-colors">
            Trang chủ
          </Link>
          <Link to="/request-rescue" className="text-sm/6 font-semibold text-black hover:text-blue-600 transition-colors">
            Yêu cầu cứu hộ
          </Link>
          <Link to="/track-rescue" className="text-sm/6 font-semibold text-black hover:text-blue-600 transition-colors">
            Tra cứu cứu hộ
          </Link>
          <Link to="/about" className="text-sm/6 font-semibold text-black hover:text-blue-600 transition-colors">
            Giới thiệu
          </Link>
          {isLoggedIn && (
            <Link to="/my-requests" className="text-sm/6 font-semibold text-blue-600 hover:text-blue-800 transition-colors border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50">
              Yêu cầu của tôi
            </Link>
          )}
        </PopoverGroup>

        {/* Desktop Login/Logout */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-x-4">
          {isLoggedIn ? (
            <>
              <Popover className="relative">
                <PopoverButton className="flex items-center gap-x-2 text-sm/6 font-semibold text-black hover:text-blue-600 transition-colors">
                  <UserCircleIcon className="size-6 text-blue-500" />
                  <span>{profileName || 'Tài khoản'}</span>
                  <ChevronDownIcon aria-hidden="true" className="size-4 text-blue-400" />
                </PopoverButton>

                <PopoverPanel
                  transition
                  className="absolute right-0 z-20 mt-2 w-56 rounded-xl bg-white p-2 shadow-xl ring-1 ring-gray-200 transition data-closed:translate-y-1 data-closed:opacity-0 data-enter:duration-150 data-enter:ease-out data-leave:duration-100 data-leave:ease-in"
                >
                  {canOpenDashboard && (
                    <Link
                      to={dashboardPath}
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      Đi đến Dashboard
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Hồ sơ cá nhân
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Đăng xuất
                  </button>
                </PopoverPanel>
              </Popover>
            </>
          ) : (
            <Link to="/login" className="text-sm/6 font-semibold text-black hover:text-blue-600 transition-colors bg-white/20 hover:bg-white/30 px-27 py-2 rounded-lg">
              Đăng nhập <span aria-hidden="true">&rarr;</span>
            </Link>
          )}
        </div>
      </nav>


    </header>
  )
}
