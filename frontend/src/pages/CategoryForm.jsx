import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryAPI } from '../services/api';

const CategoryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    attributes: [],
    uiConfig: {
      icon: '',
      color: '#3B82F6',
      thumbnailAttributes: []
    },
    isActive: true
  });

  const [attributeForm, setAttributeForm] = useState({
    name: '',
    type: 'text',
    options: '',
    required: false,
    isFilterable: true,
    isSearchable: true,
    displayOrder: 0,
    validation: {}
  });

  useEffect(() => {
    if (isEditing) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      const response = await categoryAPI.getById(id);
      const category = response.data.data;
      setFormData(category);
    } catch (error) {
      alert('Failed to load category');
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAttributeChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAttributeForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addAttribute = () => {
    if (!attributeForm.name) {
      alert('Attribute name is required');
      return;
    }

    const newAttribute = {
      ...attributeForm,
      options: attributeForm.type === 'select' || attributeForm.type === 'multiselect'
        ? attributeForm.options.split(',').map(opt => opt.trim()).filter(opt => opt)
        : [],
      validation: attributeForm.type === 'number' 
        ? { min: Number(attributeForm.validation?.min), max: Number(attributeForm.validation?.max) }
        : attributeForm.type === 'text'
          ? { minLength: Number(attributeForm.validation?.minLength), maxLength: Number(attributeForm.validation?.maxLength) }
          : {}
    };

    setFormData(prev => ({
      ...prev,
      attributes: [...prev.attributes, newAttribute]
    }));

    // Reset attribute form
    setAttributeForm({
      name: '',
      type: 'text',
      options: '',
      required: false,
      isFilterable: true,
      isSearchable: true,
      displayOrder: formData.attributes.length + 1,
      validation: {}
    });
  };

  const removeAttribute = (index) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      alert('Category name is required');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await categoryAPI.update(id, formData);
      } else {
        await categoryAPI.create(formData);
      }
      navigate('/categories');
    } catch (error) {
      alert('Failed to save category');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{isEditing ? 'Edit' : 'Create'} Category</h1>
        <p className="page-subtitle">Define category details and dynamic attributes</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h3 className="card-title">Basic Information</h3>
          
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="e.g., Mobile, Bangles, Laptops"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              placeholder="Describe this category..."
            />
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Icon (Emoji)</label>
              <input
                type="text"
                name="uiConfig.icon"
                className="form-input"
                value={formData.uiConfig.icon}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  uiConfig: { ...prev.uiConfig, icon: e.target.value }
                }))}
                placeholder="📱"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Color</label>
              <input
                type="color"
                name="uiConfig.color"
                className="form-input"
                value={formData.uiConfig.color}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  uiConfig: { ...prev.uiConfig, color: e.target.value }
                }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                style={{ marginRight: '8px' }}
              />
              Active
            </label>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Dynamic Attributes</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Define custom attributes for this category. These fields will appear when adding products.
          </p>

          <div className="grid grid-3">
            <div className="form-group">
              <label className="form-label">Attribute Name *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={attributeForm.name}
                onChange={handleAttributeChange}
                placeholder="e.g., RAM, Color, Material"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Field Type *</label>
              <select
                name="type"
                className="form-select"
                value={attributeForm.type}
                onChange={handleAttributeChange}
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="select">Dropdown (Select)</option>
                <option value="multiselect">Multiple Select</option>
                <option value="boolean">Yes/No</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Display Order</label>
              <input
                type="number"
                name="displayOrder"
                className="form-input"
                value={attributeForm.displayOrder}
                onChange={handleAttributeChange}
              />
            </div>
          </div>

          {(attributeForm.type === 'select' || attributeForm.type === 'multiselect') && (
            <div className="form-group">
              <label className="form-label">Options (comma-separated)</label>
              <input
                type="text"
                name="options"
                className="form-input"
                value={attributeForm.options}
                onChange={handleAttributeChange}
                placeholder="Option 1, Option 2, Option 3"
              />
            </div>
          )}

          {attributeForm.type === 'number' && (
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Min Value</label>
                <input
                  type="number"
                  name="validation.min"
                  className="form-input"
                  value={attributeForm.validation?.min || ''}
                  onChange={handleAttributeChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Max Value</label>
                <input
                  type="number"
                  name="validation.max"
                  className="form-input"
                  value={attributeForm.validation?.max || ''}
                  onChange={handleAttributeChange}
                />
              </div>
            </div>
          )}

          <div className="grid grid-3">
            <div className="form-group">
              <label className="form-label">
                <input
                  type="checkbox"
                  name="required"
                  checked={attributeForm.required}
                  onChange={handleAttributeChange}
                  style={{ marginRight: '8px' }}
                />
                Required
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">
                <input
                  type="checkbox"
                  name="isFilterable"
                  checked={attributeForm.isFilterable}
                  onChange={handleAttributeChange}
                  style={{ marginRight: '8px' }}
                />
                Filterable
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">
                <input
                  type="checkbox"
                  name="isSearchable"
                  checked={attributeForm.isSearchable}
                  onChange={handleAttributeChange}
                  style={{ marginRight: '8px' }}
                />
                Searchable
              </label>
            </div>
          </div>

          <button type="button" onClick={addAttribute} className="btn btn-secondary">
            ➕ Add Attribute
          </button>

          {formData.attributes.length > 0 && (
            <div className="table-container" style={{ marginTop: '20px' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Required</th>
                    <th>Filterable</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.attributes.map((attr, index) => (
                    <tr key={index}>
                      <td>{attr.name}</td>
                      <td>
                        <span className="badge badge-info">{attr.type}</span>
                        {attr.options?.length > 0 && (
                          <span style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                            ({attr.options.length} options)
                          </span>
                        )}
                      </td>
                      <td>{attr.required ? '✅' : '❌'}</td>
                      <td>{attr.isFilterable ? '✅' : '❌'}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => removeAttribute(index)}
                          className="btn btn-danger"
                          style={{ padding: '4px 12px', fontSize: '12px' }}
                        >
                          🗑️ Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
          </button>
          <button type="button" onClick={() => navigate('/categories')} className="btn btn-outline">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
