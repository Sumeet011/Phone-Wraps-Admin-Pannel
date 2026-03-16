import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const AddCollectionModal = ({ isOpen, onClose, onCollectionAdded, groupId, collectionType: initialCollectionType = 'gaming', allowTypeChange = false }) => {
  const [collectionName, setCollectionName] = useState('');
  const [description, setDescription] = useState('');
  const [collectionType, setCollectionType] = useState(initialCollectionType);
  const [price, setPrice] = useState('');
  const [platePrice, setPlatePrice] = useState('');
  const [heroImage, setHeroImage] = useState(null);
  const [features, setFeatures] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(groupId || '');
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update collection type when modal opens or initialCollectionType changes
  useEffect(() => {
    if (isOpen) {
      setCollectionType(initialCollectionType);
      setSelectedGroup(groupId || '');
      // Fetch groups only for gaming collections
      if (initialCollectionType === 'gaming') {
        fetchGroups();
      }
    }
  }, [isOpen, initialCollectionType, groupId]);

  // Fetch groups when collection type changes to gaming
  useEffect(() => {
    if (isOpen && collectionType === 'gaming' && !groupId && groups.length === 0) {
      fetchGroups();
    }
  }, [collectionType, isOpen, groupId]);

  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);
      const response = await axios.get(backendUrl + '/api/groups');
      if (response.data.success) {
        setGroups(response.data.items || response.data.groups || response.data.data || []);
      } else {
        toast.error('Failed to fetch groups');
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to fetch groups');
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!collectionName.trim()) {
      toast.error('Please enter a collection name');
      return;
    }

    // For gaming collections, group selection is required
    if (collectionType === 'gaming' && !selectedGroup) {
      toast.error('Please select a group for gaming collection');
      return;
    }
    
    if ((collectionType === 'gaming' || collectionType === 'swap-wrap') && (!price || Number(price) <= 0)) {
      toast.error('Please enter a valid price for gaming/swap-wrap collection');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      formData.append('name', collectionName.trim());
      if (description.trim()) {
        formData.append('description', description.trim());
      }
      formData.append('type', collectionType);
      if ((collectionType === 'gaming' || collectionType === 'swap-wrap') && price) {
        formData.append('price', Number(price));
      }
      if ((collectionType === 'gaming' || collectionType === 'swap-wrap') && platePrice) {
        formData.append('plateprice', Number(platePrice));
      }
      
      // Add features if provided
      if (features.trim()) {
        const featuresArray = features.split(',').map(f => f.trim()).filter(f => f);
        featuresArray.forEach(feature => {
          formData.append('features[]', feature);
        });
      }
      
      // Use selected group for gaming collections
      const finalGroupId = collectionType === 'gaming' ? selectedGroup : groupId;
      if (finalGroupId) {
        formData.append('groupId', finalGroupId);
      }
      
      if (heroImage) {
        formData.append('heroImage', heroImage);
      }

      const response = await axios.post(backendUrl + '/api/collections', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        const newCollectionId = response.data.data?._id || response.data.data?.id;
        
        // If groupId is provided and we have the new collection ID, add it to the group
        if (finalGroupId && newCollectionId) {
          try {
            await axios.post(backendUrl + `/api/groups/${finalGroupId}/collections`, {
              collectionId: newCollectionId
            });
            toast.success('Collection created and added to group successfully!');
          } catch (groupError) {
            console.error('Error adding collection to group:', groupError);
            toast.warning('Collection created but failed to add to group. Please manually assign it.');
          }
        } else {
          toast.success('Collection created successfully!');
        }
        
        setCollectionName('');
        setDescription('');
        setPrice('');
        setPlatePrice('');
        setFeatures('');
        setHeroImage(null);
        setSelectedGroup('');
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
    setCollectionType(initialCollectionType);
    setPrice('');
    setPlatePrice('');
    setFeatures('');
    setHeroImage(null);
    setSelectedGroup('');
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
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a description for this collection..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none min-h-[100px]"
              disabled={isSubmitting}
            />
          </div>

         
          {/* Collection Type - Only show when type change is allowed */}
          {allowTypeChange && (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Collection Type *
              </label>
              <select
                value={collectionType}
                onChange={(e) => setCollectionType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                required
                disabled={isSubmitting}
              >
                <option value="gaming">Gaming Collection</option>
                <option value="swap-wrap">Swap-Wrap Collection</option>
                <option value="normal">Other Collection</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Gaming and Swap-Wrap collections require pricing
              </p>
            </div>
          )}

          {/* Group Selection - Show for gaming collections when groupId is not set */}
          {!groupId && collectionType === 'gaming' && (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Gaming Group *
              </label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                required
                disabled={isSubmitting || loadingGroups}
              >
                <option value="">Select a group...</option>
                {groups.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.name || group.groupName || 'Unnamed Group'}
                  </option>
                ))}
              </select>
              {loadingGroups && (
                <p className="text-xs text-blue-500 mt-1">Loading groups...</p>
              )}
              {!loadingGroups && groups.length === 0 && (
                <p className="text-xs text-red-500 mt-1">No groups available. Please create a group first.</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Gaming collections must belong to a group
              </p>
            </div>
          )}

          {/* Price for Gaming/Swap-Wrap Collections */}
          {(collectionType === 'gaming' || collectionType === 'swap-wrap') && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Plates+Cover Price (₹) *
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g., 499"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  required
                  min="0"
                  step="1"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {collectionType === 'gaming' 
                    ? 'This price applies to the entire collection (all 5 cards)'
                    : 'Base price for backcover + plates (swap-wrap collection)'}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Plate Price (₹)
                </label>
                <input
                  type="number"
                  value={platePrice}
                  onChange={(e) => setPlatePrice(e.target.value)}
                  placeholder="e.g., 299"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  min="0"
                  step="1"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {collectionType === 'gaming'
                    ? 'Optional: Additional plate/accessory price for gaming collection'
                    : 'Optional: Additional plate/accessory price'}
                </p>
              </div>

              {/* Features for Gaming Collections */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Features (Optional)
                </label>
                <textarea
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  placeholder="e.g., Shockproof, Wireless Charging Compatible, Raised Edges (comma-separated)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none min-h-[80px]"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter features separated by commas
                </p>
              </div>
            </>
          )}

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
