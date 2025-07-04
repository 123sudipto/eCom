import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  images: [{
    type: String,
    required: [true, 'Product image is required']
  }],
  brand: {
    type: String,
    required: [true, 'Brand is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['casual', 'formal', 'sports', 'boots']
  },
  sizes: [{
    size: {
      type: Number,
      required: true
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative']
    }
  }],
  color: {
    type: String,
    required: [true, 'Color is required']
  },
  averageRating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot be more than 5']
  },
  numReviews: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add index for search functionality
productSchema.index({ name: 'text', description: 'text', brand: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product; 