const Product = require('../models/Product');
const Category = require('../models/Category');

/**
 * Advanced search with dynamic filters based on category
 * This is the core search endpoint that handles:
 * - Text search across product fields and attributes
 * - Dynamic filter generation based on selected categories
 * - Faceted search results
 */
exports.searchProducts = async (req, res) => {
  try {
    const {
      query: searchQuery,
      category,
      minPrice,
      maxPrice,
      inStock,
      sortBy,
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build main query
    const query = { isActive: true };

    // Category filter
    if (category) {
      query.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Stock filter
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Status filter (only show active products by default)
    if (!req.query.status) {
      query.status = 'active';
    } else {
      query.status = req.query.status;
    }

    // Text search
    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, 'i');
      
      // Search in name, description, tags
      const textSearchConditions = [
        { name: searchRegex },
        { description: searchRegex },
        { tags: searchRegex }
      ];

      // If category is specified, search in category-specific attributes
      if (category) {
        const categoryDoc = await Category.findById(category);
        if (categoryDoc && categoryDoc.attributes) {
          categoryDoc.attributes.forEach(attr => {
            if (attr.isSearchable !== false) {
              const attributePath = `attributes.${attr.name}`;
              const attrCondition = {};
              attrCondition[attributePath] = searchRegex;
              textSearchConditions.push(attrCondition);
            }
          });
        }
      }

      query.$or = textSearchConditions;
    }

    // Execute main search query
    const products = await Product.find(query)
      .populate('category', 'name description uiConfig attributes')
      .sort({ [sortBy || 'createdAt']: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Product.countDocuments(query);

    // Generate dynamic filters
    const filters = await generateDynamicFilters(query, category);

    res.json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: products,
      filters
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing search',
      error: error.message
    });
  }
};

/**
 * Generate dynamic filters based on categories in search results
 * This creates category-specific filter options
 */
async function generateDynamicFilters(baseQuery, selectedCategory) {
  const filters = {
    categories: [],
    priceRange: { min: 0, max: 0 },
    attributes: []
  };

  try {
    // Get all categories for filter
    const allCategories = await Category.find({ isActive: true }).select('name uiConfig');
    filters.categories = allCategories.map(cat => ({
      _id: cat._id,
      name: cat.name,
      icon: cat.uiConfig?.icon,
      color: cat.uiConfig?.color
    }));

    // Get price range from products
    const priceStats = await Product.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);

    if (priceStats.length > 0) {
      filters.priceRange = {
        min: priceStats[0].minPrice || 0,
        max: priceStats[0].maxPrice || 0
      };
    }

    // Generate attribute-based filters for selected category
    if (selectedCategory) {
      const category = await Category.findById(selectedCategory).select('attributes');
      
      if (category && category.attributes) {
        const filterableAttributes = category.attributes.filter(attr => attr.isFilterable !== false);

        for (const attr of filterableAttributes) {
          const attributeFilter = {
            name: attr.name,
            type: attr.type,
            options: []
          };

          if (attr.type === 'select' || attr.type === 'multiselect') {
            // Use predefined options
            attributeFilter.options = attr.options || [];
          } else if (attr.type === 'text') {
            // Get unique values from products
            const uniqueValues = await Product.distinct(`attributes.${attr.name}`, baseQuery);
            attributeFilter.options = uniqueValues.filter(v => v !== null && v !== undefined);
          } else if (attr.type === 'boolean') {
            attributeFilter.options = ['true', 'false'];
          }

          filters.attributes.push(attributeFilter);
        }
      }
    }

  } catch (error) {
    console.error('Error generating filters:', error);
  }

  return filters;
}

/**
 * Get available filters for a specific category
 * Used to populate filter UI before searching
 */
exports.getFiltersByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId).select('attributes');
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const filters = {
      categoryId: category._id,
      categoryName: category.name,
      attributes: []
    };

    const filterableAttributes = category.attributes.filter(attr => attr.isFilterable !== false);

    for (const attr of filterableAttributes) {
      const attributeFilter = {
        name: attr.name,
        type: attr.type,
        displayName: attr.name,
        options: []
      };

      if (attr.type === 'select' || attr.type === 'multiselect') {
        attributeFilter.options = attr.options || [];
      } else if (attr.type === 'text') {
        const uniqueValues = await Product.distinct(`attributes.${attr.name}`, {
          category: categoryId,
          isActive: true
        });
        attributeFilter.options = uniqueValues
          .filter(v => v !== null && v !== undefined)
          .sort();
      } else if (attr.type === 'number') {
        // Get min/max values for number attributes
        const stats = await Product.aggregate([
          {
            $match: {
              category: require('mongoose').Types.ObjectId(categoryId),
              isActive: true
            }
          },
          {
            $group: {
              _id: null,
              minValue: { $min: `$attributes.${attr.name}` },
              maxValue: { $max: `$attributes.${attr.name}` }
            }
          }
        ]);

        if (stats.length > 0) {
          attributeFilter.range = {
            min: stats[0].minValue || 0,
            max: stats[0].maxValue || 0
          };
        }
      } else if (attr.type === 'boolean') {
        attributeFilter.options = [
          { label: 'Yes', value: 'true' },
          { label: 'No', value: 'false' }
        ];
      }

      filters.attributes.push(attributeFilter);
    }

    res.json({
      success: true,
      data: filters
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching filters',
      error: error.message
    });
  }
};

/**
 * Get search suggestions/autocomplete
 */
exports.getSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: { suggestions: [] }
      });
    }

    const regex = new RegExp(q, 'i');

    // Get suggestions from product names
    const nameSuggestions = await Product.distinct('name', {
      name: regex,
      isActive: true
    }).limit(5);

    // Get suggestions from tags
    const tagSuggestions = await Product.distinct('tags', {
      tags: regex,
      isActive: true
    }).limit(5);

    const allSuggestions = [
      ...nameSuggestions.slice(0, 3),
      ...tagSuggestions.slice(0, 2)
    ].filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates

    res.json({
      success: true,
      data: { suggestions: allSuggestions }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching suggestions',
      error: error.message
    });
  }
};
