import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import CategoryForm from './pages/CategoryForm';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import ProductDetail from './pages/ProductDetail';
import Search from './pages/Search';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="categories" element={<Categories />} />
          <Route path="categories/new" element={<CategoryForm />} />
          <Route path="categories/:id/edit" element={<CategoryForm />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<AddProduct />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="products/:id/edit" element={<AddProduct />} />
          <Route path="search" element={<Search />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
