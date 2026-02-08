import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import backgroundImage from '../../assets/images/background.png'
import { loginApi } from '../../services/authApi'
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();

  // 1. State chứa đầy đủ các trường Backend cần
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '', // Thêm trường này
    password: '',
    confirmPassword: '', // Backend cần cái này gửi lên luôn
    rollCode: 'MEMBER' // Mặc định là MEMBER
  });
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Hàm xử lý khi gõ vào ô input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Xóa lỗi khi người dùng sửa lại
    if (error) setError(null);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Kiểm tra Frontend trước cho nhanh
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!"); // Báo lỗi tiếng Việt cho dễ hiểu
      setLoading(false);
      return;
    }

    try {
      // 2. Gửi nguyên cục formData lên (vì cấu trúc state đã khớp 100% với JSON bạn đưa)
      // JSON gửi đi sẽ y hệt: { fullName, email, phoneNumber, password, confirmPassword, rollCode }
      console.log("Sending data:", formData); 
      
      await loginApi.register(formData);

      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login'); 

    } catch (err) {
      console.error(err);
      // Lấy lỗi từ Backend trả về (nếu có)
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-135px)] w-full overflow-hidden">
            
            {/* Bên trái: Ảnh */}
            <div className="hidden md:flex md:w-1/2 relative h-full">
                <img className="h-full w-full object-cover" src={backgroundImage} alt="leftSideImage" />
            </div>
        
            {/* Bên phải: Form */}
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-white p-4 h-full overflow-y-auto">
        
                <form onSubmit={handleRegister} className="md:w-96 w-80 flex flex-col items-center justify-center py-4">
                    <h2 className="text-2xl text-gray-900 font-medium">Đăng ký tài khoản</h2>
                    <p className="text-sm text-gray-500/90 mt-1">Tham gia cùng chúng tôi để hỗ trợ cộng đồng</p>
        
                    {/* Hiển thị lỗi */}
                    {error && (
                        <div className="w-full mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">
                            {error}
                        </div>
                    )}
        
                    {/* 1. INPUT: Full Name */}
                    <div className="flex items-center w-full bg-transparent border border-gray-300/60 h-10 rounded-full overflow-hidden pl-5 gap-2 focus-within:border-indigo-500 transition-colors mt-4 mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#6B7280" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                        <input 
                            type="text" 
                            name="fullName"
                            placeholder="Họ và tên"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="bg-transparent text-gray-700 placeholder-gray-500/80 outline-none text-sm w-full h-full" 
                            required 
                        />                
                    </div>

                    {/* 2. INPUT: Email */}
                    <div className="flex items-center w-full bg-transparent border border-gray-300/60 h-10 rounded-full overflow-hidden pl-5 gap-2 focus-within:border-indigo-500 transition-colors mb-3">
                        <svg width="14" height="10" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z" fill="#6B7280"/>
                        </svg>
                        <input 
                            type="email" 
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className="bg-transparent text-gray-700 placeholder-gray-500/80 outline-none text-sm w-full h-full" 
                            required 
                        />                
                    </div>

                    {/* 3. INPUT: Phone Number (Mới thêm) */}
                    <div className="flex items-center w-full bg-transparent border border-gray-300/60 h-10 rounded-full overflow-hidden pl-5 gap-2 focus-within:border-indigo-500 transition-colors mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#6B7280" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                        <input 
                            type="tel" 
                            name="phoneNumber"
                            placeholder="Số điện thoại"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="bg-transparent text-gray-700 placeholder-gray-500/80 outline-none text-sm w-full h-full" 
                            required 
                        />                
                    </div>
        
                    {/* 4. INPUT: Password */}
                    <div className="flex items-center w-full bg-transparent border border-gray-300/60 h-10 rounded-full overflow-hidden pl-5 gap-2 focus-within:border-indigo-500 transition-colors mb-3">
                        <svg width="11" height="15" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="#6B7280"/>
                        </svg>
                        <input 
                            type="password" 
                            name="password"
                            placeholder="Mật khẩu" 
                            value={formData.password}
                            onChange={handleChange}
                            className="bg-transparent text-gray-700 placeholder-gray-500/80 outline-none text-sm w-full h-full" 
                            required 
                        />
                    </div>

                    {/* 5. INPUT: Confirm Password */}
                    <div className="flex items-center w-full bg-transparent border border-gray-300/60 h-10 rounded-full overflow-hidden pl-5 gap-2 focus-within:border-indigo-500 transition-colors">
                        <svg width="11" height="15" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="#6B7280"/>
                        </svg>
                        <input 
                            type="password" 
                            name="confirmPassword"
                            placeholder="Nhập lại mật khẩu" 
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="bg-transparent text-gray-700 placeholder-gray-500/80 outline-none text-sm w-full h-full" 
                            required 
                        />
                    </div>
        
                    {/* BUTTON REGISTER */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-6 w-full h-10 rounded-full text-white bg-indigo-500 hover:opacity-90 transition-opacity disabled:opacity-60 font-medium"
                    >
                      {loading ? "Đang xử lý..." : "Đăng ký"}
                    </button>
                    
                    <p className="text-gray-500/90 text-sm mt-4">
                        Đã có tài khoản? <Link to="/login" className="text-indigo-500 font-medium hover:underline">Đăng nhập ngay</Link>
                    </p>
                </form>
            </div>
        </div>
  )
}