import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import backgroundImage from '../../assets/images/background.png'
import { loginApi } from '../../services/authApi'
import { rescueApi } from '../../services/rescueApi';
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast';
import axiosClient from '../../api/axiosClient'; // Import thêm axiosClient để gọi API Profile

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [showClaimModal, setShowClaimModal] = React.useState(false);
  const [guestCodesToClaim, setGuestCodesToClaim] = React.useState([]);
  const [modalLoading, setModalLoading] = React.useState(false);
  const [pendingAuth, setPendingAuth] = React.useState(null);

  const getRoleBasedDashboard = (token) => {
    // Decode token to get role
    const decoded = jwtDecode(token);
    const roles = decoded.roles || [];
    const userRole = roles.length > 0 ? roles[0] : 'MEMBER';
    
    // Normalize role to uppercase
    const normalizedRole = userRole?.toUpperCase() || 'MEMBER';

    switch (normalizedRole) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'MANAGER':
        return '/manager/dashboard';
      case 'COORDINATOR':
        return '/coordinator/dashboard';
      case 'RESCUE_TEAM':
        return '/rescue-team/dashboard';
      case 'MEMBER':
      default:
        return '/';
    }
  };

  const completeLogin = (authData) => {
    if (!authData) return;

    login(authData.accessToken, authData.refreshToken);
    window.dispatchEvent(new Event('authChange'));
    toast.success('Login successful!');
    navigate(authData.redirectPath);
    setShowClaimModal(false);
    setGuestCodesToClaim([]);
    setPendingAuth(null);
  };

  const handleClaimNow = async () => {
    if (!pendingAuth) return;

    setModalLoading(true);
    try {
      if (guestCodesToClaim.length > 0) {
        await rescueApi.claimRequests(guestCodesToClaim);
        localStorage.removeItem('guestTrackingCodes');
        toast.success('Đã đồng bộ các yêu cầu cứu hộ cũ.');
      }
    } catch (syncErr) {
      console.error('Lỗi khi đồng bộ yêu cầu cũ:', syncErr);
      toast.error('Đồng bộ thất bại, bạn có thể thử lại sau.');
    } finally {
      setModalLoading(false);
      completeLogin(pendingAuth);
    }
  };

  const handleClaimLater = () => {
    completeLogin(pendingAuth);
  };

  const handleSkipAndClear = () => {
    localStorage.removeItem('guestTrackingCodes');
    completeLogin(pendingAuth);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Gọi API Login lấy Token
      const data = await loginApi.login({
        email,
        password,
      });

      console.log('Login successful:', data);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      // 2. [THÊM MỚI] Gọi API lấy Profile để lấy thông tin isTeamLeader
      try {
        // Sử dụng token vừa nhận được để gọi API lấy profile
        const profileRes = await axiosClient.get('/api/profile/me', {
          headers: { Authorization: `Bearer ${data.accessToken}` }
        });
        // Lưu thông tin user (bao gồm isTeamLeader) vào localStorage
        localStorage.setItem('user', JSON.stringify(profileRes.data));
      } catch (err) {
        console.error("Lỗi khi lấy thông tin User Profile:", err);
      }
      const redirectPath = getRoleBasedDashboard(data.accessToken);

      const guestCodes = JSON.parse(localStorage.getItem('guestTrackingCodes') || '[]');
      const authData = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        redirectPath
      };

      if (guestCodes.length > 0) {
        setPendingAuth(authData);
        setGuestCodesToClaim(guestCodes);
        setShowClaimModal(true);
        return;
      }

      completeLogin(authData);

    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Chiều cao = 100vh - Header (~85px) - Footer (~50px) = 100vh - 135px
    <>
    <div className="flex h-[calc(100vh-73px)] w-full overflow-hidden">
            
      {/* Bên trái: Ảnh */}
      <div className="hidden md:flex md:w-1/2 relative h-full">
          <img className="h-full w-full object-cover" src={backgroundImage} alt="leftSideImage" />
      </div>
  
      {/* Bên phải: Form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-white p-4 h-full">
  
          <form onSubmit={handleLogin} className="md:w-96 w-80 flex flex-col items-center justify-center">
              <h2 className="text-2xl text-gray-900 font-medium">Đăng Nhập</h2>
              <p className="text-sm text-gray-500/90 mt-1">Chào mừng trở lại! Hãy đăng nhập để tiếp tục</p>
  
              {error && (
                  <div className="w-full mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">
                      {error}
                  </div>
              )}
  
              <div className="flex items-center w-full bg-transparent border border-gray-300/60 h-10 rounded-full overflow-hidden pl-5 gap-2 focus-within:border-indigo-500 transition-colors">
                  <svg width="14" height="10" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z" fill="#6B7280"/>
                  </svg>
                  <input type="email" placeholder="Email"
                        value = {email}
                        onChange = {(e) => setEmail(e.target.value)}
                        className="bg-transparent text-gray-700 placeholder-gray-500/80 outline-none text-sm w-full h-full" required />                
              </div>
  
              <div className="flex items-center mt-3 w-full bg-transparent border border-gray-300/60 h-10 rounded-full overflow-hidden pl-5 gap-2 focus-within:border-indigo-500 transition-colors">
                  <svg width="11" height="15" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="#6B7280"/>
                  </svg>
                  <input type="password" placeholder="Mật khẩu"
                        value = {password}
                        onChange = {(e) => setPassword(e.target.value)}
                        className="bg-transparent text-gray-700 placeholder-gray-500/80 outline-none text-sm w-full h-full" required />
              </div>
  
              <div className="w-full flex items-center justify-between mt-4 text-gray-500/80">
                  <div className="flex items-center gap-2">
                      <input className="h-4 w-4 accent-indigo-500" type="checkbox" id="checkbox" />
                      <label className="text-sm cursor-pointer" htmlFor="checkbox">Ghi nhớ tài khoản</label>
                  </div>
                  <Link to="/forgot-password" className="text-sm text-indigo-500 hover:underline">Quên mật khẩu?</Link>
              </div>
  
              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full h-10 rounded-full text-white bg-indigo-500 hover:opacity-90 transition-opacity disabled:opacity-60 font-medium"
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
              <p className="text-gray-500/90 text-sm mt-3">Chưa có tài khoản? <Link to="/register" className="text-indigo-500 font-medium hover:underline">Đăng ký</Link></p>
          </form>
      </div>
    </div>
    {showClaimModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Đồng bộ yêu cầu cứu hộ trước đó?</h3>
            <p className="text-sm text-gray-600 mt-1">
              Phát hiện <strong>{guestCodesToClaim.length}</strong> mã tra cứu đã gửi khi chưa đăng nhập.
            </p>
          </div>

          <div className="px-6 py-5 space-y-3 bg-gray-50">
            <button
              type="button"
              onClick={handleClaimNow}
              disabled={modalLoading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold transition"
            >
              {modalLoading ? 'Đang đồng bộ...' : 'Đồng bộ ngay vào tài khoản này'}
            </button>

            <button
              type="button"
              onClick={handleClaimLater}
              disabled={modalLoading}
              className="w-full py-3 rounded-xl bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-60 text-gray-800 font-semibold transition"
            >
              Để sau
            </button>

            <button
              type="button"
              onClick={handleSkipAndClear}
              disabled={modalLoading}
              className="w-full py-3 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 disabled:opacity-60 text-red-700 font-semibold transition"
            >
              Không đồng bộ (xóa dữ liệu tạm)
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}