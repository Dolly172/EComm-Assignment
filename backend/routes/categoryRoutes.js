const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Routes for /api/categories
router.route('/')
  .get(categoryController.getAllCategories)
  .post(categoryController.createCategory);

router.route('/:id')
  .get(categoryController.getCategoryById)
  .put(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

router.get('/:id/attributes', categoryController.getCategoryAttributes);

module.exports = router;
