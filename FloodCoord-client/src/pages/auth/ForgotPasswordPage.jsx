import React from 'react'
import { Link } from 'react-router-dom'
import { loginApi } from '../../services/authApi'
import toast from 'react-hot-toast'
import AuthShell from '../../components/auth/AuthShell'
import AuthField from '../../components/auth/AuthField'
import '../../styles/auth-pages.css'

import forgotBg from '../../assets/images/forgot-bg.png'

const MailIcon = () => (
  <svg width="13" height="10" viewBox="0 0 16 11" fill="none" style={{ flexShrink: 0 }}>
    <path fillRule="evenodd" clipRule="evenodd" d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z" fill="currentColor" />
  </svg>
)

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error,   setError]   = React.useState(null)
  const [sent,    setSent]    = React.useState(false)
 
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError(null)
    try {
      await loginApi.forgotPassword(email)
      setSent(true)
      toast.success('Đã gửi email đặt lại mật khẩu!')
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi email. Vui lòng thử lại.')
    } finally { setLoading(false) }
  }

  return (
    <>
      <AuthShell
        rootClass="hq-fp"
        leftClass="hq-fp-l"
        rightClass="hq-fp-r"
        leftStyle={{ '--auth-bg-image': `url(${forgotBg})` }}
        leftContent={(
          <>
            <div>
              <div className="hq-fp-badge"><div className="hq-fp-dot" />KHÔI PHỤC TÀI KHOẢN</div>
              <div className="hq-fp-hero">Lấy Lại<br />Quyền<br /><em>Truy Cập</em></div>
              <div className="hq-fp-sub">
                Chúng tôi sẽ giúp bạn quay lại<br />
                nhiệm vụ trong vài phút.
              </div>
            </div>
            <div>
              <div className="hq-fp-steps">
                <div className="hq-fp-step"><span className="hq-fp-num on">01</span><div className="hq-fp-stxt">Nhập email đã đăng ký của bạn</div></div>
                <div className="hq-fp-step"><span className="hq-fp-num off">02</span><div className="hq-fp-stxt">Kiểm tra hộp thư nhận mã xác nhận</div></div>
                <div className="hq-fp-step"><span className="hq-fp-num off">03</span><div className="hq-fp-stxt">Tạo mật khẩu mới và đăng nhập</div></div>
              </div>
              {/* <div className="hq-fp-strip">
                <div className="hq-fp-si"><div className="hq-fp-sn">2 phút</div><div className="hq-fp-sl">Thời gian gửi</div></div>
                <div className="hq-fp-si"><div className="hq-fp-sn">24h</div><div className="hq-fp-sl">Hiệu lực link</div></div>
                <div className="hq-fp-si"><div className="hq-fp-sn">100%</div><div className="hq-fp-sl">Bảo mật</div></div>
              </div> */}
            </div>
          </>
        )}
        rightContent={(
          <div className="hq-fp-fw">
            <Link to="/login" className="hq-fp-back">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m0 0l7 7m-7-7l7-7" /></svg>
              Quay lại đăng nhập
            </Link>

            {!sent ? (
              <>
                <div className="hq-fp-title">QUÊN MẬT KHẨU</div>
                <div className="hq-fp-desc">Nhập địa chỉ email và chúng tôi sẽ gửi đường dẫn đặt lại mật khẩu cho bạn.</div>
                <div className="hq-fp-prog"><div className="hq-fp-pf" style={{ width: '33%' }} /></div>
                <div className="hq-fp-slbl">Bước 1/3 — Xác minh email</div>
                {error && <div className="hq-fp-err">{error}</div>}
                <form onSubmit={handleSubmit}>
                  <AuthField
                    label="Email"
                    labelClassName="hq-fp-fl"
                    inputWrapperClassName="hq-fp-iw"
                    inputClassName="hq-fp-inp"
                    icon={<MailIcon />}
                    type="email"
                    placeholder="nguyenvana@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                  <button type="submit" className="hq-fp-btn" disabled={loading}>
                    {loading ? 'ĐANG GỬI...' : 'GỬI ĐƯỜNG DẪN ĐẶT LẠI →'}
                  </button>
                </form>
                <div className="hq-fp-note">Đảm bảo dùng email đã đăng ký. Kiểm tra cả thư mục spam nếu không nhận được.</div>
              </>
            ) : (
              <div className="hq-fp-success">
                <div className="hq-fp-icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="hq-fp-stitle">EMAIL ĐÃ ĐƯỢC GỬI</div>
                <div className="hq-fp-sdesc">
                  Chúng tôi đã gửi đường dẫn đặt lại đến<br />
                  <span className="hq-fp-semail">{email}</span>.<br /><br />
                  Kiểm tra hộp thư và nhấn link trong email. Link có hiệu lực trong 24 giờ.
                </div>
                <button className="hq-fp-btn" style={{ marginTop: 22 }} onClick={() => { setSent(false); setEmail('') }}>
                  GỬI LẠI EMAIL
                </button>
                <Link to="/login" style={{ display: 'block', marginTop: 12, fontSize: 12, color: '#9ab8d4', textDecoration: 'none' }}>
                  Quay lại đăng nhập
                </Link>
              </div>
            )}

            <div className="hq-fp-sec">
              <a href='/'>Quay về trang chủ</a>
            </div>
          </div>
        )}
      />
    </>
  )
}