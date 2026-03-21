import React, { useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { loginApi } from '../../services/authApi'
import toast from 'react-hot-toast'

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@300;400;500&display=swap');
        @keyframes hqPulseRP  { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes hqFadeUpRP { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

        .hq-rp {
          display: flex;
          height: calc(100vh - 73px);
          margin-top: 73px;
          width: 100%;
          overflow: hidden;
          font-family: 'Barlow', sans-serif;
        }

        .hq-rp-l {
          position: relative;
          width: 50%;
          flex-shrink: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 40px;
          background-image: url('');
          background-size: cover;
          background-position: center;
        }
        @media(max-width:768px){ .hq-rp-l{ display:none; } }
        .hq-rp-l::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(160deg, rgba(8,14,26,0.84) 0%, rgba(13,34,64,0.44) 45%, rgba(8,14,26,0.92) 100%);
          z-index: 0;
        }
        .hq-rp-l > * { position:relative; z-index:1; }

        .hq-rp-badge { display:inline-flex; align-items:center; gap:8px; background:rgba(34,197,94,0.16); border:1px solid rgba(34,197,94,0.42); color:#22c55e; font-family:'Barlow Condensed',sans-serif; font-size:11px; font-weight:700; letter-spacing:2px; padding:5px 13px; border-radius:3px; width:fit-content; }
        .hq-rp-dot   { width:6px; height:6px; border-radius:50%; background:#22c55e; animation:hqPulseRP 1.3s infinite; }
        .hq-rp-hero  { font-family:'Barlow Condensed',sans-serif; font-size:48px; font-weight:700; line-height:1.05; color:#f0f6ff; margin-top:14px; }
        .hq-rp-hero em { font-style:normal; color:#22c55e; }
        .hq-rp-sub   { font-size:13px; color:rgba(200,220,240,0.62); line-height:1.8; margin-top:10px; }

        .hq-rp-steps { background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.11); border-radius:10px; padding:18px; backdrop-filter:blur(6px); }
        .hq-rp-step  { display:flex; align-items:center; gap:12px; margin-bottom:10px; }
        .hq-rp-step:last-child { margin-bottom:0; }
        .hq-rp-num   { font-family:'Barlow Condensed',sans-serif; font-size:10px; font-weight:700; letter-spacing:1px; padding:3px 8px; border-radius:3px; flex-shrink:0; }
        .hq-rp-num.done   { background:rgba(34,197,94,0.16); color:#22c55e; }
        .hq-rp-num.active { background:#e85d26; color:#fff; }
        .hq-rp-stxt  { font-size:12px; color:rgba(200,220,240,0.68); line-height:1.5; }

        .hq-rp-strip { display:flex; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.1); border-radius:8px; overflow:hidden; margin-top:10px; backdrop-filter:blur(4px); }
        .hq-rp-si { flex:1; padding:10px 12px; text-align:center; border-right:1px solid rgba(255,255,255,0.07); }
        .hq-rp-si:last-child { border-right:none; }
        .hq-rp-sn { font-family:'Barlow Condensed',sans-serif; font-size:18px; font-weight:700; color:#f0f6ff; }
        .hq-rp-sl { font-size:9px; color:rgba(200,220,240,0.38); letter-spacing:1px; text-transform:uppercase; margin-top:1px; }

        .hq-rp-r { flex:1; background:#f4f6fa; display:flex; flex-direction:column; justify-content:center; padding:40px 52px; overflow-y:auto; }
        @media(max-width:768px){ .hq-rp-r{ padding:28px 20px; background:#fff; } }

        .hq-rp-fw { max-width:360px; width:100%; margin:0 auto; animation:hqFadeUpRP .35s ease; }

        .hq-rp-back { display:inline-flex; align-items:center; gap:6px; font-size:12px; color:#9ab8d4; text-decoration:none; margin-bottom:26px; transition:color .18s; }
        .hq-rp-back:hover { color:#e85d26; }

        .hq-rp-title { font-family:'Barlow Condensed',sans-serif; font-size:26px; font-weight:700; color:#0d2240; margin-bottom:6px; }
        .hq-rp-desc  { font-size:13px; color:#7a9abf; line-height:1.7; margin-bottom:22px; }

        .hq-rp-prog { height:2px; background:#dde8f0; border-radius:2px; margin-bottom:6px; overflow:hidden; }
        .hq-rp-pf   { height:100%; background:#e85d26; border-radius:2px; }
        .hq-rp-slbl { font-size:10px; font-family:'Barlow Condensed',sans-serif; letter-spacing:1.5px; color:#b0c8e0; margin-bottom:18px; text-transform:uppercase; }

        .hq-rp-fl  { display:block; font-size:10px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#9ab8d4; margin-bottom:5px; }
        .hq-rp-iw  { display:flex; align-items:center; gap:10px; background:#fff; border:1.5px solid #c8d8ec; border-radius:8px; padding:0 14px; height:44px; transition:border-color .18s,box-shadow .18s; color:#9ab8d4; margin-bottom:12px; }
        .hq-rp-iw:focus-within { border-color:#1a3a5c; box-shadow:0 0 0 3px rgba(26,58,92,0.09); color:#1a3a5c; }
        .hq-rp-inp { background:transparent; border:none; outline:none; color:#0d2240; font-family:'Barlow',sans-serif; font-size:14px; width:100%; height:100%; }
        .hq-rp-inp::placeholder { color:#c0d0e0; }
        .hq-rp-eye { background:none; border:none; cursor:pointer; color:#c0d0e0; padding:0; display:flex; align-items:center; flex-shrink:0; transition:color .18s; }
        .hq-rp-eye:hover { color:#e85d26; }

        .hq-rp-sbars { display:flex; gap:4px; margin-bottom:3px; }
        .hq-rp-sbar  { flex:1; height:3px; border-radius:2px; background:#dde8f0; transition:background .3s; }
        .hq-rp-slbl2 { font-size:10px; text-align:right; font-family:'Barlow Condensed',sans-serif; letter-spacing:1px; margin-bottom:12px; }

        .hq-rp-err  { background:#fff0ed; border:1.5px solid #f4b8a8; color:#c04a15; border-radius:7px; font-size:12px; padding:10px 14px; margin-bottom:14px; text-align:center; }

        .hq-rp-btn { width:100%; height:46px; background:#e85d26; color:#fff; border:none; border-radius:8px; font-family:'Barlow Condensed',sans-serif; font-size:16px; font-weight:700; letter-spacing:1.5px; cursor:pointer; transition:background .18s,transform .1s; }
        .hq-rp-btn:hover    { background:#d14e1a; }
        .hq-rp-btn:active   { transform:scale(.98); }
        .hq-rp-btn:disabled { opacity:.55; cursor:not-allowed; }
        .hq-rp-btn.green    { background:#16a34a; }
        .hq-rp-btn.green:hover { background:#15803d; }

        .hq-rp-done { text-align:center; padding:16px 0; animation:hqFadeUpRP .3s ease; }
        .hq-rp-done-icon  { width:64px; height:64px; background:#edfbf3; border:2px solid #86efac; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; }
        .hq-rp-done-title { font-family:'Barlow Condensed',sans-serif; font-size:24px; font-weight:700; color:#0d2240; margin-bottom:8px; }
        .hq-rp-done-desc  { font-size:13px; color:#7a9abf; line-height:1.7; }

        .hq-rp-sec { display:flex; align-items:center; justify-content:center; gap:6px; margin-top:18px; font-size:10px; letter-spacing:1.5px; color:#c0d0e0; font-family:'Barlow Condensed',sans-serif; }
      `}</style>

      <div className="hq-rp">
        {/* ── LEFT ── */}
        <div className="hq-rp-l">
          <div>
            <div className="hq-rp-badge"><div className="hq-rp-dot" />BƯỚC CUỐI CÙNG</div>
            <div className="hq-rp-hero">Đặt Lại<br />Mật<br /><em>Khẩu</em></div>
            <div className="hq-rp-sub">Bạn sắp hoàn tất. Tạo mật khẩu mới<br />để trở lại nhiệm vụ cứu hộ.</div>
          </div>
          <div>
            <div className="hq-rp-steps">
              <div className="hq-rp-step"><span className="hq-rp-num done">✓ 01</span><div className="hq-rp-stxt">Email đã được xác minh</div></div>
              <div className="hq-rp-step"><span className="hq-rp-num done">✓ 02</span><div className="hq-rp-stxt">Mã xác nhận đã được kiểm tra</div></div>
              <div className="hq-rp-step"><span className="hq-rp-num active">03</span><div className="hq-rp-stxt">Tạo mật khẩu mới</div></div>
            </div>
            <div className="hq-rp-strip">
              <div className="hq-rp-si"><div className="hq-rp-sn">2 phút</div><div className="hq-rp-sl">Thời gian gửi</div></div>
              <div className="hq-rp-si"><div className="hq-rp-sn">24h</div><div className="hq-rp-sl">Hiệu lực link</div></div>
              <div className="hq-rp-si"><div className="hq-rp-sn">100%</div><div className="hq-rp-sl">Bảo mật</div></div>
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="hq-rp-r">
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
                  <label className="hq-rp-fl">Mật khẩu mới</label>
                  <div className="hq-rp-iw">
                    <LockIcon />
                    <input className="hq-rp-inp" type={showPw ? 'text' : 'password'}
                      placeholder="Tối thiểu 8 ký tự, bao gồm chữ và số" value={newPassword}
                      onChange={e => handlePwChange(e.target.value)} required />
                    <button type="button" className="hq-rp-eye" onClick={() => setShowPw(p => !p)}>
                      {showPw ? <EyeShut /> : <EyeOpen />}
                    </button>
                  </div>

                  {newPassword && (
                    <>
                      <div className="hq-rp-sbars">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="hq-rp-sbar"
                            style={{ background: pwStrength >= i ? strengthColors[pwStrength] : '#dde8f0' }} />
                        ))}
                      </div>
                      <div className="hq-rp-slbl2" style={{ color: strengthColors[pwStrength] }}>
                        {strengthLabels[pwStrength]}
                      </div>
                    </>
                  )}

                  <label className="hq-rp-fl">Xác nhận mật khẩu</label>
                  <div className="hq-rp-iw">
                    <LockIcon />
                    <input className="hq-rp-inp" type={showCpw ? 'text' : 'password'}
                      placeholder="Nhập lại mật khẩu mới" value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)} required />
                    <button type="button" className="hq-rp-eye" onClick={() => setShowCpw(p => !p)}>
                      {showCpw ? <EyeShut /> : <EyeOpen />}
                    </button>
                  </div>

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
        </div>
      </div>
    </>
  )
}