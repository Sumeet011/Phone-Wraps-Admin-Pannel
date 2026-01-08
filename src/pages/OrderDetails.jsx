import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const OrderDetails = ({ token }) => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingTracking, setEditingTracking] = useState(false)
  const [trackingLink, setTrackingLink] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [courierPartner, setCourierPartner] = useState('')

  const fetchOrderDetails = async () => {
    if (!token) return

    try {
      setLoading(true)
      const response = await axios.get(
        `${backendUrl}/api/orders/${orderId}`,
        { headers: { token } }
      )

      if (response.data.success) {
        setOrder(response.data.order)
        console.log('📦 Order data:', response.data.order);
        console.log('🎨 Order items:', response.data.order.items);
        console.log('🖼️ Items with customDesign:', response.data.order.items?.filter(i => i.customDesign));
        console.log('🎟️ Applied coupons:', response.data.order.appliedCoupons);
        setTrackingLink(response.data.order.trackingLink || '')
        setTrackingNumber(response.data.order.trackingNumber || '')
        setCourierPartner(response.data.order.courierPartner || '')
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      toast.error('Failed to fetch order details')
    } finally {
      setLoading(false)
    }
  }

  const statusHandler = async (newStatus) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/orders/status`,
        { orderId: order._id, status: newStatus },
        { headers: { token } }
      )

      if (response.data.success) {
        toast.success(`Order status updated to ${newStatus}`)
        await fetchOrderDetails()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const updateTrackingInfo = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/orders/tracking`,
        {
          orderId: order._id,
          trackingLink,
          trackingNumber,
          courierPartner,
        },
        { headers: { token } }
      )

      if (response.data.success) {
        toast.success('Tracking information updated successfully')
        setEditingTracking(false)
        await fetchOrderDetails()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Error updating tracking:', error)
      toast.error('Failed to update tracking information')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Confirmed: 'bg-blue-100 text-blue-800',
      Processing: 'bg-purple-100 text-purple-800',
      Shipped: 'bg-indigo-100 text-indigo-800',
      'Out for Delivery': 'bg-cyan-100 text-cyan-800',
      Delivered: 'bg-green-100 text-green-800',
      Cancelled: 'bg-red-100 text-red-800',
      Refunded: 'bg-gray-100 text-gray-800',
      Failed: 'bg-red-200 text-red-900',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPaymentStatusColor = (status) => {
    const colors = {
      Paid: 'bg-green-100 text-green-800',
      Pending: 'bg-yellow-100 text-yellow-800',
      Failed: 'bg-red-100 text-red-800',
      Refunded: 'bg-blue-100 text-blue-800',
      'Partially Refunded': 'bg-orange-100 text-orange-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  useEffect(() => {
    fetchOrderDetails()
  }, [orderId, token])

  // Force reload on component mount to ensure fresh data
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchOrderDetails()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [orderId, token])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-600">Loading order details...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="text-xl text-gray-600 mb-4">Order not found</div>
        <button
          onClick={() => navigate('/orders')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Orders
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <button
            onClick={() => navigate('/orders')}
            className="mb-2 text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Orders
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            Order Details - {order.orderNumber || `#${order._id.slice(-8)}`}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Order ID: {order.orderId || order._id}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Order Date</p>
          <p className="font-semibold">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Items & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Order Items</h2>
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div key={index} className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50">
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    {(() => {
                      // Priority 1: Individual product image first (for gaming collection cards)
                      const imageUrl = item.image || 
                                      item.customDesign?.designImageUrl || 
                                      item.customDesign?.originalImageUrl || 
                                      item.productImage ||
                                      item.collectionImage || 
                                      // Priority 2: Fallback to populated references
                                      item.productId?.images?.[0] ||
                                      item.productId?.image ||
                                      item.collectionId?.heroImage;
                      
                      return imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.productName || item.name || item.productId?.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/100?text=No+Image'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {item.productName || item.name || item.productId?.name || 'Custom Design'}
                    </h3>
                    {item.itemType === 'custom-design' && (
                      <div className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded mt-1">
                        Custom Design
                      </div>
                    )}
                    {(item.selectedBrand || item.selectedModel) && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Phone:</span> {item.selectedBrand} {item.selectedModel}
                      </p>
                    )}
                    {item.phoneModel && !item.selectedBrand && !item.selectedModel && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Phone Model:</span> {item.phoneModel}
                      </p>
                    )}
                    {/* Display type based on collection or item type */}
                    {item.collectionId?.type === 'gaming' ? (
                      <>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Type:</span> Gaming Collection
                        </p>
                        {item.level && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Level:</span> {item.level}
                          </p>
                        )}
                      </>
                    ) : item.itemType === 'suggested' ? (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Type:</span> Suggested Product
                      </p>
                    ) : item.itemType === 'collection' ? (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Type:</span> Collection Product
                      </p>
                    ) : item.itemType === 'product' ? (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Type:</span> Product
                      </p>
                    ) : item.itemType && item.itemType !== 'custom-design' ? (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Type:</span> {item.itemType}
                      </p>
                    ) : null}
                    {(item.collectionId?.name || item.collectionName) && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Collection:</span> {item.collectionId?.name || item.collectionName}
                      </p>
                    )}
                    {item.customDesign?.designImageUrl && (
                      <a
                        href={item.customDesign.designImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline block mt-1"
                      >
                        View Full Design →
                      </a>
                      
                    )}
                    {item.customDesign?.originalImageUrl && (
                    <a
                        href={item.customDesign.originalImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline block mt-1"
                      >
                        View Only Design →
                      </a>
                      )}
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Quantity: <span className="font-semibold">{item.quantity}</span>
                      </span>
                      <span className="font-semibold text-gray-800">
                        ₹{item.price} × {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Plates Section - Separate from Items */}
            {order.plates && order.plates.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3 text-blue-600">🎴 Gaming Collection Plates</h3>
                <div className="space-y-4">
                  {order.plates.map((plate, index) => (
                    <div key={index} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <div className="flex items-start gap-4">
                        {plate.collectionImage && (
                          <img
                            src={plate.collectionImage}
                            alt={plate.collectionName}
                            className="w-20 h-20 object-cover rounded-md border border-blue-300"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 text-lg">{plate.collectionName}</h4>
                          <p className="text-sm text-gray-600 mt-1">Gaming Collection Plates</p>
                          <div className="mt-2 flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Quantity: <span className="font-semibold">{plate.quantity}</span>
                            </span>
                            <span className="font-semibold text-gray-800">
                              ₹{plate.pricePerPlate} × {plate.quantity} = ₹{plate.totalPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="mt-6 pt-4 border-t">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>₹{order.subtotal || 0}</span>
                </div>
                
                {/* Display applied coupons array */}
                {order.appliedCoupons && order.appliedCoupons.length > 0 && (
                  <div className="space-y-1">
                    {order.appliedCoupons.map((coupon, index) => (
                      <div key={index} className="flex justify-between text-green-600">
                        <span>Coupon ({coupon.code}) - {coupon.discountPercentage}% off:</span>
                        <span>- ₹{coupon.discountAmount || 0}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Legacy coupon support */}
                {order.couponCode && (!order.appliedCoupons || order.appliedCoupons.length === 0) && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Applied ({order.couponCode}):</span>
                    <span>- ₹{order.couponDiscount || order.discount || 0}</span>
                  </div>
                )}
                
                {/* Generic discount without coupon */}
                {order.discount > 0 && !order.couponCode && (!order.appliedCoupons || order.appliedCoupons.length === 0) && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>- ₹{order.discount}</span>
                  </div>
                )}
                {order.shippingCost > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping:</span>
                    <span>+ ₹{order.shippingCost}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t">
                  <span>Total Amount:</span>
                  <span>₹{order.totalAmount || order.amount || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Customer Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold text-gray-800">
                  {order.shippingAddress?.fullName ||
                    `${order.address?.firstName || ''} ${order.address?.lastName || ''}`.trim()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-800">
                  {order.shippingAddress?.email || order.userId?.email || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold text-gray-800">
                  {order.shippingAddress?.phoneNumber || order.address?.phone || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Shipping Address</p>
                <p className="font-semibold text-gray-800">
                  {order.shippingAddress?.addressLine1 || order.address?.street}
                  {order.shippingAddress?.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                  <br />
                  {order.shippingAddress?.city || order.address?.city},{' '}
                  {order.shippingAddress?.state || order.address?.state} -{' '}
                  {order.shippingAddress?.zipCode || order.address?.zipcode}
                  <br />
                  {order.shippingAddress?.country || 'India'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Status & Actions */}
        <div className="space-y-6">
          {/* Order Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Order Status</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Current Status</p>
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Update Status</p>
                <select
                  onChange={(e) => statusHandler(e.target.value)}
                  value={order.status}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Payment Info</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-semibold text-gray-800">{order.paymentMethod || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getPaymentStatusColor(
                    order.paymentStatus
                  )}`}
                >
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Return Request Section */}
          {order.returnRequest?.isRequested && (
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-orange-500">
              <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <span>🔄</span> Return Request
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    order.returnRequest.status === 'Pending' ? 'bg-orange-100 text-orange-800' :
                    order.returnRequest.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                    order.returnRequest.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {order.returnRequest.status}
                  </span>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Requested On</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(order.returnRequest.requestedAt).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Items to Return</p>
                  <div className="space-y-2">
                    {/* Returned products */}
                    {order.returnRequest.items?.map((item, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="font-semibold text-sm text-gray-800">{item.productName}</p>
                        <p className="text-xs text-gray-600">{item.phoneModel}</p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                          <p className="text-xs text-gray-600 font-semibold">Reason:</p>
                          <p className="text-xs text-gray-800">{item.reason}</p>
                        </div>
                      </div>
                    ))}
                    {/* Returned plates */}
                    {order.returnRequest.plates?.map((plate, idx) => (
                      <div key={`plate-${idx}`} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="font-semibold text-sm text-blue-800">🎴 {plate.collectionName} Plate</p>
                        <p className="text-xs text-gray-600">Qty: {plate.quantity}</p>
                        <div className="mt-2 p-2 bg-yellow-100 rounded border border-yellow-300">
                          <p className="text-xs text-blue-700 font-semibold">Reason:</p>
                          <p className="text-xs text-gray-800">{plate.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {order.returnRequest.adminNote && (
                  <div>
                    <p className="text-sm text-gray-600">Admin Note</p>
                    <p className="text-sm text-gray-800 bg-blue-50 p-2 rounded">
                      {order.returnRequest.adminNote}
                    </p>
                  </div>
                )}

                {order.returnRequest.status === 'Pending' && (
                  <div className="pt-3 border-t space-y-2">
                    <button
                      onClick={async () => {
                        const adminNote = prompt('Enter admin note (optional):');
                        try {
                          const response = await axios.post(
                            `${backendUrl}/api/orders/return-status`,
                            { 
                              orderId: order._id, 
                              status: 'Approved',
                              adminNote: adminNote || ''
                            },
                            { headers: { token } }
                          );
                          if (response.data.success) {
                            toast.success('Return request approved');
                            await fetchOrderDetails();
                          } else {
                            toast.error(response.data.message);
                          }
                        } catch (error) {
                          toast.error('Failed to approve return request');
                        }
                      }}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-semibold transition"
                    >
                      ✓ Approve Return
                    </button>
                    <button
                      onClick={async () => {
                        const adminNote = prompt('Enter reason for rejection:');
                        if (!adminNote) return;
                        try {
                          const response = await axios.post(
                            `${backendUrl}/api/orders/return-status`,
                            { 
                              orderId: order._id, 
                              status: 'Rejected',
                              adminNote
                            },
                            { headers: { token } }
                          );
                          if (response.data.success) {
                            toast.success('Return request rejected');
                            await fetchOrderDetails();
                          } else {
                            toast.error(response.data.message);
                          }
                        } catch (error) {
                          toast.error('Failed to reject return request');
                        }
                      }}
                      className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-semibold transition"
                    >
                      ✗ Reject Return
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tracking Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Tracking Info</h2>
            {!editingTracking ? (
              <div className="space-y-3">
                {order.trackingNumber ? (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Tracking Number</p>
                      <p className="font-semibold text-gray-800">{order.trackingNumber}</p>
                    </div>
                    {order.courierPartner && (
                      <div>
                        <p className="text-sm text-gray-600">Courier Partner</p>
                        <p className="font-semibold text-gray-800">{order.courierPartner}</p>
                      </div>
                    )}
                    {order.trackingLink && (
                      <div>
                        <p className="text-sm text-gray-600">Tracking Link</p>
                        <a
                          href={order.trackingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm break-all"
                        >
                          {order.trackingLink}
                        </a>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">No tracking information available</p>
                )}
                <button
                  onClick={() => setEditingTracking(true)}
                  className="w-full mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  {order.trackingNumber ? 'Update Tracking' : 'Add Tracking'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tracking Number *
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter tracking number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Courier Partner
                  </label>
                  <input
                    type="text"
                    value={courierPartner}
                    onChange={(e) => setCourierPartner(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Blue Dart, DTDC"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tracking Link
                  </label>
                  <input
                    type="url"
                    value={trackingLink}
                    onChange={(e) => setTrackingLink(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={updateTrackingInfo}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingTracking(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetails
