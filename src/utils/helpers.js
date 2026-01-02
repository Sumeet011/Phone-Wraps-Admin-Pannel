/**
 * Security utilities
 */

/**
 * Debounce function to limit rate of function calls
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function to limit rate of function calls
 */
export const throttle = (func, limit = 1000) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Simple rate limiter for client-side API calls
 */
class RateLimiter {
  constructor(maxCalls = 10, timeWindow = 60000) {
    this.maxCalls = maxCalls;
    this.timeWindow = timeWindow;
    this.calls = [];
  }

  canMakeRequest() {
    const now = Date.now();
    this.calls = this.calls.filter(time => now - time < this.timeWindow);
    
    if (this.calls.length < this.maxCalls) {
      this.calls.push(now);
      return true;
    }
    return false;
  }

  getWaitTime() {
    if (this.calls.length === 0) return 0;
    const oldestCall = this.calls[0];
    const timeElapsed = Date.now() - oldestCall;
    return Math.max(0, this.timeWindow - timeElapsed);
  }
}

export const apiRateLimiter = new RateLimiter(30, 60000); // 30 calls per minute

/**
 * Check if token is expired (basic JWT check)
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 < Date.now() : false;
  } catch {
    return true;
  }
};

/**
 * Safely parse JSON
 */
export const safeJsonParse = (str, fallback = null) => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get file extension
 */
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export default {
  debounce,
  throttle,
  apiRateLimiter,
  isTokenExpired,
  safeJsonParse,
  formatFileSize,
  getFileExtension,
};
