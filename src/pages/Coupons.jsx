import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
import { backendUrl } from '../App.jsx';

const Coupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        discountPercentage: '',
        minimumAmount: '',
        expiryDate: '',
        maxUsage: ''
    });

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/coupon/list`, {
                headers: { token }
            });
            if (response.data.success) {
                setCoupons(response.data.coupons);
            }
        } catch (error) {
            console.error('Error fetching coupons:', error);
            toast.error('Failed to fetch coupons');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${backendUrl}/api/coupon/add`, formData, {
                headers: { token }
            });
            if (response.data.success) {
                toast.success('Coupon added successfully');
                setShowAddForm(false);
                setFormData({
                    code: '',
                    discountPercentage: '',
                    minimumAmount: '',
                    expiryDate: '',
                    maxUsage: ''
                });
                fetchCoupons();
            }
        } catch (error) {
            console.error('Error adding coupon:', error);
            toast.error(error.response?.data?.message || 'Failed to add coupon');
        }
    };

    const handleDelete = async (couponId) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            try {
                const response = await axios.delete(`${backendUrl}/api/coupon/remove/${couponId}`, {
                    headers: { token }
                });
                if (response.data.success) {
                    toast.success('Coupon deleted successfully');
                    fetchCoupons();
                }
            } catch (error) {
                console.error('Error deleting coupon:', error);
                toast.error('Failed to delete coupon');
            }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Coupon Management</h1>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    {showAddForm ? 'Cancel' : 'Add New Coupon'}
                </button>
            </div>

            {/* Add Coupon Form */}
            {showAddForm && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-xl font-semibold mb-4">Add New Coupon</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Coupon Code</label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Discount Percentage</label>
                            <input
                                type="number"
                                name="discountPercentage"
                                value={formData.discountPercentage}
                                onChange={handleInputChange}
                                min="1"
                                max="100"
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Minimum Amount</label>
                            <input
                                type="number"
                                name="minimumAmount"
                                value={formData.minimumAmount}
                                onChange={handleInputChange}
                                min="0"
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Expiry Date</label>
                            <input
                                type="date"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Max Usage</label>
                            <input
                                type="number"
                                name="maxUsage"
                                value={formData.maxUsage}
                                onChange={handleInputChange}
                                min="1"
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                            >
                                Add Coupon
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Coupons List */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Active Coupons</h2>
                    {coupons.length === 0 ? (
                        <p className="text-gray-500">No coupons found</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Code</th>
                                        <th className="text-left py-2">Discount</th>
                                        <th className="text-left py-2">Min Amount</th>
                                        <th className="text-left py-2">Usage</th>
                                        <th className="text-left py-2">Expiry</th>
                                        <th className="text-left py-2">Status</th>
                                        <th className="text-left py-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {coupons.map((coupon) => (
                                        <tr key={coupon._id} className="border-b hover:bg-gray-50">
                                            <td className="py-2 font-mono">{coupon.code}</td>
                                            <td className="py-2">{coupon.discountPercentage}%</td>
                                            <td className="py-2">₹{coupon.minimumAmount}</td>
                                            <td className="py-2">{coupon.usedCount}/{coupon.maxUsage}</td>
                                            <td className="py-2">{formatDate(coupon.expiryDate)}</td>
                                            <td className="py-2">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    new Date() > new Date(coupon.expiryDate) 
                                                        ? 'bg-red-100 text-red-800' 
                                                        : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {new Date() > new Date(coupon.expiryDate) ? 'Expired' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="py-2">
                                                <button
                                                    onClick={() => handleDelete(coupon._id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Coupons; 
