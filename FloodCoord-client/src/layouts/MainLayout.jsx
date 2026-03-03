
import Footer from '../component/Footer.jsx'
import Header from '../component/Header.jsx'

import { Outlet } from 'react-router-dom'

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen justify-between">
      <Header/>
      <main className="pt-[73px]">
        <Outlet />
      </main>
    <Footer/>

    </div>
  )
}
