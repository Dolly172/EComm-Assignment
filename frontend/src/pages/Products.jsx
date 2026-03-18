import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll({ limit: 100 });
      setProducts(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.delete(id);
        fetchProducts();
      } catch (error) {
        alert('Failed to delete product');
      }
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage your product catalog</p>
        </div>
        <Link to="/products/new" className="btn btn-primary">
          ➕ Add Product
        </Link>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    <img 
                      src={product.images?.[0]?.url || 'https://via.placeholder.com/50'} 
                      alt={product.name}
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  </td>
                  <td><strong>{product.name}</strong></td>
                  <td>{product.category?.name || 'N/A'}</td>
                  <td>₹{product.price.toLocaleString()}</td>
                  <td>{product.stock}</td>
                  <td>
                    {product.status === 'active' && <span className="badge badge-success">Active</span>}
                    {product.status === 'draft' && <span className="badge badge-warning">Draft</span>}
                    {product.status === 'out_of_stock' && <span className="badge badge-danger">Out of Stock</span>}
                    {product.status === 'inactive' && <span className="badge badge-danger">Inactive</span>}
                  </td>
                  <td>
                    <Link 
                      to={`/products/${product._id}`} 
                      className="btn btn-outline"
                      style={{ marginRight: '8px', padding: '6px 12px', fontSize: '12px' }}
                    >
                      👁️ View
                    </Link>
                    <Link 
                      to={`/products/${product._id}/edit`} 
                      className="btn btn-outline"
                      style={{ marginRight: '8px', padding: '6px 12px', fontSize: '12px' }}
                    >
                      ✏️ Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="btn btn-danger"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Products;
