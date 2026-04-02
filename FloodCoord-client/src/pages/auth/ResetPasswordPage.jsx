import React from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { loginApi } from '../../services/authApi'
import toast from 'react-hot-toast'
import AuthShell from '../../components/auth/AuthShell'
import AuthPasswordField from '../../components/auth/AuthPasswordField'
import AuthStrengthMeter from '../../components/auth/AuthStrengthMeter'
import '../../styles/auth-pages.css'

import forgotBg from '../../assets/images/forgot-bg.png'

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
 
export default function ResetPasswordPage() {
  const [params]  = useSearchParams()
  const navigate  = useNavigate()
  const token     = params.get('token')
 
  const [newPassword,     setNewPassword]     = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [showPw,          setShowPw]          = React.useState(false)
  const [showCpw,         setShowCpw]         = React.useState(false)
  const [loading,         setLoading]         = React.useState(false)
  const [error,           setError]           = React.useState(null)
  const [pwStrength,      setPwStrength]      = React.useState(0)
  const [done,            setDone]            = React.useState(false)
 
  const handlePwChange = (v) => {
    setNewPassword(v)
    let s = 0
    if (v.length >= 8) s++
    if (/[A-Z]/.test(v)) s++
    if (/[0-9]/.test(v)) s++
    if (/[^A-Za-z0-9]/.test(v)) s++
    setPwStrength(s)
  }
 
  const handleSubmit = async (e) => {
    e.preventDefault(); setError(null)
    if (!token) { setError('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.'); return }
    if (newPassword !== confirmPassword) { setError('Mật khẩu xác nhận không khớp'); return }
    setLoading(true)
    try {
      await loginApi.resetPassword({ token, newPassword, confirmPassword })
      setDone(true)
      toast.success('Đặt lại mật khẩu thành công!')
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setError(err.response?.data?.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.')
    } finally { setLoading(false) }
  }
 
  const strengthColors = ['#c0d0e0', '#ef4444', '#f97316', '#eab308', '#22c55e']
  const strengthLabels = ['', 'Yếu', 'Trung bình', 'Khá', 'Mạnh']
 
  return (
    <>
      <AuthShell
        rootClass="hq-rp"
        leftClass="hq-rp-l"
        rightClass="hq-rp-r"
        leftStyle={{ '--auth-bg-image': `url(${forgotBg})` }}
        leftContent={(
          <>
            <div>
              <div className="hq-rp-badge"><div className="hq-rp-dot" />BƯỚC CUỐI CÙNG</div>
              <div className="hq-rp-hero">Đặt Lại<br />Mật<br /><em>Khẩu</em></div>
              <div className="hq-rp-sub">Bạn sắp hoàn tất</div>
            </div>
            <div>
              <div className="hq-rp-steps">
                <div className="hq-rp-step"><span className="hq-rp-num done">✓ 01</span><div className="hq-rp-stxt">Email đã được xác minh</div></div>
                <div className="hq-rp-step"><span className="hq-rp-num done">✓ 02</span><div className="hq-rp-stxt">Mã xác nhận đã được kiểm tra</div></div>
                <div className="hq-rp-step"><span className="hq-rp-num active">03</span><div className="hq-rp-stxt">Tạo mật khẩu mới</div></div>
              </div>
              {/* <div className="hq-rp-strip">
                <div className="hq-rp-si"><div className="hq-rp-sn">2 phút</div><div className="hq-rp-sl">Thời gian gửi</div></div>
                <div className="hq-rp-si"><div className="hq-rp-sn">24h</div><div className="hq-rp-sl">Hiệu lực link</div></div>
                <div className="hq-rp-si"><div className="hq-rp-sn">100%</div><div className="hq-rp-sl">Bảo mật</div></div>
              </div> */}
            </div>
          </>
        )}
        rightContent={(
          <div className="hq-rp-fw">
            <Link to="/login" className="hq-rp-back">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m0 0l7 7m-7-7l7-7" /></svg>
              Quay lại đăng nhập
            </Link>

            {!done ? (
              <>
                <div className="hq-rp-title">ĐẶT LẠI MẬT KHẨU</div>
                <div className="hq-rp-desc">Nhập mật khẩu mới. Hãy chọn mật khẩu đủ mạnh để bảo vệ tài khoản.</div>
                <div className="hq-rp-prog"><div className="hq-rp-pf" style={{ width: '100%' }} /></div>
                <div className="hq-rp-slbl">Bước 3/3 — Tạo mật khẩu mới</div>

                {!token && <div className="hq-rp-err">Link không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại.</div>}
                {error  && <div className="hq-rp-err">{error}</div>}

                <form onSubmit={handleSubmit}>
                  <AuthPasswordField
                    label="Mật khẩu mới"
                    labelClassName="hq-rp-fl"
                    inputWrapperClassName="hq-rp-iw"
                    inputClassName="hq-rp-inp"
                    icon={<LockIcon />}
                    toggleButtonClassName="hq-rp-eye"
                    visible={showPw}
                    onToggle={() => setShowPw(p => !p)}
                    visibleIcon={<EyeOpen />}
                    hiddenIcon={<EyeShut />}
                    placeholder="Tối thiểu 8 ký tự, bao gồm chữ và số"
                    value={newPassword}
                    onChange={e => handlePwChange(e.target.value)}
                    required
                    autoComplete="new-password"
                  />

                  <AuthStrengthMeter
                    show={Boolean(newPassword)}
                    value={pwStrength}
                    colors={strengthColors}
                    labels={strengthLabels}
                    barsClassName="hq-rp-sbars"
                    barClassName="hq-rp-sbar"
                    labelClassName="hq-rp-slbl2"
                  />

                  <AuthPasswordField
                    label="Xác nhận mật khẩu"
                    labelClassName="hq-rp-fl"
                    inputWrapperClassName="hq-rp-iw"
                    inputClassName="hq-rp-inp"
                    icon={<LockIcon />}
                    toggleButtonClassName="hq-rp-eye"
                    visible={showCpw}
                    onToggle={() => setShowCpw(p => !p)}
                    visibleIcon={<EyeOpen />}
                    hiddenIcon={<EyeShut />}
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />

                  <button type="submit" className="hq-rp-btn" disabled={loading || !token}>
                    {loading ? 'ĐANG ĐẶT LẠI...' : 'ĐẶT LẠI MẬT KHẨU →'}
                  </button>
                </form>
              </>
            ) : (
              <div className="hq-rp-done">
                <div className="hq-rp-done-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="hq-rp-done-title">MẬT KHẨU ĐÃ ĐẶT LẠI</div>
                <div className="hq-rp-done-desc">
                  Mật khẩu đã được cập nhật thành công.<br />
                  Đang chuyển hướng đến trang đăng nhập...
                </div>
                <Link to="/login">
                  <button className="hq-rp-btn green" style={{ marginTop: 24 }}>
                    VỀ TRANG ĐĂNG NHẬP →
                  </button>
                </Link>
              </div>
            )}

            <div className="hq-rp-sec">

            </div>
          </div>
        )}
      />
    </>
  )
}