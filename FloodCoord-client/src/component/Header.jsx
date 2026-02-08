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
} from '@heroicons/react/24/outline'
import { ChevronDownIcon, PhoneIcon } from '@heroicons/react/20/solid'
import { loginApi } from '../services/authApi'
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

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
    <header className="bg-gradient-to-r from-blue-500 via-teal-500 to-cyan-500 shadow-lg">
      <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1 ">
          <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <span className="sr-only">Flood Rescue System</span>
            <img
              alt="Logo"
              src={logo}
              className="w-13 h-13 rounded-full border-2 border-white shadow-lg"
            />
            <span className="text-white font-bold text-lg hidden sm:block drop-shadow-md">Trung tâm cứu trợ lũ lụt TP.HCM</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white hover:bg-white/20 transition-colors"
          >
            <span className="sr-only">Mở menu</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
        </div>

        {/* Desktop menu */}
        <PopoverGroup className="hidden lg:flex lg:gap-x-12">
          <Popover className="relative">
            <PopoverButton className="flex items-center gap-x-1 text-sm/6 font-semibold text-white hover:text-blue-100 transition-colors">
              Dịch vụ
              <ChevronDownIcon aria-hidden="true" className="size-5 flex-none text-blue-100" />
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

          <Link to="/" className="text-sm/6 font-semibold text-white hover:text-blue-100 transition-colors">
            Trang chủ
          </Link>
          <Link to="/request-rescue" className="text-sm/6 font-semibold text-white hover:text-blue-100 transition-colors">
            Gửi cứu hộ
          </Link>
          <Link to="/track-rescue" className="text-sm/6 font-semibold text-white hover:text-blue-100 transition-colors">
            Tra cứu cứu hộ
          </Link>
          <Link to="/about" className="text-sm/6 font-semibold text-white hover:text-blue-100 transition-colors">
            Giới thiệu
          </Link>
        </PopoverGroup>

        {/* Desktop Login/Logout */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="text-sm/6 font-semibold text-white hover:text-blue-100 transition-colors"
            >
              Đăng xuất <span aria-hidden="true">&rarr;</span>
            </button>
          ) : (
            <Link to="/login" className="text-sm/6 font-semibold text-white hover:text-blue-100 transition-colors bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg">
              Đăng nhập <span aria-hidden="true">&rarr;</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gradient-to-br from-blue-500 via-teal-500 to-cyan-500 p-6 sm:max-w-sm sm:ring-1 sm:ring-white/20 shadow-2xl">
          <div className="flex items-center justify-between">
            <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
              <span className="sr-only">Flood Rescue System</span>
              <img
                alt="Logo"
                src={logo}
                className="h-8 w-auto rounded-full border-2 border-white shadow-lg"
              />
              <span className="text-white font-bold drop-shadow-md">Cứu trợ lũ lụt</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-white hover:bg-white/20 transition-colors"
            >
              <span className="sr-only">Đóng menu</span>
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-white/20">
              <div className="space-y-2 py-6">
                <Disclosure as="div" className="-mx-3">
                  <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pr-3.5 pl-3 text-base/7 font-semibold text-white hover:bg-white/20 transition-colors">
                    Dịch vụ
                    <ChevronDownIcon aria-hidden="true" className="size-5 flex-none group-data-open:rotate-180 transition-transform" />
                  </DisclosureButton>
                  <DisclosurePanel className="mt-2 space-y-2">
                    {[...services, ...callsToAction].map((item) => (
                      <DisclosureButton
                        key={item.name}
                        as={item.href.startsWith('tel:') ? 'a' : Link}
                        to={item.href.startsWith('tel:') ? undefined : item.href}
                        href={item.href.startsWith('tel:') ? item.href : undefined}
                        onClick={() => !item.href.startsWith('tel:') && setMobileMenuOpen(false)}
                        className="block rounded-lg py-2 pr-3 pl-6 text-sm/7 font-semibold text-white hover:bg-white/20 transition-colors"
                      >
                        {item.name}
                      </DisclosureButton>
                    ))}
                  </DisclosurePanel>
                </Disclosure>
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-white hover:bg-white/20 transition-colors"
                >
                  Trang chủ
                </Link>
                <Link
                  to="/map/sos"
                  onClick={() => setMobileMenuOpen(false)}
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-white hover:bg-white/20 transition-colors"
                >
                  Gửi cứu hộ
                </Link>
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-white hover:bg-white/20 transition-colors"
                >
                  Giới thiệu
                </Link>
              </div>
              <div className="py-6">
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-white hover:bg-white/20 w-full text-left transition-colors"
                  >
                    Đăng xuất
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-white hover:bg-white/20 bg-white/10 text-center transition-colors"
                  >
                    Đăng nhập
                  </Link>
                )}
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  )
}
