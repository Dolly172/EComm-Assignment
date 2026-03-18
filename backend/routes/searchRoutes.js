const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Routes for /api/search
router.get('/', searchController.searchProducts);
router.get('/suggestions', searchController.getSuggestions);
router.get('/filters/:categoryId', searchController.getFiltersByCategory);

module.exports = router;
