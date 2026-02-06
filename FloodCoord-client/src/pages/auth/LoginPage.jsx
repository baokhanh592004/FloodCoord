import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import backgroundImage from '../../assets/images/background.png'
import { loginApi } from '../../services/authApi'
import toast from 'react-hot-toast';


export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await loginApi.login({
        email,
        password,
      });

      console.log('Login successful:', data);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      window.dispatchEvent(new Event('authChange'));
      toast.success('Login successful!');
      navigate('/');

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Chiều cao = 100vh - Header (~85px) - Footer (~50px) = 100vh - 135px
    <div className="flex h-[calc(100vh-135px)] w-full overflow-hidden">
            
            {/* Bên trái: Ảnh (Giữ nguyên logic chia đôi) */}
            <div className="hidden md:flex md:w-1/2 relative h-full">
                <img className="h-full w-full" src={backgroundImage} alt="leftSideImage" />
            </div>
        
            {/* Bên phải: Form */}
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-white p-4 h-full">
        
                <form onSubmit={handleLogin} className="md:w-96 w-80 flex flex-col items-center justify-center">
                    <h2 className="text-2xl text-gray-900 font-medium">Sign in</h2>
                    <p className="text-sm text-gray-500/90 mt-1">Welcome back! Please sign in to continue</p>
        
                    <button type="button" className="w-full mt-4 bg-gray-500/10 flex items-center justify-center h-10 rounded-full hover:bg-gray-500/20 transition-colors">
                        <img className="h-5" src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/googleLogo.svg" alt="googleLogo" />
                    </button>
        
                    <div className="flex items-center gap-4 w-full my-3">
                        <div className="w-full h-px bg-gray-300/90"></div>
                        <p className="w-full text-nowrap text-xs text-gray-500/90">or sign in with email</p>
                        <div className="w-full h-px bg-gray-300/90"></div>
                    </div>

                    {error && (
                        <div className="w-full mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">
                            {error}
                        </div>
                    )}
        
                    <div className="flex items-center w-full bg-transparent border border-gray-300/60 h-10 rounded-full overflow-hidden pl-5 gap-2 focus-within:border-indigo-500 transition-colors">
                        <svg width="14" height="10" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z" fill="#6B7280"/>
                        </svg>
                        <input type="email" placeholder="Email id"
                              value = {email}
                              onChange = {(e) => setEmail(e.target.value)}
                              className="bg-transparent text-gray-700 placeholder-gray-500/80 outline-none text-sm w-full h-full" required />                
                    </div>
        
                    <div className="flex items-center mt-3 w-full bg-transparent border border-gray-300/60 h-10 rounded-full overflow-hidden pl-5 gap-2 focus-within:border-indigo-500 transition-colors">
                        <svg width="11" height="15" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="#6B7280"/>
                        </svg>
                        <input type="password" placeholder="Password" 
                              value = {password}
                              onChange = {(e) => setPassword(e.target.value)}
                              className="bg-transparent text-gray-700 placeholder-gray-500/80 outline-none text-sm w-full h-full" required />
                    </div>
        
                    <div className="w-full flex items-center justify-between mt-4 text-gray-500/80">
                        <div className="flex items-center gap-2">
                            <input className="h-4 w-4 accent-indigo-500" type="checkbox" id="checkbox" />
                            <label className="text-sm cursor-pointer" htmlFor="checkbox">Remember me</label>
                        </div>
                        <Link to="/forgot-password" className="text-sm text-indigo-500 hover:underline">Forgot password?</Link>
                    </div>
        
                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-4 w-full h-10 rounded-full text-white bg-indigo-500 hover:opacity-90 transition-opacity disabled:opacity-60 font-medium"
                    >
                      {loading ? "Signing in..." : "Login"}
                    </button>
                    <p className="text-gray-500/90 text-sm mt-3">Don't have an account? <Link to="/register" className="text-indigo-500 font-medium hover:underline">Sign up</Link></p>
                </form>
            </div>
        </div>
  )
}