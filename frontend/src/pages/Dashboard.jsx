import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryAPI, productAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    categories: 0,
    products: 0,
    activeProducts: 0,
    outOfStock: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        categoryAPI.getAll(),
        productAPI.getAll({ limit: 100 })
      ]);

      const allProducts = productsRes.data.data || [];
      
      setStats({
        categories: categoriesRes.data.count,
        products: productsRes.data.total || allProducts.length,
        activeProducts: allProducts.filter(p => p.status === 'active').length,
        outOfStock: allProducts.filter(p => p.status === 'out_of_stock').length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Categories', value: stats.categories, icon: '📁', color: '#3B82F6' },
    { title: 'Total Products', value: stats.products, icon: '📦', color: '#10B981' },
    { title: 'Active Products', value: stats.activeProducts, icon: '✅', color: '#8B5CF6' },
    { title: 'Out of Stock', value: stats.outOfStock, icon: '⚠️', color: '#F59E0B' }
  ];

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your e-commerce system</p>
      </div>

      <div className="grid grid-4" style={{ gap: '16px' }}>
        {statCards.map((stat, index) => (
          <div key={index} className="card" style={{ 
            borderLeft: `4px solid ${stat.color}`,
            padding: '20px',
            marginBottom: 0
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: '13px', 
                  marginBottom: '8px',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {stat.title}
                </p>
                <h3 style={{ 
                  fontSize: '28px', 
                  fontWeight: '700', 
                  color: 'var(--text-primary)',
                  margin: 0
                }}>
                  {stat.value}
                </h3>
              </div>
              <span style={{ fontSize: '32px', opacity: 0.4 }}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-2" style={{ marginTop: '20px', gap: '20px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link to="/products/new" className="btn btn-primary">
              ➕ Add New Product
            </Link>
            <Link to="/categories/new" className="btn btn-secondary">
              📁 Create New Category
            </Link>
            <Link to="/search" className="btn btn-outline">
              🔍 Search Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
