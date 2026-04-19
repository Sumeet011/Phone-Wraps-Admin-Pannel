/**
 * API Utility Functions
 * Centralized API request handling with error management
 */

import axios from 'axios';
import { toast } from 'react-toastify';
import { getApiUrl } from '../config/api';

/**
 * Get auth headers
 * @param {string} token - Authentication token
 * @returns {object} Headers object
 */
const getAuthHeaders = (token) => {
  return {
    token: token,
    'Content-Type': 'application/json',
  };
};

/**
 * Get multipart form headers
 * @param {string} token - Authentication token
 * @returns {object} Headers object
 */
const getMultipartHeaders = (token) => {
  return {
    token: token,
  };
};

/**
 * Handle API errors
 * @param {Error} error - Error object
 * @param {string} defaultMessage - Default error message
 */
const handleApiError = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Server responded with error
    const message = error.response.data?.message || error.response.data?.error || defaultMessage;
    toast.error(message);
    return { success: false, message, error: error.response.data };
  } else if (error.request) {
    // Request made but no response
    const message = 'No response from server. Please check your connection.';
    toast.error(message);
    return { success: false, message };
  } else {
    // Error in request setup
    const message = error.message || defaultMessage;
    toast.error(message);
    return { success: false, message };
  }
};

/**
 * Generic GET request
 * @param {string} endpoint - API endpoint
 * @param {object} options - Request options
 * @returns {Promise} API response
 */
export const apiGet = async (endpoint, options = {}) => {
  try {
    const { token, params } = options;
    const url = getApiUrl(endpoint);
    
    const config = {
      params,
    };
    
    if (token) {
      config.headers = getAuthHeaders(token);
    }
    
    const response = await axios.get(url, config);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch data');
  }
};

/**
 * Generic POST request
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request data
 * @param {object} options - Request options
 * @returns {Promise} API response
 */
export const apiPost = async (endpoint, data = {}, options = {}) => {
  try {
    const { token, isMultipart = false, isFormData = false } = options;
    const url = getApiUrl(endpoint);
    const useMultipart = isMultipart || isFormData;
    
    const config = {};
    
    if (token) {
      config.headers = useMultipart 
        ? getMultipartHeaders(token) 
        : getAuthHeaders(token);
    }
    
    const response = await axios.post(url, data, config);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to save data');
  }
};

/**
 * Generic PUT request
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request data
 * @param {object} options - Request options
 * @returns {Promise} API response
 */
export const apiPut = async (endpoint, data = {}, options = {}) => {
  try {
    const { token, isMultipart = false, isFormData = false } = options;
    const url = getApiUrl(endpoint);
    const useMultipart = isMultipart || isFormData;
    
    const config = {};
    
    if (token) {
      config.headers = useMultipart 
        ? getMultipartHeaders(token) 
        : getAuthHeaders(token);
    }
    
    const response = await axios.put(url, data, config);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to update data');
  }
};

/**
 * Generic PATCH request
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request data
 * @param {object} options - Request options
 * @returns {Promise} API response
 */
export const apiPatch = async (endpoint, data = {}, options = {}) => {
  try {
    const { token, isMultipart = false, isFormData = false } = options;
    const url = getApiUrl(endpoint);
    const useMultipart = isMultipart || isFormData;
    
    const config = {};
    
    if (token) {
      config.headers = useMultipart 
        ? getMultipartHeaders(token) 
        : getAuthHeaders(token);
    }
    
    const response = await axios.patch(url, data, config);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to update data');
  }
};

/**
 * Generic DELETE request
 * @param {string} endpoint - API endpoint
 * @param {object} options - Request options
 * @returns {Promise} API response
 */
export const apiDelete = async (endpoint, options = {}) => {
  try {
    const { token } = options;
    const url = getApiUrl(endpoint);
    
    const config = {};
    
    if (token) {
      config.headers = getAuthHeaders(token);
    }
    
    const response = await axios.delete(url, config);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to delete data');
  }
};

/**
 * Upload file
 * @param {string} endpoint - API endpoint
 * @param {FormData} formData - Form data with file
 * @param {string} token - Authentication token
 * @returns {Promise} API response
 */
export const apiUpload = async (endpoint, formData, token) => {
  try {
    const url = getApiUrl(endpoint);
    
    const config = {
      headers: getMultipartHeaders(token),
    };
    
    const response = await axios.post(url, formData, config);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to upload file');
  }
};

// Export default object with all functions
export default {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
  upload: apiUpload,
};
