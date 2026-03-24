import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { backendUrl } from '../App';
import api from '../utils/api';
import API_ENDPOINTS from '../config/api';

const PhoneBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [showEditModelModal, setShowEditModelModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [editingModel, setEditingModel] = useState(null);
  
  const [brandForm, setBrandForm] = useState({
    brandName: '',
    models: []
  });

  const [modelForm, setModelForm] = useState({
    modelName: '',
    backCoversCount: '',
    aluminumSheetsCount: ''
  });

  const [editModelForm, setEditModelForm] = useState({
    modelName: '',
    backCoversCount: '',
    aluminumSheetsCount: ''
  });

  const parseStockInput = (value) => {
    if (value === '') return '';
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return '';
    return Math.max(0, parsed);
  };

  const toStockNumber = (value) => {
    if (value === '' || value === null || value === undefined) return 0;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
  };

  // Fetch all brands
  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.PHONE_BRANDS.LIST);
      if (response.success) {
        setBrands(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching phone brands:', error);
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
      let response;
      if (editingBrand) {
        // Update existing brand
        response = await api.put(
          API_ENDPOINTS.PHONE_BRANDS.UPDATE(editingBrand._id),
          brandForm
        );
      } else {
        // Create new brand
        response = await api.post(
          API_ENDPOINTS.PHONE_BRANDS.CREATE,
          brandForm
        );
      }
      
      if (response.success) {
        toast.success(editingBrand ? 'Brand updated successfully' : 'Brand created successfully');
        fetchBrands();
        closeModal();
      }
    } catch (error) {
      console.error('Error saving brand:', error);
    }
  };

  // Handle model addition
  const handleAddModel = () => {
    if (!modelForm.modelName) {
      toast.error('Model name is required');
      return;
    }

    const normalizedModel = {
      ...modelForm,
      backCoversCount: toStockNumber(modelForm.backCoversCount),
      aluminumSheetsCount: toStockNumber(modelForm.aluminumSheetsCount)
    };

    setBrandForm({
      ...brandForm,
      models: [...brandForm.models, normalizedModel]
    });

    setModelForm({ 
      modelName: '',
      backCoversCount: '',
      aluminumSheetsCount: ''
    });
  };

  // Handle model addition to existing brand
  const handleAddModelToExistingBrand = async (e) => {
    e.preventDefault();

    if (!modelForm.modelName) {
      toast.error('Model name is required');
      return;
    }

    try {
      const payload = {
        ...modelForm,
        backCoversCount: toStockNumber(modelForm.backCoversCount),
        aluminumSheetsCount: toStockNumber(modelForm.aluminumSheetsCount)
      };

      const response = await axios.post(
        `${backendUrl}/api/phone-brands/${selectedBrand._id}/models`,
        payload
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

  // Open edit model modal
  const handleEditModel = (brand, model) => {
    setSelectedBrand(brand);
    setEditingModel(model);
    setEditModelForm({
      modelName: model.modelName,
      backCoversCount: model.backCoversCount ?? '',
      aluminumSheetsCount: model.aluminumSheetsCount ?? ''
    });
    setShowEditModelModal(true);
  };

  // Handle model update
  const handleUpdateModel = async (e) => {
    e.preventDefault();

    if (!editModelForm.modelName) {
      toast.error('Model name is required');
      return;
    }

    try {
      const payload = {
        ...editModelForm,
        backCoversCount: toStockNumber(editModelForm.backCoversCount),
        aluminumSheetsCount: toStockNumber(editModelForm.aluminumSheetsCount)
      };

      const response = await axios.put(
        `${backendUrl}/api/phone-brands/${selectedBrand._id}/models/${editingModel._id}`,
        payload
      );
      if (response.data.success) {
        toast.success('Model updated successfully');
        fetchBrands();
        setShowEditModelModal(false);
        setEditingModel(null);
        setEditModelForm({ modelName: '', backCoversCount: '', aluminumSheetsCount: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update model');
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
    setModelForm({ 
      modelName: '',
      backCoversCount: '',
      aluminumSheetsCount: ''
    });
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

      {/* Brands List */}
      <div className="space-y-6">
        {brands.map((brand) => (
          <div
            key={brand._id}
            className={`bg-white rounded-lg shadow-md border-2 ${
              brand.isActive ? 'border-green-200' : 'border-gray-200'
            }`}
          >
            {/* Brand Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <h3 className="text-2xl font-bold text-gray-800">{brand.brandName}</h3>
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
              <div className="flex gap-2">
                <button
                  onClick={() => openModelModal(brand)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                  title="Add Model"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Model
                </button>
                <button
                  onClick={() => handleEdit(brand)}
                  className="text-blue-500 hover:text-blue-700 p-2"
                  title="Edit Brand"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteBrand(brand._id)}
                  className="text-red-500 hover:text-red-700 p-2"
                  title="Delete Brand"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Models Table */}
            {brand.models && brand.models.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Model</th>
                      <th className="px-6 py-3 text-center text-sm font-bold text-gray-700">Cover Count</th>
                      <th className="px-6 py-3 text-center text-sm font-bold text-gray-700">Plates Count</th>
                      <th className="px-6 py-3 text-center text-sm font-bold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {brand.models.map((model, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">{model.modelName}</td>
                        <td className="px-6 py-4 text-sm text-center">
                          <span className="inline-flex items-center justify-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                            {model.backCoversCount || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          <span className="inline-flex items-center justify-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
                            {model.aluminumSheetsCount || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          <button
                            onClick={() => handleEditModel(brand, model)}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded mr-2"
                            title="Edit Model"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteModel(brand._id, model.modelName)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded"
                            title="Delete Model"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-8 text-center">
                <p className="text-gray-400 italic">No models added yet</p>
              </div>
            )}
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
                <div className="space-y-3 mb-3">
                  <input
                    type="text"
                    value={modelForm.modelName}
                    onChange={(e) =>
                      setModelForm({ ...modelForm, modelName: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Model name (e.g., iPhone 15 Pro, Galaxy S24)"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Back Covers Stock</label>
                      <input
                        type="number"
                        value={modelForm.backCoversCount}
                        onChange={(e) =>
                          setModelForm({ ...modelForm, backCoversCount: parseStockInput(e.target.value) })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Aluminum Sheets Stock</label>
                      <input
                        type="number"
                        value={modelForm.aluminumSheetsCount}
                        onChange={(e) =>
                          setModelForm({ ...modelForm, aluminumSheetsCount: parseStockInput(e.target.value) })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddModel}
                    className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Model to List
                  </button>
                </div>

                {/* Models List */}
                {brandForm.models.length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                    <p className="text-sm text-gray-600 mb-2 font-medium">Models to be added ({brandForm.models.length}):</p>
                    {brandForm.models.map((model, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 p-3 rounded mb-2"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-medium">{model.modelName}</p>
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
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1 text-blue-600">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <span>Back Covers: <strong>{model.backCoversCount || 0}</strong></span>
                          </div>
                          <div className="flex items-center gap-1 text-purple-600">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                            <span>Al. Sheets: <strong>{model.aluminumSheetsCount || 0}</strong></span>
                          </div>
                        </div>
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
                    setModelForm({ ...modelForm, modelName: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., iPhone 15 Pro, Galaxy S24"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Back Covers Stock
                </label>
                <input
                  type="number"
                  value={modelForm.backCoversCount}
                  onChange={(e) =>
                    setModelForm({ ...modelForm, backCoversCount: parseStockInput(e.target.value) })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter back covers stock quantity"
                  min="0"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Aluminum Sheets Stock
                </label>
                <input
                  type="number"
                  value={modelForm.aluminumSheetsCount}
                  onChange={(e) =>
                    setModelForm({ ...modelForm, aluminumSheetsCount: parseStockInput(e.target.value) })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter aluminum sheets stock quantity"
                  min="0"
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

      {/* Edit Model Modal */}
      {showEditModelModal && editingModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                Edit Model: {editingModel.modelName}
              </h2>
              <button
                onClick={() => setShowEditModelModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateModel} className="p-6">
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Model Name *
                </label>
                <input
                  type="text"
                  value={editModelForm.modelName}
                  onChange={(e) =>
                    setEditModelForm({ ...editModelForm, modelName: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., iPhone 15 Pro, Galaxy S24"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Back Covers Stock
                </label>
                <input
                  type="number"
                  value={editModelForm.backCoversCount}
                  onChange={(e) =>
                    setEditModelForm({ ...editModelForm, backCoversCount: parseStockInput(e.target.value) })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter back covers stock quantity"
                  min="0"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Aluminum Sheets Stock
                </label>
                <input
                  type="number"
                  value={editModelForm.aluminumSheetsCount}
                  onChange={(e) =>
                    setEditModelForm({ ...editModelForm, aluminumSheetsCount: parseStockInput(e.target.value) })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter aluminum sheets stock quantity"
                  min="0"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModelModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                >
                  Update Model
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
