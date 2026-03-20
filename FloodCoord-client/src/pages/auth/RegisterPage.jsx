import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginApi } from '../../services/authApi'
import toast from 'react-hot-toast'

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@300;400;500&display=swap');
        @keyframes hqPulse2  { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes hqFadeUp2 { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

        .hq-reg {
          display: flex;
          height: calc(100vh - 73px);
          margin-top: 73px;
          width: 100%;
          overflow: hidden;
          font-family: 'Barlow', sans-serif;
        }

        .hq-reg-l {
          position: relative;
          width: 45%;
          flex-shrink: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 40px;
          background-image: ;
          background-size: cover;
          background-position: center;
        }
        @media(max-width:768px){ .hq-reg-l{ display:none; } }
        .hq-reg-l::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(10,18,32,0.82) 0%, rgba(13,34,64,0.40) 45%, rgba(10,18,32,0.88) 100%);
          z-index: 0;
        }
        .hq-reg-l > * { position:relative; z-index:1; }

        .hq-reg-badge { display:inline-flex; align-items:center; gap:8px; background:rgba(232,93,38,0.18); border:1px solid rgba(232,93,38,0.5); color:#e85d26; font-family:'Barlow Condensed',sans-serif; font-size:11px; font-weight:700; letter-spacing:2px; padding:5px 13px; border-radius:3px; width:fit-content; }
        .hq-reg-dot   { width:6px; height:6px; border-radius:50%; background:#e85d26; animation:hqPulse2 1.3s infinite; }
        .hq-reg-hero  { font-family:'Barlow Condensed',sans-serif; font-size:48px; font-weight:700; line-height:1.05; color:#f0f6ff; margin-top:14px; }
        .hq-reg-hero em { font-style:normal; color:#e85d26; }
        .hq-reg-sub   { font-size:13px; color:rgba(200,220,240,0.62); line-height:1.8; margin-top:10px; }

        .hq-why { background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.11); border-radius:10px; padding:18px; backdrop-filter:blur(6px); }
        .hq-why-title { font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:rgba(200,220,240,0.42); margin-bottom:12px; font-family:'Barlow Condensed',sans-serif; }
        .hq-why-item  { display:flex; align-items:flex-start; gap:10px; margin-bottom:10px; font-size:12px; color:rgba(200,220,240,0.78); line-height:1.55; }
        .hq-why-item:last-child { margin-bottom:0; }
        .hq-why-arrow { color:#e85d26; font-weight:700; flex-shrink:0; }

        .hq-reg-r { flex:1; background:#f4f6fa; display:flex; flex-direction:column; justify-content:center; padding:32px 48px; overflow-y:auto; }
        @media(max-width:768px){ .hq-reg-r{ padding:24px 20px; background:#fff; } }

        .hq-reg-fw { max-width:400px; width:100%; margin:0 auto; animation:hqFadeUp2 .35s ease; }

        .hq-reg-toprow { display:flex; justify-content:space-between; align-items:center; margin-bottom:22px; }
        .hq-reg-ptitle { font-family:'Barlow Condensed',sans-serif; font-size:24px; font-weight:700; color:#0d2240; }
        .hq-reg-sw   { font-size:12px; color:#7a9abf; }
        .hq-reg-sw a { color:#1a3a5c; font-weight:600; text-decoration:none; }
        .hq-reg-sw a:hover { color:#e85d26; }

        .hq-reg-rl    { font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#9ab8d4; margin-bottom:8px; }
        .hq-reg-roles { display:flex; gap:6px; margin-bottom:18px; }
        .hq-reg-chip  { flex:1; border:1.5px solid #c8d8ec; border-radius:6px; padding:7px 4px; text-align:center; font-family:'Barlow',sans-serif; font-size:12px; font-weight:500; color:#6a8aaa; cursor:pointer; background:#fff; transition:all .18s; }
        .hq-reg-chip:hover  { border-color:#1a3a5c; color:#1a3a5c; }
        .hq-reg-chip.active { border-color:#1a3a5c; background:#1a3a5c; color:#fff; }

        .hq-name-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; }

        .hq-rf  { margin-bottom:12px; }
        .hq-rfl { display:block; font-size:10px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#9ab8d4; margin-bottom:5px; }
        .hq-riw { display:flex; align-items:center; gap:10px; background:#fff; border:1.5px solid #c8d8ec; border-radius:8px; padding:0 12px; height:42px; transition:border-color .18s,box-shadow .18s; color:#9ab8d4; }
        .hq-riw:focus-within { border-color:#1a3a5c; box-shadow:0 0 0 3px rgba(26,58,92,0.09); color:#1a3a5c; }
        .hq-ri  { background:transparent; border:none; outline:none; color:#0d2240; font-family:'Barlow',sans-serif; font-size:13px; width:100%; height:100%; }
        .hq-ri::placeholder { color:#c0d0e0; }
        .hq-reye { background:none; border:none; cursor:pointer; color:#c0d0e0; padding:0; display:flex; align-items:center; flex-shrink:0; transition:color .18s; }
        .hq-reye:hover { color:#e85d26; }

        .hq-sbars { display:flex; gap:4px; margin-bottom:3px; }
        .hq-sbar  { flex:1; height:3px; border-radius:2px; background:#dde8f0; transition:background .3s; }
        .hq-slbl  { font-size:10px; text-align:right; font-family:'Barlow Condensed',sans-serif; letter-spacing:1px; margin-bottom:10px; }

        .hq-rerr  { background:#fff0ed; border:1.5px solid #f4b8a8; color:#c04a15; border-radius:7px; font-size:12px; padding:10px 14px; margin-bottom:12px; text-align:center; }

        .hq-reg-btn { width:100%; height:44px; background:#e85d26; color:#fff; border:none; border-radius:8px; font-family:'Barlow Condensed',sans-serif; font-size:16px; font-weight:700; letter-spacing:1.5px; cursor:pointer; transition:background .18s,transform .1s; margin-top:4px; }
        .hq-reg-btn:hover    { background:#d14e1a; }
        .hq-reg-btn:active   { transform:scale(.98); }
        .hq-reg-btn:disabled { opacity:.55; cursor:not-allowed; }

        .hq-terms { font-size:11px; color:#9ab8d4; text-align:center; margin-top:10px; }
        .hq-terms a { color:#1a3a5c; font-weight:500; text-decoration:none; }
        .hq-terms a:hover { color:#e85d26; }
      `}</style>

      <div className="hq-reg">
        {/* ── LEFT ── */}
        <div className="hq-reg-l">
          <div>
            <div className="hq-reg-badge"><div className="hq-reg-dot" />THAM GIA MẠNG LƯỚI</div>
            <div className="hq-reg-hero">Đăng Ký<br />Đơn Vị<br /><em>Cứu Hộ</em></div>
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
        </div>

        {/* ── RIGHT ── */}
        <div className="hq-reg-r">
          <div className="hq-reg-fw">
            <div className="hq-reg-toprow">
              <div className="hq-reg-ptitle">TẠO TÀI KHOẢN</div>
              <div className="hq-reg-sw">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></div>
            </div>

            <form onSubmit={handleRegister}>
              {error && <div className="hq-rerr">{error}</div>}

                <div className="hq-rf">
                  <label className="hq-rfl">Họ và tên</label>
                  <div className="hq-riw">
                    <input className="hq-ri" type="text" name="fullName" placeholder="Nguyễn Văn A"
                      value={formData.fullName} onChange={handleChange} required />
                  </div>
                </div>                

              <div className="hq-rf">
                <label className="hq-rfl">Email</label>
                <div className="hq-riw">
                  <MailIcon />
                  <input className="hq-ri" type="email" name="email" placeholder="nguyenvana@gmail.com"
                    value={formData.email} onChange={handleChange} required />
                </div>
              </div>

              <div className="hq-rf">
                <label className="hq-rfl">Số điện thoại</label>
                <div className="hq-riw">
                  <PhoneIcon />
                  <input className="hq-ri" type="tel" name="phoneNumber" placeholder="0912 345 678"
                    value={formData.phoneNumber} onChange={handleChange} required />
                </div>
              </div>

              <div className="hq-rf">
                <label className="hq-rfl">Mật khẩu</label>
                <div className="hq-riw">
                  <LockIcon />
                  <input className="hq-ri" type={showPw ? 'text' : 'password'} name="password"
                    placeholder="Tối thiểu 8 ký tự, bao gồm chữ và số" value={formData.password} onChange={handleChange} required />
                  <button type="button" className="hq-reye" onClick={() => setShowPw(p => !p)}>
                    {showPw ? <EyeShut /> : <EyeOpen />}
                  </button>
                </div>
              </div>

              {formData.password && (
                <>
                  <div className="hq-sbars">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="hq-sbar"
                        style={{ background: pwStrength >= i ? strengthColors[pwStrength] : '#dde8f0' }} />
                    ))}
                  </div>
                  <div className="hq-slbl" style={{ color: strengthColors[pwStrength] }}>
                    {strengthLabels[pwStrength]}
                  </div>
                </>
              )}

              <div className="hq-rf">
                <label className="hq-rfl">Xác nhận mật khẩu</label>
                <div className="hq-riw">
                  <LockIcon />
                  <input className="hq-ri" type={showCpw ? 'text' : 'password'} name="confirmPassword"
                    placeholder="Nhập lại mật khẩu" value={formData.confirmPassword} onChange={handleChange} required />
                  <button type="button" className="hq-reye" onClick={() => setShowCpw(p => !p)}>
                    {showCpw ? <EyeShut /> : <EyeOpen />}
                  </button>
                </div>
              </div>

              <button type="submit" className="hq-reg-btn" disabled={loading}>
                {loading ? 'ĐANG XỬ LÝ...' : 'TẠO TÀI KHOẢN →'}
              </button>
              {/* <div className="hq-terms">
                Bằng cách đăng ký, bạn đồng ý với <a href="#">Điều khoản dịch vụ</a>
              </div> */}
            </form>
          </div>
        </div>
      </div>
    </>
  )
}