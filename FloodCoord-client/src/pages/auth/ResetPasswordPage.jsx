import React from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import backgroundImage from '../../assets/images/background.png'
import { loginApi } from '../../services/authApi'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token')

  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!token) {
      setError('Invalid or expired reset link')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      await loginApi.resetPassword({
        token,
        newPassword,
        confirmPassword,
      })

      toast.success('Password reset successfully')
      navigate('/login')
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Reset password failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-135px)] w-full overflow-hidden">
      {/* Left image */}
      <div className="hidden md:flex md:w-1/2 h-full">
        <img
          src={backgroundImage}
          alt="reset-password"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Right form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-4">
        <form
          onSubmit={handleSubmit}
          className="md:w-96 w-80 flex flex-col items-center"
        >
          <h2 className="text-3xl font-medium text-gray-900">
            Reset password
          </h2>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Enter your new password below
          </p>

          {error && (
            <div className="w-full mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">
              {error}
            </div>
          )}

          {/* New password */}
          <div className="mt-6 flex items-center w-full border border-gray-300/60 h-11 rounded-full pl-5 gap-2 focus-within:border-indigo-500">
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="bg-transparent w-full h-full outline-none text-sm"
            />
          </div>

          {/* Confirm password */}
          <div className="mt-4 flex items-center w-full border border-gray-300/60 h-11 rounded-full pl-5 gap-2 focus-within:border-indigo-500">
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-transparent w-full h-full outline-none text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full h-11 rounded-full bg-indigo-500 text-white font-medium hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Resetting...' : 'Reset password'}
          </button>

          <p className="mt-4 text-sm text-gray-500">
            <Link
              to="/login"
              className="text-indigo-500 hover:underline font-medium"
            >
              Back to login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
