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

const SERVICE_ITEMS = [
  { name: 'Gửi yêu cầu cứu hộ', description: 'Gửi tín hiệu SOS khẩn cấp', href: '/request-rescue', icon: ShieldExclamationIcon },
  { name: 'Giới thiệu', description: 'Hướng dẫn sử dụng hệ thống', href: '/about', icon: InformationCircleIcon },
  { name: 'Tra cứu yêu cầu cứu hộ', description: 'Theo dõi trạng thái yêu cầu cứu hộ', href: '/track-rescue', icon: ShieldExclamationIcon },
]

const CTA_ITEMS = [
  { name: 'Hotline cứu hộ', href: 'tel:113', icon: PhoneIcon },
]

const MAIN_NAV_ITEMS = [
  { to: '/', label: 'Trang chủ' },
  { to: '/request-rescue', label: 'Yêu cầu cứu hộ' },
  { to: '/track-rescue', label: 'Tra cứu cứu hộ' },
  { to: '/about', label: 'Giới thiệu' },
]

const DASHBOARD_PATH_BY_ROLE = {
  ADMIN: '/admin/dashboard',
  MANAGER: '/manager/dashboard',
  COORDINATOR: '/coordinator/dashboard',
  RESCUE_TEAM: '/rescue-team/dashboard',
}

