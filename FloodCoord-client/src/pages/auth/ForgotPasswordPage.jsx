import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { loginApi } from '../../services/authApi'
import toast from 'react-hot-toast'

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@300;400;500&display=swap');
        @keyframes hqPulseFP  { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes hqFadeUpFP { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

        .hq-fp {
          display: flex;
          height: calc(100vh - 73px);
          margin-top: 73px;
          width: 100%;
          overflow: hidden;
          font-family: 'Barlow', sans-serif;
        }

        .hq-fp-l {
          position: relative;
          width: 50%;
          flex-shrink: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 40px;
          background-image: url('${forgotBg}');
          background-size: cover;
          background-position: center;
        }
        @media(max-width:768px){ .hq-fp-l{ display:none; } }
        .hq-fp-l::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(160deg, rgba(8,14,26,0.84) 0%, rgba(13,34,64,0.44) 45%, rgba(8,14,26,0.92) 100%);
          z-index: 0;
        }
        .hq-fp-l > * { position:relative; z-index:1; }

        .hq-fp-badge { display:inline-flex; align-items:center; gap:8px; background:rgba(232,93,38,0.18); border:1px solid rgba(232,93,38,0.5); color:#e85d26; font-family:'Barlow Condensed',sans-serif; font-size:11px; font-weight:700; letter-spacing:2px; padding:5px 13px; border-radius:3px; width:fit-content; }
        .hq-fp-dot   { width:6px; height:6px; border-radius:50%; background:#e85d26; animation:hqPulseFP 1.3s infinite; }
        .hq-fp-hero  { font-family:'Barlow Condensed',sans-serif; font-size:48px; font-weight:700; line-height:1.05; color:#f0f6ff; margin-top:14px; }
        .hq-fp-hero em { font-style:normal; color:#e85d26; }
        .hq-fp-sub   { font-size:13px; color:rgba(200,220,240,0.62); line-height:1.8; margin-top:10px; }

        .hq-fp-steps { background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.11); border-radius:10px; padding:18px; backdrop-filter:blur(6px); }
        .hq-fp-step  { display:flex; align-items:center; gap:12px; margin-bottom:10px; }
        .hq-fp-step:last-child { margin-bottom:0; }
        .hq-fp-num   { font-family:'Barlow Condensed',sans-serif; font-size:10px; font-weight:700; letter-spacing:1px; padding:3px 8px; border-radius:3px; flex-shrink:0; }
        .hq-fp-num.on  { background:#e85d26; color:#fff; }
        .hq-fp-num.off { background:rgba(232,93,38,0.14); color:#e85d26; }
        .hq-fp-stxt  { font-size:12px; color:rgba(200,220,240,0.68); line-height:1.5; }

        .hq-fp-strip { display:flex; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.1); border-radius:8px; overflow:hidden; margin-top:10px; backdrop-filter:blur(4px); }
        .hq-fp-si { flex:1; padding:10px 12px; text-align:center; border-right:1px solid rgba(255,255,255,0.07); }
        .hq-fp-si:last-child { border-right:none; }
        .hq-fp-sn { font-family:'Barlow Condensed',sans-serif; font-size:18px; font-weight:700; color:#f0f6ff; }
        .hq-fp-sl { font-size:9px; color:rgba(200,220,240,0.38); letter-spacing:1px; text-transform:uppercase; margin-top:1px; }

        .hq-fp-r { flex:1; background:#f4f6fa; display:flex; flex-direction:column; justify-content:center; padding:40px 52px; overflow-y:auto; }
        @media(max-width:768px){ .hq-fp-r{ padding:28px 20px; background:#fff; } }

        .hq-fp-fw { max-width:360px; width:100%; margin:0 auto; animation:hqFadeUpFP .35s ease; }

        .hq-fp-back { display:inline-flex; align-items:center; gap:6px; font-size:12px; color:#9ab8d4; text-decoration:none; margin-bottom:26px; transition:color .18s; }
        .hq-fp-back:hover { color:#e85d26; }

        .hq-fp-title { font-family:'Barlow Condensed',sans-serif; font-size:26px; font-weight:700; color:#0d2240; margin-bottom:6px; }
        .hq-fp-desc  { font-size:13px; color:#7a9abf; line-height:1.7; margin-bottom:22px; }

        .hq-fp-prog { height:2px; background:#dde8f0; border-radius:2px; margin-bottom:6px; overflow:hidden; }
        .hq-fp-pf   { height:100%; background:#e85d26; border-radius:2px; }
        .hq-fp-slbl { font-size:10px; font-family:'Barlow Condensed',sans-serif; letter-spacing:1.5px; color:#b0c8e0; margin-bottom:18px; text-transform:uppercase; }

        .hq-fp-fl  { display:block; font-size:10px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#9ab8d4; margin-bottom:5px; }
        .hq-fp-iw  { display:flex; align-items:center; gap:10px; background:#fff; border:1.5px solid #c8d8ec; border-radius:8px; padding:0 14px; height:44px; transition:border-color .18s,box-shadow .18s; color:#9ab8d4; margin-bottom:6px; }
        .hq-fp-iw:focus-within { border-color:#1a3a5c; box-shadow:0 0 0 3px rgba(26,58,92,0.09); color:#1a3a5c; }
        .hq-fp-inp { background:transparent; border:none; outline:none; color:#0d2240; font-family:'Barlow',sans-serif; font-size:14px; width:100%; height:100%; }
        .hq-fp-inp::placeholder { color:#c0d0e0; }

        .hq-fp-btn { width:100%; height:46px; background:#e85d26; color:#fff; border:none; border-radius:8px; font-family:'Barlow Condensed',sans-serif; font-size:16px; font-weight:700; letter-spacing:1.5px; cursor:pointer; transition:background .18s,transform .1s; margin-top:8px; }
        .hq-fp-btn:hover    { background:#d14e1a; }
        .hq-fp-btn:active   { transform:scale(.98); }
        .hq-fp-btn:disabled { opacity:.55; cursor:not-allowed; }

        .hq-fp-err  { background:#fff0ed; border:1.5px solid #f4b8a8; color:#c04a15; border-radius:7px; font-size:12px; padding:10px 14px; margin-bottom:14px; text-align:center; }
        .hq-fp-note { background:#eef4fc; border:1px solid #c8d8ec; border-radius:7px; padding:10px 14px; font-size:11px; color:#5a7a9a; line-height:1.65; margin-top:12px; }

        .hq-fp-success { text-align:center; padding:16px 0; animation:hqFadeUpFP .3s ease; }
        .hq-fp-icon    { width:60px; height:60px; background:#edfbf3; border:2px solid #86efac; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; }
        .hq-fp-stitle  { font-family:'Barlow Condensed',sans-serif; font-size:22px; font-weight:700; color:#0d2240; margin-bottom:8px; }
        .hq-fp-sdesc   { font-size:13px; color:#7a9abf; line-height:1.7; }
        .hq-fp-semail  { color:#e85d26; font-weight:500; }

        .hq-fp-sec { display:flex; align-items:center; justify-content:center; gap:6px; margin-top:18px; font-size:10px; letter-spacing:1.5px; color:#c0d0e0; font-family:'Barlow Condensed',sans-serif; }
      `}</style>

      <div className="hq-fp">
        {/* ── LEFT ── */}
        <div className="hq-fp-l">
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
            <div className="hq-fp-strip">
              <div className="hq-fp-si"><div className="hq-fp-sn">2 phút</div><div className="hq-fp-sl">Thời gian gửi</div></div>
              <div className="hq-fp-si"><div className="hq-fp-sn">24h</div><div className="hq-fp-sl">Hiệu lực link</div></div>
              <div className="hq-fp-si"><div className="hq-fp-sn">100%</div><div className="hq-fp-sl">Bảo mật</div></div>
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="hq-fp-r">
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
                  <label className="hq-fp-fl">Email</label>
                  <div className="hq-fp-iw">
                    <MailIcon />
                    <input className="hq-fp-inp" type="email" placeholder="nguyenvana@gmail.com"
                      value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
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
        </div>
      </div>
    </>
  )
}