import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserCircleIcon, PencilSquareIcon, CheckIcon, XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { profileApi } from '../../services/profileApi'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const ROLE_LABELS = {
  ADMIN: 'Quản trị viên',
  MANAGER: 'Quản lý',
  COORDINATOR: 'Điều phối viên',
  RESCUE_TEAM: 'Đội cứu hộ',
  TEAM_MEMBER: 'Thành viên đội',
  CITIZEN: 'Người dân',
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { role, setProfileName } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ fullName: '', phoneNumber: '' })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
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
  }

  const handleEdit = () => {
    setForm({
      fullName: profile.fullName || '',
      phoneNumber: profile.phoneNumber || '',
    })
    setEditing(true)
  }

  const handleCancel = () => {
    setEditing(false)
  }

  const handleSave = async () => {
    if (!form.fullName.trim()) {
      toast.error('Họ tên không được để trống')
      return
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header banner */}
        <div className="relative h-24 bg-gradient-to-r from-blue-500 to-teal-500">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-white/20 hover:bg-white/35 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Quay lại
          </button>
        </div>

        <div className="px-8 pb-8">
          {/* Avatar */}
          <div className="flex justify-center -mt-12 mb-4">
            <div className="bg-white rounded-full p-1 shadow-lg">
              <UserCircleIcon className="w-20 h-20 text-blue-400" />
            </div>
          </div>

          {/* Name & Role */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {profile?.fullName || 'Chưa cập nhật'}
            </h1>
            <span className="inline-block mt-1 px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
              {ROLE_LABELS[role] || role || 'Người dùng'}
            </span>
          </div>

          {/* Profile Fields */}
          <div className="space-y-5">
            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <div className="w-full px-4 py-2.5 bg-gray-100 rounded-lg text-gray-700 text-sm">
                {profile?.email || '—'}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Họ và tên</label>
              {editing ? (
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-blue-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Nhập họ và tên"
                />
              ) : (
                <div className="w-full px-4 py-2.5 bg-gray-100 rounded-lg text-gray-700 text-sm">
                  {profile?.fullName || '—'}
                </div>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Số điện thoại</label>
              {editing ? (
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  className="w-full px-4 py-2.5 border border-blue-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Nhập số điện thoại"
                />
              ) : (
                <div className="w-full px-4 py-2.5 bg-gray-100 rounded-lg text-gray-700 text-sm">
                  {profile?.phoneNumber || '—'}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-3 justify-end">
            {editing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-60"
                >
                  {saving ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <CheckIcon className="w-4 h-4" />
                  )}
                  Lưu thay đổi
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <PencilSquareIcon className="w-4 h-4" />
                Chỉnh sửa hồ sơ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
