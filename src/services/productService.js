/**
 * Product Service
 * API calls related to products
 */

import api from './api';
import API_ENDPOINTS from '../config/api';

/**
 * Fetch all products
 * @returns {Promise} Products list
 */
export const fetchProducts = async () => {
  return await api.get(API_ENDPOINTS.PRODUCTS.LIST);
};

/**
 * Fetch product by ID
 * @param {string} id - Product ID
 * @returns {Promise} Product data
 */
export const fetchProductById = async (id) => {
  return await api.get(API_ENDPOINTS.PRODUCTS.GET_BY_ID(id));
};

/**
 * Create new product
 * @param {FormData} formData - Product form data
 * @param {string} token - Auth token
 * @returns {Promise} Created product
 */
export const createProduct = async (formData, token) => {
  return await api.post(API_ENDPOINTS.PRODUCTS.CREATE, formData, {
    token,
    isMultipart: true,
  });
};

/**
 * Update product
 * @param {string} id - Product ID
 * @param {FormData} formData - Product form data
 * @param {string} token - Auth token
 * @returns {Promise} Updated product
 */
export const updateProduct = async (id, formData, token) => {
  return await api.patch(API_ENDPOINTS.PRODUCTS.UPDATE(id), formData, {
    token,
    isMultipart: true,
  });
};

/**
 * Delete product
 * @param {string} id - Product ID
 * @param {string} token - Auth token
 * @returns {Promise} Delete response
 */
export const deleteProduct = async (id, token) => {
  return await api.delete(API_ENDPOINTS.PRODUCTS.DELETE(id), { token });
};

export default {
  fetchProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
