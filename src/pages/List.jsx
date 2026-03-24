import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

const List = ({ token }) => {

  const [collections, setCollections] = useState([])
  const [products, setProducts] = useState([])
  const [gamingCollections, setGamingCollections] = useState([])
  const [nonGamingCollections, setNonGamingCollections] = useState([])
  const [otherCollections, setOtherCollections] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Edit modals state
  const [editingCollection, setEditingCollection] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showCollectionModal, setShowCollectionModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)

  const fetchCollections = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/collections/')
      console.log('Collections response:', response.data);
      if (response.data.success) {
        const collectionsList = response.data.items || response.data.data || response.data.collections || [];
        console.log('Collections list:', collectionsList);
        setCollections(collectionsList);
        return collectionsList;
      }
      else {
        toast.error(response.data.message)
        return [];
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message || 'Failed to fetch collections')
      return [];
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/products')
      console.log('Products fetched:', response.data);
      if (response.data.success) {
        const productsList = response.data.items || response.data.data || response.data.products || [];
        setProducts(productsList);
        return productsList;
      }
      else {
        toast.error(response.data.message)
        return [];
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message || 'Failed to fetch products')
      return [];
    }
  }

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [collectionsData, productsData] = await Promise.all([
        fetchCollections(),
        fetchProducts()
      ])

      // Separate gaming, standard, and other collections
      console.log('All collections:', collectionsData.map(c => ({ name: c.name, type: c.type, productsCount: c.products?.length })));
      const gamingCols = collectionsData.filter(col => col.type === 'gaming');
      const standardCols = collectionsData.filter(col => col.type === 'swap-wrap' || col.type === 'normal-swap' || col.type === 'custom');
      const otherCols = collectionsData.filter(col => col.type === 'normal' || col.type === 'other');
      console.log('Gaming collections filtered:', gamingCols.map(c => ({ name: c.name, products: c.products })));
      console.log('Standard collections filtered:', standardCols.map(c => c.name));
      console.log('Other collections filtered:', otherCols.map(c => c.name));

      // Map collections with their products
      const gamingCollectionsWithProducts = gamingCols.map(collection => ({
        ...collection,
        products: collection.products || []
      }));

      const standardCollectionsWithProducts = standardCols.map(collection => ({
        ...collection,
        products: collection.products || []
      }));
      
      const otherCollectionsWithProducts = otherCols.map(collection => ({
        ...collection,
        products: collection.products || []
      }));

      setGamingCollections(gamingCollectionsWithProducts);
      setNonGamingCollections(standardCollectionsWithProducts);
      setOtherCollections(otherCollectionsWithProducts);

      // Find products that are NOT in any collection (orphaned products)
      const productIdsInCollections = new Set();
      collectionsData.forEach(collection => {
        (collection.products || []).forEach(product => {
          productIdsInCollections.add(product._id || product.id);
        });
      });

      const orphanedProducts = productsData.filter(product => 
        !productIdsInCollections.has(product._id || product.id)
      );

      console.log('Gaming collections:', gamingCollectionsWithProducts.length);
      console.log('Standard collections:', standardCollectionsWithProducts.length);
      console.log('Other collections:', otherCollectionsWithProducts.length);
      console.log('Orphaned products (not in any collection):', orphanedProducts.length);
      
      setProducts(orphanedProducts);

    } catch (error) {
      console.log(error)
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const removeProduct = async (productId) => {
    try {
      const response = await axios.delete(backendUrl + `/api/products/${productId}`, { 
        headers: { token } 
      })

      if (response.data.success || response.status === 204) {
        toast.success('Product removed successfully')
        await fetchAllData();
      } else {
        toast.error(response.data.message || 'Failed to remove product')
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message || 'Failed to remove product')
    }
  }

  const removeCollection = async (collectionId) => {
    try {
      const response = await axios.delete(backendUrl + `/api/collections/${collectionId}`, { 
        headers: { token } 
      })

      if (response.data.success) {
        toast.success('Collection removed successfully')
        await fetchAllData();
      } else {
        toast.error(response.data.message || 'Failed to remove collection')
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message || 'Failed to remove collection')
    }
  }

  const updateCollection = async (collectionId, updateData) => {
    try {
      console.log('Updating collection:', collectionId, updateData);
      const response = await axios.patch(backendUrl + `/api/collections/${collectionId}`, updateData)

      console.log('Update collection response:', response.data);
      if (response.data.success) {
        toast.success('Collection updated successfully')
        setShowCollectionModal(false)
        setEditingCollection(null)
        await fetchAllData();
      } else {
        toast.error(response.data.message || 'Failed to update collection')
      }
    } catch (error) {
      console.log('Update collection error:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to update collection')
    }
  }

  const updateProduct = async (productId, updateData) => {
    try {
      console.log('Updating product:', productId, updateData);
      const response = await axios.patch(backendUrl + `/api/products/${productId}`, updateData)

      console.log('Update product response:', response.data);
      if (response.data.success) {
        toast.success('Product updated successfully')
        setShowProductModal(false)
        setEditingProduct(null)
        await fetchAllData();
      } else {
        toast.error(response.data.message || 'Failed to update product')
      }
    } catch (error) {
      console.log('Update product error:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to update product')
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <p className='text-lg'>Loading...</p>
      </div>
    )
  }

  const CollectionRow = ({ collection, collectionType }) => {
    const isGaming = collectionType === 'gaming';
    const isOther = collectionType === 'other';
    
    const badgeClasses = isGaming 
      ? 'bg-purple-100 text-purple-700' 
      : isOther 
        ? 'bg-orange-100 text-orange-700' 
        : 'bg-blue-100 text-blue-700';
    
    const badgeText = isGaming ? 'Gaming' : isOther ? 'Other' : 'Standard';
    
    return (
    <div className='border rounded-lg p-4 mb-4 bg-white shadow-sm'>
      {/* Collection Header */}
      <div className='flex justify-between items-start mb-3 pb-3 border-b'>
        <div className='flex-1'>
          <div className='flex items-center gap-3'>
            <h3 className='text-lg font-bold text-gray-800'>{collection.name}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClasses}`}>
              {badgeText}
            </span>
          </div>
          <p className='text-sm text-gray-600 mt-1'>{collection.description}</p>
        </div>
        <div className='flex gap-2'>
          <button 
            onClick={() => {
              setEditingCollection(collection)
              setShowCollectionModal(true)
            }}
            className='px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm'
          >
            Edit
          </button>
          <button 
            onClick={() => removeCollection(collection._id || collection.id)}
            className='px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm'
          >
            Delete
          </button>
        </div>
      </div>

      {/* Products Horizontal Scroll - Always show for all collections */}
      <div className='mt-3'>
        <p className='text-sm font-semibold text-gray-700 mb-2'>
          Products ({collection.products.length})
        </p>
        {collection.products.length === 0 ? (
          <p className='text-sm text-gray-400 italic'>No products in this collection</p>
        ) : (
          <div className='flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100'>
            {/* Hero Image Card */}
            {collection.heroImage && (
              <div className='group relative bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-3 text-white shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 duration-300 flex flex-col min-w-[200px] flex-shrink-0'>
                <div className='relative overflow-hidden rounded-xl h-[180px]'>
                  <img 
                    src={collection.heroImage} 
                    alt={collection.name}
                    className='w-full h-full object-cover'
                    onError={(e) => e.target.src = 'https://via.placeholder.com/200?text=Collection'}
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2'>
                    <p className='text-white text-xs font-bold'>Collection Hero</p>
                  </div>
                  {/* Show price on hero image for gaming collections */}
                  {isGaming && (collection.price || (typeof collection.price === 'object' && collection.price?.backcover_plate)) && (
                    <div className='absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded'>
                      ₹{typeof collection.price === 'number' ? collection.price : (collection.price?.backcover_plate || 0)}/₹{typeof collection.plateprice === 'number' ? collection.plateprice : (collection.price?.plates || 0)}
                    </div>
                  )}
                </div>
                <div className='mt-2'>
                  <h2 className='text-sm font-semibold leading-tight'>
                    {collection.name}
                  </h2>
                </div>
              </div>
            )}
            
            {collection.products.map((product, idx) => (
              <div key={idx} className='group relative bg-[#1a1816] rounded-2xl p-3 text-white shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 duration-300 flex flex-col min-w-[200px] flex-shrink-0'>
                <div className='relative overflow-hidden rounded-xl h-[180px]'>
                  <img 
                    src={product.images && product.images.length > 0 ? product.images[0] : (product.image || 'https://via.placeholder.com/200?text=No+Image')} 
                    alt={product.name}
                    className='w-full h-full object-cover'
                    onError={(e) => e.target.src = 'https://via.placeholder.com/200?text=No+Image'}
                  />
                  {/* Only show product price for non-gaming collections */}
                  {!isGaming && (product.coverprice || product.price) && (
                    <p className='absolute bottom-2 left-2 text-white text-xs font-semibold bg-black/60 px-2 py-1 rounded'>
                      ₹{product.coverprice || product.price}
                    </p>
                  )}
                  <div className='absolute top-2 right-2 flex gap-1'>
                    <button 
                      onClick={() => {
                        setEditingProduct(product)
                        setShowProductModal(true)
                      }}
                      className='bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded'
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => removeProduct(product._id || product.id)}
                      className='bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-2 py-1 rounded'
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className='mt-2'>
                  <h2 className='text-sm font-semibold leading-tight line-clamp-2' title={product.name}>
                    {product.name}
                  </h2>
                  <p className='text-xs text-gray-400 mt-1'>{product.category}</p>
                  
                </div>

                <div className='absolute bottom-2 right-2 w-6 h-6 rounded-full bg-white group-hover:bg-lime-400 flex items-center justify-center'>
                  <svg
                    className='w-4 h-4 text-black'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                  >
                    <path
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M7 17l10-10M7 7h10v10'
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )}

  return (
    <div className='max-w-7xl'>

      {/* Gaming Collections Section */}
      <div className='mb-8'>
        <div className='mb-4 pb-2 border-b-2 border-purple-500'>
          <h2 className='text-2xl font-bold text-gray-800'>Gaming Collections</h2>
          <p className='text-sm text-gray-600 mt-1'>
            {gamingCollections.length} collection(s) with {gamingCollections.reduce((acc, col) => acc + col.products.length, 0)} product(s)
          </p>
        </div>
        
        {gamingCollections.length === 0 ? (
          <div className='text-center py-8 bg-gray-50 rounded-lg'>
            <p className='text-gray-500'>No gaming collections found</p>
          </div>
        ) : (
          gamingCollections.map((collection, index) => (
            <CollectionRow key={collection._id || collection.id || index} collection={collection} collectionType='gaming' />
          ))
        )}
      </div>

      {/* Standard Collections Section */}
      <div className='mb-8'>
        <div className='mb-4 pb-2 border-b-2 border-green-500'>
          <h2 className='text-2xl font-bold text-gray-800'>Swap-Wrap Collections</h2>
          <p className='text-sm text-gray-600 mt-1'>
            {nonGamingCollections.length} collection(s) with {nonGamingCollections.reduce((acc, col) => acc + col.products.length, 0)} product(s)
          </p>
        </div>
        
        {nonGamingCollections.length === 0 ? (
          <div className='text-center py-8 bg-gray-50 rounded-lg'>
            <p className='text-gray-500'>No standard collections found</p>
          </div>
        ) : (
          nonGamingCollections.map((collection, index) => (
            <CollectionRow key={collection._id || collection.id || index} collection={collection} collectionType='standard' />
          ))
        )}
      </div>

      {/* Other Collections Section */}
      <div className='mb-8'>
        <div className='mb-4 pb-2 border-b-2 border-orange-500'>
          <h2 className='text-2xl font-bold text-gray-800'>Other Collections</h2>
          <p className='text-sm text-gray-600 mt-1'>
            {otherCollections.length} collection(s) with {otherCollections.reduce((acc, col) => acc + col.products.length, 0)} product(s)
          </p>
        </div>
        
        {otherCollections.length === 0 ? (
          <div className='text-center py-8 bg-gray-50 rounded-lg'>
            <p className='text-gray-500'>No other collections found</p>
          </div>
        ) : (
          otherCollections.map((collection, index) => (
            <CollectionRow key={collection._id || collection.id || index} collection={collection} collectionType='other' />
          ))
        )}
      </div>

      {/* Collection Edit Modal */}
      {showCollectionModal && editingCollection && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' onClick={() => setShowCollectionModal(false)}>
          <div className='bg-white rounded-lg p-6 max-w-md w-full m-4 max-h-[90vh] overflow-y-auto' onClick={(e) => e.stopPropagation()}>
            <h3 className='text-xl font-bold mb-4'>Edit Collection</h3>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-semibold mb-1'>Collection Name</label>
                <input
                  type='text'
                  value={editingCollection.name || ''}
                  onChange={(e) => setEditingCollection({...editingCollection, name: e.target.value})}
                  className='w-full border rounded px-3 py-2'
                />
              </div>
              <div>
                <label className='block text-sm font-semibold mb-1'>Description</label>
                <textarea
                  value={editingCollection.description || ''}
                  onChange={(e) => setEditingCollection({...editingCollection, description: e.target.value})}
                  className='w-full border rounded px-3 py-2 h-24'
                />
              </div>
              <div>
                <label className='block text-sm font-semibold mb-1'>Collection Type</label>
                <select
                  value={editingCollection.type || 'gaming'}
                  onChange={(e) => setEditingCollection({...editingCollection, type: e.target.value})}
                  className='w-full border rounded px-3 py-2'
                  disabled
                >
                  <option value='gaming'>Gaming Collection</option>
                  <option value='normal-swap'>Standard/Swap Collection</option>
                  <option value='other'>Other Collection</option>
                  <option value='custom'>Custom Collection</option>
                  <option value='accessories'>Accessories Collection</option>
                </select>
                <p className='text-xs text-gray-500 mt-1'>Collection type cannot be changed after creation</p>
              </div>
              
              {/* Gaming Collection Specific Fields */}
              {editingCollection.type === 'gaming' && (
                <>
                  <div>
                    <label className='block text-sm font-semibold mb-1'>Collection Price (₹) *</label>
                    <input
                      type='number'
                      value={editingCollection.price || ''}
                      onChange={(e) => setEditingCollection({
                        ...editingCollection, 
                        price: Number(e.target.value)
                      })}
                      className='w-full border rounded px-3 py-2'
                      placeholder='499'
                    />
                    <p className='text-xs text-gray-500 mt-1'>Price for the collection (covers)</p>
                  </div>
                  <div>
                    <label className='block text-sm font-semibold mb-1'>Plate Price (₹) *</label>
                    <input
                      type='number'
                      value={editingCollection.plateprice || ''}
                      onChange={(e) => setEditingCollection({
                        ...editingCollection,
                        plateprice: Number(e.target.value)
                      })}
                      className='w-full border rounded px-3 py-2'
                      placeholder='299'
                    />
                    <p className='text-xs text-gray-500 mt-1'>Price for additional plates only</p>
                  </div>
                  <div>
                    <label className='block text-sm font-semibold mb-1'>Features (comma-separated)</label>
                    <textarea
                      value={(editingCollection.Features || []).join(', ')}
                      onChange={(e) => setEditingCollection({
                        ...editingCollection,
                        Features: e.target.value.split(',').map(f => f.trim()).filter(f => f)
                      })}
                      className='w-full border rounded px-3 py-2 h-20'
                      placeholder='Shockproof, Wireless Charging Compatible, Raised Edges'
                    />
                  </div>
                </>
              )}
              
              <div>
                <label className='block text-sm font-semibold mb-1'>Hero/Cover Image</label>
                <div className='space-y-2'>
                  {editingCollection.heroImage && (
                    <div className='relative w-full h-32 rounded overflow-hidden'>
                      <img 
                        src={editingCollection.heroImage} 
                        alt="Current hero" 
                        className='w-full h-full object-cover'
                      />
                    </div>
                  )}
                  <label htmlFor='heroImageUpload' className='cursor-pointer'>
                    <div className='w-full h-32 border-2 border-dashed border-gray-300 rounded hover:border-blue-400 flex items-center justify-center'>
                      {editingCollection.newHeroImage ? (
                        <img 
                          src={URL.createObjectURL(editingCollection.newHeroImage)} 
                          alt="New hero" 
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <div className='text-center'>
                          <svg className='mx-auto h-8 w-8 text-gray-400' stroke='currentColor' fill='none' viewBox='0 0 48 48'>
                            <path d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                          </svg>
                          <p className='text-xs text-gray-500 mt-1'>Upload new hero image</p>
                        </div>
                      )}
                    </div>
                    <input 
                      id='heroImageUpload'
                      type='file' 
                      accept='image/*'
                      hidden
                      onChange={(e) => setEditingCollection({...editingCollection, newHeroImage: e.target.files[0]})}
                    />
                  </label>
                </div>
              </div>
              <div className='flex gap-2 justify-end'>
                <button
                  onClick={() => {
                    setShowCollectionModal(false)
                    setEditingCollection(null)
                  }}
                  className='px-4 py-2 bg-gray-300 rounded hover:bg-gray-400'
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const formData = new FormData();
                    formData.append('name', editingCollection.name);
                    formData.append('description', editingCollection.description);
                    formData.append('type', editingCollection.type);
                    
                    // Gaming/swap-wrap collection price fields (flat structure)
                    if (editingCollection.type === 'gaming' || editingCollection.type === 'swap-wrap') {
                      if (editingCollection.price) {
                        formData.append('price', Number(editingCollection.price));
                      }
                      if (editingCollection.plateprice) {
                        formData.append('plateprice', Number(editingCollection.plateprice));
                      }
                      if (editingCollection.Features && editingCollection.Features.length > 0) {
                        editingCollection.Features.forEach(feature => {
                          formData.append('features[]', feature);
                        });
                      }
                    }
                    
                    if (editingCollection.newHeroImage) {
                      formData.append('heroImage', editingCollection.newHeroImage);
                    }
                    
                    try {
                      const response = await axios.patch(
                        backendUrl + `/api/collections/${editingCollection._id || editingCollection.id}`, 
                        formData,
                        {
                          headers: {
                            'Content-Type': 'multipart/form-data'
                          }
                        }
                      );

                      if (response.data.success) {
                        toast.success('Collection updated successfully');
                        setShowCollectionModal(false);
                        setEditingCollection(null);
                        await fetchAllData();
                      } else {
                        toast.error(response.data.message || 'Failed to update collection');
                      }
                    } catch (error) {
                      console.error('Update collection error:', error);
                      toast.error(error.response?.data?.message || error.message || 'Failed to update collection');
                    }
                  }}
                  className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Edit Modal */}
      {showProductModal && editingProduct && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' onClick={() => setShowProductModal(false)}>
          <div className='bg-white rounded-lg p-6 max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto' onClick={(e) => e.stopPropagation()}>
            <h3 className='text-xl font-bold mb-4'>Edit Product</h3>
            <div className='space-y-6'>
              
              {/* Product Images */}
              <div>
                <label className='block text-sm font-semibold mb-2'>
                  Product Image{editingProduct.type !== 'gaming' ? 's' : ''} *
                </label>
                <p className='text-xs text-gray-500 mb-3'>
                  {editingProduct.type === 'gaming' 
                    ? 'Upload a single image for this gaming product.' 
                    : 'Upload up to 4 images. First image will be the main product image.'}
                </p>
                
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  {/* Image 1 */}
                  <div>
                    <label htmlFor='productImage1Upload' className='cursor-pointer block'>
                      <div className='w-full aspect-square border-2 border-dashed border-gray-300 rounded hover:border-blue-400 overflow-hidden'>
                        {editingProduct.newImage1 ? (
                          <img src={URL.createObjectURL(editingProduct.newImage1)} alt="New 1" className='w-full h-full object-cover' />
                        ) : editingProduct.images && editingProduct.images.length > 0 ? (
                          <img src={editingProduct.images[0]} alt="Current 1" className='w-full h-full object-cover' />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center'>
                            <div className='text-center'>
                              <svg className='mx-auto h-8 w-8 text-gray-400' stroke='currentColor' fill='none' viewBox='0 0 48 48'>
                                <path d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                              </svg>
                              <p className='text-xs text-gray-500 mt-1'>Main</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <input 
                        id='productImage1Upload'
                        type='file' 
                        accept='image/*'
                        hidden
                        onChange={(e) => setEditingProduct({...editingProduct, newImage1: e.target.files[0]})}
                      />
                    </label>
                    <p className='text-xs text-center text-gray-500 mt-1'>Image 1 (Main)</p>
                  </div>

                  {/* Image 2-4 only for non-gaming products */}
                  {editingProduct.type !== 'gaming' && (
                    <>
                      {/* Image 2 */}
                      <div>
                        <label htmlFor='productImage2Upload' className='cursor-pointer block'>
                          <div className='w-full aspect-square border-2 border-dashed border-gray-300 rounded hover:border-blue-400 overflow-hidden'>
                            {editingProduct.newImage2 ? (
                              <img src={URL.createObjectURL(editingProduct.newImage2)} alt="New 2" className='w-full h-full object-cover' />
                            ) : (editingProduct.images && editingProduct.images.length > 1) ? (
                              <img src={editingProduct.images[1]} alt="Current 2" className='w-full h-full object-cover' />
                            ) : (
                              <div className='w-full h-full flex items-center justify-center'>
                                <div className='text-center'>
                                  <svg className='mx-auto h-8 w-8 text-gray-400' stroke='currentColor' fill='none' viewBox='0 0 48 48'>
                                    <path d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                                  </svg>
                                  <p className='text-xs text-gray-500 mt-1'>Upload</p>
                                </div>
                              </div>
                            )}
                          </div>
                          <input 
                            id='productImage2Upload'
                            type='file' 
                            accept='image/*'
                            hidden
                            onChange={(e) => setEditingProduct({...editingProduct, newImage2: e.target.files[0]})}
                          />
                        </label>
                        <p className='text-xs text-center text-gray-500 mt-1'>Image 2 (Optional)</p>
                      </div>

                      {/* Image 3 */}
                      <div>
                        <label htmlFor='productImage3Upload' className='cursor-pointer block'>
                          <div className='w-full aspect-square border-2 border-dashed border-gray-300 rounded hover:border-blue-400 overflow-hidden'>
                            {editingProduct.newImage3 ? (
                              <img src={URL.createObjectURL(editingProduct.newImage3)} alt="New 3" className='w-full h-full object-cover' />
                            ) : (editingProduct.images && editingProduct.images.length > 2) ? (
                              <img src={editingProduct.images[2]} alt="Current 3" className='w-full h-full object-cover' />
                            ) : (
                              <div className='w-full h-full flex items-center justify-center'>
                                <div className='text-center'>
                                  <svg className='mx-auto h-8 w-8 text-gray-400' stroke='currentColor' fill='none' viewBox='0 0 48 48'>
                                    <path d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                                  </svg>
                                  <p className='text-xs text-gray-500 mt-1'>Upload</p>
                                </div>
                              </div>
                            )}
                          </div>
                          <input 
                            id='productImage3Upload'
                            type='file' 
                            accept='image/*'
                            hidden
                            onChange={(e) => setEditingProduct({...editingProduct, newImage3: e.target.files[0]})}
                          />
                        </label>
                        <p className='text-xs text-center text-gray-500 mt-1'>Image 3 (Optional)</p>
                      </div>

                      {/* Image 4 */}
                      <div>
                        <label htmlFor='productImage4Upload' className='cursor-pointer block'>
                          <div className='w-full aspect-square border-2 border-dashed border-gray-300 rounded hover:border-blue-400 overflow-hidden'>
                            {editingProduct.newImage4 ? (
                              <img src={URL.createObjectURL(editingProduct.newImage4)} alt="New 4" className='w-full h-full object-cover' />
                            ) : (editingProduct.images && editingProduct.images.length > 3) ? (
                              <img src={editingProduct.images[3]} alt="Current 4" className='w-full h-full object-cover' />
                            ) : (
                              <div className='w-full h-full flex items-center justify-center'>
                                <div className='text-center'>
                                  <svg className='mx-auto h-8 w-8 text-gray-400' stroke='currentColor' fill='none' viewBox='0 0 48 48'>
                                    <path d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                                  </svg>
                                  <p className='text-xs text-gray-500 mt-1'>Upload</p>
                                </div>
                              </div>
                            )}
                          </div>
                          <input 
                            id='productImage4Upload'
                            type='file' 
                            accept='image/*'
                            hidden
                            onChange={(e) => setEditingProduct({...editingProduct, newImage4: e.target.files[0]})}
                          />
                        </label>
                        <p className='text-xs text-center text-gray-500 mt-1'>Image 4 (Optional)</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Basic Information */}
              <div className='grid grid-cols-2 gap-4'>
                <div className='col-span-2'>
                  <label className='block text-sm font-semibold mb-1'>Product Name *</label>
                  <input
                    type='text'
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    className='w-full border rounded px-3 py-2'
                    required
                  />
                </div>
                <div className='col-span-2'>
                  <label className='block text-sm font-semibold mb-1'>Price (₹) {editingProduct.type === 'gaming' ? '(Set by Collection)' : '*'}</label>
                  <input
                    type='number'
                    value={editingProduct.price || editingProduct.coverprice || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                    className='w-full border rounded px-3 py-2'
                    disabled={editingProduct.type === 'gaming'}
                  />
                  {editingProduct.type === 'gaming' && editingProduct.level && (
                    <p className='text-xs text-gray-500 mt-1'>Level: {editingProduct.level} (Level cannot be changed after creation)</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className='block text-sm font-semibold mb-1'>Description</label>
                <textarea
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                  className='w-full border rounded px-3 py-2 h-24'
                />
              </div>

              {/* Product Specifications */}
              <div>
                <h4 className='font-semibold text-gray-800 mb-3 border-b pb-2'>Product Specifications</h4>
                <div className='grid grid-cols-3 gap-4'>
                  <div>
                    <label className='block text-sm font-semibold mb-1'>Category *</label>
                    <select
                      value={editingProduct.category || 'Phone Case'}
                      onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                      className='w-full border rounded px-3 py-2'
                    >
                      <option value='Phone Case'>Phone Case</option>
                      <option value='Phone Skin'>Phone Skin</option>
                      <option value='Screen Protector'>Screen Protector</option>
                      <option value='Full Body Wrap'>Full Body Wrap</option>
                      <option value='Camera Protector'>Camera Protector</option>
                      <option value='Combo Pack'>Combo Pack</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-semibold mb-1'>Material *</label>
                    <select
                      value={editingProduct.material || 'TPU'}
                      onChange={(e) => setEditingProduct({...editingProduct, material: e.target.value})}
                      className='w-full border rounded px-3 py-2'
                    >
                      <option value='TPU'>TPU</option>
                      <option value='Silicone'>Silicone</option>
                      <option value='Polycarbonate'>Polycarbonate</option>
                      <option value='Leather'>Leather</option>
                      <option value='PU Leather'>PU Leather</option>
                      <option value='Metal'>Metal</option>
                      <option value='Vinyl'>Vinyl</option>
                      <option value='Tempered Glass'>Tempered Glass</option>
                      <option value='Hybrid'>Hybrid</option>
                      <option value='Aramid Fiber'>Aramid Fiber</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-semibold mb-1'>Finish</label>
                    <select
                      value={editingProduct.finish || 'Matte'}
                      onChange={(e) => setEditingProduct({...editingProduct, finish: e.target.value})}
                      className='w-full border rounded px-3 py-2'
                    >
                      <option value='Matte'>Matte</option>
                      <option value='Glossy'>Glossy</option>
                      <option value='Textured'>Textured</option>
                      <option value='Transparent'>Transparent</option>
                      <option value='Metallic'>Metallic</option>
                      <option value='Carbon Fiber'>Carbon Fiber</option>
                      <option value='Wood Grain'>Wood Grain</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Design Details */}
              <div>
                <h4 className='font-semibold text-gray-800 mb-3 border-b pb-2'>Design Details</h4>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-semibold mb-1'>Design Type</label>
                    <select
                      value={editingProduct.design?.type || 'Solid Color'}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct, 
                        design: {...(editingProduct.design || {}), type: e.target.value}
                      })}
                      className='w-full border rounded px-3 py-2'
                    >
                      <option value='Solid Color'>Solid Color</option>
                      <option value='Pattern'>Pattern</option>
                      <option value='Custom Print'>Custom Print</option>
                      <option value='Transparent'>Transparent</option>
                      <option value='Gradient'>Gradient</option>
                      <option value='Marble'>Marble</option>
                      <option value='Abstract'>Abstract</option>
                      <option value='Gaming Character'>Gaming Character</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-semibold mb-1'>Pattern (if applicable)</label>
                    <input
                      type='text'
                      value={editingProduct.design?.pattern || ''}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        design: {...(editingProduct.design || {}), pattern: e.target.value}
                      })}
                      className='w-full border rounded px-3 py-2'
                      placeholder='e.g., Stripes, Dots'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-semibold mb-1'>Primary Color</label>
                    <input
                      type='text'
                      value={editingProduct.design?.color?.primary || ''}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        design: {
                          ...(editingProduct.design || {}),
                          color: {...(editingProduct.design?.color || {}), primary: e.target.value}
                        }
                      })}
                      className='w-full border rounded px-3 py-2'
                      placeholder='e.g., Red, Blue'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-semibold mb-1'>Secondary Color</label>
                    <input
                      type='text'
                      value={editingProduct.design?.color?.secondary || ''}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        design: {
                          ...(editingProduct.design || {}),
                          color: {...(editingProduct.design?.color || {}), secondary: e.target.value}
                        }
                      })}
                      className='w-full border rounded px-3 py-2'
                      placeholder='e.g., White'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-semibold mb-1'>Hex Code</label>
                    <input
                      type='text'
                      value={editingProduct.design?.color?.hexCode || ''}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        design: {
                          ...(editingProduct.design || {}),
                          color: {...(editingProduct.design?.color || {}), hexCode: e.target.value}
                        }
                      })}
                      className='w-full border rounded px-3 py-2'
                      placeholder='#000000'
                    />
                  </div>
                  <div className='flex items-center'>
                    <label className='flex items-center cursor-pointer'>
                      <input
                        type='checkbox'
                        checked={editingProduct.design?.customizable || false}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          design: {...(editingProduct.design || {}), customizable: e.target.checked}
                        })}
                        className='w-4 h-4 mr-2'
                      />
                      <span className='text-sm font-semibold'>Customizable</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <label className='block text-sm font-semibold mb-1'>Features (comma-separated)</label>
                <textarea
                  value={(editingProduct.Features || []).join(', ')}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    Features: e.target.value.split(',').map(f => f.trim()).filter(f => f)
                  })}
                  className='w-full border rounded px-3 py-2 h-20'
                  placeholder='Shockproof, Wireless Charging Compatible, Raised Edges'
                />
              </div>

              {/* Phone Brands - Only for 'other' type products */}
              {editingProduct.type === 'other' && (
                <div>
                  <h4 className='font-semibold text-gray-800 mb-3 border-b pb-2'>📱 Phone Brand Cover Counts</h4>
                  <p className='text-sm text-gray-600 mb-3'>Edit the number of back covers available for each phone model</p>
                  
                  {editingProduct.phoneBrands && editingProduct.phoneBrands.length > 0 ? (
                    <div className='space-y-4 max-h-96 overflow-y-auto border rounded p-4 bg-gray-50'>
                      {editingProduct.phoneBrands.map((brand, brandIndex) => (
                        <div key={brandIndex} className='border border-gray-200 rounded-lg p-3 bg-white'>
                          <h5 className='font-semibold text-gray-700 mb-2'>{brand.brandName}</h5>
                          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                            {brand.models.map((model, modelIndex) => (
                              <div key={modelIndex} className='flex items-center gap-2'>
                                <label className='text-sm text-gray-600 flex-1 truncate' title={model.modelName}>
                                  {model.modelName}
                                </label>
                                <input
                                  type='number'
                                  min='0'
                                  value={model.coverCount}
                                  onChange={(e) => {
                                    const newPhoneBrands = [...editingProduct.phoneBrands];
                                    newPhoneBrands[brandIndex].models[modelIndex].coverCount = parseInt(e.target.value) || '';
                                    setEditingProduct({...editingProduct, phoneBrands: newPhoneBrands});
                                  }}
                                  className='w-20 px-2 py-1 border border-gray-300 rounded focus:border-purple-500 focus:outline-none text-sm'
                                  placeholder='0'
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-sm text-orange-600 p-3 bg-orange-50 rounded'>
                      No phone brand data available for this product. This may be an older product created before the phone brands feature was added.
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className='flex gap-2 justify-end pt-4 border-t'>
                <button
                  onClick={() => {
                    setShowProductModal(false)
                    setEditingProduct(null)
                  }}
                  className='px-4 py-2 bg-gray-300 rounded hover:bg-gray-400'
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const formData = new FormData();
                    formData.append('name', editingProduct.name);
                    formData.append('description', editingProduct.description || '');
                    formData.append('category', editingProduct.category);
                    formData.append('material', editingProduct.material);
                    formData.append('finish', editingProduct.finish);
                    formData.append('level', editingProduct.level || '1');
                    
                    if (editingProduct.type !== 'gaming' && editingProduct.price) {
                      formData.append('price', editingProduct.price);
                    }
                    
                    // Design data
                    if (editingProduct.design) {
                      formData.append('designType', editingProduct.design.type || 'Solid Color');
                      formData.append('pattern', editingProduct.design.pattern || '');
                      formData.append('primaryColor', editingProduct.design.color?.primary || '');
                      formData.append('secondaryColor', editingProduct.design.color?.secondary || '');
                      formData.append('hexCode', editingProduct.design.color?.hexCode || '');
                      formData.append('customizable', editingProduct.design.customizable || false);
                    }
                    
                    // Features
                    if (editingProduct.Features && editingProduct.Features.length > 0) {
                      formData.append('features', editingProduct.Features.join(','));
                    }
                    
                    // Phone brands for 'other' type products
                    if (editingProduct.type === 'other' && editingProduct.phoneBrands) {
                      formData.append('phoneBrands', JSON.stringify(editingProduct.phoneBrands));
                    }
                    
                    // Images
                    if (editingProduct.newImage1) {
                      formData.append('image1', editingProduct.newImage1);
                    }
                    if (editingProduct.newImage2) {
                      formData.append('image2', editingProduct.newImage2);
                    }
                    if (editingProduct.newImage3) {
                      formData.append('image3', editingProduct.newImage3);
                    }
                    if (editingProduct.newImage4) {
                      formData.append('image4', editingProduct.newImage4);
                    }

                    try {
                      const response = await axios.patch(
                        backendUrl + `/api/products/${editingProduct._id || editingProduct.id}`,
                        formData,
                        {
                          headers: {
                            'Content-Type': 'multipart/form-data'
                          }
                        }
                      );

                      if (response.data.success) {
                        toast.success('Product updated successfully');
                        setShowProductModal(false);
                        setEditingProduct(null);
                        await fetchAllData();
                      } else {
                        toast.error(response.data.message || 'Failed to update product');
                      }
                    } catch (error) {
                      console.error('Update product error:', error);
                      toast.error(error.response?.data?.message || error.message || 'Failed to update product');
                    }
                  }}
                  className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default List