function ServicePopover() {
  return (
    <Popover className="relative">
      <PopoverButton className="flex items-center gap-x-1 text-sm/6 font-semibold text-black hover:text-coordinator transition-colors">
        Dịch vụ
        <ChevronDownIcon aria-hidden="true" className="size-5 flex-none text-coordinator" />
      </PopoverButton>

      <PopoverPanel
        transition
        className="absolute left-1/2 z-10 mt-3 w-screen max-w-md -translate-x-1/2 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-neutral-100 transition data-closed:translate-y-1 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in"
      >
        <div className="p-4">
          {SERVICE_ITEMS.map((item) => (
            <div
              key={item.name}
              className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-linear-to-r hover:from-coordinator-50 hover:to-rescue-50 transition-all"
            >
              <div className="flex size-11 flex-none items-center justify-center rounded-lg bg-linear-to-br from-coordinator to-rescue-medium group-hover:from-coordinator-dark group-hover:to-rescue transition-all shadow-md">
                <item.icon aria-hidden="true" className="size-6 text-white" />
              </div>
              <div className="flex-auto">
                <Link to={item.href} className="block font-semibold text-neutral-900 group-hover:text-coordinator transition-colors">
                  {item.name}
                  <span className="absolute inset-0" />
                </Link>
                <p className="mt-1 text-neutral-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-linear-to-r from-coordinator-50 to-rescue-50 border-t border-neutral-100">
          {CTA_ITEMS.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center justify-center gap-x-2.5 p-3 text-sm/6 font-semibold text-coordinator hover:bg-coordinator-100 transition-colors"
            >
              <item.icon aria-hidden="true" className="size-5 flex-none text-rescue-medium" />
              {item.name}
            </a>
          ))}
        </div>
      </PopoverPanel>
    </Popover>
  )
}

function ProfileMenu({ profileName, canOpenDashboard, dashboardPath, onLogout }) {
  return (
    <Popover className="relative">
      <PopoverButton className="flex items-center gap-x-2 text-sm/6 font-semibold text-black hover:text-coordinator transition-colors">
        <UserCircleIcon className="size-6 text-coordinator" />
        <span>{profileName || 'Tài khoản'}</span>
        <ChevronDownIcon aria-hidden="true" className="size-4 text-coordinator" />
      </PopoverButton>

      <PopoverPanel
        transition
        className="absolute right-0 z-20 mt-2 w-56 rounded-xl bg-white p-2 shadow-xl ring-1 ring-neutral-100 transition data-closed:translate-y-1 data-closed:opacity-0 data-enter:duration-150 data-enter:ease-out data-leave:duration-100 data-leave:ease-in"
      >
        {canOpenDashboard && (
          <Link
            to={dashboardPath}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-coordinator-50 hover:text-coordinator-dark transition-colors"
          >
            Đi đến Dashboard
          </Link>
        )}
        <Link
          to="/profile"
          className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
        >
          Hồ sơ cá nhân
        </Link>
        <button
          onClick={onLogout}
          className="w-full text-left rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          Đăng xuất
        </button>
      </PopoverPanel>
    </Popover>
  )
}

export default function Header({ hideLoginEntry = false }) {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { profileName, role } = useAuth()

  const dashboardPath = DASHBOARD_PATH_BY_ROLE[role?.toUpperCase()] || null
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
    <header className="fixed top-0 left-0 w-full bg-white shadow-md border-b border-neutral-100 z-50">
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

        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="inline-flex items-center justify-center rounded-md p-2 text-neutral-700 hover:bg-neutral-100"
          >
            <span className="sr-only">Mở menu</span>
            <Bars3Icon className="size-6" aria-hidden="true" />
          </button>
        </div>

        {/* Desktop menu */}
        <PopoverGroup className="hidden lg:flex lg:gap-x-13">
          <ServicePopover />
          {MAIN_NAV_ITEMS.map((item) => (
            <Link key={item.to} to={item.to} className="text-sm/6 font-semibold text-black hover:text-coordinator transition-colors">
              {item.label}
            </Link>
          ))}
          {isLoggedIn && (
            <Link to="/my-requests" className="text-sm/6 font-semibold text-coordinator hover:text-coordinator-dark transition-colors border border-coordinator-100 px-3 py-1.5 rounded-lg hover:bg-coordinator-50">
              Yêu cầu của tôi
            </Link>
          )}
        </PopoverGroup>

        {/* Desktop Login/Logout */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-x-4">
          {isLoggedIn ? (
            <ProfileMenu
              profileName={profileName}
              canOpenDashboard={canOpenDashboard}
              dashboardPath={dashboardPath}
              onLogout={handleLogout}
            />
          ) : !hideLoginEntry ? (
            <Link to="/login" className="text-sm/6 font-semibold text-black hover:text-coordinator transition-colors bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg">
              Đăng nhập <span aria-hidden="true">&rarr;</span>
            </Link>
          ) : null
          }
        </div>
      </nav>

      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-50 bg-black/20" aria-hidden="true" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full max-w-sm overflow-y-auto bg-white px-6 py-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
              <img alt="Logo" src={logo} className="w-10 h-10 rounded-full border border-neutral-200" />
              <span className="text-sm font-semibold text-neutral-800">FloodCoord</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-md p-2 text-neutral-700 hover:bg-neutral-100"
            >
              <span className="sr-only">Đóng menu</span>
              <XMarkIcon className="size-6" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-2">
            <Disclosure as="div" className="rounded-lg border border-neutral-100">
              <DisclosureButton className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-semibold text-neutral-800">
                Dịch vụ
                <ChevronDownIcon className="size-5 text-neutral-500" aria-hidden="true" />
              </DisclosureButton>
              <DisclosurePanel className="px-3 pb-3">
                <div className="space-y-1">
                  {SERVICE_ITEMS.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-md px-2 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </DisclosurePanel>
            </Disclosure>

            {MAIN_NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
              >
                {item.label}
              </Link>
            ))}

            {isLoggedIn && (
              <Link
                to="/my-requests"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-semibold text-coordinator hover:bg-coordinator-50"
              >
                Yêu cầu của tôi
              </Link>
            )}
          </div>

          <div className="mt-6 border-t border-neutral-100 pt-4 space-y-2">
            {isLoggedIn ? (
              <>
                {canOpenDashboard && (
                  <Link
                    to={dashboardPath}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    Đi đến Dashboard
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Hồ sơ cá nhân
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Đăng xuất
                </button>
              </>
            ) : !hideLoginEntry ? (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-2 py-2 text-sm font-semibold text-coordinator hover:bg-coordinator-50"
              >
                Đăng nhập
              </Link>
            ) : null
            }
          </div>
        </DialogPanel>
      </Dialog>

    </header>
  )
}
