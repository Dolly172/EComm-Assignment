import React, { useState, useEffect } from 'react';
import { searchAPI, categoryAPI } from '../services/api';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [filters, setFilters] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedFilters, setSelectedFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    attributes: {}
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      const searchParams = {
        query: searchQuery,
        ...selectedFilters
      };

      // Remove empty values
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key] === '' || searchParams[key] === null || searchParams[key] === undefined) {
          delete searchParams[key];
        }
      });

      if (typeof searchParams.inStock === 'boolean') {
        searchParams.inStock = searchParams.inStock ? 'true' : 'false';
      }

      const response = await searchAPI.search(searchParams);
      setResults(response.data.data);
      setFilters(response.data.filters);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedFilters(prev => ({
      ...prev,
      category: categoryId,
      attributes: {} // Reset attribute filters when category changes
    }));
    
    // Fetch category-specific filters
    if (categoryId) {
      fetchCategoryFilters(categoryId);
    }
  };

  const fetchCategoryFilters = async (categoryId) => {
    try {
      const response = await searchAPI.getFiltersByCategory(categoryId);
      setFilters(prev => ({
        ...prev,
        attributes: response.data.data.attributes
      }));
    } catch (error) {
      console.error('Error fetching category filters:', error);
    }
  };

  const handleAttributeFilterChange = (attrName, value, type) => {
    setSelectedFilters(prev => {
      const currentAttrs = prev.attributes || {};
      
      if (type === 'checkbox') {
        const currentValues = currentAttrs[attrName] || [];
        const newValues = value
          ? [...currentValues, value]
          : currentValues.filter(v => v !== value);
        
        return {
          ...prev,
          attributes: {
            ...currentAttrs,
            [attrName]: newValues
          }
        };
      } else {
        return {
          ...prev,
          attributes: {
            ...currentAttrs,
            [attrName]: value
          }
        };
      }
    });
  };

  const clearFilters = () => {
    setSelectedFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      inStock: false,
      attributes: {}
    });
    setFilters(null);
  };

  const renderAttributeFilter = (attribute) => {
    const currentValue = selectedFilters.attributes?.[attribute.name] || '';

    switch (attribute.type) {
      case 'text':
        return (
          <select
            className="form-select"
            value={currentValue}
            onChange={(e) => handleAttributeFilterChange(attribute.name, e.target.value)}
          >
            <option value="">All {attribute.name}</option>
            {attribute.options?.map((opt, idx) => (
              <option key={idx} value={opt}>{opt}</option>
            ))}
          </select>
        );

      case 'number':
        return attribute.range ? (
          <div className="grid grid-2">
            <input
              type="number"
              className="form-input"
              placeholder={`Min ${attribute.name}`}
              onChange={(e) => handleAttributeFilterChange(`${attribute.name}_min`, e.target.value)}
            />
            <input
              type="number"
              className="form-input"
              placeholder={`Max ${attribute.name}`}
              onChange={(e) => handleAttributeFilterChange(`${attribute.name}_max`, e.target.value)}
            />
          </div>
        ) : null;

      case 'select':
        return (
          <select
            className="form-select"
            value={currentValue}
            onChange={(e) => handleAttributeFilterChange(attribute.name, e.target.value)}
          >
            <option value="">All {attribute.name}</option>
            {attribute.options?.map((opt, idx) => (
              <option key={idx} value={opt}>{opt}</option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="checkbox-group">
            {attribute.options?.map((opt, idx) => (
              <label key={idx} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={(Array.isArray(currentValue) ? currentValue : []).includes(opt)}
                  onChange={(e) => handleAttributeFilterChange(
                    attribute.name, 
                    opt, 
                    'checkbox'
                  )}
                />
                {opt}
              </label>
            ))}
          </div>
        );

      case 'boolean':
        return (
          <select
            className="form-select"
            value={currentValue}
            onChange={(e) => handleAttributeFilterChange(attribute.name, e.target.value)}
          >
            <option value="">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Search Products</h1>
        <p className="page-subtitle">Advanced search with dynamic filters</p>
      </div>

      {/* Search Bar */}
      <div className="card">
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search products by name, description, or specifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && performSearch()}
            style={{ flex: 1 }}
          />
          <button onClick={performSearch} className="btn btn-primary" disabled={loading}>
            🔍 Search
          </button>
          <button onClick={clearFilters} className="btn btn-outline">
            Clear Filters
          </button>
        </div>
      </div>

      <div className="grid grid-4" style={{ gridTemplateColumns: '250px 1fr' }}>
        {/* Filters Sidebar */}
        <div className="filter-section">
          <div className="filter-header">
            <h3 className="filter-title">Filters</h3>
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <label className="filter-label">Category</label>
            <select
              className="form-select"
              value={selectedFilters.category}
              onChange={handleCategoryChange}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.uiConfig?.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="filter-group">
            <label className="filter-label">Price Range</label>
            <div className="grid grid-2">
              <input
                type="number"
                className="form-input"
                placeholder="Min"
                value={selectedFilters.minPrice}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, minPrice: e.target.value }))}
              />
              <input
                type="number"
                className="form-input"
                placeholder="Max"
                value={selectedFilters.maxPrice}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
              />
            </div>
          </div>

          {/* In Stock */}
          <div className="filter-group">
            <label className="filter-label">
              <input
                type="checkbox"
                checked={selectedFilters.inStock}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, inStock: e.target.checked }))}
                style={{ marginRight: '8px' }}
              />
              In Stock Only
            </label>
          </div>

          {/* Dynamic Attribute Filters */}
          {filters?.attributes && filters.attributes.length > 0 && (
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', margin: '20px 0 12px' }}>
                {filters.categoryName || 'Category'} Attributes
              </h4>
              {filters.attributes.map((attr, idx) => (
                <div key={idx} className="filter-group">
                  <label className="filter-label">{attr.name}</label>
                  {renderAttributeFilter(attr)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search Results */}
        <div>
          {loading && <div className="spinner"></div>}

          {!loading && results.length === 0 && searchQuery && (
            <div className="card">
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                No products found. Try adjusting your search or filters.
              </p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div>
              <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                Found {results.length} product{results.length !== 1 ? 's' : ''}
              </p>
              
              <div className="grid grid-3">
                {results.map((product) => (
                  <div key={product._id} className="product-card">
                    <img 
                      src={product.images?.[0]?.url || 'https://via.placeholder.com/200'} 
                      alt={product.name}
                      className="product-image"
                    />
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-category">
                        {product.category?.uiConfig?.icon} {product.category?.name}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span className="product-price">₹{product.price?.toLocaleString()}</span>
                        {product.discountPrice && (
                          <span className="product-original-price">
                            ₹{product.discountPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                        Stock: {product.stock} units
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
