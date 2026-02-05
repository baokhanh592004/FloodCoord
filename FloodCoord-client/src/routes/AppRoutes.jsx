import React from 'react'
import Home from '../pages/Home'
import { Route, Routes } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import LoginPage from '../pages/auth/LoginPage'
import RequestRescuePage from '../pages/rescue/RequestRescuePage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'
import PrivateRoute from './PrivateRoute'
import CoordinatorLayout from '../layouts/CoordinatorLayout'
import CoordinatorDashboard from '../pages/coordinator/CoordinatorDashboard'
import RequestQueue from '../pages/coordinator/RequestQueue'
import AssignTeams from '../pages/coordinator/AssignTeams'
import Operations from '../pages/coordinator/Operations'

export default function AppRoutes() {
  return (
    <Routes>

      <Route element={<MainLayout />}>
        {/* Route công khai - ai cũng xem được */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/request-rescue" element={<RequestRescuePage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route
        path="/coordinator"
        element={
          <PrivateRoute>
            <CoordinatorLayout />
          </PrivateRoute>
        }
      >
        <Route path="" element={<CoordinatorDashboard />} />
        <Route path="dashboard" element={<CoordinatorDashboard />} />
        <Route path="requests" element={<RequestQueue />} />
        <Route path="assign-teams" element={<AssignTeams />} />
        <Route path="operations" element={<Operations />} />
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
