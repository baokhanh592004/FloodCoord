// Email vaidation with comprehensive regex
export const validateEmail = (email) => {
    if (!email) { 
        return 'Email is required';
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
        return 'Please enter a valid email address';
    }

    return '';
};

// Password validation with strength requirements
export const validatePassword = (password, fieldName = 'Password') => {
    if (!password) {
        return `${fieldName} is required`
    }

    if (password.length < 6) {
        return `${fieldName} must be at least 6 characters long`;
    }

    if (password.length > 128) {
        return `${fieldName} must not exceed 128 characters`;
    }   

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
        return `${fieldName} must contain at least one uppercase letter`;
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
        return `${fieldName} must contain at least one lowercase letter`;
    }

    // Check for at least one number
    if (!/\d/.test(password)) {
        return `${fieldName} must contain at least one number`;
    }

    // Check for at least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return `${fieldName} must contain at least one special character`;
    }

    return '';
};

// Confirm password validation
export const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) {
        return 'Please confirm your password';
    }

    if (password !== confirmPassword) {
        return 'Passwords do not match';
    }

    return '';
};

// Full name validation
export const validateFullName = (name) => {
    if (!name) {
        return 'Full name is required';
    }

    if (name.trim().length < 2) {
        return 'Full name must be at least 2 characters';
    }

    if (name.trim().length > 50) {
        return 'Full name must not exceed 50 characters';
    }

    return '';
};

// Phone number validation
export const validatePhoneNumber = (phone) => {
    if (!phone) {
        return 'Phone number is required';
    }

    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');

    if (digitsOnly.length < 10 || digitsOnly.length > 11) {
        return 'Please enter a valid phone number (10 to 11 digits)';
    }

    return '';
};

// Address validation
export const validateAddress = (address) => {
    return '';
}

// Generic required field validation
export const validateRequired = (value, fielldName) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
        return `${fieldName} is required`;
    }
    return '';
};

// Password strength calculator
export const getPasswordStrength = (password) => {
    if (!password) {
        return {strength: 0, label: 'None', color: '#e0e0e0'};
    }

    let strength = 0;

    // Length check
    if (password.length >= 6) strength += 2;
    if (password.length >= 12) strength += 1;
    if (password.length >= 18) strength += 1;

    // Character variety 
    if (/[a-z]/.test(password)) strength += 1.5;
    if (/[A-Z]/.test(password)) strength += 1.5;
    if (/\d/.test(password)) strength += 1.5;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1.5;

    // Get label and color
    if (strength < 4) return {strength, label: 'Weak', color: '#f44336'};
    if (strength < 7) return {strength, label: 'Medium', color: '#ff9800'};
    return {strength, label: 'Strong', color: '#4caf50'};
};

// Format phone number for display
export const formatPhoneNumber = (value) => {
  const digits = value.replace(/\D/g, '');
  
  function formatVNPhone(value) {
  // normalize:
  // 0xxxxxxxxx  -> 84xxxxxxxxx
  if (digits.startsWith('0')) {
    digits = '84' + digits.slice(1);
  }

  // if user typed 84 directly, keep it
  if (!digits.startsWith('84')) {
    return digits; // still typing / incomplete
  }

  // remove country code for formatting
  const local = digits.slice(2); // 9 digits max

  if (local.length <= 3) return `+84 ${local}`;
  if (local.length <= 6) return `+84 ${local.slice(0, 3)} ${local.slice(3)}`;
  if (local.length <= 9)
    return `+84 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;

  // cap at 9 local digits
  return `+84 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6, 9)}`;
}  

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4)}`;
  if (digits.length <= 10) return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  
  return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 11)}`;
};