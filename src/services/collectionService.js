/**
 * Collection Service
 * API calls related to collections
 */

import api from '../utils/api';
import API_ENDPOINTS from '../config/api';

/**
 * Fetch all collections
 * @returns {Promise} Collections list
 */
export const fetchCollections = async () => {
  return await api.get(API_ENDPOINTS.COLLECTIONS.LIST);
};

/**
 * Fetch collection by ID
 * @param {string} id - Collection ID
 * @returns {Promise} Collection data
 */
export const fetchCollectionById = async (id) => {
  return await api.get(API_ENDPOINTS.COLLECTIONS.GET_BY_ID(id));
};

/**
 * Create new collection
 * @param {FormData} formData - Collection form data
 * @param {string} token - Auth token
 * @returns {Promise} Created collection
 */
export const createCollection = async (formData, token) => {
  return await api.post(API_ENDPOINTS.COLLECTIONS.CREATE, formData, {
    token,
    isMultipart: true,
  });
};

/**
 * Update collection
 * @param {string} id - Collection ID
 * @param {FormData} formData - Collection form data
 * @param {string} token - Auth token
 * @returns {Promise} Updated collection
 */
export const updateCollection = async (id, formData, token) => {
  return await api.patch(API_ENDPOINTS.COLLECTIONS.UPDATE(id), formData, {
    token,
    isMultipart: true,
  });
};

/**
 * Delete collection
 * @param {string} id - Collection ID
 * @param {string} token - Auth token
 * @returns {Promise} Delete response
 */
export const deleteCollection = async (id, token) => {
  return await api.delete(API_ENDPOINTS.COLLECTIONS.DELETE(id), { token });
};

/**
 * Add product to collection
 * @param {string} collectionId - Collection ID
 * @param {string} productId - Product ID
 * @param {string} token - Auth token
 * @returns {Promise} Response
 */
export const addProductToCollection = async (collectionId, productId, token) => {
  return await api.post(
    API_ENDPOINTS.COLLECTIONS.ADD_PRODUCT(collectionId),
    { productId },
    { token }
  );
};

/**
 * Remove product from collection
 * @param {string} collectionId - Collection ID
 * @param {string} productId - Product ID
 * @param {string} token - Auth token
 * @returns {Promise} Response
 */
export const removeProductFromCollection = async (collectionId, productId, token) => {
  return await api.delete(API_ENDPOINTS.COLLECTIONS.REMOVE_PRODUCT(collectionId), {
    token,
    data: { productId },
  });
};

export default {
  fetchCollections,
  fetchCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
  addProductToCollection,
  removeProductFromCollection,
};
