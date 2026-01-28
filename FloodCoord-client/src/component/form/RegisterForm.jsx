import React, { useState } from 'react';
import Input from '../component/Input';
import useFormValidation from '../hooks/useFormValidation';
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateFullName,
  validatePhoneNumber,
  validateAddress,
  getPasswordStrength,
  formatPhoneNumber
} from '../utils/validationUtils';
import { User, Mail, Phone, MapPin, Lock, Eye, EyeOff } from 'lucide-react';
import '../styles/AuthForms.css';

const RegisterForm = ({ onSubmit, isLoading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Initial form values
  const initialValues = {
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    confirmPassword: ''
  };

  // Validation rules
  const validationRules = {
    fullName: (value) => validateFullName(value),
    email: (value) => validateEmail(value),
    phoneNumber: (value) => validatePhoneNumber(value),
    address: (value) => validateAddress(value),
    password: (value) => validatePassword(value, 'Password'),
    confirmPassword: (value, allValues) => validateConfirmPassword(allValues.password, value)
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
    validateForm,
    setFieldValue,
    setFieldError
  } = useFormValidation(initialValues, validationRules);

  // Get password strength
  const passwordStrength = getPasswordStrength(values.password);

  // Handle phone number formatting
  const handlePhoneChange = (e) => {
    const { value } = e.target;
    const formattedValue = formatPhoneNumber(value);
    setFieldValue('phoneNumber', formattedValue);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check terms agreement
    if (!agreedToTerms) {
      alert('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    // Validate all fields
    const isValid = validateForm();
    
    if (isValid) {
      setIsSubmitting(true);
      try {
        // Remove confirmPassword before sending to API
        const { confirmPassword, ...registrationData } = values;
        await onSubmit(registrationData);
      } catch (error) {
        console.error('Registration error:', error);
        // Handle specific errors
        if (error.response?.data?.message) {
          // Set field-specific errors from API
          if (error.response.data.field) {
            setFieldError(error.response.data.field, error.response.data.message);
          }
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form register-form" noValidate>
      <div className="form-header">
        <div className="logo-container">
          <div className="logo-icon">🆘</div>
        </div>
        <h1 className="form-title">Student Coordinator Registration</h1>
        <p className="form-subtitle">Create your account to join the student relief network.</p>
      </div>

      <div className="form-body">
        <div className="form-row">
          <Input
            label="Full Name"
            type="text"
            name="fullName"
            value={values.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.fullName ? errors.fullName : ''}
            placeholder="Enter your full name"
            icon={User}
            required
          />

          <Input
            label="University Email"
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
        </div>

        <div className="form-row">
          <Input
            label="Phone Number"
            type="tel"
            name="phoneNumber"
            value={values.phoneNumber}
            onChange={handlePhoneChange}
            onBlur={handleBlur}
            error={touched.phoneNumber ? errors.phoneNumber : ''}
            placeholder="+1 (555) 000-0000"
            icon={Phone}
            required
          />

          <Input
            label="Current Address"
            type="text"
            name="address"
            value={values.address}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.address ? errors.address : ''}
            placeholder="Dorm or Street Address"
            icon={MapPin}
            required
          />
        </div>

        <div className="form-row">
          <div className="password-input-wrapper">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password ? errors.password : ''}
              placeholder="Create a password"
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
            
            {values.password && (
              <div className="password-strength">
                <div className="strength-bar-container">
                  <div 
                    className="strength-bar" 
                    style={{ 
                      width: `${passwordStrength.strength}%`,
                      backgroundColor: passwordStrength.color 
                    }}
                  />
                </div>
                <span 
                  className="strength-label" 
                  style={{ color: passwordStrength.color }}
                >
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>

          <div className="password-input-wrapper">
            <Input
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.confirmPassword ? errors.confirmPassword : ''}
              placeholder="Confirm password"
              icon={Lock}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="terms-checkbox">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              required
            />
            <span>
              I agree to the{' '}
              <a href="/terms" target="_blank" className="link">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" target="_blank" className="link">
                Privacy Policy
              </a>{' '}
              regarding the handling of medical coordination data.
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting || isLoading || !agreedToTerms}
        >
          {isSubmitting || isLoading ? (
            <>
              <span className="spinner"></span>
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>

        <div className="form-footer">
          <p>
            Already have an account?{' '}
            <a href="/login" className="link">
              Login here
            </a>
          </p>
        </div>

        <div className="secure-notice">
          <Lock size={14} />
          <span>Secure SSL Registration</span>
        </div>
      </div>
    </form>
  );
};

export default RegisterForm;