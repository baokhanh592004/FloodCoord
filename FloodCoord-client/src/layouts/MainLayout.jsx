
import Footer from '../component/Footer.jsx'
import Header from '../component/Header.jsx'

import { Outlet } from 'react-router-dom'

export default function MainLayout() {
  return (
    <div>

        <Header/>
      <main  className="min-h-screen bg-gray-100 py-6">

        <Outlet />
      </main>
      <Footer/>

    </div>
  )
}
