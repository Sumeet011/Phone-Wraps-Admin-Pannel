import { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import PropTypes from 'prop-types'

const Orders = ({ token }) => {

  const [orders, setOrders] = useState([])
  const [expandedOrderId, setExpandedOrderId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingTracking, setEditingTracking] = useState(null)
  const [trackingLink, setTrackingLink] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [courierPartner, setCourierPartner] = useState('')

  const fetchAllOrders = async () => {
    if (!token) {
      return null;
    }

    try {
      setLoading(true)
      const response = await axios.post(backendUrl + '/api/orders/list', {}, { headers: { token } })
      
      if (response.data.success) {
        setOrders(response.data.orders || [])
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error(error.message || 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const statusHandler = async (event, orderId) => {
    try {
      const newStatus = event.target.value
      const response = await axios.post(
        backendUrl + '/api/orders/status', 
        { orderId, status: newStatus }, 
        { headers: { token } }
      );
      
      if (response.data.success) {
        toast.success(`Order status updated to ${newStatus}`)
        await fetchAllOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const updateTrackingInfo = async (orderId) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/orders/tracking',
        { 
          orderId, 
          trackingLink,
          trackingNumber,
          courierPartner
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Tracking information updated successfully');
        setEditingTracking(null);
        setTrackingLink('');
        setTrackingNumber('');
        setCourierPartner('');
        await fetchAllOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error updating tracking:', error);
      toast.error(error.response?.data?.message || "Failed to update tracking information");
    }
  };

  const openTrackingModal = (order) => {
    setEditingTracking(order._id);
    setTrackingLink(order.trackingLink || '');
    setTrackingNumber(order.trackingNumber || '');
    setCourierPartner(order.courierPartner || '');
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token])

  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const deleteOrder = async (orderId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      const response = await axios.post(
        backendUrl + '/api/orders/delete',
        { orderId },
        { headers: { token } }
      );
      
      if (response.data.success) {
        toast.success('Order deleted successfully');
        await fetchAllOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error(error.response?.data?.message || "Failed to delete order");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Confirmed': 'bg-blue-100 text-blue-800',
      'Processing': 'bg-indigo-100 text-indigo-800',
      'Shipped': 'bg-purple-100 text-purple-800',
      'Out for Delivery': 'bg-orange-100 text-orange-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'Refunded': 'bg-gray-100 text-gray-800',
      'Failed': 'bg-red-200 text-red-900'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'Paid': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Failed': 'bg-red-100 text-red-800',
      'Refunded': 'bg-blue-100 text-blue-800',
      'Partially Refunded': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Orders Management</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Total Orders: {orders.length}</span>
          <button 
            onClick={fetchAllOrders}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-500">Loading orders...</div>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-500">No orders found</div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              className="border-2 border-gray-200 rounded-lg p-5 hover:shadow-lg transition cursor-pointer bg-white"
              key={order._id}
              onClick={() => toggleExpand(order._id)}
            >
              {/* Order Header */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                {/* Order Icon & Number */}
                <div className="flex items-start gap-3">
                  <img className="w-12 h-12" src={assets.parcel_icon} alt="Order" />
                  <div>
                    <p className="font-bold text-sm text-gray-800">
                      {order.orderNumber || `#${order._id.slice(-8)}`}
                    </p>
                    <p className="text-xs text-gray-500">{order.orderId || 'N/A'}</p>
                  </div>
                </div>

                {/* Customer & Address Info */}
                <div className="md:col-span-2">
                  <p className="font-semibold text-gray-800 mb-2">
                    {order.shippingAddress?.fullName || 
                     `${order.address?.firstName || ''} ${order.address?.lastName || ''}`.trim()}
                  </p>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{order.shippingAddress?.phoneNumber || order.address?.phone}</p>
                    <p className="text-xs">
                      {order.shippingAddress?.addressLine1 || order.address?.street}, {' '}
                      {order.shippingAddress?.city || order.address?.city}, {' '}
                      {order.shippingAddress?.state || order.address?.state} - {' '}
                      {order.shippingAddress?.zipCode || order.address?.zipcode}
                    </p>
                  </div>
                  <p className="text-xs mt-2">
                    <span className="font-semibold">Items:</span>{' '}
                    {order.items?.map((item, index) => (
                      <span key={index}>
                        {item.productName || item.name} x {item.quantity}
                        {index < order.items.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </p>
                </div>

                {/* Order Details */}
                <div className="text-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <p className="text-xs">
                    <span className="font-semibold">Payment:</span> {order.paymentMethod}
                  </p>
                  <p className="text-xs">
                    <span className="font-semibold">Date:</span> {formatDate(order.createdAt)}
                  </p>
                  {order.trackingNumber && (
                    <p className="text-xs">
                      <span className="font-semibold">Tracking:</span> {order.trackingNumber}
                    </p>
                  )}
                </div>

                {/* Amount & Actions */}
                <div className="flex flex-col gap-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="text-xl font-bold text-gray-800">₹{order.totalAmount || order.amount}</p>
                    {order.discount > 0 && (
                      <p className="text-xs text-green-600">Discount: ₹{order.discount}</p>
                    )}
                  </div>
                  
                  <select
                    onChange={(event) => statusHandler(event, order._id)}
                    value={order.status}
                    className="p-2 text-sm font-semibold bg-gray-50 border-2 border-gray-300 rounded-md hover:border-blue-400 focus:border-blue-500 focus:outline-none"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  <button
                    className="bg-green-500 text-white text-sm px-3 py-2 rounded hover:bg-green-600 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      openTrackingModal(order);
                    }}
                  >
                    📦 Add Tracking
                  </button>

                  {(order.status === 'Delivered' || order.status === 'Cancelled') && (
                    <button
                      className="bg-red-500 text-white text-sm px-3 py-2 rounded hover:bg-red-600 transition"
                      onClick={(e) => deleteOrder(order._id, e)}
                    >
                      Delete Order
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedOrderId === order._id && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Order Items - Grouped View */}
                    <div>
                      <h4 className="font-bold text-base mb-3 text-gray-800">Order Items Details</h4>
                      
                      {/* Summary Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">
                            {order.items?.length || 0}
                          </p>
                          <p className="text-xs text-gray-600">Total Items</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">
                            {[...new Set(order.items?.map(item => item.collectionId || item.collectionName))].filter(Boolean).length || 0}
                          </p>
                          <p className="text-xs text-gray-600">Collections</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">
                            {[...new Set(order.items?.map(item => item.phoneModel))].filter(Boolean).length || 0}
                          </p>
                          <p className="text-xs text-gray-600">Phone Models</p>
                        </div>
                      </div>

                      {/* Group by Phone Model */}
                      {(() => {
                        const groupedByModel = {};
                        order.items?.forEach(item => {
                          const model = item.phoneModel || 'No Model Specified';
                          if (!groupedByModel[model]) {
                            groupedByModel[model] = [];
                          }
                          groupedByModel[model].push(item);
                        });

                        return Object.entries(groupedByModel).map(([model, items], modelIndex) => (
                          <div key={modelIndex} className="mb-4">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-2 rounded-t-lg font-semibold text-sm flex justify-between items-center">
                              <span>📱 {model}</span>
                              <span className="bg-white text-indigo-600 px-2 py-1 rounded-full text-xs">
                                {items.length} item{items.length > 1 ? 's' : ''}
                              </span>
                            </div>
                            
                            {/* Group by Collection within each Model */}
                            {(() => {
                              const groupedByCollection = {};
                              items.forEach(item => {
                                const collection = item.collectionName || 'No Collection';
                                if (!groupedByCollection[collection]) {
                                  groupedByCollection[collection] = [];
                                }
                                groupedByCollection[collection].push(item);
                              });

                              return Object.entries(groupedByCollection).map(([collection, collectionItems], collIndex) => (
                                <div key={collIndex} className="border-l-4 border-r border-b border-indigo-200 bg-white">
                                  <div className="bg-indigo-50 px-3 py-2 border-b border-indigo-200">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm font-semibold text-gray-700">
                                        🎨 Collection: {collection}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {collectionItems.length} product{collectionItems.length > 1 ? 's' : ''}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Products in this collection */}
                                  <div className="space-y-2 p-3">
                                    {collectionItems.map((item, itemIndex) => (
                                      <div key={itemIndex} className="p-2 bg-gray-50 rounded border border-gray-200 hover:shadow-md transition">
                                        <div className="flex justify-between items-start">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">
                                                #{itemIndex + 1}
                                              </span>
                                              <p className="font-semibold text-gray-800 text-sm">
                                                {item.productName || item.name}
                                              </p>
                                            </div>
                                            
                                            <div className="text-xs text-gray-600 space-y-0.5 ml-8">
                                              {item.productId && (
                                                <p>
                                                  <span className="font-semibold">Product ID:</span> {item.productId}
                                                </p>
                                              )}
                                              {item.selectedBrand && (
                                                <p>
                                                  <span className="font-semibold">Brand:</span> {item.selectedBrand}
                                                </p>
                                              )}
                                              {item.selectedModel && (
                                                <p>
                                                  <span className="font-semibold">Model:</span> {item.selectedModel}
                                                </p>
                                              )}
                                              {item.size && (
                                                <p>
                                                  <span className="font-semibold">Size:</span> {item.size}
                                                </p>
                                              )}
                                              {item.color && (
                                                <p>
                                                  <span className="font-semibold">Color:</span> {item.color}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                          
                                          <div className="text-right ml-3">
                                            <p className="text-sm font-bold text-gray-800">₹{item.price}</p>
                                            <p className="text-xs text-gray-600 mt-1">Qty: {item.quantity}</p>
                                            <p className="text-xs font-semibold text-green-600 mt-1">
                                              ₹{item.price * item.quantity}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  
                                  {/* Collection Subtotal */}
                                  <div className="bg-indigo-50 px-3 py-2 border-t border-indigo-200">
                                    <div className="flex justify-between items-center text-sm">
                                      <span className="font-semibold text-gray-700">Collection Subtotal:</span>
                                      <span className="font-bold text-indigo-600">
                                        ₹{collectionItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ));
                            })()}
                            
                            {/* Model Total */}
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-2 rounded-b-lg">
                              <div className="flex justify-between items-center font-semibold text-sm">
                                <span>Model Total ({model}):</span>
                                <span>₹{items.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</span>
                              </div>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>

                    {/* Payment & Shipping Info */}
                    <div className="space-y-4">
                      {/* Payment Details */}
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-bold text-base mb-2 text-gray-800">Payment Details</h4>
                        <div className="text-sm space-y-1">
                          <p><span className="font-semibold">Method:</span> {order.paymentMethod}</p>
                          <p><span className="font-semibold">Status:</span> {order.paymentStatus}</p>
                          {order.transactionId && (
                            <p className="text-xs"><span className="font-semibold">Transaction ID:</span> {order.transactionId}</p>
                          )}
                          {order.razorpayPaymentId && (
                            <p className="text-xs"><span className="font-semibold">Razorpay ID:</span> {order.razorpayPaymentId}</p>
                          )}
                        </div>
                      </div>

                      {/* Shipping Details */}
                      {(order.trackingNumber || order.courierPartner || order.trackingLink) && (
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <h4 className="font-bold text-base mb-2 text-gray-800">Shipping Details</h4>
                          <div className="text-sm space-y-1">
                            {order.courierPartner && (
                              <p><span className="font-semibold">Courier:</span> {order.courierPartner}</p>
                            )}
                            {order.trackingNumber && (
                              <p><span className="font-semibold">Tracking:</span> {order.trackingNumber}</p>
                            )}
                            {order.trackingLink && (
                              <p>
                                <span className="font-semibold">Track Order:</span>{' '}
                                <a 
                                  href={order.trackingLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Click to Track
                                </a>
                              </p>
                            )}
                            {order.shippedAt && (
                              <p><span className="font-semibold">Shipped:</span> {formatDate(order.shippedAt)}</p>
                            )}
                            {order.estimatedDelivery && (
                              <p><span className="font-semibold">Est. Delivery:</span> {formatDate(order.estimatedDelivery)}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Order Summary */}
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-bold text-base mb-2 text-gray-800">Order Summary</h4>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span className="font-semibold">₹{order.subtotal || order.amount}</span>
                          </div>
                          {order.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Discount:</span>
                              <span className="font-semibold">-₹{order.discount}</span>
                            </div>
                          )}
                          {order.shippingCost > 0 && (
                            <div className="flex justify-between">
                              <span>Shipping:</span>
                              <span className="font-semibold">₹{order.shippingCost}</span>
                            </div>
                          )}
                          {order.couponCode && (
                            <div className="flex justify-between text-blue-600">
                              <span>Coupon ({order.couponCode}):</span>
                              <span className="font-semibold">-₹{order.couponDiscount || 0}</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-2 border-t border-green-200">
                            <span className="font-bold">Total:</span>
                            <span className="font-bold text-lg">₹{order.totalAmount || order.amount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tracking Modal */}
      {editingTracking && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setEditingTracking(null)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4 text-gray-800">Update Tracking Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Tracking Link</label>
                <input
                  type="url"
                  value={trackingLink}
                  onChange={(e) => setTrackingLink(e.target.value)}
                  placeholder="https://example.com/track/123456"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Enter the full tracking URL from courier</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g., 123456789"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Courier Partner</label>
                <input
                  type="text"
                  value={courierPartner}
                  onChange={(e) => setCourierPartner(e.target.value)}
                  placeholder="e.g., Delhivery, BlueDart, etc."
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button
                  onClick={() => {
                    setEditingTracking(null);
                    setTrackingLink('');
                    setTrackingNumber('');
                    setCourierPartner('');
                  }}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateTrackingInfo(editingTracking)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Save Tracking Info
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

Orders.propTypes = {
  token: PropTypes.string.isRequired,
};

export default Orders
