import React from 'react'
import { Link } from 'react-router-dom'
import backgroundImage from '../../assets/images/background.png'
import { loginApi } from '../../services/authApi'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await loginApi.forgotPassword(email)
      toast.success(
        'If the email exists, a password reset link has been sent.'
      )
      setEmail('')
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to send reset email. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-135px)] w-full overflow-hidden">
      {/* Left image */}
      <div className="hidden md:flex md:w-1/2 relative h-full">
        <img
          className="h-full w-full object-cover"
          src={backgroundImage}
          alt="forgot-password"
        />
      </div>

      {/* Right form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-4">
        <form
          onSubmit={handleSubmit}
          className="md:w-96 w-80 flex flex-col items-center"
        >
          <h2 className="text-3xl font-medium text-gray-900">
            Forgot password
          </h2>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Enter your email and we’ll send you a reset link
          </p>

          {error && (
            <div className="w-full mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">
              {error}
            </div>
          )}

          <div className="mt-6 flex items-center w-full border border-gray-300/60 h-11 rounded-full pl-5 gap-2 focus-within:border-indigo-500">
            <svg
              width="14"
              height="10"
              viewBox="0 0 16 11"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45z"
                fill="#6B7280"
              />
            </svg>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-transparent w-full h-full outline-none text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full h-11 rounded-full bg-indigo-500 text-white font-medium hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>

          <p className="mt-4 text-sm text-gray-500">
            Remember your password?{' '}
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
