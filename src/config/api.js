/**
 * API Configuration
 * Centralized API endpoint definitions for the admin panel
 */

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    ADMIN_LOGIN: '/api/auth/admin',
  },

  // User endpoints
  USERS: {
    GET_ALL: '/api/users/all',
  },

  // Product endpoints
  PRODUCTS: {
    LIST: '/api/products',
    GET_BY_ID: (id) => `/api/products/${id}`,
    CREATE: '/api/products',
    UPDATE: (id) => `/api/products/${id}`,
    DELETE: (id) => `/api/products/${id}`,
  },

  // Collection endpoints
  COLLECTIONS: {
    LIST: '/api/collections',
    GET_BY_ID: (id) => `/api/collections/${id}`,
    CREATE: '/api/collections',
    UPDATE: (id) => `/api/collections/${id}`,
    DELETE: (id) => `/api/collections/${id}`,
    ADD_PRODUCT: (id) => `/api/collections/${id}/products`,
    REMOVE_PRODUCT: (id) => `/api/collections/${id}/products`,
  },

  // Group endpoints
  GROUPS: {
    LIST: '/api/groups',
    GET_BY_ID: (id) => `/api/groups/${id}`,
    CREATE: '/api/groups',
    UPDATE: (id) => `/api/groups/${id}`,
    DELETE: (id) => `/api/groups/${id}`,
  },

  // Order endpoints
  ORDERS: {
    LIST: '/api/orders/list',
    GET_BY_ID: (id) => `/api/orders/${id}`,
    UPDATE_STATUS: '/api/orders/status',
    UPDATE_TRACKING: '/api/orders/tracking',
    CREATE_SHIPMENT: (id) => `/api/orders/${id}/create-shipment`,
    CANCEL_SHIPMENT: (id) => `/api/orders/${id}/cancel-shipment`,
    CANCEL_ORDER: (id) => `/api/orders/${id}/cancel`,
    LEADERBOARD: '/api/orders/leaderboard',
  },

  // Coupon endpoints
  COUPONS: {
    LIST: '/api/coupon/list',
    ADD: '/api/coupon/add',
    REMOVE: (id) => `/api/coupon/remove/${id}`,
    UPDATE: (id) => `/api/coupon/update/${id}`,
    VALIDATE: '/api/coupon/validate',
  },

  // Blog endpoints
  BLOGS: {
    LIST: '/api/blogs',
    GET_BY_ID: (id) => `/api/blogs/${id}`,
    CREATE: '/api/blogs',
    UPDATE: (id) => `/api/blogs/${id}`,
    DELETE: (id) => `/api/blogs/${id}`,
  },

  // Design Asset endpoints
  DESIGN_ASSETS: {
    LIST: '/api/design-assets',
    GET_BY_ID: (id) => `/api/design-assets/${id}`,
    CREATE: '/api/design-assets',
    UPDATE: (id) => `/api/design-assets/${id}`,
    DELETE: (id) => `/api/design-assets/${id}`,
  },

  // Site Settings endpoints
  SITE_SETTINGS: {
    GET: '/api/site-settings',
    UPDATE: '/api/site-settings',
  },

  // Collection Tooltip endpoints
  COLLECTION_TOOLTIPS: {
    LIST: '/api/collection-tooltips',
    GET_BY_ID: (id) => `/api/collection-tooltips/${id}`,
    CREATE: '/api/collection-tooltips',
    UPDATE: (id) => `/api/collection-tooltips/${id}`,
    DELETE: (id) => `/api/collection-tooltips/${id}`,
  },

  // Phone Brand endpoints
  PHONE_BRANDS: {
    LIST: '/api/phone-brands',
    GET_BY_ID: (id) => `/api/phone-brands/${id}`,
    CREATE: '/api/phone-brands',
    UPDATE: (id) => `/api/phone-brands/${id}`,
    DELETE: (id) => `/api/phone-brands/${id}`,
    ADD_MODEL: (id) => `/api/phone-brands/${id}/models`,
    DELETE_MODEL: (id, modelName) => `/api/phone-brands/${id}/models/${encodeURIComponent(modelName)}`,
    TOGGLE_STATUS: (id) => `/api/phone-brands/${id}/toggle-status`,
  },

  // Suggested Product endpoints
  SUGGESTED_PRODUCTS: {
    LIST: '/api/suggested-products',
    GET_BY_ID: (id) => `/api/suggested-products/${id}`,
    CREATE: '/api/suggested-products',
    UPDATE: (id) => `/api/suggested-products/${id}`,
    DELETE: (id) => `/api/suggested-products/${id}`,
  },

  // Featured Home Product endpoints
  FEATURED_HOME_PRODUCTS: {
    LIST: '/api/featured-home-products',
    GET_BY_ID: (id) => `/api/featured-home-products/${id}`,
    CREATE: '/api/featured-home-products',
    UPDATE: (id) => `/api/featured-home-products/${id}`,
    DELETE: (id) => `/api/featured-home-products/${id}`,
  },

  // Testimonial endpoints
  TESTIMONIALS: {
    LIST: '/api/testimonials',
    ACTIVE: '/api/testimonials/active',
    GET_BY_ID: (id) => `/api/testimonials/${id}`,
    CREATE: '/api/testimonials',
    UPDATE: (id) => `/api/testimonials/${id}`,
    DELETE: (id) => `/api/testimonials/${id}`,
    TOGGLE_ACTIVE: (id) => `/api/testimonials/${id}/toggle-active`,
    UPDATE_ORDER: (id) => `/api/testimonials/${id}/order`,
  },

  // Cart endpoints
  CART: {
    GET: '/api/cart',
    ADD: '/api/cart/add',
    UPDATE: '/api/cart/update',
    REMOVE: '/api/cart/remove',
  },

  // Custom Design endpoints
  CUSTOM_DESIGN: {
    LIST: '/api/custom-design',
    GET_BY_ID: (id) => `/api/custom-design/${id}`,
    CREATE: '/api/custom-design',
    UPDATE: (id) => `/api/custom-design/${id}`,
    DELETE: (id) => `/api/custom-design/${id}`,
  },
};

/**
 * Get full API URL
 * @param {string} endpoint - API endpoint
 * @returns {string} Full API URL
 */
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

/**
 * Get backend URL
 * @returns {string} Backend base URL
 */
export const getBackendUrl = () => {
  return API_BASE_URL;
};

export default API_ENDPOINTS;
