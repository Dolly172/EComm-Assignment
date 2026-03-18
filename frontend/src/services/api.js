import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Category APIs
export const categoryAPI = {
  getAll: (includeAttributes = false) => 
    api.get(`/categories?includeAttributes=${includeAttributes}`),
  
  getById: (id) => 
    api.get(`/categories/${id}`),
  
  getAttributes: (id) => 
    api.get(`/categories/${id}/attributes`),
  
  create: (data) => 
    api.post('/categories', data),
  
  update: (id, data) => 
    api.put(`/categories/${id}`, data),
  
  delete: (id) => 
    api.delete(`/categories/${id}`)
};

// Product APIs
export const productAPI = {
  getAll: (params) => 
    api.get('/products', { params }),
  
  getById: (id) => 
    api.get(`/products/${id}`),
  
  create: (data) => 
    api.post('/products', data),
  
  update: (id, data) => 
    api.put(`/products/${id}`, data),
  
  delete: (id) => 
    api.delete(`/products/${id}`),
  
  bulkUpdateStatus: (productIds, status) => 
    api.put('/products/bulk/status', { productIds, status })
};

// Search APIs
export const searchAPI = {
  search: (params) => 
    api.get('/search', { params }),
  
  getSuggestions: (query) => 
    api.get('/search/suggestions', { params: { q: query } }),
  
  getFiltersByCategory: (categoryId) => 
    api.get(`/search/filters/${categoryId}`)
};

export default api;
