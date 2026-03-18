const mongoose = require('mongoose');

/**
 * Category Schema - Dynamic attribute definition
 * This schema allows admins to define categories with custom attributes
 * Each attribute has a type, validation rules, and whether it's required
 */
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  // Dynamic attributes definition
  attributes: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['text', 'number', 'select', 'multiselect', 'boolean', 'file'],
      required: true
    },
    // For select/multiselect types
    options: [String],
    required: {
      type: Boolean,
      default: false
    },
    // Validation rules
    validation: {
      min: Number,
      max: Number,
      minLength: Number,
      maxLength: Number,
      pattern: String
    },
    // Display order in forms
    displayOrder: {
      type: Number,
      default: 0
    },
    // Whether this attribute should be used in filters
    isFilterable: {
      type: Boolean,
      default: true
    },
    // Whether this attribute should be searchable
    isSearchable: {
      type: Boolean,
      default: true
    }
  }],
  // Metadata for UI rendering
  uiConfig: {
    icon: String,
    color: String,
    thumbnailAttributes: [String] // Attributes to show in product thumbnails
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
categorySchema.index({ name: 1, isActive: 1 });

module.exports = mongoose.model('Category', categorySchema);
