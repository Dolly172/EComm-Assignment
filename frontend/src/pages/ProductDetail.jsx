import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productAPI } from '../services/api';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productAPI.getById(id);
      setProduct(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner"></div>;
  if (!product) return <div className="alert alert-error">Product not found</div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">{product.name}</h1>
          <p className="page-subtitle">
            {product.category?.uiConfig?.icon} {product.category?.name}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to={`/products/${id}/edit`} className="btn btn-primary">
            ✏️ Edit Product
          </Link>
          <Link to="/products" className="btn btn-outline">
            ← Back to Products
          </Link>
        </div>
      </div>

      <div className="grid grid-2">
        {/* Product Images */}
        <div className="card">
          <img 
            src={product.images?.[0]?.url || 'https://via.placeholder.com/400'} 
            alt={product.name}
            style={{ width: '100%', borderRadius: '8px', marginBottom: '16px' }}
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {product.images?.map((img, idx) => (
              <img 
                key={idx}
                src={img.url} 
                alt={img.alt}
                style={{ 
                  width: '100%', 
                  height: '80px', 
                  objectFit: 'cover', 
                  borderRadius: '4px',
                  border: img.isPrimary ? '2px solid var(--primary-color)' : '1px solid var(--border-color)'
                }}
              />
            ))}
          </div>
        </div>

        {/* Basic Info */}
        <div className="card">
          <h3 className="card-title">Basic Information</h3>
          
          <div style={{ marginTop: '16px' }}>
            <div className="form-group">
              <label className="form-label">Price</label>
              <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-color)' }}>
                ₹{product.price?.toLocaleString()}
              </p>
              {product.discountPrice && (
                <p style={{ fontSize: '18px', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
                  ₹{product.discountPrice.toLocaleString()}
                </p>
              )}
              {product.discountPercentage > 0 && (
                <span className="badge badge-success" style={{ marginLeft: '8px' }}>
                  {product.discountPercentage}% OFF
                </span>
              )}
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Stock</label>
                <p style={{ fontSize: '18px' }}>{product.stock} units</p>
              </div>

              <div className="form-group">
                <label className="form-label">SKU</label>
                <p style={{ fontSize: '16px' }}>{product.sku || 'N/A'}</p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <div>
                {product.status === 'active' && <span className="badge badge-success">Active</span>}
                {product.status === 'draft' && <span className="badge badge-warning">Draft</span>}
                {product.status === 'out_of_stock' && <span className="badge badge-danger">Out of Stock</span>}
                {product.status === 'inactive' && <span className="badge badge-danger">Inactive</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <p style={{ lineHeight: '1.6' }}>{product.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Category-Specific Attributes */}
      {product.formattedAttributes && product.formattedAttributes.length > 0 && (
        <div className="card">
          <h3 className="card-title">{product.category?.name} Specifications</h3>
          <div className="grid grid-3">
            {product.formattedAttributes.map((attr, idx) => (
              <div key={idx} className="form-group">
                <label className="form-label">{attr.name}</label>
                <p style={{ fontSize: '16px' }}>
                  {Array.isArray(attr.value) ? attr.value.join(', ') : attr.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Highlights */}
      {product.highlights && product.highlights.length > 0 && (
        <div className="card">
          <h3 className="card-title">Product Highlights</h3>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
            {product.highlights.map((highlight, idx) => (
              <li key={idx}>{highlight}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed Specifications */}
      {product.specifications && product.specifications.length > 0 && (
        <div className="card">
          <h3 className="card-title">Detailed Specifications</h3>
          <div className="table-container">
            <table className="table">
              <tbody>
                {product.specifications.map((spec, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '600', width: '200px' }}>{spec.label}</td>
                    <td>{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="card">
        <h3 className="card-title">Additional Information</h3>
        <div className="grid grid-3">
          <div className="form-group">
            <label className="form-label">Created At</label>
            <p>{new Date(product.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="form-group">
            <label className="form-label">Last Updated</label>
            <p>{new Date(product.updatedAt).toLocaleDateString()}</p>
          </div>
          <div className="form-group">
            <label className="form-label">Tags</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {product.tags?.map((tag, idx) => (
                <span key={idx} className="badge badge-info">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
