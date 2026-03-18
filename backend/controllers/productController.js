const Product = require('../models/Product');
const Category = require('../models/Category');

/**
 * Get all products with filtering, sorting, and pagination
 */
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Stock filter
    if (req.query.inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Search by name or description
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    const products = await Product.find(query)
      .populate('category', 'name description uiConfig')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

/**
 * Get single product by ID with full details
 */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name description attributes uiConfig');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Format attributes based on category
    const formattedAttributes = product.getFormattedAttributes(product.category);

    res.json({
      success: true,
      data: {
        ...product.toObject(),
        formattedAttributes
      }
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

/**
 * Create new product with dynamic attributes
 */
exports.createProduct = async (req, res) => {
  try {
    console.log('Creating product with data:', req.body);
    
    // Verify category exists
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Convert attributes object to Map format
    if (req.body.attributes) {
      const attributesMap = new Map();
      Object.entries(req.body.attributes).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          attributesMap.set(key, value);
        }
      });
      req.body.attributes = attributesMap;
      console.log('Converted attributes to Map:', attributesMap);
    }

    const product = await Product.create(req.body);

    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name description attributes uiConfig');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: populatedProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    console.error('Error details:', error.errors);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }
    
    // Handle validation errors
    if (error.errors) {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

/**
 * Update product
 */
exports.updateProduct = async (req, res) => {
  try {
    // Handle attributes conversion to Map
    if (req.body.attributes) {
      const attributesMap = new Map();
      Object.entries(req.body.attributes).forEach(([key, value]) => {
        attributesMap.set(key, value);
      });
      req.body.attributes = attributesMap;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('category', 'name description attributes uiConfig');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(400).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

/**
 * Delete product
 */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: {}
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

/**
 * Bulk update product status
 */
exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { productIds, status } = req.body;

    if (!Array.isArray(productIds) || !status) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request. productIds array and status are required'
      });
    }

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { status }
    );

    res.json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} products`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating products',
      error: error.message
    });
  }
};
