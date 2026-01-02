/**
 * Environment configuration
 */

const config = {
  backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000',
  environment: import.meta.env.VITE_ENV || import.meta.env.MODE,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Validate required environment variables
if (!config.backendUrl) {
  console.error('VITE_BACKEND_URL is not defined in environment variables');
}

export default config;
