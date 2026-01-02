/**
 * Constants used throughout the application
 */

export const APP_NAME = 'PhoneWraps Admin';

export const API_TIMEOUT = 30000; // 30 seconds

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

export const ORDER_STATUSES = [
  'Order Placed',
  'Packing',
  'Shipped',
  'Out for delivery',
  'Delivered'
];

export const PRODUCT_CATEGORIES = [
  'Phone Case',
  'Screen Protector',
  'Accessories'
];

export const MATERIALS = [
  'TPU',
  'Silicone',
  'Hard Plastic',
  'Leather',
  'Metal',
  'Rubber'
];

export const FINISHES = [
  'Matte',
  'Glossy',
  'Transparent',
  'Metallic',
  'Carbon Fiber',
  'Wood Grain'
];

export const DESIGN_TYPES = [
  'Solid Color',
  'Pattern',
  'Custom Print',
  'Transparent',
  'Gradient',
  'Marble',
  'Artistic',
  'Brand Logo'
];

export const TOAST_CONFIG = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const PAGINATION = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100]
};

export default {
  APP_NAME,
  API_TIMEOUT,
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
  ORDER_STATUSES,
  PRODUCT_CATEGORIES,
  MATERIALS,
  FINISHES,
  DESIGN_TYPES,
  TOAST_CONFIG,
  PAGINATION
};
