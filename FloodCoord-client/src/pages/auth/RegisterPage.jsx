import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginApi } from '../../services/authApi'
import toast from 'react-hot-toast'
import AuthShell from '../../components/auth/AuthShell'
import AuthField from '../../components/auth/AuthField'
import AuthPasswordField from '../../components/auth/AuthPasswordField'
import AuthStrengthMeter from '../../components/auth/AuthStrengthMeter'
import '../../styles/auth-pages.css'

import registerBg from '../../assets/images/register-bg.png'

const LockIcon = () => (
  <svg width="10" height="13" viewBox="0 0 13 17" fill="none" style={{ flexShrink: 0 }}>
    <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="currentColor" />
  </svg>
)
const MailIcon = () => (
  <svg width="13" height="10" viewBox="0 0 16 11" fill="none" style={{ flexShrink: 0 }}>
    <path fillRule="evenodd" clipRule="evenodd" d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z" fill="currentColor" />
  </svg>
)
const PhoneIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" strokeWidth={1.8} stroke="currentColor" style={{ flexShrink: 0 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
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

export default function RegisterPage() {
  const navigate = useNavigate()
 
  const [formData, setFormData] = useState({
    fullName: '', email: '', phoneNumber: '',
    password: '', confirmPassword: '', rollCode: 'MEMBER',
  })
  const [error,      setError]      = useState(null)
  const [loading,    setLoading]    = useState(false)
  const [showPw,     setShowPw]     = useState(false)
  const [showCpw,    setShowCpw]    = useState(false)
  const [pwStrength, setPwStrength] = useState(0)
 
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'password') {
      let s = 0
      if (value.length >= 8) s++
      if (/[A-Z]/.test(value)) s++
      if (/[0-9]/.test(value)) s++
      if (/[^A-Za-z0-9]/.test(value)) s++
      setPwStrength(s)
    }
    if (error) setError(null)
  }

  const handleRegister = async (e) => {
    e.preventDefault(); setLoading(true); setError(null)
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!'); setLoading(false); return
    }
    try {
      await loginApi.register(formData)
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.')
      navigate('/login')
    } catch (err) {
      const rawMessage = err.response?.data?.message || ''
      let friendlyMessage = rawMessage || 'Đăng ký thất bại. Vui lòng thử lại.'
      const defaultMsgMatch = rawMessage.match(/default message \[([^\]]+)\]\](?:\s*$|;)/)
      if (defaultMsgMatch) friendlyMessage = defaultMsgMatch[1]
      const fieldNameMap = { phoneNumber: 'Số điện thoại', email: 'Email', fullName: 'Họ và tên', password: 'Mật khẩu', confirmPassword: 'Xác nhận mật khẩu' }
      const fieldMatch = rawMessage.match(/on field '(\w+)':/)
      if (fieldMatch) {
        const fieldLabel = fieldNameMap[fieldMatch[1]] || fieldMatch[1]
        if (!friendlyMessage.toLowerCase().includes(fieldLabel.toLowerCase()))
          friendlyMessage = `${fieldLabel}: ${friendlyMessage}`
      }
      setError(friendlyMessage)
    } finally { setLoading(false) }
  }

  const strengthColors = ['#c0d0e0', '#ef4444', '#f97316', '#eab308', '#22c55e']
  const strengthLabels = ['', 'Yếu', 'Trung bình', 'Khá', 'Mạnh']

  return (
    <>
      <AuthShell
        rootClass="hq-reg"
        leftClass="hq-reg-l"
        rightClass="hq-reg-r"
        leftStyle={{ '--auth-bg-image': `url(${registerBg})` }}
        leftContent={(
          <>
            <div>
              <div className="hq-reg-badge"><div className="hq-reg-dot" />THAM GIA MẠNG LƯỚI</div>
              <div className="hq-reg-hero">Đăng Ký<br />Để Được<br /><em>Hỗ Trợ Cứu Hộ</em></div>
              <div className="hq-reg-sub">
                Kết nối với các đội cứu hộ<br />
                trên toàn bộ vùng bị ảnh hưởng
              </div>
            </div>
            <div className="hq-why">
              <div className="hq-why-title">Tại sao tham gia?</div>
              <div className="hq-why-item"><span className="hq-why-arrow">→</span>Phối hợp cứu hộ theo thời gian thực</div>
              <div className="hq-why-item"><span className="hq-why-arrow">→</span>Theo dõi nguồn lực & vật tư cứu trợ</div>
              <div className="hq-why-item"><span className="hq-why-arrow">→</span>Liên lạc đa cơ quan, đa vùng</div>
              <div className="hq-why-item"><span className="hq-why-arrow">→</span>Báo cáo thiệt hại & bản đồ ngập lụt</div>
            </div>
          </>
        )}
        rightContent={(
          <div className="hq-reg-fw">
            <div className="hq-reg-toprow">
              <div className="hq-reg-ptitle">TẠO TÀI KHOẢN</div>
              <div className="hq-reg-sw">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></div>
            </div>

            <form onSubmit={handleRegister}>
              {error && <div className="hq-rerr">{error}</div>}

              <AuthField
                fieldClassName="hq-rf"
                label="Họ và tên"
                labelClassName="hq-rfl"
                inputWrapperClassName="hq-riw"
                inputClassName="hq-ri"
                type="text"
                name="fullName"
                placeholder="Nguyễn Văn A"
                value={formData.fullName}
                onChange={handleChange}
                required
                autoComplete="name"
              />

              <AuthField
                fieldClassName="hq-rf"
                label="Email"
                labelClassName="hq-rfl"
                inputWrapperClassName="hq-riw"
                inputClassName="hq-ri"
                icon={<MailIcon />}
                type="email"
                name="email"
                placeholder="nguyenvana@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />

              <AuthField
                fieldClassName="hq-rf"
                label="Số điện thoại"
                labelClassName="hq-rfl"
                inputWrapperClassName="hq-riw"
                inputClassName="hq-ri"
                icon={<PhoneIcon />}
                type="tel"
                name="phoneNumber"
                placeholder="0912 345 678"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                autoComplete="tel"
              />

              <AuthPasswordField
                fieldClassName="hq-rf"
                label="Mật khẩu"
                labelClassName="hq-rfl"
                inputWrapperClassName="hq-riw"
                inputClassName="hq-ri"
                icon={<LockIcon />}
                toggleButtonClassName="hq-reye"
                visible={showPw}
                onToggle={() => setShowPw(p => !p)}
                visibleIcon={<EyeOpen />}
                hiddenIcon={<EyeShut />}
                name="password"
                placeholder="Tối thiểu 8 ký tự, bao gồm chữ và số"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />

              <AuthStrengthMeter
                show={Boolean(formData.password)}
                value={pwStrength}
                colors={strengthColors}
                labels={strengthLabels}
                barsClassName="hq-sbars"
                barClassName="hq-sbar"
                labelClassName="hq-slbl"
              />

              <AuthPasswordField
                fieldClassName="hq-rf"
                label="Xác nhận mật khẩu"
                labelClassName="hq-rfl"
                inputWrapperClassName="hq-riw"
                inputClassName="hq-ri"
                icon={<LockIcon />}
                toggleButtonClassName="hq-reye"
                visible={showCpw}
                onToggle={() => setShowCpw(p => !p)}
                visibleIcon={<EyeOpen />}
                hiddenIcon={<EyeShut />}
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />

              <button type="submit" className="hq-reg-btn" disabled={loading}>
                {loading ? 'ĐANG XỬ LÝ...' : 'TẠO TÀI KHOẢN →'}
              </button>
              {/* <div className="hq-terms">
                Bằng cách đăng ký, bạn đồng ý với <a href="#">Điều khoản dịch vụ</a>
              </div> */}
            </form>
          </div>
        )}
      />
    </>
  )
}