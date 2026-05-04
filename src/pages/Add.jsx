import React, { useState, useEffect } from 'react'
import {assets} from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import AddGroupModal from '../components/AddGroupModal'
import AddCollectionModal from '../components/AddCollectionModal'

const Add = ({token}) => {

  const [image1,setImage1] = useState(false)
  const [image2,setImage2] = useState(false)
  const [image3,setImage3] = useState(false)
  const [image4,setImage4] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Product Type
  const [productType, setProductType] = useState("gaming"); // gaming or Standard
  
  // Gaming specific
  const [collections, setCollections] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [isAddCollectionModalOpen, setIsAddCollectionModalOpen] = useState(false);
  
  // Standard collection specific
  const [standardCollections, setStandardCollections] = useState([]);
  const [selectedStandardCollection, setSelectedStandardCollection] = useState("");
  const [loadingStandardCollections, setLoadingStandardCollections] = useState(false);
  const [usedLevels, setUsedLevels] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  // Other type specific
  const [otherCollections, setOtherCollections] = useState([]);
  const [selectedOtherCollection, setSelectedOtherCollection] = useState("");
  const [loadingOtherCollections, setLoadingOtherCollections] = useState(false);
  const [phoneBrands, setPhoneBrands] = useState([]);
  const [loadingPhoneBrands, setLoadingPhoneBrands] = useState(false);
  const [phoneBrandData, setPhoneBrandData] = useState([]);
  
  // Basic Product Info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [plateprice, setPlateprice] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [level, setLevel] = useState("1");
  
  // Product Details
  const [category, setCategory] = useState("Phone Case");
  const [material, setMaterial] = useState("TPU");
  const [finish, setFinish] = useState("Matte");
  const [designType, setDesignType] = useState("Solid Color");
  const [primaryColor, setPrimaryColor] = useState("");
  const [secondaryColor, setSecondaryColor] = useState("");
  const [hexCode, setHexCode] = useState("");
  const [pattern, setPattern] = useState("");
  const [customizable, setCustomizable] = useState(false);
  const [showInBrowseAll, setShowInBrowseAll] = useState(true);
  const [features, setFeatures] = useState("");
  
  // Fetch Collections and Groups
  useEffect(() => {
    if (productType === "gaming") {
      fetchCollections();
      fetchGroups();
    } else if (productType === "Standard") {
      fetchStandardCollections();
    } else if (productType === "other") {
      fetchOtherCollections();
      fetchPhoneBrands();
    }
  }, [productType]);

  // Filter collections when group is selected
  useEffect(() => {
    if (selectedGroup && groups.length > 0 && collections.length > 0) {
      const group = groups.find(g => (g._id || g.id) === selectedGroup);
      if (group && group.collections) {
        // Filter collections that are in this group's collections array
        const groupCollectionIds = group.collections.map(c => {
          // Handle both populated and unpopulated references
          if (typeof c === 'string') return c;
          return c._id || c.id || c;
        });
        const filtered = collections.filter(col => 
          groupCollectionIds.includes(col._id || col.id)
        );
        console.log('Selected group:', group);
        console.log('Group collection IDs:', groupCollectionIds);
        console.log('Filtered collections:', filtered);
        setFilteredCollections(filtered);
        setSelectedCollection(""); // Reset collection selection when group changes
      } else {
        setFilteredCollections([]);
      }
    } else {
      // Don't show any collections until a group is selected
      setFilteredCollections([]);
    }
  }, [selectedGroup, groups, collections]);
  
  // Fetch products in selected collection to get used levels
  useEffect(() => {
    if (selectedCollection && productType === "gaming") {
      fetchUsedLevels();
    } else {
      setUsedLevels([]);
    }
  }, [selectedCollection, productType]);

  // Auto-select first available level when used levels change
  useEffect(() => {
    if (productType === "gaming" && selectedCollection && !loadingProducts) {
      const availableLevels = ['1', '2', '3', '4', '5'].filter(lvl => !usedLevels.includes(lvl));
      if (availableLevels.length > 0 && !availableLevels.includes(level)) {
        setLevel(availableLevels[0]);
      }
    }
  }, [usedLevels, loadingProducts, productType, selectedCollection]);
  
  const fetchUsedLevels = async () => {
    try {
      setLoadingProducts(true);
      
      // First, fetch the collection to get its product IDs
      const collectionResponse = await axios.get(`${backendUrl}/api/collections/${selectedCollection}`);
      console.log('Collection response:', collectionResponse.data);
      
      if (collectionResponse.data.success && collectionResponse.data.data) {
        const collection = collectionResponse.data.data;
        const productIds = collection.products || [];
        console.log('Product IDs in collection:', productIds);
        
        if (productIds.length === 0) {
          console.log('No products in this collection yet');
          setUsedLevels([]);
          return;
        }
        
        // Fetch all products and filter by IDs
        const productsResponse = await axios.get(`${backendUrl}/api/products?limit=100`);
        console.log('All products response:', productsResponse.data);
        
        if (productsResponse.data.success) {
          const allProducts = productsResponse.data.items || [];
          
          // Filter products that are in this collection
          const collectionProducts = allProducts.filter(p => 
            productIds.some(id => {
              const productId = p._id || p.id;
              const collectionProductId = typeof id === 'string' ? id : (id._id || id.id || id);
              return productId === collectionProductId;
            })
          );
          
          console.log('Products in this collection:', collectionProducts);
          
          // Extract used levels
          const levels = collectionProducts
            .filter(p => p.type === 'gaming' && p.level)
            .map(p => p.level.toString());
          
          console.log('Used levels in collection:', levels);
          setUsedLevels(levels);
        }
      }
    } catch (error) {
      console.error('Error fetching used levels:', error);
      setUsedLevels([]);
    } finally {
      setLoadingProducts(false);
    }
  };
  
  const fetchCollections = async () => {
    try {
      setLoadingCollections(true);
      const response = await axios.get(backendUrl + '/api/collections?type=gaming');
      console.log('Gaming Collections response:', response.data);
      if (response.data.success) {
        const cols = response.data.items || response.data.collections || response.data.data || [];
        // Filter to only show gaming type collections
        const gamingCols = cols.filter(col => col.type === 'gaming');
        console.log('Setting gaming collections:', gamingCols);
        setCollections(gamingCols);
      } else {
        console.log('Collections fetch failed:', response.data);
        toast.error('Failed to fetch collections');
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast.error('Failed to fetch collections: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoadingCollections(false);
    }
  };
  
  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);
      const response = await axios.get(backendUrl + '/api/groups');
      console.log('Groups response:', response.data);
      if (response.data.success) {
        const grps = response.data.items || response.data.data || [];
        console.log('Setting groups:', grps);
        setGroups(grps);
      } else {
        console.log('Groups fetch failed:', response.data);
        toast.error('Failed to fetch groups');
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to fetch groups: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoadingGroups(false);
    }
  };
  
  const fetchStandardCollections = async () => {
    try {
      setLoadingStandardCollections(true);
      const response = await axios.get(backendUrl + '/api/collections?type=swap-wrap');
      console.log('Standard Collections response:', response.data);
      if (response.data.success) {
        const cols = response.data.items || response.data.collections || response.data.data || [];
        console.log('All collections received:', cols);
        // Filter to only show swap-wrap type collections
        const standardCols = cols.filter(col => col.type === 'swap-wrap');
        console.log('Filtered standard collections:', standardCols);
        console.log('Number of standard collections:', standardCols.length);
        setStandardCollections(standardCols);
      } else {
        console.log('Standard collections fetch failed:', response.data);
        toast.error('Failed to fetch standard collections');
      }
    } catch (error) {
      console.error('Error fetching standard collections:', error);
      toast.error('Failed to fetch standard collections: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoadingStandardCollections(false);
    }
  };
  
  const fetchOtherCollections = async () => {
    try {
      setLoadingOtherCollections(true);
      const response = await axios.get(backendUrl + '/api/collections?type=normal');
      console.log('Other Collections response:', response.data);
      if (response.data.success) {
        const cols = response.data.items || response.data.collections || response.data.data || [];
        const otherCols = cols.filter(col => col.type === 'normal');
        console.log('Filtered other collections:', otherCols);
        setOtherCollections(otherCols);
      } else {
        console.log('Other collections fetch failed:', response.data);
        toast.error('Failed to fetch other collections');
      }
    } catch (error) {
      console.error('Error fetching other collections:', error);
      toast.error('Failed to fetch other collections: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoadingOtherCollections(false);
    }
  };
  
  const fetchPhoneBrands = async () => {
    try {
      setLoadingPhoneBrands(true);
      const response = await axios.get(backendUrl + '/api/phone-brands');
      console.log('Phone Brands response:', response.data);
      if (response.data.success) {
        const brands = response.data.data || [];
        setPhoneBrands(brands);
        // Initialize phone brand data with all brands and models, default cover count to 0
        const initialData = brands.map(brand => ({
          brandName: brand.brandName,
          models: brand.models.map(model => ({
            modelName: model.modelName,
            coverCount: 0
          }))
        }));
        setPhoneBrandData(initialData);
      } else {
        toast.error('Failed to fetch phone brands');
      }
    } catch (error) {
      console.error('Error fetching phone brands:', error);
      toast.error('Failed to fetch phone brands: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoadingPhoneBrands(false);
    }
  };

  const handleDeleteGroup = async (groupId, groupName) => {

    try {
      const response = await axios.delete(`${backendUrl}/api/groups/${groupId}`, {
        headers: { token }
      });

      if (response.data.success) {
        toast.success(`Group "${groupName}" deleted successfully`);
        // If the deleted group was selected, clear the selection
        if (selectedGroup === groupId) {
          setSelectedGroup("");
          setSelectedCollection("");
        }
        // Refresh the groups list
        fetchGroups();
      } else {
        toast.error(response.data.message || 'Failed to delete group');
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete group: ' + (error.response?.data?.message || error.message));
    }
  };

   const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Basic Info
      formData.append("name", name);
      formData.append("description", description);
      // Price for non-gaming products
      if (productType !== "gaming" && price) {
        formData.append("price", Number(price));
      }
      // Plate price for swap-wrap products
      if (productType === "Standard" && plateprice) {
        formData.append("plateprice", Number(plateprice));
      }
      // Convert product type to backend format
      const backendType = productType === "Standard" ? "swap-wrap" : productType.toLowerCase();
      formData.append("type", backendType);
      // Only append level for gaming products
      if (productType === "gaming") {
        formData.append("level", level);
      }
      
      // Quantity - for gaming and Standard (swap-wrap) products, use 0 (managed by global storage), for accessories use user input
      if (productType === "gaming" || productType === "Standard") {
        formData.append("quantity", 0); // Gaming and swap-wrap products have different stock logic (managed globally)
      } else {
        formData.append("quantity", Number(quantity) || 0);
      }
      
      // Product Details
      formData.append("category", category);
      formData.append("material", material);
      formData.append("finish", finish);
      formData.append("designType", designType);
      formData.append("primaryColor", primaryColor);
      formData.append("secondaryColor", secondaryColor);
      formData.append("hexCode", hexCode);
      formData.append("pattern", pattern);
      formData.append("customizable", customizable);
      formData.append("showInBrowseAll", showInBrowseAll);
      formData.append("features", features);
      
      // Gaming specific
      if (productType === "gaming") {
        if (!selectedCollection) {
          toast.error("Please select a collection for gaming products");
          return;
        }
        if (!selectedGroup) {
          toast.error("Please select a group for gaming products");
          return;
        }
        formData.append("collectionId", selectedCollection);
        formData.append("groupId", selectedGroup);
      }
      
      // Standard collection specific
      if (productType === "Standard") {
        if (!selectedStandardCollection) {
          toast.error("Please select a collection for standard products");
          return;
        }
        console.log("Selected Standard Collection ID:", selectedStandardCollection);
        formData.append("collectionId", selectedStandardCollection);
      }
      
      // Other collection specific
      if (productType === "other") {
        if (!selectedOtherCollection) {
          toast.error("Please select a collection for other products");
          return;
        }
        
        // Check if phone brands exist in the system
        if (!phoneBrands || phoneBrands.length === 0) {
          toast.error("No phone brands available. Please add phone brands first from the Phone Brands page.");
          return;
        }
        
        console.log("Selected Other Collection ID:", selectedOtherCollection);
        formData.append("collectionId", selectedOtherCollection);
        
        // Filter phone brand data to only include models with coverCount > 0
        const filteredPhoneBrands = phoneBrandData
          .map(brand => ({
            brandName: brand.brandName,
            models: brand.models.filter(model => model.coverCount > 0)
          }))
          .filter(brand => brand.models.length > 0);
        
        // Check if at least one model has been selected (coverCount > 0)
        if (filteredPhoneBrands.length === 0) {
          toast.error("Please set cover count (greater than 0) for at least one phone model");
          return;
        }
        
        console.log("Filtered phone brands data:", filteredPhoneBrands);
        // Add phone brand data
        formData.append("phoneBrands", JSON.stringify(filteredPhoneBrands));
      }

      // Images - For gaming: only image1, for others: all available images
      if (image1) {
        console.log('Image1 details:', {
          name: image1.name,
          type: image1.type,
          size: image1.size,
          isFile: image1 instanceof File
        });
        formData.append("image1", image1);
      } else {
        toast.error("Please upload at least one product image");
        return;
      }
      
      // Only append additional images for non-gaming products
      if (productType !== "gaming") {
        if (image2) {
          console.log('Image2 details:', {
            name: image2.name,
            type: image2.type,
            size: image2.size
          });
          formData.append("image2", image2);
        }
        if (image3) {
          console.log('Image3 details:', {
            name: image3.name,
            type: image3.type,
            size: image3.size
          });
          formData.append("image3", image3);
        }
        if (image4) {
          console.log('Image4 details:', {
            name: image4.name,
            type: image4.type,
            size: image4.size
          });
          formData.append("image4", image4);
        }
      }

      console.log('FormData entries:');
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(pair[0], '= File:', pair[1].name, pair[1].type);
        } else {
          console.log(pair[0], '=', pair[1]);
        }
      }

  // POST to backend products route (server expects POST /api/products with field name 'image1')
  const response = await axios.post(backendUrl + "/api/products", formData, { headers: { token } });

      if (response.data.success) {
        toast.success(response.data.message);
        // Reset form
        setName('');
        setDescription('');
        setPrice('');
        setPlateprice('');
        setQuantity('0');
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setPrimaryColor('');
        setSecondaryColor('');
        setHexCode('');
        setPattern('');
        setFeatures('');
        setSelectedCollection('');
        setSelectedGroup('');
        setSelectedStandardCollection('');
        setSelectedOtherCollection('');
        setPhoneBrandData(phoneBrands.map(brand => ({
          brandName: brand.brandName,
          models: brand.models.map(model => ({
            modelName: model.modelName,
            coverCount: 0
          }))
        })));
        setCustomizable(false);
        setShowInBrowseAll(true);
      } else {
        toast.error(response.data.message);
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message)
    } finally {
      setIsSubmitting(false);
    }
   }

  return (
    <>
      <AddGroupModal
        isOpen={isAddGroupModalOpen}
        onClose={() => setIsAddGroupModalOpen(false)}
        onGroupAdded={fetchGroups}
      />
      
      <AddCollectionModal
        isOpen={isAddCollectionModalOpen}
        onClose={() => setIsAddCollectionModalOpen(false)}
        onCollectionAdded={() => {
          if (productType === "gaming") {
            fetchCollections();
            fetchGroups(); // Refresh groups to show updated collection count
          } else if (productType === "other") {
            fetchOtherCollections();
          } else {
            fetchStandardCollections();
          }
        }}
        groupId={productType === "gaming" ? selectedGroup : null}
        collectionType={
          productType === "gaming" ? "gaming" : 
          productType === "other" ? "normal" :
          "swap-wrap"
        }
      />
      
      <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-4 p-6 bg-gray-50 rounded-lg max-w-6xl'>
      
      {/* Header */}
      <div className='w-full border-b pb-4'>
        <h2 className='text-2xl font-bold text-gray-800'>Add New Product</h2>
        <p className='text-sm text-gray-600 mt-1'>Fill in the details to add a new product to your inventory</p>
      </div>

      {/* Product Type Selection */}
      <div className='w-full'>
        <p className='mb-3 font-semibold text-gray-700'>Product Type *</p>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
          <div 
            onClick={() => setProductType("gaming")}
            className={`p-4 border-2 rounded-lg cursor-pointer transition ${
              productType === "gaming" 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 bg-white hover:border-blue-300'
            }`}
          >
            <div className='flex flex-col items-center text-center gap-2'>
              <span className='text-2xl'>🎮</span>
              <p className='font-semibold text-sm text-gray-800'>Gaming</p>
            </div>
          </div>
          
          <div 
            onClick={() => setProductType("Standard")}
            className={`p-4 border-2 rounded-lg cursor-pointer transition ${
              productType === "Standard" 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 bg-white hover:border-green-300'
            }`}
          >
            <div className='flex flex-col items-center text-center gap-2'>
              <span className='text-2xl'>📱</span>
              <p className='font-semibold text-sm text-gray-800'>Swap-Wrap</p>
            </div>
          </div>
          
          <div 
            onClick={() => setProductType("other")}
            className={`p-4 border-2 rounded-lg cursor-pointer transition ${
              productType === "other" 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-300 bg-white hover:border-purple-300'
            }`}
          >
            <div className='flex flex-col items-center text-center gap-2'>
              <span className='text-2xl'>📦</span>
              <p className='font-semibold text-sm text-gray-800'>Other</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gaming Collection & Group Selection */}
      {productType === "gaming" && (
        <div key="gaming-section" className='w-full bg-blue-50 p-4 rounded-lg border border-blue-200'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='font-semibold text-gray-800'>🎮 Gaming Collection Settings</h3>
            <button
              type="button"
              onClick={() => {
                fetchCollections();
                fetchGroups();
              }}
              className='px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition'
            >
              🔄 Refresh
            </button>
          </div>

          {/* Group Selection */} 
          <div>
            <div className='flex justify-between items-center mb-2'>
              <p className='font-medium text-gray-700'>Select Group *</p>
              <button
                type="button"
                onClick={() => setIsAddGroupModalOpen(true)}
                className='px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition flex items-center gap-1'
              >
                <span>+</span> New Group
              </button>
            </div>
            <div className='overflow-x-auto pb-2'>
              <div className='flex gap-3'>
                {loadingGroups ? (
                  <p className='text-sm text-gray-500 self-center'>Loading groups...</p>
                ) : groups.length === 0 ? (
                  <div className='text-sm text-gray-500 self-center flex flex-col gap-2'>
                    <p>No groups available. Create a group first.</p>
                    <button
                      type="button"
                      onClick={() => setIsAddGroupModalOpen(true)}
                      className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition'
                    >
                      + Create Your First Group
                    </button>
                  </div>
                ) : (
                  groups.map((group) => (
                    <div
                      key={group._id}
                      className={`min-w-[150px] p-3 border-2 rounded-lg cursor-pointer transition shrink-0 relative ${
                        selectedGroup === group._id
                          ? 'border-purple-500 bg-purple-100 shadow-md'
                          : 'border-gray-300 bg-white hover:border-purple-300 hover:shadow'
                      }`}
                    >
                      <div onClick={() => setSelectedGroup(group._id)}>
                        <p className='font-semibold text-sm text-gray-800 truncate pr-6'>{group.name}</p>
                        <p className='text-xs text-gray-500 mt-1'>
                          {group.collections?.length || 0} collections
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGroup(group._id, group.name);
                        }}
                        className='absolute top-2 right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition'
                        title={`Delete ${group.name}`}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          {/* Collection Selection */}
          <div className='mb-4'>
            <div className='flex justify-between items-center mb-2'>
              <p className='font-medium text-gray-700'>
                Select Collection * 
                {selectedGroup && filteredCollections.length > 0 && (
                  <span className='text-sm text-gray-500 ml-2'>
                    (Showing {filteredCollections.length} collection(s) from selected group)
                  </span>
                )}
              </p>
              {selectedGroup && (
      <button
        type="button"
        onClick={() => setIsAddCollectionModalOpen(true)}
        className='px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition flex items-center gap-1'
      >
        <span>+</span> New Collection
      </button>
    )}
            </div>
            <div className='overflow-x-auto pb-2'>
              <div className='flex gap-3'>
                {loadingCollections ? (
                  <p className='text-sm text-gray-500'>Loading collections...</p>
                ) : selectedGroup && filteredCollections.length === 0 ? (
                  <p className='text-sm text-orange-600'>No collections available in the selected group. Please select a different group or add collections to this group first.</p>
                ) : filteredCollections.length === 0 ? (
                  <p className='text-sm text-gray-500'>Please select a group first to see available collections.</p>
                ) : (
                  filteredCollections.map((collection) => (
                    <div
                      key={collection._id || collection.id}
                      onClick={() => setSelectedCollection(collection._id || collection.id)}
                      className={`min-w-[180px] p-3 border-2 rounded-lg cursor-pointer transition shrink-0 ${
                        selectedCollection === (collection._id || collection.id)
                          ? 'border-blue-500 bg-blue-100 shadow-md'
                          : 'border-gray-300 bg-white hover:border-blue-300 hover:shadow'
                      }`}
                    >
                      <p className='font-semibold text-sm text-gray-800 truncate'>{collection.name}</p>
                      <p className='text-xs text-gray-500 mt-1'>
                        {collection.products?.length || 0} products
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          
          
        </div>
      )}

      {/* Other Product Type Collection Selection */}
      {productType === "other" && (
        <div key="other-section" className='w-full bg-purple-50 p-4 rounded-lg border border-purple-200'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='font-semibold text-gray-800'>📦 Other Product Settings</h3>
            <button
              type="button"
              onClick={() => {
                fetchOtherCollections();
                fetchPhoneBrands();
              }}
              className='px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition'
            >
              🔄 Refresh
            </button>
          </div>

          {/* Collection Selection */}
          <div className='mb-4'>
            <div className='flex justify-between items-center mb-2'>
              <p className='font-medium text-gray-700'>Select Collection *</p>
              <button
                type="button"
                onClick={() => setIsAddCollectionModalOpen(true)}
                className='px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center gap-1'
              >
                <span>+</span> New Collection
              </button>
            </div>
            <div className='overflow-x-auto pb-2'>
              <div className='flex gap-3'>
                {loadingOtherCollections ? (
                  <p className='text-sm text-gray-500'>Loading collections...</p>
                ) : otherCollections.length === 0 ? (
                  <div className='text-sm text-gray-500 flex flex-col gap-2'>
                    <p>No other collections available. Create a collection first.</p>
                    <button
                      type="button"
                      onClick={() => setIsAddCollectionModalOpen(true)}
                      className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition'
                    >
                      + Create Your First Other Collection
                    </button>
                  </div>
                ) : (
                  otherCollections.map((collection) => (
                    <div
                      key={collection._id || collection.id}
                      onClick={() => {
                        console.log('Selecting other collection:', collection._id || collection.id);
                        setSelectedOtherCollection(collection._id || collection.id);
                      }}
                      className={`min-w-[180px] p-3 border-2 rounded-lg cursor-pointer transition shrink-0 ${
                        selectedOtherCollection === (collection._id || collection.id)
                          ? 'border-purple-500 bg-purple-100 shadow-md'
                          : 'border-gray-300 bg-white hover:border-purple-300 hover:shadow'
                      }`}
                    >
                      <p className='font-semibold text-sm text-gray-800 truncate'>{collection.name}</p>
                      <p className='text-xs text-gray-500 mt-1'>
                        {collection.products?.length || 0} products
                      </p>
                      <p className='text-xs text-gray-400 mt-1'>Type: Other</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Phone Brands & Models Cover Count */}
          {selectedOtherCollection && (
            <div className='mt-4 bg-white p-4 rounded-lg border border-purple-200'>
              <h4 className='font-semibold text-gray-800 mb-2'>📱 Phone Brand Cover Counts</h4>
              <p className='text-sm text-gray-600 mb-2'>Set the number of back covers available for each phone model</p>
              <div className='bg-blue-50 border border-blue-200 rounded p-2 mb-4'>
                <p className='text-xs text-blue-800'>
                  💡 <span className='font-semibold'>Tip:</span> Only set cover count {`"(> 0)"`} for phone models that are compatible with this product. You must select at least one model.
                </p>
              </div>
              
              {loadingPhoneBrands ? (
                <p className='text-sm text-gray-500'>Loading phone brands...</p>
              ) : phoneBrands.length === 0 ? (
                <div className='bg-orange-50 border border-orange-300 rounded-lg p-4 text-center'>
                  <p className='text-sm font-semibold text-orange-800 mb-2'>⚠️ No phone brands available</p>
                  <p className='text-xs text-orange-700 mb-3'>
                    You need to add phone brands and models before creating 'Other' type products.
                  </p>
                  <p className='text-xs text-orange-600'>
                    Please go to the <span className='font-semibold'>Phone Brands</span> page to add brands and models first.
                  </p>
                </div>
              ) : (
                <div className='space-y-4 max-h-96 overflow-y-auto'>
                  {phoneBrandData.map((brand, brandIndex) => (
                    <div key={brandIndex} className='border border-gray-200 rounded-lg p-3'>
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
                                const newData = [...phoneBrandData];
                                newData[brandIndex].models[modelIndex].coverCount = parseInt(e.target.value) || 0;
                                setPhoneBrandData(newData);
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
              )}
            </div>
          )}
        </div>
      )}

      {/* Standard Collection Selection */}
      {productType === "Standard" && (
        <div key="standard-section" className='w-full bg-green-50 p-4 rounded-lg border border-green-200'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='font-semibold text-gray-800'>📱 Standard Collection Settings</h3>
            <button
              type="button"
              onClick={() => {
                fetchStandardCollections();
              }}
              className='px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition'
            >
              🔄 Refresh
            </button>
          </div>

          {/* Collection Selection */}
          <div>
            <div className='flex justify-between items-center mb-2'>
              <p className='font-medium text-gray-700'>Select Collection *</p>
              <button
                type="button"
                onClick={() => setIsAddCollectionModalOpen(true)}
                className='px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center gap-1'
              >
                <span>+</span> New Collection
              </button>
            </div>
            <div className='overflow-x-auto pb-2'>
              <div className='flex gap-3'>
                {loadingStandardCollections ? (
                  <p className='text-sm text-gray-500'>Loading collections...</p>
                ) : standardCollections.length === 0 ? (
                  <div className='text-sm text-gray-500 flex flex-col gap-2'>
                    <p>No standard collections available. Create a collection first.</p>
                    <button
                      type="button"
                      onClick={() => setIsAddCollectionModalOpen(true)}
                      className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition'
                    >
                      + Create Your First Collection
                    </button>
                  </div>
                ) : (
                  standardCollections.map((collection) => (
                    <div
                      key={collection._id || collection.id}
                      onClick={() => {
                        console.log('Selecting standard collection:', collection._id || collection.id);
                        setSelectedStandardCollection(collection._id || collection.id);
                      }}
                      className={`min-w-[180px] p-3 border-2 rounded-lg cursor-pointer transition shrink-0 ${
                        selectedStandardCollection === (collection._id || collection.id)
                          ? 'border-green-500 bg-green-100 shadow-md'
                          : 'border-gray-300 bg-white hover:border-green-300 hover:shadow'
                      }`}
                    >
                      <p className='font-semibold text-sm text-gray-800 truncate'>{collection.name}</p>
                      <p className='text-xs text-gray-500 mt-1'>
                        {collection.products?.length || 0} products
                      </p>
                      <p className='text-xs text-gray-400 mt-1'>Type: Standard</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Details Form - Only show when selections are made */}
      {((productType === "gaming" && selectedGroup && selectedCollection) || 
  (productType === "Standard" && selectedStandardCollection) ||
  (productType === "other" && selectedOtherCollection)) && (
  <>
    {/* Upload Image */}
    <div className='w-full'>
      <p className='mb-2 font-semibold text-gray-700'>
        {productType === "gaming" ? 'Product Image *' : 'Product Images * (Up to 4 images)'}
      </p>
      <div className='flex gap-4 flex-wrap'>
        {/* Image 1 - Always shown */}
        <div>
          <label htmlFor="image1" className='cursor-pointer block'>
            <div className='w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-blue-400 transition'>
              <img 
                className='w-full h-full object-cover' 
                src={!image1 ? assets.upload_area : URL.createObjectURL(image1)} 
                alt="Upload 1" 
              />
            </div>
          </label>
          <input onChange={(e)=>setImage1(e.target.files[0])} type="file" id="image1" hidden accept='image/*'/>
          <p className='text-xs text-gray-500 text-center mt-1'>{productType === "gaming" ? 'Required' : 'Main'}</p>
        </div>
        
        {/* Images 2-4 - Only for non-gaming products */}
        {productType !== "gaming" && (
          <>
            {/* Image 2 */}
            <div>
              <label htmlFor="image2" className='cursor-pointer block'>
                <div className='w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-blue-400 transition'>
                  <img 
                    className='w-full h-full object-cover' 
                    src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} 
                    alt="Upload 2" 
                  />
                </div>
              </label>
              <input onChange={(e)=>setImage2(e.target.files[0])} type="file" id="image2" hidden accept='image/*'/>
              <p className='text-xs text-gray-500 text-center mt-1'>Optional</p>
            </div>
            
            {/* Image 3 */}
            <div>
              <label htmlFor="image3" className='cursor-pointer block'>
                <div className='w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-blue-400 transition'>
                  <img 
                    className='w-full h-full object-cover' 
                    src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} 
                    alt="Upload 3" 
                  />
                </div>
              </label>
              <input onChange={(e)=>setImage3(e.target.files[0])} type="file" id="image3" hidden accept='image/*'/>
              <p className='text-xs text-gray-500 text-center mt-1'>Optional</p>
            </div>
            
            {/* Image 4 */}
            <div>
              <label htmlFor="image4" className='cursor-pointer block'>
                <div className='w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-blue-400 transition'>
                  <img 
                    className='w-full h-full object-cover' 
                    src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} 
                    alt="Upload 4" 
                  />
                </div>
              </label>
              <input onChange={(e)=>setImage4(e.target.files[0])} type="file" id="image4" hidden accept='image/*'/>
              <p className='text-xs text-gray-500 text-center mt-1'>Optional</p>
            </div>
          </>
        )}
      </div>
      <p className='text-xs text-gray-500 mt-2'>
        {productType === "gaming" 
          ? 'Upload a single image for this gaming product.' 
          : 'First image will be the main product image. Add up to 4 images total.'}
      </p>
    </div>

    {/* Basic Information */}
    <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-4'>
      <div className='md:col-span-2'>
        <p className='mb-2 font-semibold text-gray-700'>Product Name *</p>
        <input 
          onChange={(e)=>setName(e.target.value)} 
          value={name} 
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none' 
          type="text" 
          placeholder='e.g., Iron Man Phone Case' 
          required
        />
      </div>

      {productType === "gaming" && (
        <div key="gaming-description" className='md:col-span-2'>
          <p className='mb-2 font-semibold text-gray-700'>Product Description *</p>
          <textarea 
            onChange={(e)=>setDescription(e.target.value)} 
            value={description} 
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none min-h-[100px]' 
            placeholder='Detailed product description...' 
            required
          />
        </div>
      )}

      {productType === "Standard" && (
        <div key="standard-price">
          <p className='mb-2 font-semibold text-gray-700'>Backcover + Plates Price (₹) <span className='text-gray-500 font-normal'>(Optional)</span></p>
          <input 
            onChange={(e) => setPrice(e.target.value)} 
            value={price} 
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none' 
            type="number" 
            placeholder='499' 
          />
          <p className='text-xs text-gray-500 mt-1'>Leave empty to use collection price</p>
        </div>
      )}
      
      {productType === "other" && (
        <div key="other-price">
          <p className='mb-2 font-semibold text-gray-700'>Price (₹) *</p>
          <input 
            onChange={(e) => setPrice(e.target.value)} 
            value={price} 
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none' 
            type="number" 
            placeholder='499' 
            required 
          />
        </div>
      )}
      
      {productType === "Standard" && (
        <div key="plate-price">
          <p className='mb-2 font-semibold text-gray-700'>Plate Price (₹) <span className='text-gray-500 font-normal'>(Optional)</span></p>
          <input 
            onChange={(e) => setPlateprice(e.target.value)} 
            value={plateprice} 
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none' 
            type="number" 
            placeholder='149' 
          />
          <p className='text-xs text-gray-500 mt-1'>Price for plates only. Leave empty to use collection price</p>
        </div>
      )}
      
      {/* Info message for Standard/swap-wrap products */}
      {productType === "Standard" && (
        <div key="swap-wrap-info" className='md:col-span-2'>
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
            <p className='text-sm text-blue-800'>
              <strong>💡 Note:</strong> Swap-wrap products don't have individual stock. Stock is managed globally through the phone model inventory system. Prices are optional - if not specified, the product will use the collection's default prices.
            </p>
          </div>
        </div>
      )}

      {productType === "gaming" && (
        <div key="gaming-level">
          <div className='flex items-center justify-between mb-2'>
            <p className='font-semibold text-gray-700'>Level *</p>
            {selectedCollection && !loadingProducts && (
              <span className='text-xs text-gray-500'>
                Available: {5 - usedLevels.length}/5 levels
                {usedLevels.length > 0 && ` (Used: ${usedLevels.join(', ')})`}
              </span>
            )}
          </div>
          <select 
            onChange={(e) => setLevel(e.target.value)} 
            value={level}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none'
            disabled={!selectedCollection || loadingProducts}
          >
            {!selectedCollection ? (
              <option value="">Select collection first</option>
            ) : loadingProducts ? (
              <option value="">Loading available levels...</option>
            ) : (
              ['1', '2', '3', '4', '5']
                .filter(lvl => !usedLevels.includes(lvl))
                .map(lvl => (
                  <option key={lvl} value={lvl}>
                    Level {lvl}
                  </option>
                ))
            )}
            {!loadingProducts && selectedCollection && usedLevels.length > 0 && (
              <optgroup label="Already Used (Not Available)">
                {usedLevels.map(lvl => (
                  <option key={`used-${lvl}`} value={lvl} disabled>
                    Level {lvl} (Already Used)
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          {loadingProducts && <p className='text-sm text-blue-500 mt-1'>🔄 Loading available levels...</p>}
          {!loadingProducts && selectedCollection && usedLevels.length === 5 && (
            <p className='text-sm text-red-500 mt-1'>⚠️ All levels (1-5) are already used in this collection!</p>
          )}
          {!loadingProducts && selectedCollection && usedLevels.length === 0 && (
            <p className='text-sm text-green-600 mt-1'>✅ All levels available for this collection</p>
          )}
        </div>
      )}
    </div>

    {/* Product Specifications */}
    <div className='w-full'>
      <h3 className='font-semibold text-gray-800 mb-3 text-lg border-b pb-2'>Product Specifications</h3>
      
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div>
          <p className='mb-2 font-medium text-gray-700'>Category *</p>
          <select 
            onChange={(e) => setCategory(e.target.value)} 
            value={category}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none'
          >
            <option value="Phone Case">Phone Case</option>
            <option value="Phone Skin">Phone Skin</option>
            <option value="Screen Protector">Screen Protector</option>
            <option value="Full Body Wrap">Full Body Wrap</option>
            <option value="Camera Protector">Camera Protector</option>
            <option value="Combo Pack">Combo Pack</option>
          </select>
        </div>

        <div>
          <p className='mb-2 font-medium text-gray-700'>Material *</p>
          <select 
            onChange={(e) => setMaterial(e.target.value)} 
            value={material}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none'
          >
            <option value="TPU">TPU</option>
            <option value="Silicone">Silicone</option>
            <option value="Polycarbonate">Polycarbonate</option>
            <option value="Leather">Leather</option>
            <option value="PU Leather">PU Leather</option>
            <option value="Metal">Metal</option>
            <option value="Vinyl">Vinyl</option>
            <option value="Tempered Glass">Tempered Glass</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Aramid Fiber">Aramid Fiber</option>
          </select>
        </div>

        <div>
          <p className='mb-2 font-medium text-gray-700'>Finish</p>
          <select 
            onChange={(e) => setFinish(e.target.value)} 
            value={finish}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none'
          >
            <option value="Matte">Matte</option>
            <option value="Glossy">Glossy</option>
            <option value="Textured">Textured</option>
            <option value="Transparent">Transparent</option>
            <option value="Metallic">Metallic</option>
            <option value="Carbon Fiber">Carbon Fiber</option>
            <option value="Wood Grain">Wood Grain</option>
          </select>
        </div>
      </div>
    </div>

    {/* Design Details */}
    <div className='w-full'>
      <h3 className='font-semibold text-gray-800 mb-3 text-lg border-b pb-2'>Design Details</h3>
      
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <p className='mb-2 font-medium text-gray-700'>Design Type *</p>
          <select 
            onChange={(e) => setDesignType(e.target.value)} 
            value={designType}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none'
          >
            <option value="Solid Color">Solid Color</option>
            <option value="Pattern">Pattern</option>
            <option value="Custom Print">Custom Print</option>
            <option value="Transparent">Transparent</option>
            <option value="Gradient">Gradient</option>
            <option value="Marble">Marble</option>
            <option value="Artistic">Artistic</option>
            <option value="Brand Logo">Brand Logo</option>
          </select>
        </div>

        <div>
          <p className='mb-2 font-medium text-gray-700'>Primary Color *</p>
          <input 
            onChange={(e) => setPrimaryColor(e.target.value)} 
            value={primaryColor} 
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none' 
            type="text" 
            placeholder='e.g., Red' 
            required 
          />
        </div>

        <div>
          <p className='mb-2 font-medium text-gray-700'>Secondary Color</p>
          <input 
            onChange={(e) => setSecondaryColor(e.target.value)} 
            value={secondaryColor} 
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none' 
            type="text" 
            placeholder='e.g., Gold' 
          />
        </div>

        <div className='md:col-span-2'>
          <p className='mb-2 font-medium text-gray-700'>Pattern Name</p>
          <input 
            onChange={(e) => setPattern(e.target.value)} 
            value={pattern} 
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none' 
            type="text" 
            placeholder='e.g., Geometric, Floral' 
          />
        </div>
      </div>

      <div className='flex gap-2 mt-4'>
        <input 
          onChange={() => setCustomizable(prev => !prev)} 
          checked={customizable} 
          type="checkbox" 
          id='customizable' 
          className='w-4 h-4 text-blue-500'
        />
        <label className='cursor-pointer text-gray-700' htmlFor="customizable">
          This product is customizable
        </label>
      </div>

      <div className='flex gap-2 mt-2'>
        <input 
          onChange={() => setShowInBrowseAll(prev => !prev)} 
          checked={showInBrowseAll} 
          type="checkbox" 
          id='showInBrowseAll' 
          className='w-4 h-4 text-blue-500'
        />
        <label className='cursor-pointer text-gray-700' htmlFor="showInBrowseAll">
          Show this product in Home Browse All Products section
        </label>
      </div>
    </div>

    {/* Features */}
    <div className='w-full'>
      <p className='mb-2 font-semibold text-gray-700'>Product Features</p>
      <textarea 
        onChange={(e)=>setFeatures(e.target.value)} 
        value={features} 
        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none' 
        placeholder='Enter features separated by commas (e.g., Shockproof, Wireless charging compatible, Anti-scratch)' 
        rows="3"
      />
      <p className='text-xs text-gray-500 mt-1'>Separate multiple features with commas</p>
    </div>

    {/* Submit Button */}
    <button 
      type="submit" 
      disabled={isSubmitting}
      className={`w-full md:w-auto px-8 py-3 mt-4 text-white font-semibold rounded-lg transition shadow-md ${
        isSubmitting
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg'
      }`}
    >
      {isSubmitting ? 'Adding Product...' : 'Add Product'}
    </button>
  </>
)}

{/* Helper message when selections are not complete */}
{productType === "gaming" && (!selectedGroup || !selectedCollection) && (
  <div className='w-full p-6 bg-yellow-50 border border-yellow-200 rounded-lg'>
    <p className='text-yellow-800 font-medium'>
      ⚠️ Please select both a Group and Collection to continue adding product details.
    </p>
    <ul className='mt-2 text-sm text-yellow-700 list-disc list-inside'>
      {!selectedGroup && <li>Select a Group first</li>}
      {!selectedCollection && <li>Select a Collection from the chosen group</li>}
    </ul>
  </div>
)}

{productType === "Standard" && !selectedStandardCollection && (
  <div className='w-full p-6 bg-yellow-50 border border-yellow-200 rounded-lg'>
    <p className='text-yellow-800 font-medium'>
      ⚠️ Please select a Collection to continue adding product details.
    </p>
  </div>
)}

{productType === "other" && !selectedOtherCollection && (
  <div className='w-full p-6 bg-yellow-50 border border-yellow-200 rounded-lg'>
    <p className='text-yellow-800 font-medium'>
      ⚠️ Please select a Collection to continue adding product details.
    </p>
  </div>
)}
      </form>
    </>
    
  )
}

export default Add
