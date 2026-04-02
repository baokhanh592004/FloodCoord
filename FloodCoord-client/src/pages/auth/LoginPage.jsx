import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { loginApi } from '../../services/authApi'
import { rescueApi } from '../../services/rescueApi'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import axiosClient from '../../api/axiosClient'
import AuthShell from '../../components/auth/AuthShell'
import AuthField from '../../components/auth/AuthField'
import AuthPasswordField from '../../components/auth/AuthPasswordField'
import '../../styles/auth-pages.css'

// ── Vite static import (works 100% with Vite + React) ──────────────────────
import loginBg from '../../assets/images/login-bg.png'

// ── Shared icon components ──────────────────────────────────────────────────
const MailIcon = () => (
  <svg width="13" height="10" viewBox="0 0 16 11" fill="none" style={{ flexShrink: 0 }}>
    <path fillRule="evenodd" clipRule="evenodd" d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z" fill="currentColor" />
  </svg>
)
const LockIcon = () => (
  <svg width="10" height="13" viewBox="0 0 13 17" fill="none" style={{ flexShrink: 0 }}>
    <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="currentColor" />
  </svg>
)
const EyeOpen = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
)
const EyeShut = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
 
  const [email,             setEmail]             = React.useState('')
  const [password,          setPassword]          = React.useState('')
  const [error,             setError]             = React.useState(null)
  const [loading,           setLoading]           = React.useState(false)
  const [showPw,            setShowPw]            = React.useState(false)
  const [showClaimModal,    setShowClaimModal]    = React.useState(false)
  const [guestCodesToClaim, setGuestCodesToClaim] = React.useState([])
  const [modalLoading,      setModalLoading]      = React.useState(false)
  const [pendingAuth,       setPendingAuth]       = React.useState(null)

  const getRoleBasedDashboard = (token) => {
    const decoded  = jwtDecode(token)
    const userRole = ((decoded.roles || [])[0] || 'MEMBER').toUpperCase()
    const roleToPath = {
      ADMIN: '/admin/dashboard',
      MANAGER: '/manager/dashboard',
      COORDINATOR: '/coordinator/dashboard',
      RESCUE_TEAM: '/rescue-team/dashboard',
    }
    return roleToPath[userRole] || '/'
  }

  const completeLogin = (authData) => {
    if (!authData) return
    login(authData.accessToken, authData.refreshToken)
    window.dispatchEvent(new Event('authChange'))
    toast.success('Đăng nhập thành công!')
    navigate(authData.redirectPath)
    setShowClaimModal(false); setGuestCodesToClaim([]); setPendingAuth(null)
  }

  const handleClaimNow = async () => {
    if (!pendingAuth) return
    setModalLoading(true)
    try {
      if (guestCodesToClaim.length > 0) {
        await rescueApi.claimRequests(guestCodesToClaim)
        localStorage.removeItem('guestTrackingCodes')
        toast.success('Đã đồng bộ các yêu cầu cứu hộ cũ.')
      }
    } catch { toast.error('Đồng bộ thất bại, bạn có thể thử lại sau.') }
    finally  { setModalLoading(false); completeLogin(pendingAuth) }
  }

  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true); setError(null)
    try {
      const data = await loginApi.login({ email, password })
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      try {
        const profileRes = await axiosClient.get('/api/profile/me', {
          headers: { Authorization: `Bearer ${data.accessToken}` },
        })
        localStorage.setItem('user', JSON.stringify(profileRes.data))
      } catch (profileErr) {
        console.warn('Unable to load profile after login:', profileErr)
      }
      const redirectPath = getRoleBasedDashboard(data.accessToken)
      const guestCodes   = JSON.parse(localStorage.getItem('guestTrackingCodes') || '[]')
      const authData     = { accessToken: data.accessToken, refreshToken: data.refreshToken, redirectPath }
      if (guestCodes.length > 0) {
        setPendingAuth(authData); setGuestCodesToClaim(guestCodes); setShowClaimModal(true); return
      }
      completeLogin(authData)
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.')
    } finally { setLoading(false) }
  }

  return (
    <>
      <AuthShell
        rootClass="hq-login"
        leftClass="hq-ll"
        rightClass="hq-lr"
        leftStyle={{ '--auth-bg-image': `url(${loginBg})` }}
        leftContent={(
          <>
            <div>
              <div className="hq-badge"><div className="hq-dot" />KHẨN CẤP ĐANG HOẠT ĐỘNG</div>
              <div className="hq-hero">Trung tâm<br />Cứu hộ cứu nạn<br /><em>Lũ lụt TP.HCM</em></div>
              <div className="hq-sub">
                Nền tảng phối hợp cứu hộ lũ lụt<br />
                thời gian thực giúp kết nối người cần cứu hộ với đội cứu hộ<br/> 
                nhanh chóng và hiệu quả hơn.
              </div>
            </div>
            <div className="hq-stats">
              <div className="hq-stat"><div className="hq-stat-n">142</div><div className="hq-stat-l">Ca cứu hộ</div></div>
              <div className="hq-stat"><div className="hq-stat-n">38</div><div className="hq-stat-l">Vùng hoạt động</div></div>
              <div className="hq-stat"><div className="hq-stat-n">2.4k</div><div className="hq-stat-l">Người được hỗ trợ</div></div>
              <div className="hq-stat"><div className="hq-stat-n">96%</div><div className="hq-stat-l">Tỷ lệ phản hồi</div></div>
            </div>
          </>
        )}
        rightContent={(
          <div className="hq-fw">
            <div className="hq-toprow">
              <div className="hq-ptitle">ĐĂNG NHẬP</div>
              <div className="hq-sw">Chưa có tài khoản? <Link to="/register">Đăng ký</Link></div>
            </div>

            <form onSubmit={handleLogin}>
              {error && <div className="hq-err">{error}</div>}

              <AuthField
                fieldClassName="hq-fld"
                label="Email"
                labelClassName="hq-fl"
                inputWrapperClassName="hq-iw"
                inputClassName="hq-inp"
                icon={<MailIcon />}
                type="email"
                placeholder="nguyenvana@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

              <AuthPasswordField
                fieldClassName="hq-fld"
                label="Mật khẩu"
                labelClassName="hq-fl"
                inputWrapperClassName="hq-iw"
                inputClassName="hq-inp"
                icon={<LockIcon />}
                toggleButtonClassName="hq-eye"
                visible={showPw}
                onToggle={() => setShowPw(p => !p)}
                visibleIcon={<EyeOpen />}
                hiddenIcon={<EyeShut />}
                placeholder="••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />

              <div className="hq-row">
                <label className="hq-rem">
                  <input type="checkbox" /> Ghi nhớ tài khoản
                </label>
                <Link to="/forgot-password" className="hq-fgt">Quên mật khẩu?</Link>
              </div>

              <button type="submit" className="hq-btn" disabled={loading}>
                {loading ? 'ĐANG XÁC THỰC...' : 'ĐĂNG NHẬP →'}
              </button>
            </form>

            <div className="hq-sec">
              <a href='/'>Quay về trang chủ</a>
            </div>
          </div>
        )}
      />

      {/* ── CLAIM MODAL ── */}
      {showClaimModal && (
        <div className="hq-mbg">
          <div className="hq-mod">
            <div className="hq-mh">
              <div className="hq-mt">Đồng bộ yêu cầu cứu hộ?</div>
              <div className="hq-ms">
                Phát hiện <strong>{guestCodesToClaim.length}</strong> mã tra cứu đã gửi khi chưa đăng nhập.
              </div>
            </div>
            <div className="hq-mb">
              <button className="hq-mbtn mp" onClick={handleClaimNow} disabled={modalLoading}>
                {modalLoading ? 'Đang đồng bộ...' : 'Đồng bộ vào tài khoản này'}
              </button>
              <button className="hq-mbtn ms" onClick={() => completeLogin(pendingAuth)} disabled={modalLoading}>
                Để sau
              </button>
              <button className="hq-mbtn md"
                onClick={() => { localStorage.removeItem('guestTrackingCodes'); completeLogin(pendingAuth) }}
                disabled={modalLoading}>
                Không đồng bộ (xóa dữ liệu tạm)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}