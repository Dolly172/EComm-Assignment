const mongoose = require('mongoose');

/**
 * Product Schema - Dynamic attributes based on category
 * Uses MongoDB's flexible schema to store category-specific attributes
 */
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  // Basic product information (common to all categories)
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discountPrice: {
    type: Number,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  // Images array
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  /**
   * Dynamic Attributes - Core feature for category-specific fields
   * Stores attribute values as key-value pairs
   * Example for Mobile: { "RAM": "8GB", "Processor": "Snapdragon 888", "Storage": "128GB" }
   * Example for Bangles: { "Color": "Gold", "Size": "Medium", "Material": "Gold", "Weight": "50g" }
   */
  attributes: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  // Structured sections for detailed product information
  highlights: [String],      // Key selling points
  specifications: [{         // Detailed specs with labels and values
    label: String,
    value: mongoose.Schema.Types.Mixed
  }],
  // SEO and metadata
  tags: [String],
  metaTitle: String,
  metaDescription: String,
  // Status and visibility
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'out_of_stock'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Ratings and reviews aggregation
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  // Sales metrics
  soldCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.discountPrice && this.price) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

// Indexes for performance optimization
productSchema.index({ category: 1, status: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ 'attributes.$**': 'text' }); // Text index on all attribute values
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'ratings.average': -1 });

// Pre-save middleware to update status based on stock
productSchema.pre('save', function(next) {
  if (this.stock === 0 && this.status !== 'draft') {
    this.status = 'out_of_stock';
  } else if (this.stock > 0 && this.status === 'out_of_stock') {
    this.status = 'active';
  }
  next();
});

// Instance method to get formatted attributes
productSchema.methods.getFormattedAttributes = function(category) {
  const formatted = [];
  if (category && category.attributes) {
    category.attributes.forEach(attr => {
      const value = this.attributes.get(attr.name);
      if (value !== undefined && value !== null) {
        formatted.push({
          name: attr.name,
          value: value,
          type: attr.type
        });
      }
    });
  }
  return formatted;
};

module.exports = mongoose.model('Product', productSchema);
