import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
import api from '../utils/api';
import API_ENDPOINTS from '../config/api';
import { STORAGE_KEYS } from '../utils/constants';

const Testimonials = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        quote: '',
        rating: 5,
        isActive: true,
        order: 0,
        image: null
    });
    const [imagePreview, setImagePreview] = useState('');

    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const response = await api.get(API_ENDPOINTS.TESTIMONIALS.LIST, { token });
            if (response.success) {
                setTestimonials(response.data || []);
            }
        } catch (error) {
            toast.error('Error fetching testimonials');
            console.error('Error:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            title: '',
            quote: '',
            rating: 5,
            isActive: true,
            order: 0,
            image: null
        });
        setImagePreview('');
        setShowForm(false);
        setEditMode(false);
        setCurrentId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('title', formData.title);
            submitData.append('quote', formData.quote);
            submitData.append('rating', formData.rating);
            submitData.append('isActive', formData.isActive);
            submitData.append('order', formData.order);
            
            if (formData.image && typeof formData.image !== 'string') {
                submitData.append('image', formData.image);
            }

            let response;
            if (editMode) {
                response = await api.put(
                    API_ENDPOINTS.TESTIMONIALS.UPDATE(currentId),
                    submitData,
                    { token, isFormData: true }
                );
            } else {
                response = await api.post(
                    API_ENDPOINTS.TESTIMONIALS.CREATE,
                    submitData,
                    { token, isFormData: true }
                );
            }

            if (response.success) {
                toast.success(`Testimonial ${editMode ? 'updated' : 'created'} successfully`);
                resetForm();
                fetchTestimonials();
            }
        } catch (error) {
            toast.error(`Error ${editMode ? 'updating' : 'creating'} testimonial`);
            console.error('Error:', error);
        }
    };

    const handleEdit = (testimonial) => {
        setEditMode(true);
        setCurrentId(testimonial._id);
        setFormData({
            name: testimonial.name,
            title: testimonial.title,
            quote: testimonial.quote,
            rating: testimonial.rating,
            isActive: testimonial.isActive,
            order: testimonial.order,
            image: testimonial.image
        });
        setImagePreview(testimonial.image || '');
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this testimonial?')) {
            try {
                const response = await api.delete(
                    API_ENDPOINTS.TESTIMONIALS.DELETE(id),
                    { token }
                );
                if (response.success) {
                    toast.success('Testimonial deleted successfully');
                    fetchTestimonials();
                }
            } catch (error) {
                toast.error('Error deleting testimonial');
                console.error('Error:', error);
            }
        }
    };

    const handleToggleActive = async (id) => {
        try {
            const response = await api.patch(
                API_ENDPOINTS.TESTIMONIALS.TOGGLE_ACTIVE(id),
                {},
                { token }
            );
            if (response.success) {
                toast.success('Status updated successfully');
                fetchTestimonials();
            }
        } catch (error) {
            toast.error('Error updating status');
            console.error('Error:', error);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Customer Testimonials</h1>
                <button
                    onClick={() => {
                        if (showForm) {
                            resetForm();
                        } else {
                            setShowForm(true);
                        }
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    {showForm ? 'Cancel' : 'Add New Testimonial'}
                </button>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-xl font-semibold mb-4">
                        {editMode ? 'Edit Testimonial' : 'Add New Testimonial'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Customer Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Title/Designation *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    placeholder="e.g., Verified Customer, Happy Client"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Testimonial Quote *</label>
                            <textarea
                                name="quote"
                                value={formData.quote}
                                onChange={handleInputChange}
                                rows="4"
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                placeholder="Enter customer testimonial..."
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Rating</label>
                                <select
                                    name="rating"
                                    value={formData.rating}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                >
                                    <option value="5">5 Stars</option>
                                    <option value="4">4 Stars</option>
                                    <option value="3">3 Stars</option>
                                    <option value="2">2 Stars</option>
                                    <option value="1">1 Star</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Order/Position</label>
                                <input
                                    type="number"
                                    name="order"
                                    value={formData.order}
                                    onChange={handleInputChange}
                                    min="0"
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                />
                            </div>
                            <div className="flex items-center mt-6">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleInputChange}
                                    className="mr-2"
                                    id="isActive"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium">Active</label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Customer Image (Optional)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                            {imagePreview && (
                                <div className="mt-2">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-20 h-20 object-cover rounded-full"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                            >
                                {editMode ? 'Update' : 'Create'} Testimonial
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Testimonials List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Image
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Title
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quote
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rating
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {testimonials.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                                        No testimonials found. Add your first testimonial!
                                    </td>
                                </tr>
                            ) : (
                                testimonials.map((testimonial) => (
                                    <tr key={testimonial._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {testimonial.image ? (
                                                <img
                                                    src={testimonial.image}
                                                    alt={testimonial.name}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <span className="text-gray-500 text-xs">No Image</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {testimonial.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600">
                                                {testimonial.title}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600 max-w-xs truncate">
                                                {testimonial.quote}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className="text-yellow-500">{'★'.repeat(testimonial.rating)}</span>
                                                <span className="text-gray-300">{'★'.repeat(5 - testimonial.rating)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600">{testimonial.order}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggleActive(testimonial._id)}
                                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    testimonial.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {testimonial.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(testimonial)}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(testimonial._id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Testimonials;
