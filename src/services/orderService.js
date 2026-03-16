/**
 * Order Service
 * API calls related to orders
 */

import api from '../utils/api';
import API_ENDPOINTS from '../config/api';

/**
 * Fetch all orders
 * @param {string} token - Auth token
 * @returns {Promise} Orders list
 */
export const fetchOrders = async (token) => {
  return await api.post(API_ENDPOINTS.ORDERS.LIST, {}, { token });
};

/**
 * Fetch order by ID
 * @param {string} orderId - Order ID
 * @param {string} token - Auth token
 * @returns {Promise} Order data
 */
export const fetchOrderById = async (orderId, token) => {
  return await api.get(API_ENDPOINTS.ORDERS.GET_BY_ID(orderId), { token });
};

/**
 * Update order status
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 * @param {string} token - Auth token
 * @returns {Promise} Response
 */
export const updateOrderStatus = async (orderId, status, token) => {
  return await api.post(
    API_ENDPOINTS.ORDERS.UPDATE_STATUS,
    { orderId, status },
    { token }
  );
};

/**
 * Update order tracking
 * @param {string} orderId - Order ID
 * @param {object} trackingData - Tracking data
 * @param {string} token - Auth token
 * @returns {Promise} Response
 */
export const updateOrderTracking = async (orderId, trackingData, token) => {
  return await api.post(
    API_ENDPOINTS.ORDERS.UPDATE_TRACKING,
    { orderId, ...trackingData },
    { token }
  );
};

/**
 * Create order shipment
 * @param {string} orderId - Order ID
 * @param {string} token - Auth token
 * @returns {Promise} Response
 */
export const createOrderShipment = async (orderId, token) => {
  return await api.post(API_ENDPOINTS.ORDERS.CREATE_SHIPMENT(orderId), {}, { token });
};

/**
 * Cancel order shipment
 * @param {string} orderId - Order ID
 * @param {string} token - Auth token
 * @returns {Promise} Response
 */
export const cancelOrderShipment = async (orderId, token) => {
  return await api.post(API_ENDPOINTS.ORDERS.CANCEL_SHIPMENT(orderId), {}, { token });
};

/**
 * Cancel order
 * @param {string} orderId - Order ID
 * @param {string} token - Auth token
 * @returns {Promise} Response
 */
export const cancelOrder = async (orderId, token) => {
  return await api.post(API_ENDPOINTS.ORDERS.CANCEL_ORDER(orderId), {}, { token });
};

export default {
  fetchOrders,
  fetchOrderById,
  updateOrderStatus,
  updateOrderTracking,
  createOrderShipment,
  cancelOrderShipment,
  cancelOrder,
};
