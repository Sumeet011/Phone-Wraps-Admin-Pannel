import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const BlogsRich = ({ token }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  
  // Basic form states
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [author, setAuthor] = useState('Admin');
  const [status, setStatus] = useState('draft');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState('');

  // Rich content blocks state
  const [contentBlocks, setContentBlocks] = useState([
    { type: 'heading', level: 2, content: '' }
  ]);

  // Fetch all blogs
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/blogs`);
      if (response.data.success) {
        setBlogs(response.data.blogs);
      }
    } catch (error) {
      toast.error('Failed to fetch blogs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Handle cover image upload
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  // Add a new content block
  const addContentBlock = (type) => {
    const newBlock = { type, content: '' };
    if (type === 'heading') {
      newBlock.level = 2;
    } else if (type === 'image') {
      newBlock.file = null;
      newBlock.preview = '';
      newBlock.alt = '';
      newBlock.caption = '';
    } else if (type === 'list') {
      newBlock.items = [''];
    }
    setContentBlocks([...contentBlocks, newBlock]);
  };

  // Update a content block
  const updateContentBlock = (index, field, value) => {
    const newBlocks = [...contentBlocks];
    newBlocks[index][field] = value;
    setContentBlocks(newBlocks);
  };

  // Handle image upload for content blocks
  const handleContentImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const newBlocks = [...contentBlocks];
      newBlocks[index].file = file;
      newBlocks[index].preview = URL.createObjectURL(file);
      setContentBlocks(newBlocks);
    }
  };

  // Remove a content block
  const removeContentBlock = (index) => {
    const newBlocks = contentBlocks.filter((_, i) => i !== index);
    setContentBlocks(newBlocks);
  };

  // Move block up
  const moveBlockUp = (index) => {
    if (index === 0) return;
    const newBlocks = [...contentBlocks];
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    setContentBlocks(newBlocks);
  };

  // Move block down
  const moveBlockDown = (index) => {
    if (index === contentBlocks.length - 1) return;
    const newBlocks = [...contentBlocks];
    [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    setContentBlocks(newBlocks);
  };

  // Add list item
  const addListItem = (blockIndex) => {
    const newBlocks = [...contentBlocks];
    newBlocks[blockIndex].items.push('');
    setContentBlocks(newBlocks);
  };

  // Update list item
  const updateListItem = (blockIndex, itemIndex, value) => {
    const newBlocks = [...contentBlocks];
    newBlocks[blockIndex].items[itemIndex] = value;
    setContentBlocks(newBlocks);
  };

  // Remove list item
  const removeListItem = (blockIndex, itemIndex) => {
    const newBlocks = [...contentBlocks];
    newBlocks[blockIndex].items = newBlocks[blockIndex].items.filter((_, i) => i !== itemIndex);
    setContentBlocks(newBlocks);
  };

  // Reset form
  const resetForm = () => {
    setTitle('');
    setExcerpt('');
    setCoverImage(null);
    setCoverImagePreview('');
    setAuthor('Admin');
    setStatus('draft');
    setCategory('General');
    setTags('');
    setContentBlocks([{ type: 'heading', level: 2, content: '' }]);
    setEditingBlog(null);
    setShowForm(false);
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !excerpt) {
      toast.error('Please fill in title and excerpt');
      return;
    }

    if (!coverImage && !editingBlog) {
      toast.error('Please select a cover image');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('excerpt', excerpt);
      formData.append('author', author);
      formData.append('status', status);
      formData.append('category', category);
      formData.append('tags', tags);
      
      if (coverImage) {
        formData.append('image', coverImage);
      }

      // Process content blocks - upload images and prepare data
      const processedBlocks = [];
      const contentImages = [];

      for (const block of contentBlocks) {
        const processedBlock = { type: block.type };
        
        if (block.type === 'heading') {
          processedBlock.level = block.level;
          processedBlock.content = block.content;
        } else if (block.type === 'paragraph') {
          processedBlock.content = block.content;
        } else if (block.type === 'quote') {
          processedBlock.content = block.content;
        } else if (block.type === 'list') {
          processedBlock.items = block.items.filter(item => item.trim() !== '');
        } else if (block.type === 'image') {
          if (block.file) {
            // Add to formData for upload
            contentImages.push(block.file);
            processedBlock.imageIndex = contentImages.length - 1;
            processedBlock.alt = block.alt || '';
            processedBlock.caption = block.caption || '';
          } else if (block.content) {
            // Existing image URL
            processedBlock.content = block.content;
            processedBlock.alt = block.alt || '';
            processedBlock.caption = block.caption || '';
          }
        }
        
        processedBlocks.push(processedBlock);
      }

      // Append content images
      contentImages.forEach(image => {
        formData.append('contentImages', image);
      });

      formData.append('contentBlocks', JSON.stringify(processedBlocks));

      let response;
      if (editingBlog) {
        response = await axios.put(
          `${backendUrl}/api/blogs/${editingBlog._id}`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } else {
        response = await axios.post(
          `${backendUrl}/api/blogs`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      if (response.data.success) {
        // Update processed blocks with uploaded image URLs
        if (response.data.uploadedImages && response.data.uploadedImages.length > 0) {
          processedBlocks.forEach(block => {
            if (block.type === 'image' && block.imageIndex !== undefined) {
              block.content = response.data.uploadedImages[block.imageIndex].url;
              delete block.imageIndex;
            }
          });
        }

        toast.success(editingBlog ? 'Blog updated successfully' : 'Blog created successfully');
        resetForm();
        fetchBlogs();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save blog');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setTitle(blog.title);
    setExcerpt(blog.excerpt);
    setCoverImagePreview(blog.image);
    setAuthor(blog.author);
    setStatus(blog.status);
    setCategory(blog.category);
    setTags(blog.tags.join(', '));
    
    // Load content blocks or create from plain content
    if (blog.contentBlocks && blog.contentBlocks.length > 0) {
      setContentBlocks(blog.contentBlocks);
    } else if (blog.content) {
      setContentBlocks([{ type: 'paragraph', content: blog.content }]);
    }
    
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.delete(
        `${backendUrl}/api/blogs/${blogId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Blog deleted successfully');
        fetchBlogs();
      }
    } catch (error) {
      toast.error('Failed to delete blog');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Render content block form
  const renderContentBlockForm = (block, index) => {
    switch (block.type) {
      case 'heading':
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <select
                value={block.level}
                onChange={(e) => updateContentBlock(index, 'level', parseInt(e.target.value))}
                className="px-3 py-2 border rounded"
              >
                <option value={1}>H1</option>
                <option value={2}>H2</option>
                <option value={3}>H3</option>
                <option value={4}>H4</option>
              </select>
              <input
                type="text"
                value={block.content}
                onChange={(e) => updateContentBlock(index, 'content', e.target.value)}
                className="flex-1 px-3 py-2 border rounded"
                placeholder="Enter heading text..."
              />
            </div>
          </div>
        );

      case 'paragraph':
        return (
          <textarea
            value={block.content}
            onChange={(e) => updateContentBlock(index, 'content', e.target.value)}
            className="w-full px-3 py-2 border rounded"
            rows="4"
            placeholder="Enter paragraph text..."
          />
        );

      case 'image':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <label className="cursor-pointer bg-gray-100 px-4 py-2 rounded border hover:bg-gray-200">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleContentImageChange(index, e)}
                  className="hidden"
                />
                Choose Image
              </label>
              {(block.preview || block.content) && (
                <img
                  src={block.preview || block.content}
                  alt="Preview"
                  className="h-20 w-20 object-cover rounded border"
                />
              )}
            </div>
            <input
              type="text"
              value={block.alt || ''}
              onChange={(e) => updateContentBlock(index, 'alt', e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="Alt text (for accessibility)"
            />
            <input
              type="text"
              value={block.caption || ''}
              onChange={(e) => updateContentBlock(index, 'caption', e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="Image caption (optional)"
            />
          </div>
        );

      case 'list':
        return (
          <div className="space-y-2">
            {block.items.map((item, itemIndex) => (
              <div key={itemIndex} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateListItem(index, itemIndex, e.target.value)}
                  className="flex-1 px-3 py-2 border rounded"
                  placeholder="List item..."
                />
                <button
                  type="button"
                  onClick={() => removeListItem(index, itemIndex)}
                  className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addListItem(index)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              + Add Item
            </button>
          </div>
        );

      case 'quote':
        return (
          <textarea
            value={block.content}
            onChange={(e) => updateContentBlock(index, 'content', e.target.value)}
            className="w-full px-3 py-2 border rounded italic"
            rows="3"
            placeholder="Enter quote text..."
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Rich Blog Management</h1>
        <button
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showForm ? 'Cancel' : 'Create New Blog'}
        </button>
      </div>

      {/* Blog Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">
            {editingBlog ? 'Edit Blog' : 'Create New Blog'}
          </h2>
          <form onSubmit={handleSubmit}>
            {/* Basic Info */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block mb-2 font-medium">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter blog title"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Excerpt *</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description"
                  rows="2"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Cover Image *</label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer bg-gray-100 px-4 py-2 rounded border hover:bg-gray-200">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="hidden"
                    />
                    Choose Cover Image
                  </label>
                  {coverImagePreview && (
                    <img
                      src={coverImagePreview}
                      alt="Preview"
                      className="h-20 w-32 object-cover rounded border"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium">Author</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="General">General</option>
                    <option value="Design">Design</option>
                    <option value="Tutorial">Tutorial</option>
                    <option value="News">News</option>
                    <option value="Tips">Tips</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-medium">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-medium">Tags</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>
            </div>

            {/* Rich Content Editor */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Content Blocks</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => addContentBlock('heading')}
                    className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
                  >
                    + Heading
                  </button>
                  <button
                    type="button"
                    onClick={() => addContentBlock('paragraph')}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    + Paragraph
                  </button>
                  <button
                    type="button"
                    onClick={() => addContentBlock('image')}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                  >
                    + Image
                  </button>
                  <button
                    type="button"
                    onClick={() => addContentBlock('list')}
                    className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                  >
                    + List
                  </button>
                  <button
                    type="button"
                    onClick={() => addContentBlock('quote')}
                    className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                  >
                    + Quote
                  </button>
                </div>
              </div>

              {/* Content Blocks */}
              <div className="space-y-4">
                {contentBlocks.map((block, index) => (
                  <div key={index} className="border rounded p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm uppercase text-gray-600">
                        {block.type}
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => moveBlockUp(index)}
                          disabled={index === 0}
                          className="px-2 py-1 text-sm bg-gray-300 rounded disabled:opacity-50"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveBlockDown(index)}
                          disabled={index === contentBlocks.length - 1}
                          className="px-2 py-1 text-sm bg-gray-300 rounded disabled:opacity-50"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removeContentBlock(index)}
                          className="px-2 py-1 text-sm bg-red-500 text-white rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {renderContentBlockForm(block, index)}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 disabled:bg-gray-400 font-medium"
              >
                {loading ? 'Saving...' : editingBlog ? 'Update Blog' : 'Create Blog'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Blogs List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Image</th>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Views</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && !showForm ? (
              <tr>
                <td colSpan="7" className="text-center py-8">Loading...</td>
              </tr>
            ) : blogs.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8">No blogs found</td>
              </tr>
            ) : (
              blogs.map((blog) => (
                <tr key={blog._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="h-12 w-12 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate">{blog.title}</td>
                  <td className="px-4 py-3">{blog.category}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        blog.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {blog.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{blog.views}</td>
                  <td className="px-4 py-3">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(blog)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(blog._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BlogsRich;
