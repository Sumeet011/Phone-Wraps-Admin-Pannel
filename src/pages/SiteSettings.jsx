import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

// Circular Gallery Images Section Component
const CircularGallerySection = ({ token, backendUrl, settings, handleInputChange }) => {
  const [circularImages, setCircularImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchCircularImages();
  }, []);

  const fetchCircularImages = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/design-assets?category=CIRCULAR&isActive=true`);
      if (response.data.success) {
        setCircularImages(response.data.items || []);
      }
    } catch (error) {
      console.error('Error fetching circular images:', error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('category', 'CIRCULAR');
      formData.append('name', `Gallery Image ${Date.now()}`);
      formData.append('isActive', 'true');

      const response = await axios.post(
        `${backendUrl}/api/design-assets`,
        formData,
        { 
          headers: { 
            token, 
            'Content-Type': 'multipart/form-data' 
          } 
        }
      );

      if (response.data.success) {
        toast.success('Image uploaded successfully!');
        setSelectedFile(null);
        setImagePreview(null);
        fetchCircularImages();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${backendUrl}/api/design-assets/${id}`,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Image deleted successfully!');
        fetchCircularImages();
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  return (
    <div className="mb-8 border-b pb-6">
      <h2 className="text-xl font-semibold text-gray-700 mb-2">⭕ Circular Gallery Section</h2>
      <p className="text-sm text-gray-500 mb-4">Manage heading text and images for the circular scrolling gallery section</p>
      
      {/* Heading Text Control */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Section Heading
        </label>
        <input
          type="text"
          name="circularGalleryTitle"
          value={settings.circularGalleryTitle}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="WELCOME TO MYSTERY WORLD"
        />
        <p className="text-xs text-gray-500 mt-1">Main heading displayed above the circular gallery</p>
      </div>

      {/* Upload Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload New Gallery Image
        </label>
        <div className="flex flex-col gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {imagePreview && (
            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </div>
      </div>

      {/* Current Images Grid */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Current Gallery Images ({circularImages.length})</h3>
        {circularImages.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No images uploaded yet</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {circularImages.map((image) => (
              <div key={image._id} className="relative group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                <div className="aspect-square">
                  <img 
                    src={image.imageUrl} 
                    alt="Gallery image" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => handleDelete(image._id)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Carousel Images Section Component
const CarouselImagesSection = ({ token, backendUrl }) => {
  const [carouselImages, setCarouselImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchCarouselImages();
  }, []);

  const fetchCarouselImages = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/design-assets?category=CARD&isActive=true`);
      if (response.data.success) {
        setCarouselImages(response.data.items || []);
      }
    } catch (error) {
      console.error('Error fetching carousel images:', error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('category', 'CARD');
      formData.append('name', `Carousel Image ${Date.now()}`);
      formData.append('isActive', 'true');

      const response = await axios.post(
        `${backendUrl}/api/design-assets`,
        formData,
        { 
          headers: { 
            token, 
            'Content-Type': 'multipart/form-data' 
          } 
        }
      );

      if (response.data.success) {
        toast.success('Image uploaded successfully!');
        setSelectedFile(null);
        setImagePreview(null);
        fetchCarouselImages();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${backendUrl}/api/design-assets/${id}`,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Image deleted successfully!');
        fetchCarouselImages();
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  return (
    <div className="mb-8 border-b pb-6">
      <h2 className="text-xl font-semibold text-gray-700 mb-2">🎠 Hero Carousel Images</h2>
      <p className="text-sm text-gray-500 mb-4">Manage images displayed in the hero carousel section</p>
      
      {/* Upload Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload New Carousel Image
        </label>
        <div className="flex flex-col gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {imagePreview && (
            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </div>
      </div>

      {/* Current Images Grid */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Current Carousel Images ({carouselImages.length})</h3>
        {carouselImages.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No images uploaded yet</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {carouselImages.map((image) => (
              <div key={image._id} className="relative group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                <div className="aspect-square">
                  <img 
                    src={image.imageUrl} 
                    alt={image.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2">
                  <p className="text-xs text-gray-600 truncate">{image.name}</p>
                </div>
                <button
                  onClick={() => handleDelete(image._id)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SiteSettings = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    // Text Scroll Settings
    textScrollContent: 'Phone Wraps  ',
    textScrollVelocity: 5,

    // Collections Section
    collectionsTitle: 'BROWSE ALL COLLECTIONS',
    gamingCollectionsLimit: 1,
    nonGamingCollectionsLimit: 10,

    // Circular Gallery Section
    circularGalleryTitle: 'WELCOME TO MYSTERY WORLD',

    // Products Section
    productsTitle: 'BROWSE ALL PRODUCTS',
    productsPerRow: 41,
    productsRows: 2,

    // Section Visibility
    showGamingSection: true,
    showNonGamingSection: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/site-settings`);
      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await axios.put(
        `${backendUrl}/api/site-settings`,
        settings,
        {
          headers: { token },
        }
      );

      if (response.data.success) {
        toast.success('Settings saved successfully!');
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all settings to default?')) {
      return;
    }

    setSaving(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/site-settings/reset`,
        {},
        {
          headers: { token },
        }
      );

      if (response.data.success) {
        toast.success('Settings reset to defaults!');
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast.error('Failed to reset settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Homepage Settings</h1>
            <p className="text-sm text-gray-600 mt-1">Configure settings that are actually used on your website</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              disabled={saving}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 transition"
            >
              Reset to Default
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Text Scroll Section */}
        <div className="mb-8 border-b pb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">🎬 Text Scroll Banner</h2>
          <p className="text-sm text-gray-500 mb-4">Top scrolling text banner on homepage</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scroll Text
              </label>
              <input
                type="text"
                name="textScrollContent"
                value={settings.textScrollContent}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Phone Wraps  "
              />
              <p className="text-xs text-gray-500 mt-1">The text that scrolls horizontally at the top</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scroll Speed (1-20)
              </label>
              <input
                type="number"
                name="textScrollVelocity"
                value={settings.textScrollVelocity}
                onChange={handleInputChange}
                min="1"
                max="20"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Higher = faster scroll speed</p>
            </div>
          </div>
        </div>

        {/* Hero Carousel Images Section */}
        <CarouselImagesSection token={token} backendUrl={backendUrl} />

        {/* Collections Section */}
        <div className="mb-8 border-b pb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">📦 Collections Section</h2>
          <p className="text-sm text-gray-500 mb-4">Settings for the "Browse All Collections" section on homepage</p>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Title
              </label>
              <input
                type="text"
                name="collectionsTitle"
                value={settings.collectionsTitle}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="BROWSE ALL COLLECTIONS"
              />
              <p className="text-xs text-gray-500 mt-1">Main heading for collections section</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🎮 Gaming Collections to Show (1-20)
                </label>
                <input
                  type="number"
                  name="gamingCollectionsLimit"
                  value={settings.gamingCollectionsLimit}
                  onChange={handleInputChange}
                  min="1"
                  max="20"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Number of gaming collections displayed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ✨ Non-Gaming Collections to Show (1-20)
                </label>
                <input
                  type="number"
                  name="nonGamingCollectionsLimit"
                  value={settings.nonGamingCollectionsLimit}
                  onChange={handleInputChange}
                  min="1"
                  max="20"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Number of non-gaming collections displayed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Circular Gallery Section */}
        <CircularGallerySection token={token} backendUrl={backendUrl} settings={settings} handleInputChange={handleInputChange} />

        {/* Products Section */}
        <div className="mb-8 border-b pb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">🛍️ Products Section</h2>
          <p className="text-sm text-gray-500 mb-4">Settings for the "Browse All Products" horizontal scroll section on homepage</p>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Title
              </label>
              <input
                type="text"
                name="productsTitle"
                value={settings.productsTitle}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="BROWSE ALL PRODUCTS"
              />
              <p className="text-xs text-gray-500 mt-1">Main heading for products section</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Products Per Row (1-100)
                </label>
                <input
                  type="number"
                  name="productsPerRow"
                  value={settings.productsPerRow}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Number of products shown in one horizontal row</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Rows (1-10)
                </label>
                <input
                  type="number"
                  name="productsRows"
                  value={settings.productsRows}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Number of horizontal scrolling rows to display</p>
              </div>
            </div>
          </div>
        </div>

        {/* Visibility Settings */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">👁️ Section Visibility</h2>
          <p className="text-sm text-gray-500 mb-4">Show or hide collection types on homepage</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="showGamingSection"
                name="showGamingSection"
                checked={settings.showGamingSection}
                onChange={handleInputChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="showGamingSection" className="ml-3 text-sm font-medium text-gray-700">
                🎮 Show Gaming Collections Section
              </label>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="showNonGamingSection"
                name="showNonGamingSection"
                checked={settings.showNonGamingSection}
                onChange={handleInputChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="showNonGamingSection" className="ml-3 text-sm font-medium text-gray-700">
                ✨ Show Non-Gaming Collections Section
              </label>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Only settings that are actively used on your website are shown here. 
                Hero text, Leaderboard, and Reviews sections use hardcoded content in the frontend components.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button at Bottom */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <button
            onClick={handleReset}
            disabled={saving}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 transition"
          >
            Reset to Default
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition font-semibold"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiteSettings;
