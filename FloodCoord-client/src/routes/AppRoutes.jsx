import React from 'react'
import HomePage from '../pages/HomePage'
import { Route, Routes } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import LoginPage from '../pages/auth/LoginPage'
import RequestRescuePage from '../pages/rescue/RequestRescuePage'
import TrackRescuePage from '../pages/rescue/TrackRescuePage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'

import RegisterPage from '../pages/auth/RegisterPage'

import PrivateRoute from './PrivateRoute'
import RoleBasedRoute from './RoleBasedRoute'
import CoordinatorLayout from '../layouts/CoordinatorLayout'
import CoordinatorDashboard from '../pages/coordinator/CoordinatorDashboard'
import RequestQueue from '../pages/coordinator/RequestQueue'
import AssignTeams from '../pages/coordinator/AssignTeams'
import Operations from '../pages/coordinator/Operations'
import AdminDashboard from '../pages/admin/AdminDashboard'
import ManagerDashboard from '../pages/manager/ManagerDashboard'
import VehicleManagement from '../pages/manager/VehicleManagement'
import RescueTeamManagement from '../pages/manager/RescueTeamManagement'
import SupplyManagement from '../pages/manager/SupplyManagement'
import RescueTeamDashboard from '../pages/rescue/RescueTeamDashboard'



export default function AppRoutes() {
  return (
    <Routes>

      <Route element={<MainLayout />}>
        {/* Route công khai - ai cũng xem được */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/request-rescue" element={<RequestRescuePage />} />
        <Route path="/track-rescue" element={<TrackRescuePage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Admin Dashboard Route */}
      <Route
        path="/admin/dashboard"
        element={
          <RoleBasedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </RoleBasedRoute>
        }
      />

      {/* Manager Dashboard Route */}
      <Route
        path="/manager/dashboard"
        element={
          <RoleBasedRoute allowedRoles={['MANAGER']}>
            <ManagerDashboard />
          </RoleBasedRoute>
        }
      />

      {/* Manager Vehicle Management Route */}
      <Route
        path="/manager/vehicles"
        element={
          <RoleBasedRoute allowedRoles={['MANAGER']}>
            <VehicleManagement />
          </RoleBasedRoute>
        }
      />

      {/* Manager Rescue Team Management Route */}
      <Route
        path="/manager/rescue-teams"
        element={
          <RoleBasedRoute allowedRoles={['MANAGER']}>
            <RescueTeamManagement />
          </RoleBasedRoute>
        }
      />

      {/* Manager Supply Management Route */}
      <Route
        path="/manager/supplies"
        element={
          <RoleBasedRoute allowedRoles={['MANAGER']}>
            <SupplyManagement />
          </RoleBasedRoute>
        }
      />

      {/* Coordinator Dashboard Routes */}
      <Route
        path="/coordinator"
        element={
          <RoleBasedRoute allowedRoles={['COORDINATOR']}>
            <CoordinatorLayout />
          </RoleBasedRoute>
        }
      >
        <Route path="" element={<CoordinatorDashboard />} />
        <Route path="dashboard" element={<CoordinatorDashboard />} />
        <Route path="requests" element={<RequestQueue />} />
        <Route path="assign-teams" element={<AssignTeams />} />
        <Route path="operations" element={<Operations />} />
      </Route>

      {/* Rescue Team Dashboard Route */}
      <Route
        path="/rescue-team/dashboard"
        element={
          <RoleBasedRoute allowedRoles={['RESCUE_TEAM', 'TEAM_MEMBER']}>
            <RescueTeamDashboard />
          </RoleBasedRoute>
        }
      />

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
