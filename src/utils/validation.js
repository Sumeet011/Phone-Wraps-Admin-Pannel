/**
 * Validation utilities for form inputs
 */

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 6 characters
  return password && password.length >= 6;
};

export const validateRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined && value !== '';
};

export const validateNumber = (value) => {
  return !isNaN(value) && !isNaN(parseFloat(value));
};

export const validatePositiveNumber = (value) => {
  return validateNumber(value) && parseFloat(value) > 0;
};

export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateHexColor = (hex) => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(hex);
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove potentially dangerous characters
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent XSS
    .substring(0, 10000); // Limit length
};

export const sanitizeHtml = (html) => {
  if (typeof html !== 'string') return html;
  
  // Basic HTML sanitization - for production use a library like DOMPurify
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

export const validateImageFile = (file) => {
  if (!file) return { valid: false, error: 'No file provided' };
  
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, WebP and GIF are allowed.' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 5MB limit.' };
  }
  
  return { valid: true };
};

export const validateFormData = (data, schema) => {
  const errors = {};
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    if (rules.required && !validateRequired(value)) {
      errors[field] = `${rules.label || field} is required`;
      continue;
    }
    
    if (value && rules.type === 'email' && !validateEmail(value)) {
      errors[field] = `${rules.label || field} must be a valid email`;
    }
    
    if (value && rules.type === 'number' && !validateNumber(value)) {
      errors[field] = `${rules.label || field} must be a number`;
    }
    
    if (value && rules.type === 'positive' && !validatePositiveNumber(value)) {
      errors[field] = `${rules.label || field} must be a positive number`;
    }
    
    if (value && rules.type === 'url' && !validateUrl(value)) {
      errors[field] = `${rules.label || field} must be a valid URL`;
    }
    
    if (value && rules.minLength && value.length < rules.minLength) {
      errors[field] = `${rules.label || field} must be at least ${rules.minLength} characters`;
    }
    
    if (value && rules.maxLength && value.length > rules.maxLength) {
      errors[field] = `${rules.label || field} must not exceed ${rules.maxLength} characters`;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
