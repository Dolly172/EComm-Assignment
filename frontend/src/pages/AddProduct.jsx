import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productAPI, categoryAPI } from '../services/api';

const AddProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    discountPrice: '',
    stock: '',
    sku: '',
    attributes: {},
    highlights: [''],
    specifications: [{ label: '', value: '' }],
    images: [],
    tags: [],
    status: 'active'
  });

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll(true);
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await productAPI.getById(id);
      const product = response.data.data;
      
      // Convert attributes Map to object for form
      const attributesObj = {};
      if (product.attributes) {
        product.attributes.forEach((value, key) => {
          attributesObj[key] = value;
        });
      }

      setFormData({
        ...product,
        price: product.price || '',
        discountPrice: product.discountPrice || '',
        stock: product.stock || '',
        attributes: attributesObj,
        highlights: product.highlights?.length > 0 ? product.highlights : [''],
        specifications: product.specifications?.length > 0 ? product.specifications : [{ label: '', value: '' }]
      });
      
      // Set selected category
      if (product.category) {
        setSelectedCategory(product.category);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Failed to load product');
    }
  };

  const handleCategoryChange = async (e) => {
    const categoryId = e.target.value;
    setFormData(prev => ({
      ...prev,
      category: categoryId,
      attributes: {} // Reset attributes when category changes
    }));

    if (categoryId) {
      try {
        const response = await categoryAPI.getById(categoryId);
        setSelectedCategory(response.data.data);
      } catch (error) {
        console.error('Error fetching category:', error);
      }
    } else {
      setSelectedCategory(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAttributeChange = (attrName, value, type) => {
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attrName]: type === 'multiselect' ? value : value
      }
    }));
  };

  const handleHighlightChange = (index, value) => {
    const newHighlights = [...formData.highlights];
    newHighlights[index] = value;
    setFormData(prev => ({
      ...prev,
      highlights: newHighlights
    }));
  };

  const addHighlight = () => {
    setFormData(prev => ({
      ...prev,
      highlights: [...prev.highlights, '']
    }));
  };

  const removeHighlight = (index) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  const handleSpecificationChange = (index, field, value) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index][field] = value;
    setFormData(prev => ({
      ...prev,
      specifications: newSpecs
    }));
  };

  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { label: '', value: '' }]
    }));
  };

  const removeSpecification = (index) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.category || !formData.price) {
      alert('Please fill all required fields');
      return;
    }

    // Validate required attributes based on category
    if (selectedCategory && selectedCategory.attributes) {
      for (const attr of selectedCategory.attributes) {
        if (attr.required && (!formData.attributes[attr.name] || formData.attributes[attr.name] === '')) {
          alert(`Please provide required attribute: ${attr.name}`);
          return;
        }
      }
    }

    setLoading(true);
    try {
      const submitData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
        stock: Number(formData.stock),
        sku: formData.sku || undefined,
        status: formData.status || 'active',
        attributes: {},
        highlights: formData.highlights.filter(h => h && h.trim()),
        specifications: formData.specifications.filter(s => s.label && s.label.trim() && s.value && s.value.trim())
      };

      // Clean up and include only non-empty attributes
      Object.keys(formData.attributes).forEach(key => {
        const value = formData.attributes[key];
        if (value !== '' && value !== null && value !== undefined) {
          submitData.attributes[key] = value;
        }
      });

      console.log('Submitting product:', JSON.stringify(submitData, null, 2));

      if (isEditing) {
        await productAPI.update(id, submitData);
      } else {
        await productAPI.create(submitData);
      }
      navigate('/products');
    } catch (error) {
      console.error('Error creating product:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save product';
      console.error('Error details:', error.response?.data);
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic attribute renderer
  const renderAttributeField = (attribute) => {
    const value = formData.attributes[attribute.name] || '';

    switch (attribute.type) {
      case 'text':
        return (
          <input
            type="text"
            className="form-input"
            value={value}
            onChange={(e) => handleAttributeChange(attribute.name, e.target.value, 'text')}
            placeholder={`Enter ${attribute.name}`}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            className="form-input"
            value={value}
            onChange={(e) => handleAttributeChange(attribute.name, e.target.value, 'number')}
            placeholder={`Enter ${attribute.name}`}
            min={attribute.validation?.min}
            max={attribute.validation?.max}
          />
        );

      case 'select':
        return (
          <select
            className="form-select"
            value={value}
            onChange={(e) => handleAttributeChange(attribute.name, e.target.value, 'select')}
          >
            <option value="">Select {attribute.name}</option>
            {attribute.options?.map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="checkbox-group">
            {attribute.options?.map((option, idx) => (
              <label key={idx} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option]
                      : selectedValues.filter(v => v !== option);
                    handleAttributeChange(attribute.name, newValues, 'multiselect');
                  }}
                />
                {option}
              </label>
            ))}
          </div>
        );

      case 'boolean':
        return (
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                checked={value === true || value === 'true'}
                onChange={() => handleAttributeChange(attribute.name, true, 'boolean')}
              />
              Yes
            </label>
            <label className="radio-label">
              <input
                type="radio"
                checked={value === false || value === 'false'}
                onChange={() => handleAttributeChange(attribute.name, false, 'boolean')}
              />
              No
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{isEditing ? 'Edit' : 'Add'} Product</h1>
        <p className="page-subtitle">
          {selectedCategory 
            ? `Adding product to ${selectedCategory.name} category` 
            : 'Select a category to see dynamic fields'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h3 className="card-title">Basic Information</h3>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g., iPhone 15 Pro Max"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleCategoryChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.uiConfig?.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows="4"
              placeholder="Describe your product..."
            />
          </div>

          <div className="grid grid-3">
            <div className="form-group">
              <label className="form-label">Price (₹) *</label>
              <input
                type="number"
                name="price"
                className="form-input"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Discount Price (₹)</label>
              <input
                type="number"
                name="discountPrice"
                className="form-input"
                value={formData.discountPrice}
                onChange={handleInputChange}
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Stock *</label>
              <input
                type="number"
                name="stock"
                className="form-input"
                value={formData.stock}
                onChange={handleInputChange}
                required
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">SKU</label>
            <input
              type="text"
              name="sku"
              className="form-input"
              value={formData.sku}
              onChange={handleInputChange}
              placeholder="Unique product code"
            />
          </div>
        </div>

        {/* Dynamic Attributes Section */}
        {selectedCategory && selectedCategory.attributes && selectedCategory.attributes.length > 0 && (
          <div className="card">
            <h3 className="card-title">
              {selectedCategory.name} - Product Specifications
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              These fields are dynamically generated based on the selected category
            </p>

            <div className="grid grid-2">
              {selectedCategory.attributes
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((attribute) => (
                  <div key={attribute._id || attribute.name} className="form-group">
                    <label className="form-label">
                      {attribute.name}
                      {attribute.required && <span className="required-mark"> *</span>}
                    </label>
                    {renderAttributeField(attribute)}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Highlights Section */}
        <div className="card">
          <h3 className="card-title">Product Highlights</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Key selling points and features
          </p>

          {formData.highlights.map((highlight, index) => (
            <div key={index} className="form-group" style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                value={highlight}
                onChange={(e) => handleHighlightChange(index, e.target.value)}
                placeholder={`Highlight ${index + 1}`}
                style={{ flex: 1 }}
              />
              {formData.highlights.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeHighlight(index)}
                  className="btn btn-danger"
                  style={{ padding: '8px 12px' }}
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addHighlight} className="btn btn-outline">
            ➕ Add Highlight
          </button>
        </div>

        {/* Specifications Section */}
        <div className="card">
          <h3 className="card-title">Detailed Specifications</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Technical specifications with labels and values
          </p>

          {formData.specifications.map((spec, index) => (
            <div key={index} className="grid grid-2" style={{ gap: '12px', marginBottom: '12px' }}>
              <input
                type="text"
                className="form-input"
                value={spec.label}
                onChange={(e) => handleSpecificationChange(index, 'label', e.target.value)}
                placeholder="Label (e.g., Display)"
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  value={spec.value}
                  onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                  placeholder="Value (e.g., 6.7-inch Super Retina XDR)"
                  style={{ flex: 1 }}
                />
                {formData.specifications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    className="btn btn-danger"
                    style={{ padding: '8px 12px' }}
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
          <button type="button" onClick={addSpecification} className="btn btn-outline">
            ➕ Add Specification
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
          </button>
          <button type="button" onClick={() => navigate('/products')} className="btn btn-outline">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
