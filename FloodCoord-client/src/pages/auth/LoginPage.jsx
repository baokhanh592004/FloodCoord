import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { loginApi } from '../../services/authApi'
import { rescueApi } from '../../services/rescueApi'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import axiosClient from '../../api/axiosClient'

// ── Vite static import (works 100% with Vite + React) ──────────────────────
import loginBg from '../../assets/images/login-bg.png'

// ── Google Font injection ───────────────────────────────────────────────────
const FONT_URL =
  'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@300;400;500&display=swap'
const injectFont = () => {
  if (document.getElementById('hq-font')) return
  const l = document.createElement('link')
  l.id = 'hq-font'; l.rel = 'stylesheet'; l.href = FONT_URL
  document.head.appendChild(l)
}

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
  React.useEffect(() => { injectFont() }, [])

  const navigate = useNavigate()
  const { login } = useAuth()

  const [email,    setEmail]    = React.useState('')
  const [password, setPassword] = React.useState('')
  const [role,     setRole]     = React.useState('MEMBER')
  const [error,    setError]    = React.useState(null)
  const [loading,  setLoading]  = React.useState(false)
  const [showPw,   setShowPw]   = React.useState(false)

  const [showClaimModal,    setShowClaimModal]    = React.useState(false)
  const [guestCodesToClaim, setGuestCodesToClaim] = React.useState([])
  const [modalLoading,      setModalLoading]      = React.useState(false)
  const [pendingAuth,       setPendingAuth]       = React.useState(null)

  const getRoleBasedDashboard = (token) => {
    const decoded  = jwtDecode(token)
    const userRole = ((decoded.roles || [])[0] || 'MEMBER').toUpperCase()
    const map = {
      ADMIN: '/admin/dashboard', MANAGER: '/manager/dashboard',
      COORDINATOR: '/coordinator/dashboard', RESCUE_TEAM: '/rescue-team/dashboard',
    }
    return map[userRole] || '/'
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
      } catch (_) {}
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

  const roles = [
    { label: 'Thành viên', value: 'MEMBER' },
    { label: 'Điều phối',  value: 'COORDINATOR' },
    { label: 'Quản lý',    value: 'MANAGER' },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@300;400;500&display=swap');

        @keyframes hqPulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(1.6)} }
        @keyframes hqFadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

        /* ── Page shell: subtract fixed header (73px) + footer ── */
        .hq-login {
          display: flex;
          /* header is fixed at ~73px; fill remaining viewport */
          height: calc(100vh - 73px);
          margin-top: 73px;
          width: 100%;
          overflow: hidden;
          font-family: 'Barlow', sans-serif;
        }

        /* ── LEFT PANEL ── */
        .hq-ll {
          position: relative;
          width: 50%;
          flex-shrink: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 40px;
          /* Photo as CSS background — Vite resolves the imported URL */
          background-image: url('');
          background-size: cover;
          background-position: center top;
        }
        @media(max-width:768px){ .hq-ll{ display:none; } }

        /* Dark navy overlay on top of photo */
        .hq-ll::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            160deg,
            rgba(10,18,32,0.83) 0%,
            rgba(13,34,64,0.50) 50%,
            rgba(13,34,64,0.87) 100%
          );
          z-index: 0;
        }
        .hq-ll > * { position: relative; z-index: 1; }

        .hq-badge { display:inline-flex; align-items:center; gap:8px; background:#e85d26; color:#fff; font-family:'Barlow Condensed',sans-serif; font-size:11px; font-weight:700; letter-spacing:2px; padding:5px 13px; border-radius:3px; width:fit-content; }
        .hq-dot   { width:7px; height:7px; border-radius:50%; background:#fff; animation:hqPulse 1.3s infinite; }
        .hq-hero  { font-family:'Barlow Condensed',sans-serif; font-size:54px; font-weight:700; line-height:1; color:#f0f6ff; letter-spacing:-1px; margin-top:16px; }
        .hq-hero em { font-style:normal; color:#e85d26; }
        .hq-sub   { font-size:13px; color:rgba(200,220,240,0.68); line-height:1.8; margin-top:10px; }

        .hq-stats { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        .hq-stat  { background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.14); border-radius:8px; padding:12px 14px; backdrop-filter:blur(6px); }
        .hq-stat-n { font-family:'Barlow Condensed',sans-serif; font-size:22px; font-weight:700; color:#f0f6ff; }
        .hq-stat-l { font-size:10px; color:rgba(200,220,240,0.45); letter-spacing:1.2px; text-transform:uppercase; margin-top:2px; }

        /* ── RIGHT PANEL ── */
        .hq-lr {
          flex: 1;
          background: #f4f6fa;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 40px 52px;
          overflow-y: auto;
        }
        @media(max-width:768px){ .hq-lr{ padding:28px 20px; background:#fff; } }

        .hq-fw  { max-width:360px; width:100%; margin:0 auto; animation:hqFadeUp .35s ease; }

        .hq-toprow { display:flex; justify-content:space-between; align-items:center; margin-bottom:26px; }
        .hq-ptitle { font-family:'Barlow Condensed',sans-serif; font-size:26px; font-weight:700; color:#0d2240; letter-spacing:.5px; }
        .hq-sw   { font-size:12px; color:#7a9abf; }
        .hq-sw a { color:#1a3a5c; font-weight:600; text-decoration:none; }
        .hq-sw a:hover { color:#e85d26; }

        .hq-rl   { font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#9ab8d4; margin-bottom:8px; }
        .hq-roles { display:flex; gap:6px; margin-bottom:22px; }
        .hq-chip  { flex:1; border:1.5px solid #c8d8ec; border-radius:6px; padding:8px 4px; text-align:center; font-family:'Barlow',sans-serif; font-size:12px; font-weight:500; color:#6a8aaa; cursor:pointer; background:#fff; transition:all .18s; }
        .hq-chip:hover  { border-color:#1a3a5c; color:#1a3a5c; }
        .hq-chip.active { border-color:#1a3a5c; background:#1a3a5c; color:#fff; }

        .hq-fld { margin-bottom:14px; }
        .hq-fl  { display:block; font-size:10px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#9ab8d4; margin-bottom:5px; }
        .hq-iw  { display:flex; align-items:center; gap:10px; background:#fff; border:1.5px solid #c8d8ec; border-radius:8px; padding:0 14px; height:44px; transition:border-color .18s,box-shadow .18s; color:#9ab8d4; }
        .hq-iw:focus-within { border-color:#1a3a5c; box-shadow:0 0 0 3px rgba(26,58,92,0.09); color:#1a3a5c; }
        .hq-inp { background:transparent; border:none; outline:none; color:#0d2240; font-family:'Barlow',sans-serif; font-size:14px; width:100%; height:100%; }
        .hq-inp::placeholder { color:#c0d0e0; }
        .hq-eye { background:none; border:none; cursor:pointer; color:#c0d0e0; padding:0; display:flex; align-items:center; flex-shrink:0; transition:color .18s; }
        .hq-eye:hover { color:#e85d26; }

        .hq-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
        .hq-rem  { display:flex; align-items:center; gap:7px; font-size:12px; color:#8aaac8; cursor:pointer; }
        .hq-rem input { accent-color:#1a3a5c; }
        .hq-fgt  { font-size:12px; color:#e85d26; text-decoration:none; font-weight:500; }
        .hq-fgt:hover { text-decoration:underline; }

        .hq-btn  { width:100%; height:46px; background:#e85d26; color:#fff; border:none; border-radius:8px; font-family:'Barlow Condensed',sans-serif; font-size:16px; font-weight:700; letter-spacing:1.5px; cursor:pointer; transition:background .18s,transform .1s; }
        .hq-btn:hover    { background:#d14e1a; }
        .hq-btn:active   { transform:scale(.98); }
        .hq-btn:disabled { opacity:.55; cursor:not-allowed; }

        .hq-err  { background:#fff0ed; border:1.5px solid #f4b8a8; color:#c04a15; border-radius:7px; font-size:12px; padding:10px 14px; margin-bottom:14px; text-align:center; }
        .hq-sec  { display:flex; align-items:center; justify-content:center; gap:6px; margin-top:16px; font-size:10px; letter-spacing:1.5px; color:#c0d0e0; font-family:'Barlow Condensed',sans-serif; }

        /* ── CLAIM MODAL ── */
        .hq-mbg  { position:fixed; inset:0; z-index:100; display:flex; align-items:center; justify-content:center; background:rgba(13,34,64,0.6); backdrop-filter:blur(4px); padding:16px; }
        .hq-mod  { width:100%; max-width:460px; background:#fff; border:1.5px solid #c8d8ec; border-radius:14px; overflow:hidden; }
        .hq-mh   { padding:20px 24px; border-bottom:1px solid #e8eff8; }
        .hq-mt   { font-family:'Barlow Condensed',sans-serif; font-size:20px; font-weight:700; color:#0d2240; }
        .hq-ms   { font-size:13px; color:#6a8aaa; margin-top:4px; }
        .hq-ms strong { color:#e85d26; }
        .hq-mb   { padding:18px 24px; display:flex; flex-direction:column; gap:10px; background:#f4f6fa; }
        .hq-mbtn { width:100%; padding:12px; border-radius:8px; font-family:'Barlow',sans-serif; font-size:14px; font-weight:600; cursor:pointer; border:none; transition:opacity .18s; }
        .hq-mbtn:disabled { opacity:.5; cursor:not-allowed; }
        .hq-mbtn.mp { background:#1a3a5c; color:#fff; }
        .hq-mbtn.mp:hover { background:#0d2240; }
        .hq-mbtn.ms { background:#fff; border:1.5px solid #c8d8ec; color:#0d2240; }
        .hq-mbtn.md { background:#fff0ed; border:1.5px solid #f4b8a8; color:#c04a15; }
      `}</style>

      <div className="hq-login">
        {/* ── LEFT ── */}
        <div className="hq-ll">
          <div>
            <div className="hq-badge"><div className="hq-dot" />KHẨN CẤP ĐANG HOẠT ĐỘNG</div>
            <div className="hq-hero">Flood<br />Rescue<br /><em>HQ</em></div>
            <div className="hq-sub">
              Nền tảng phối hợp cứu hộ lũ lụt<br />
              thời gian thực — Ban Chỉ đạo Quốc gia
            </div>
          </div>
          <div className="hq-stats">
            <div className="hq-stat"><div className="hq-stat-n">142</div><div className="hq-stat-l">Ca cứu hộ</div></div>
            <div className="hq-stat"><div className="hq-stat-n">38</div><div className="hq-stat-l">Vùng hoạt động</div></div>
            <div className="hq-stat"><div className="hq-stat-n">2.4k</div><div className="hq-stat-l">Người được hỗ trợ</div></div>
            <div className="hq-stat"><div className="hq-stat-n">96%</div><div className="hq-stat-l">Tỷ lệ phản hồi</div></div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="hq-lr">
          <div className="hq-fw">
            <div className="hq-toprow">
              <div className="hq-ptitle">ĐĂNG NHẬP</div>
              <div className="hq-sw">Chưa có tài khoản? <Link to="/register">Đăng ký</Link></div>
            </div>

            <form onSubmit={handleLogin}>
              {error && <div className="hq-err">{error}</div>}

              <div className="hq-fld">
                <label className="hq-fl">Email</label>
                <div className="hq-iw">
                  <MailIcon />
                  <input className="hq-inp" type="email" placeholder="ban@coquan.gov.vn"
                    value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>

              <div className="hq-fld">
                <label className="hq-fl">Mật khẩu</label>
                <div className="hq-iw">
                  <LockIcon />
                  <input className="hq-inp" type={showPw ? 'text' : 'password'} placeholder="••••••••••"
                    value={password} onChange={e => setPassword(e.target.value)} required />
                  <button type="button" className="hq-eye" onClick={() => setShowPw(p => !p)}>
                    {showPw ? <EyeShut /> : <EyeOpen />}
                  </button>
                </div>
              </div>

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
        </div>
      </div>

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