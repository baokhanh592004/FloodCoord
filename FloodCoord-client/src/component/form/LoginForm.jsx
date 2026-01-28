import React, { useState } from 'react';
import Input from '../component/Input';
import useFormValidation from '../hooks/useFormValidation';
import { validateEmail, validatePassword } from '../utils/validationUtils';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import '../styles/AuthForms.css';

const LoginForm = ({ onSubmit, isLoading }) => {
  const [showPassword, setShowPassword] = useState(false);

  // Initial form values
  const initialValues = {
    email: '',
    password: ''
  };

  // Validation rules
  const validationRules = {
    email: (value) => validateEmail(value),
    password: (value) => validatePassword(value, 'Password')
  };

  // Use custom validation hook
  const {
    values,
    errors,
    touched,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleBlur,
    validateForm
  } = useFormValidation(initialValues, validationRules);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const isValid = validateForm();
    
    if (isValid) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Login error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form" noValidate>
      <div className="form-header">
        <div className="logo-container">
          <div className="logo-icon">🆘</div>
          <h2 className="logo-text">BloodRescue</h2>
        </div>
        <h1 className="form-title">Welcome Back</h1>
        <p className="form-subtitle">Please login to your account to continue.</p>
      </div>

      <div className="form-body">
        <Input
          label="Email or Phone"
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.email ? errors.email : ''}
          placeholder="student@university.edu"
          icon={Mail}
          required
        />

        <div className="password-input-group">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password ? errors.password : ''}
            placeholder="Enter your password"
            icon={Lock}
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="form-options">
          <label className="checkbox-label">
            <input type="checkbox" name="remember" />
            <span>Remember me</span>
          </label>
          <a href="/forgot-password" className="forgot-link">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting || isLoading ? (
            <>
              <span className="spinner"></span>
              Signing in...
            </>
          ) : (
            <>
              Sign in <span className="arrow">→</span>
            </>
          )}
        </button>

        <div className="form-footer">
          <p>
            New to the platform?{' '}
            <a href="/register" className="link">
              Create an account
            </a>
          </p>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;