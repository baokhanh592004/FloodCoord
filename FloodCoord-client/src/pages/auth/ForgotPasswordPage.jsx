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
        'Nếu email tồn tại, hệ thống đã gửi một đường dẫn đặt lại mật khẩu cho bạn.'
      )
      setEmail('')
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-73px)] w-full overflow-hidden">
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
            Quên mật khẩu
          </h2>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Nhập email của bạn và chúng tôi sẽ gửi cho bạn một đường dẫn đặt lại mật khẩu
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
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z"
                fill="#6B7280"
              />
            </svg>
            <input
              type="email"
              placeholder="Email"
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
            {loading ? 'Đang gửi...' : 'Gửi đường dẫn đặt lại'}
          </button>

          <p className="mt-4 text-sm text-gray-500">
            Ghi nhớ mật khẩu của bạn?{' '}
            <Link
              to="/login"
              className="text-indigo-500 hover:underline font-medium"
            >
              Quay lại đăng nhập
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
