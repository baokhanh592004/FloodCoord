import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../component/form/LoginForm.jsx';
import '../../styles/AuthPages.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Handle login submission
  const handleLogin = async (credentials) => {
    setIsLoading(true);
    
    try {
      // TODO: Replace with your actual API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store authentication token
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Navigate to dashboard or home page
      navigate('/');
      
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left side - Image and branding */}
        <div className="auth-left">
          <div className="auth-branding">
            <div className="branding-badge">
              🩸 RELIEF MANAGEMENT
            </div>
            <h1 className="branding-title">
              Coordinating hope where it's needed most.
            </h1>
            <p className="branding-description">
              Join the network of university students and medical professionals 
              saving lives through efficient blood rescue operations.
            </p>
          </div>
          
          <div className="auth-image">
            <img 
              src="/images/medical-team.jpg" 
              alt="Medical professionals coordinating relief efforts"
            />
          </div>
        </div>

        {/* Right side - Form */}
        <div className="auth-right">
          <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;