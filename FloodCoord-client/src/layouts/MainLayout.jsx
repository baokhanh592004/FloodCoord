
import Footer from '../components/Footer.jsx'
import Header from '../components/Header.jsx'

import { Outlet, useLocation } from 'react-router-dom'

const AUTH_ROUTES = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
])

export default function MainLayout() {
  const { pathname } = useLocation()
  const isAuthRoute = AUTH_ROUTES.has(pathname)

  return (
    <div className="flex flex-col min-h-screen justify-between">
      <Header hideLoginEntry={isAuthRoute} />
      <main className={isAuthRoute ? '' : 'pt-header'}>
        <Outlet />
      </main>
      {!isAuthRoute && <Footer/>}

    </div>
  )
}
