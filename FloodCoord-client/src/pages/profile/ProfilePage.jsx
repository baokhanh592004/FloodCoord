import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UserCircleIcon,
  LockClosedIcon,
  ClockIcon,
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { profileApi } from '../../services/profileApi'
import { loginApi } from '../../services/authApi'
import { rescueApi } from '../../services/rescueApi'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/coordinator/StatusBadge'
import toast from 'react-hot-toast'

const ROLE_LABELS = {
  ADMIN: 'Quản trị viên',
  MANAGER: 'Quản lý',
  COORDINATOR: 'Điều phối viên',
  RESCUE_TEAM: 'Đội cứu hộ',
  MEMBER: 'Người dân',
}

const ROLE_COLORS = {
  ADMIN: 'bg-red-100 text-red-700',
  MANAGER: 'bg-purple-100 text-purple-700',
  COORDINATOR: 'bg-blue-100 text-blue-700',
  RESCUE_TEAM: 'bg-orange-100 text-orange-700',
  MEMBER: 'bg-teal-100 text-teal-700',
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { role, setProfileName } = useAuth()

  // Tabs
  const [activeTab, setActiveTab] = useState('profile')

  // Profile state
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ fullName: '', phoneNumber: '' })

  // Confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // Change password state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordChanging, setPasswordChanging] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Rescue history state (member only)
  const [rescueHistory, setRescueHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const isMember = role === 'MEMBER'
  const isRescueTeam = role === 'RESCUE_TEAM' 

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      const data = await profileApi.getProfile()
      setProfile(data)
      setForm({
        fullName: data.fullName || '',
        phoneNumber: data.phoneNumber || '',
      })
    } catch (error) {
      toast.error('Không thể tải thông tin hồ sơ')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchRescueHistory = useCallback(async () => {
    try {
      setLoadingHistory(true)
      const data = await rescueApi.getMyRescueRequests()
      setRescueHistory(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Không thể tải lịch sử cứu hộ:', error)
      setRescueHistory([])
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    if (activeTab === 'history' && isMember) {
      fetchRescueHistory()
    }
  }, [activeTab, isMember, fetchRescueHistory])

  // --- Profile edit handlers ---
  const handleEdit = () => {
    setForm({
      fullName: profile.fullName || '',
      phoneNumber: profile.phoneNumber || '',
    })
    setEditing(true)
  }

  const handleCancelEdit = () => {
    setEditing(false)
    setForm({
      fullName: profile.fullName || '',
      phoneNumber: profile.phoneNumber || '',
    })
  }

  const handleSaveClick = () => {
    if (!form.fullName.trim()) {
      toast.error('Họ tên không được để trống')
      return
    }
    setShowConfirmModal(true)
  }

  const handleConfirmSave = async () => {
    setShowConfirmModal(false)
    try {
      setSaving(true)
      const updated = await profileApi.updateProfile({
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim(),
      })
      setProfile(updated)
      setProfileName(updated.fullName || updated.name || null)
      setEditing(false)
      toast.success('Cập nhật hồ sơ thành công!')
    } catch (error) {
      toast.error('Cập nhật thất bại. Vui lòng thử lại.')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  // --- Change password handlers ---
  const handlePasswordChange = (field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleCancelPassword = () => {
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    setShowOldPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
  }

  const handleUpdatePassword = async () => {
    const { oldPassword, newPassword, confirmPassword } = passwordForm
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Vui lòng điền đầy đủ các trường')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Mật khẩu mới phải có ít nhất 8 ký tự')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp')
      return
    }
    try {
      setPasswordChanging(true)
      await loginApi.changePassword({ oldPassword, newPassword, confirmPassword })
      toast.success('Đổi mật khẩu thành công!')
      handleCancelPassword()
    } catch (error) {
      const msg = error.response?.data || 'Đổi mật khẩu thất bại. Vui lòng thử lại.'
      toast.error(typeof msg === 'string' ? msg : 'Đổi mật khẩu thất bại.')
      console.error(error)
    } finally {
      setPasswordChanging(false)
    }
  }

  // --- Helpers ---
  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return name[0].toUpperCase()
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
      </div>
    )
  }

  // --- Tab definitions ---
  const tabs = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: UserCircleIcon },
    { id: 'password', label: 'Đổi mật khẩu', icon: LockClosedIcon },
    ...(isMember
      ? [{ id: 'history', label: 'Lịch sử yêu cầu cứu hộ', icon: ClockIcon }]
      : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Quay lại
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Cài đặt hồ sơ</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý thông tin tài khoản và cài đặt cá nhân.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Card - Avatar & Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                {/* Avatar */}
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 rounded-full bg-teal-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {getInitials(profile?.fullName)}
                  </div>
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  {profile?.fullName || 'Chưa cập nhật'}
                </h2>
                <span
                  className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${
                    ROLE_COLORS[role] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {ROLE_LABELS[role] || role || 'Người dùng'}
                </span>

                {profile?.createdAt && (
                  <p className="text-xs text-gray-400 mt-2">
                    Thành viên từ {formatDate(profile.createdAt)}
                  </p>
                )}

                {/* Rescue Team Info */}
                {isRescueTeam && profile?.teamName && (
                  <div className="mt-5 pt-5 border-t border-gray-100">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <UserGroupIcon className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium text-gray-700">Thông tin đội</span>
                    </div>
                    <p className="text-sm text-gray-600">{profile.teamName}</p>
                    {profile.teamId && (
                      <p className="text-xs text-gray-400">ID: {profile.teamId}</p>
                    )}
                    <span
                      className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${
                        profile.isTeamLeader
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {profile.isTeamLeader ? 'Đội trưởng' : 'Thành viên đội'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Card - Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Thông tin cá nhân</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Cập nhật thông tin cá nhân và liên hệ.
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
                        placeholder="Nhập họ và tên"
                      />
                    ) : (
                      <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm">
                        {profile?.fullName || '—'}
                      </div>
                    )}
                  </div>

                  {/* Email (read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm">
                      {profile?.email || '—'}
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    {editing ? (
                      <input
                        type="tel"
                        value={form.phoneNumber}
                        onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
                        placeholder="Nhập số điện thoại"
                      />
                    ) : (
                      <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm">
                        {profile?.phoneNumber || '—'}
                      </div>
                    )}
                  </div>

                  {/* Role (read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vai trò
                    </label>
                    <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm">
                      {ROLE_LABELS[profile?.roleName] || ROLE_LABELS[role] || role || '—'}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex gap-3">
                  {editing ? (
                    <>
                      <button
                        onClick={handleSaveClick}
                        disabled={saving}
                        className="px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-60"
                      >
                        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={saving}
                        className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Hủy
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleEdit}
                      className="px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      Chỉnh sửa hồ sơ
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">Đổi mật khẩu</h3>
                <p className="text-sm text-teal-600 mt-1">
                  Cập nhật mật khẩu để bảo vệ tài khoản.
                </p>
              </div>

              <div className="space-y-5">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu hiện tại
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? 'text' : 'password'}
                      value={passwordForm.oldPassword}
                      onChange={(e) => handlePasswordChange('oldPassword', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 pr-10"
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showOldPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 pr-10"
                      placeholder="Nhập mật khẩu mới"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs text-teal-600">
                    Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ cái, số và ký tự đặc biệt.
                  </p>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 pr-10"
                      placeholder="Nhập lại mật khẩu mới"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-3">
                <button
                  onClick={handleUpdatePassword}
                  disabled={passwordChanging}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-60"
                >
                  {passwordChanging ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                </button>
                <button
                  onClick={handleCancelPassword}
                  disabled={passwordChanging}
                  className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && isMember && (
          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">Lịch sử yêu cầu cứu hộ</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Tất cả các yêu cầu cứu hộ bạn đã gửi trên hệ thống.
                </p>
              </div>

              {loadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
                </div>
              ) : rescueHistory.length === 0 ? (
                <div className="text-center py-12">
                  <ShieldCheckIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">Bạn chưa có yêu cầu cứu hộ nào.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-500">
                          Mã theo dõi
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">
                          Tiêu đề
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">
                          Trạng thái
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">
                          Ngày tạo
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">
                          Đội cứu hộ
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rescueHistory.map((request, index) => (
                        <tr
                          key={request.id || request.trackingCode || index}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-4 font-mono text-xs text-gray-600">
                            {request.trackingCode || '—'}
                          </td>
                          <td className="py-3 px-4 text-gray-800">
                            {request.title || request.description?.substring(0, 50) || '—'}
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={request.status} />
                          </td>
                          <td className="py-3 px-4 text-gray-500 text-xs">
                            {formatDateTime(request.createdAt)}
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-xs">
                            {request.assignedTeamName || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận thay đổi</h3>
            <p className="text-sm text-gray-500 mb-6">
              Bạn có chắc chắn muốn cập nhật thông tin cá nhân?
            </p>
            <div className="space-y-2 mb-6 bg-gray-50 rounded-lg p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Họ và tên:</span>
                <span className="font-medium text-gray-800">{form.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Số điện thoại:</span>
                <span className="font-medium text-gray-800">{form.phoneNumber || '—'}</span>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmSave}
                disabled={saving}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
