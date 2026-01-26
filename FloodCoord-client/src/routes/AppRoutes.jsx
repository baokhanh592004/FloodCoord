import React from 'react'
import Home from '../pages/Home'
import { Route, Router, Routes } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import SoSMapPage from '../pages/citizens/SoSMapPage'
import LoginPage from '../pages/auth/LoginPage'

export default function AppRoutes() {
  return (
    <Routes>

      <Route element={<MainLayout />}>
        <Route path = "/" element={<Home />} />
        <Route path = "/map/sos" element = {<SoSMapPage/>} />
        <Route path = "/login" element = {<LoginPage />} />
      </Route>

      <Route
        path="*"
        element={
          <h2 className="text-center text-red-500">
            404 - Not Found
          </h2>
        }
      />  
    </Routes>
  )
}
