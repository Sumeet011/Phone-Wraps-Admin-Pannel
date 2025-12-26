import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const CollectionTooltips = ({ token }) => {
  const [tooltips, setTooltips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch tooltips on component mount
  useEffect(() => {
    fetchTooltips();
  }, []);

  const fetchTooltips = async () => {
    try {
      setLoading(true);
      const response = await axios.get(backendUrl + '/api/collection-tooltips');
      
      if (response.data.success) {
        // Sort tooltips by quantity
        const sortedTooltips = response.data.data.tooltips.sort((a, b) => a.quantity - b.quantity);
        setTooltips(sortedTooltips);
      } else {
        toast.error('Failed to fetch tooltips');
      }
    } catch (error) {
      console.error('Error fetching tooltips:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch tooltips');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (quantity, field, value) => {
    setTooltips(prevTooltips =>
      prevTooltips.map(tooltip =>
        tooltip.quantity === quantity
          ? { ...tooltip, [field]: value }
          : tooltip
      )
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validate that all tooltips have title and message
      const isValid = tooltips.every(tooltip => tooltip.title.trim() && tooltip.message.trim());
      
      if (!isValid) {
        toast.error('All tooltips must have a title and message');
        return;
      }

      const response = await axios.put(
        backendUrl + '/api/collection-tooltips',
        { tooltips },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Collection tooltips updated successfully!');
        fetchTooltips(); // Refresh data
      } else {
        toast.error(response.data.message || 'Failed to update tooltips');
      }
    } catch (error) {
      console.error('Error updating tooltips:', error);
      toast.error(error.response?.data?.message || 'Failed to update tooltips');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchTooltips();
    toast.info('Changes discarded');
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='text-lg'>Loading tooltips...</div>
      </div>
    );
  }

  const getQuantityLabel = (quantity) => {
    return `${quantity}/5 Cards`;
  };

  const getQuantityIcon = (quantity) => {
    if (quantity === 5) return '✓';
    return '⚠';
  };

  const getQuantityColor = (quantity) => {
    if (quantity === 5) return 'bg-green-50 border-green-300';
    if (quantity >= 3) return 'bg-yellow-50 border-yellow-300';
    return 'bg-orange-50 border-orange-300';
  };

  return (
    <div className='max-w-5xl mx-auto p-6'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>
          🎮 Collection Progress Tooltips
        </h1>
        <p className='text-gray-600'>
          Customize the tooltip messages that appear when users hover over the info icon 
          for different collection quantities in their cart.
        </p>
      </div>

      {/* Info Box */}
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
        <div className='flex items-start gap-3'>
          <div className='text-blue-500 text-2xl'>ℹ️</div>
          <div>
            <h3 className='font-semibold text-blue-900 mb-1'>How it works</h3>
            <p className='text-sm text-blue-800'>
              When customers add gaming collection products to their cart, a progress bar shows 
              how many cards they've added (1/5, 2/5, etc.). Hovering over the "i" icon displays 
              the tooltip you configure below for that specific quantity.
            </p>
          </div>
        </div>
      </div>

      {/* Tooltips Form */}
      <div className='space-y-4'>
        {tooltips.map((tooltip) => (
          <div
            key={tooltip.quantity}
            className={`border-2 rounded-lg p-5 transition-all ${getQuantityColor(tooltip.quantity)}`}
          >
            {/* Header */}
            <div className='flex items-center gap-3 mb-4'>
              <div className='text-2xl'>
                {getQuantityIcon(tooltip.quantity)}
              </div>
              <div className='flex-1'>
                <h3 className='font-bold text-gray-800 text-lg'>
                  {getQuantityLabel(tooltip.quantity)}
                </h3>
                <p className='text-xs text-gray-600'>
                  {tooltip.quantity === 5 
                    ? 'Complete collection message' 
                    : `Partial collection (${5 - tooltip.quantity} more needed)`}
                </p>
              </div>
              <div className='text-sm font-mono text-gray-500 bg-white px-3 py-1 rounded border border-gray-300'>
                Quantity: {tooltip.quantity}
              </div>
            </div>

            {/* Title Input */}
            <div className='mb-3'>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Tooltip Title
              </label>
              <input
                type='text'
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition'
                placeholder='e.g., ⚠ Incomplete Collection'
                value={tooltip.title}
                onChange={(e) => handleInputChange(tooltip.quantity, 'title', e.target.value)}
              />
            </div>

            {/* Message Input */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Tooltip Message
              </label>
              <textarea
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none'
                placeholder='Enter the message customers will see...'
                rows='3'
                value={tooltip.message}
                onChange={(e) => handleInputChange(tooltip.quantity, 'message', e.target.value)}
              />
            </div>

            {/* Preview */}
            <div className='mt-4 pt-4 border-t border-gray-300'>
              <p className='text-xs font-semibold text-gray-600 mb-2'>PREVIEW:</p>
              <div className='bg-white border border-gray-300 rounded-lg p-3 shadow-sm'>
                <p className='text-sm leading-relaxed'>
                  <span className={`font-semibold ${tooltip.quantity === 5 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {tooltip.title}
                  </span>
                  <br />
                  {tooltip.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className='mt-8 flex gap-4 justify-end'>
        <button
          onClick={handleReset}
          disabled={saving}
          className='px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Reset Changes
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className='px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
        >
          {saving ? (
            <>
              <svg className='animate-spin h-5 w-5' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              💾 Save Changes
            </>
          )}
        </button>
      </div>

      {/* Additional Info */}
      <div className='mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg'>
        <h4 className='font-semibold text-gray-800 mb-2'>💡 Tips</h4>
        <ul className='text-sm text-gray-600 space-y-1 list-disc list-inside'>
          <li>Use emojis to make tooltips more engaging (✓, ⚠, 🎮, etc.)</li>
          <li>Keep messages clear and concise - users should quickly understand the benefit</li>
          <li>The 5/5 message should be encouraging and positive</li>
          <li>Messages for 1-4 cards should motivate users to complete the collection</li>
        </ul>
      </div>
    </div>
  );
};

export default CollectionTooltips;
