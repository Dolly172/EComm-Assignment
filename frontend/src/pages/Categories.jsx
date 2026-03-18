import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryAPI } from '../services/api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll(true);
      setCategories(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load categories');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryAPI.delete(id);
        fetchCategories();
      } catch (err) {
        alert('Failed to delete category');
      }
    }
  };

  if (loading) return <div className="spinner"></div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Manage product categories and their attributes</p>
        </div>
        <Link to="/categories/new" className="btn btn-primary">
          ➕ Create Category
        </Link>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Attributes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category._id}>
                  <td>
                    <strong>{category.uiConfig?.icon} {category.name}</strong>
                  </td>
                  <td style={{ maxWidth: '300px' }}>{category.description}</td>
                  <td>
                    <span className="badge badge-info">
                      {category.attributes?.length || 0} attributes
                    </span>
                  </td>
                  <td>
                    {category.isActive ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-danger">Inactive</span>
                    )}
                  </td>
                  <td>
                    <Link 
                      to={`/categories/${category._id}/edit`} 
                      className="btn btn-outline"
                      style={{ marginRight: '8px' }}
                    >
                      ✏️ Edit
                    </Link>
                    <button 
                      onClick={() => handleDelete(category._id)}
                      className="btn btn-danger"
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

export default Categories;
