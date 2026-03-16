/**
 * Application Constants
 * Centralized constants for the admin panel
 */

// Currency symbol
export const CURRENCY = '₹';

// Order statuses
export const ORDER_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURNED: 'Returned',
};

// Product categories
export const PRODUCT_CATEGORIES = {
  PHONE_CASE: 'Phone Case',
  SCREEN_PROTECTOR: 'Screen Protector',
  CHARGER: 'Charger',
  CABLE: 'Cable',
  EARPHONES: 'Earphones',
  POWER_BANK: 'Power Bank',
  HOLDER: 'Holder',
};

// Material types
export const MATERIALS = {
  TPU: 'TPU',
  SILICONE: 'Silicone',
  HARD_PLASTIC: 'Hard Plastic',
  LEATHER: 'Leather',
  METAL: 'Metal',
};

// Finish types
export const FINISHES = {
  MATTE: 'Matte',
  GLOSSY: 'Glossy',
  METALLIC: 'Metallic',
  TEXTURED: 'Textured',
};

// Design types
export const DESIGN_TYPES = {
  SOLID_COLOR: 'Solid Color',
  GRADIENT: 'Gradient',
  PATTERN: 'Pattern',
  CHARACTER: 'Character',
  LOGO: 'Logo',
  CUSTOM: 'Custom',
};

// Product types
export const PRODUCT_TYPES = {
  GAMING: 'gaming',
  STANDARD: 'Standard',
};

// Design asset categories
export const DESIGN_ASSET_CATEGORIES = {
  HERO: 'HERO',
  CIRCULAR: 'CIRCULAR',
  CARD: 'CARD',
};

// Blog statuses
export const BLOG_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
};

// Blog categories
export const BLOG_CATEGORIES = [
  'General',
  'Technology',
  'Design',
  'Gaming',
  'Trends',
  'Tips & Tricks',
  'News',
];

// Content block types for blogs
export const CONTENT_BLOCK_TYPES = {
  HEADING: 'heading',
  PARAGRAPH: 'paragraph',
  IMAGE: 'image',
  LIST: 'list',
  QUOTE: 'quote',
  CODE: 'code',
};

// Product levels
export const PRODUCT_LEVELS = ['1', '2', '3', '4', '5'];

// Pagination
export const ITEMS_PER_PAGE = 10;

// Toast duration
export const TOAST_DURATION = 3000;

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  IMAGE: 10 * 1024 * 1024, // 10MB
  BLOG_IMAGE: 5 * 1024 * 1024, // 5MB
};

// Allowed image formats
export const ALLOWED_IMAGE_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
};

// API timeout
export const API_TIMEOUT = 30000; // 30 seconds

// Debounce delay for search
export const SEARCH_DEBOUNCE_DELAY = 500; // milliseconds

export default {
  CURRENCY,
  ORDER_STATUS,
  PRODUCT_CATEGORIES,
  MATERIALS,
  FINISHES,
  DESIGN_TYPES,
  PRODUCT_TYPES,
  DESIGN_ASSET_CATEGORIES,
  BLOG_STATUS,
  BLOG_CATEGORIES,
  CONTENT_BLOCK_TYPES,
  PRODUCT_LEVELS,
  ITEMS_PER_PAGE,
  TOAST_DURATION,
  FILE_SIZE_LIMITS,
  ALLOWED_IMAGE_FORMATS,
  STORAGE_KEYS,
  API_TIMEOUT,
  SEARCH_DEBOUNCE_DELAY,
};
