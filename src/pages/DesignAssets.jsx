import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const DesignAssets = ({ token }) => {
  const [designAssets, setDesignAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAsset, setEditingAsset] = useState(null)
  const [filterCategory, setFilterCategory] = useState('all')

  // Form state
  const [formData, setFormData] = useState({
    category: 'HERO',
    isActive: true
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const categories = ['HERO','CIRCULAR','CARD']

  useEffect(() => {
    fetchDesignAssets()
  }, [filterCategory])

  const fetchDesignAssets = async () => {
    try {
      setLoading(true)
      const url = filterCategory === 'all' 
        ? `${backendUrl}/api/design-assets` 
        : `${backendUrl}/api/design-assets?category=${filterCategory}`
      
      const response = await axios.get(url)
      
      if (response.data.success) {
        setDesignAssets(response.data.items || [])
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Error fetching design assets:', error)
      toast.error('Failed to fetch design assets')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size should be less than 10MB')
        return
      }
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!editingAsset && !imageFile) {
      toast.error('Please select an image')
      return
    }

    try {
      const data = new FormData()
      data.append('category', formData.category)
      data.append('isActive', formData.isActive)

      if (imageFile) {
        data.append('image', imageFile)
      }

      let response
      if (editingAsset) {
        response = await axios.patch(
          `${backendUrl}/api/design-assets/${editingAsset._id}`,
          data,
          { headers: { token, 'Content-Type': 'multipart/form-data' } }
        )
      } else {
        response = await axios.post(
          `${backendUrl}/api/design-assets`,
          data,
          { headers: { token, 'Content-Type': 'multipart/form-data' } }
        )
      }

      if (response.data.success) {
        toast.success(editingAsset ? 'Asset updated successfully' : 'Asset created successfully')
        closeModal()
        fetchDesignAssets()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Error saving design asset:', error)
      toast.error(error.response?.data?.message || 'Failed to save design asset')
    }
  }

  const handleEdit = (asset) => {
    setEditingAsset(asset)
    setFormData({
      category: asset.category,
      isActive: asset.isActive
    })
    setImagePreview(asset.imageUrl)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this design asset?')) return

    try {
      const response = await axios.delete(
        `${backendUrl}/api/design-assets/${id}`,
        { headers: { token } }
      )

      if (response.data.success) {
        toast.success('Asset deleted successfully')
        fetchDesignAssets()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Error deleting design asset:', error)
      toast.error('Failed to delete design asset')
    }
  }

  const copyImageUrl = (url) => {
    navigator.clipboard.writeText(url)
    toast.success('Image URL copied to clipboard!')
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingAsset(null)
    setFormData({
      category: 'HERO',
      isActive: true
    })
    setImageFile(null)
    setImagePreview(null)
  }

  return (
    <div className='max-w-7xl mx-auto p-6'>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h2 className='text-3xl font-bold text-gray-800'>Design Assets</h2>
          <p className='text-sm text-gray-600 mt-1'>Manage images for your website</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className='px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition'
        >
          + Add New Asset
        </button>
      </div>

      {/* Filter */}
      <div className='mb-6 flex gap-2 flex-wrap'>
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-4 py-2 rounded-lg transition ${
            filterCategory === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-lg transition capitalize ${
              filterCategory === cat
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Assets Grid */}
      {loading ? (
        <div className='flex justify-center items-center h-64'>
          <p className='text-lg text-gray-600'>Loading...</p>
        </div>
      ) : designAssets.length === 0 ? (
        <div className='text-center py-12 bg-gray-50 rounded-lg'>
          <p className='text-gray-500'>No design assets found</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          {designAssets.map(asset => (
            <div key={asset._id} className='bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition'>
              <div className='relative h-48 bg-gray-100'>
                <img
                  src={asset.imageUrl}
                  alt={asset.name}
                  className='w-full h-full object-cover'
                  onError={(e) => e.target.src = '/placeholder.png'}
                />
                <div className='absolute top-2 right-2 flex gap-1'>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    asset.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                  }`}>
                    {asset.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className='p-4'>
                <div className='flex justify-between items-start mb-3'>
                  <span className='text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded capitalize'>
                    {asset.category}
                  </span>
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={() => copyImageUrl(asset.imageUrl)}
                    className='flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm transition'
                  >
                    Copy URL
                  </button>
                  <button
                    onClick={() => handleEdit(asset)}
                    className='px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm transition'
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(asset._id)}
                    className='px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm transition'
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4' onClick={closeModal}>
          <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto' onClick={(e) => e.stopPropagation()}>
            <div className='sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center'>
              <h3 className='text-xl font-bold text-gray-800'>
                {editingAsset ? 'Edit Design Asset' : 'Add New Design Asset'}
              </h3>
              <button onClick={closeModal} className='text-gray-500 hover:text-gray-700 text-2xl'>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className='p-6 space-y-4'>
              {/* Image Upload */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Image * {editingAsset && '(Leave empty to keep current image)'}
                </label>
                <div className='flex items-center gap-4'>
                  <label htmlFor='imageUpload' className='cursor-pointer'>
                    <div className='w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-blue-400 flex items-center justify-center'>
                      {imagePreview ? (
                        <img src={imagePreview} alt='Preview' className='w-full h-full object-cover' />
                      ) : (
                        <span className='text-gray-400 text-center text-sm'>Click to upload</span>
                      )}
                    </div>
                    <input
                      id='imageUpload'
                      type='file'
                      accept='image/*'
                      hidden
                      onChange={handleImageChange}
                    />
                  </label>
                  <div className='flex-1'>
                    <p className='text-xs text-gray-500'>Recommended: PNG, JPG, WEBP</p>
                    <p className='text-xs text-gray-500'>Max size: 10MB</p>
                  </div>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none'
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className='capitalize'>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Is Active */}
              <div className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  id='isActive'
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className='w-4 h-4 text-blue-500'
                />
                <label htmlFor='isActive' className='text-sm text-gray-700'>
                  Active (visible in frontend)
                </label>
              </div>

              {/* Actions */}
              <div className='flex gap-3 pt-4'>
                <button
                  type='button'
                  onClick={closeModal}
                  className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition'
                >
                  {editingAsset ? 'Update Asset' : 'Create Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default DesignAssets
