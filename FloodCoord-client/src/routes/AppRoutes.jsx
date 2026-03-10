import React from 'react'
import { Routes, Route } from 'react-router-dom'

/* Layouts */
import MainLayout from '../layouts/MainLayout'
import CoordinatorLayout from '../layouts/CoordinatorLayout'
import ManagerLayout from '../layouts/ManagerLayout'
import AdminLayout from '../layouts/AdminLayout'
import RescueTeamLayout from '../layouts/RescueTeamLayout'

/* Public pages */
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'
import RequestRescuePage from '../pages/rescue/RequestRescuePage'
import TrackRescuePage from '../pages/rescue/TrackRescuePage'
import ProfilePage from '../pages/profile/ProfilePage'
import AboutPage from '../pages/AboutPage'

/* Route guards */
import RoleBasedRoute from './RoleBasedRoute'
import PrivateRoute from './PrivateRoute'

/* Admin */
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminRescueTeamManagement from '../pages/admin/RescueTeamManagement'
import UserManagement from '../pages/admin/UserManagement'
import AdminVehicleManagement from '../pages/admin/VehicleManagement'
import AdminSupplyManagement from '../pages/admin/SupplyManagement'

/* Manager */
import ManagerDashboard from '../pages/manager/ManagerDashboard'
import VehicleManagement from '../pages/manager/VehicleManagement'
import RescueTeamManagement from '../pages/manager/RescueTeamManagement'
import SupplyManagement from '../pages/manager/SupplyManagement'

/* Coordinator */
import CoordinatorDashboard from '../pages/coordinator/CoordinatorDashboard'
import RequestQueue from '../pages/coordinator/RequestQueue'
import Operations from '../pages/coordinator/Operations'

/* Rescue Team */
import RescueTeamDashboard from '../pages/rescueteam/RescueTeamDashboard'
import MyMissions from '../pages/rescueteam/MyMissions'
import MissionDetail from '../pages/rescueteam/MissionDetail'
import RescueReport from '../pages/rescueteam/RescueReport'

export default function AppRoutes() {
  return (
    <Routes>
      {/* ================= PUBLIC ROUTES ================= */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/request-rescue" element={<RequestRescuePage />} />
        <Route path="/track-rescue" element={<TrackRescuePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
      </Route>

      {/* ================= ADMIN (WITH SIDEBAR) ================= */}
      <Route
        path="/admin"
        element={
          <RoleBasedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </RoleBasedRoute>
        }
      >
        <Route path="" element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="rescue-teams" element={<AdminRescueTeamManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="vehicles" element={<AdminVehicleManagement />} />
        <Route path="supplies" element={<AdminSupplyManagement />} />
      </Route>

      {/* ================= MANAGER (WITH SIDEBAR) ================= */}
      <Route
        path="/manager"
        element={
          <RoleBasedRoute allowedRoles={['MANAGER']}>
            <ManagerLayout />
          </RoleBasedRoute>
        }
      >
        <Route path="" element={<ManagerDashboard />} />
        <Route path="dashboard" element={<ManagerDashboard />} />
        <Route path="vehicles" element={<VehicleManagement />} />
        <Route path="rescue-teams" element={<RescueTeamManagement />} />
        <Route path="supplies" element={<SupplyManagement />} />
      </Route>

      {/* ================= COORDINATOR (WITH SIDEBAR) ================= */}
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
        <Route path="operations" element={<Operations />} />
      </Route>

{/* ================= RESCUE TEAM (WITH SIDEBAR) ================= */}
    <Route
        path="/rescue-team"
        element={
          <RoleBasedRoute allowedRoles={['RESCUE_TEAM']}>
            <RescueTeamLayout />
          </RoleBasedRoute>
        }
      >
        <Route index path="" element={<RescueTeamDashboard />} />
        <Route path="dashboard" element={<RescueTeamDashboard />} />
        <Route path="missions" element={<MyMissions />} />
        <Route path="missions/:id" element={<MissionDetail />}/>
        <Route path="missions/:id/report" element={<RescueReport />}/>
      </Route>

      {/* ================= 404 ================= */}
      <Route
        path="*"
        element={
          <h2 className="text-center text-red-500 mt-10">
            404 - Not Found
          </h2>
        }
      />
    </Routes>
  )
}
