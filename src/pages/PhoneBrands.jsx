import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const PhoneBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  
  const [brandForm, setBrandForm] = useState({
    brandName: '',
    models: []
  });

  const [modelForm, setModelForm] = useState({
    modelName: ''
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  // Fetch all brands
  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/phone-brands`);
      if (response.data.success) {
        setBrands(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch phone brands');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // Handle brand form submission
  const handleBrandSubmit = async (e) => {
    e.preventDefault();
    
    if (!brandForm.brandName) {
      toast.error('Brand name is required');
      return;
    }

    try {
      if (editingBrand) {
        // Update existing brand
        const response = await axios.put(
          `${backendUrl}/api/phone-brands/${editingBrand._id}`,
          brandForm
        );
        if (response.data.success) {
          toast.success('Brand updated successfully');
          fetchBrands();
          closeModal();
        }
      } else {
        // Create new brand
        const response = await axios.post(
          `${backendUrl}/api/phone-brands`,
          brandForm
        );
        if (response.data.success) {
          toast.success('Brand created successfully');
          fetchBrands();
          closeModal();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save brand');
      console.error(error);
    }
  };

  // Handle model addition
  const handleAddModel = () => {
    if (!modelForm.modelName) {
      toast.error('Model name is required');
      return;
    }

    setBrandForm({
      ...brandForm,
      models: [...brandForm.models, { ...modelForm }]
    });

    setModelForm({ modelName: '' });
  };

  // Handle model addition to existing brand
  const handleAddModelToExistingBrand = async (e) => {
    e.preventDefault();

    if (!modelForm.modelName) {
      toast.error('Model name is required');
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/phone-brands/${selectedBrand._id}/models`,
        modelForm
      );
      if (response.data.success) {
        toast.success('Model added successfully');
        fetchBrands();
        setShowModelModal(false);
        setModelForm({ modelName: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add model');
      console.error(error);
    }
  };

  // Remove model from form
  const handleRemoveModelFromForm = (index) => {
    setBrandForm({
      ...brandForm,
      models: brandForm.models.filter((_, i) => i !== index)
    });
  };

  // Delete model from existing brand
  const handleDeleteModel = async (brandId, modelName) => {
    if (!confirm('Are you sure you want to delete this model?')) return;

    try {
      const response = await axios.delete(
        `${backendUrl}/api/phone-brands/${brandId}/models/${encodeURIComponent(modelName)}`
      );
      if (response.data.success) {
        toast.success('Model deleted successfully');
        fetchBrands();
      }
    } catch (error) {
      toast.error('Failed to delete model');
      console.error(error);
    }
  };

  // Delete brand
  const handleDeleteBrand = async (id) => {
    if (!confirm('Are you sure you want to delete this brand and all its models?')) return;

    try {
      const response = await axios.delete(`${backendUrl}/api/phone-brands/${id}`);
      if (response.data.success) {
        toast.success('Brand deleted successfully');
        fetchBrands();
      }
    } catch (error) {
      toast.error('Failed to delete brand');
      console.error(error);
    }
  };

  // Toggle brand status
  const handleToggleStatus = async (id) => {
    try {
      const response = await axios.patch(
        `${backendUrl}/api/phone-brands/${id}/toggle-status`
      );
      if (response.data.success) {
        toast.success(response.data.message);
        fetchBrands();
      }
    } catch (error) {
      toast.error('Failed to toggle status');
      console.error(error);
    }
  };

  // Open modal for editing
  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setBrandForm({
      brandName: brand.brandName,
      models: brand.models || []
    });
    setShowModal(true);
  };

  // Open modal for adding new brand
  const handleAddNew = () => {
    setEditingBrand(null);
    setBrandForm({
      brandName: '',
      models: []
    });
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingBrand(null);
    setBrandForm({
      brandName: '',
      models: []
    });
  };

  // Open model modal
  const openModelModal = (brand) => {
    setSelectedBrand(brand);
    setModelForm({ modelName: '' });
    setShowModelModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Phone Brands Management
          </h1>
          <p className="text-gray-600 mt-1">Manage phone brands and their models</p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Brand
        </button>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map((brand) => (
          <div
            key={brand._id}
            className={`bg-white rounded-lg shadow-md p-6 border-2 ${
              brand.isActive ? 'border-green-200' : 'border-gray-200'
            }`}
          >
            {/* Brand Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  {brand.brandName}
                </h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(brand)}
                  className="text-blue-500 hover:text-blue-700"
                  title="Edit Brand"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteBrand(brand._id)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete Brand"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Status Badge */}
            <div className="mb-4">
              <button
                onClick={() => handleToggleStatus(brand._id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  brand.isActive
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {brand.isActive ? 'Active' : 'Inactive'}
              </button>
            </div>

            {/* Models List */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-700">
                  Models ({brand.models?.length || 0})
                </h4>
                <button
                  onClick={() => openModelModal(brand)}
                  className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {brand.models && brand.models.length > 0 ? (
                  brand.models.map((model, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-gray-50 p-2 rounded"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {model.modelName}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteModel(brand._id, model.modelName)}
                        className="text-red-400 hover:text-red-600"
                        title="Delete Model"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic">No models added yet</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Brand Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingBrand ? 'Edit Brand' : 'Add New Brand'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleBrandSubmit} className="p-6">
              {/* Brand Name */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Brand Name *
                </label>
                <input
                  type="text"
                  value={brandForm.brandName}
                  onChange={(e) =>
                    setBrandForm({ ...brandForm, brandName: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Apple, Samsung"
                  required
                />
              </div>

              {/* Add Models Section */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Add Models
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={modelForm.modelName}
                    onChange={(e) =>
                      setModelForm({ modelName: e.target.value })
                    }
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Model name (e.g., iPhone 15 Pro, Galaxy S24)"
                  />
                  <button
                    type="button"
                    onClick={handleAddModel}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {/* Models List */}
                {brandForm.models.length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                    {brandForm.models.map((model, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center bg-gray-50 p-2 rounded mb-2"
                      >
                        <div>
                          <p className="text-sm font-medium">{model.modelName}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveModelFromForm(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {editingBrand ? 'Update Brand' : 'Create Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Model to Existing Brand Modal */}
      {showModelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                Add Model to {selectedBrand?.brandName}
              </h2>
              <button
                onClick={() => setShowModelModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddModelToExistingBrand} className="p-6">
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Model Name *
                </label>
                <input
                  type="text"
                  value={modelForm.modelName}
                  onChange={(e) =>
                    setModelForm({ modelName: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., iPhone 15 Pro, Galaxy S24"
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModelModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                >
                  Add Model
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneBrands;
