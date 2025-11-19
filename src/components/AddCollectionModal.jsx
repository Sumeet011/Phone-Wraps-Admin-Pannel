import React, { useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const AddCollectionModal = ({ isOpen, onClose, onCollectionAdded }) => {
  const [collectionName, setCollectionName] = useState('');
  const [description, setDescription] = useState('');
  const [heroImage, setHeroImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!collectionName.trim()) {
      toast.error('Please enter a collection name');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      formData.append('name', collectionName.trim());
      formData.append('description', description.trim());
      
      if (heroImage) {
        formData.append('heroImage', heroImage);
      }

      const response = await axios.post(backendUrl + '/api/collections', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Collection created successfully!');
        setCollectionName('');
        setDescription('');
        setHeroImage(null);
        onCollectionAdded(); // Refresh the collections list
        onClose();
      } else {
        toast.error(response.data.message || 'Failed to create collection');
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      toast.error(error.response?.data?.message || 'Failed to create collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCollectionName('');
    setDescription('');
    setHeroImage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Create New Collection</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            type="button"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Collection Name */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Collection Name *
            </label>
            <input
              type="text"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              placeholder="e.g., Marvel Heroes, Anime Collection"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a description for this collection..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none min-h-[100px]"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Hero Image Upload */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Hero/Cover Image (Optional)
            </label>
            <label htmlFor="heroImage" className="cursor-pointer">
              <div className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-blue-400 transition flex items-center justify-center">
                {heroImage ? (
                  <img 
                    className="w-full h-full object-cover" 
                    src={URL.createObjectURL(heroImage)} 
                    alt="Hero preview" 
                  />
                ) : (
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">Click to upload hero image</p>
                    <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
                  </div>
                )}
              </div>
              <input 
                onChange={(e) => setHeroImage(e.target.files[0])} 
                type="file" 
                id="heroImage" 
                hidden 
                accept="image/*"
                disabled={isSubmitting}
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">
              This image will be displayed as the cover for this collection
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-blue-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCollectionModal;
