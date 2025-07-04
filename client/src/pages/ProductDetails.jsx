import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import axios from '../utils/axios';
import { useCart } from '../context/CartContext';
import { SHOE_SIZES } from '../utils/config';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/products/${id}`);
      setProduct(data.data);
      setSelectedImage(0);
    } catch (error) {
      setError('Failed to fetch product details');
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    const sizeInfo = product.sizes.find(s => s.size === selectedSize);
    if (!sizeInfo || sizeInfo.stock === 0) {
      toast.error('Selected size is out of stock');
      return;
    }

    addItem(product, selectedSize);
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={fetchProduct}
          className="mt-4 btn btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Product Images */}
      <div className="space-y-4">
        <div className="aspect-square overflow-hidden rounded-lg">
          <img
            src={product.images[selectedImage]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {product.images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`aspect-square rounded-lg overflow-hidden border-2 ${
                selectedImage === index
                  ? 'border-primary-600'
                  : 'border-transparent'
              }`}
            >
              <img
                src={image}
                alt={`${product.name} view ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Product Info */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {product.name}
        </h1>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            ${product.price.toFixed(2)}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-100">
            {product.category}
          </span>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Description
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {product.description}
          </p>
        </div>

        {/* Size Selection */}
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Select Size
          </h2>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {SHOE_SIZES.map(size => {
              const sizeInfo = product.sizes.find(s => s.size === size);
              const inStock = sizeInfo && sizeInfo.stock > 0;
              return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  disabled={!inStock}
                  className={`py-2 text-center rounded-md ${
                    selectedSize === size
                      ? 'bg-primary-600 text-white'
                      : inStock
                      ? 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stock Info */}
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          {selectedSize ? (
            <span>
              Stock:{' '}
              {product.sizes.find(s => s.size === selectedSize)?.stock || 0} pairs
              available
            </span>
          ) : (
            'Select a size to see stock availability'
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="mt-8 w-full btn btn-primary flex items-center justify-center space-x-2"
        >
          <ShoppingBagIcon className="h-5 w-5" />
          <span>Add to Cart</span>
        </button>

        {/* Additional Info */}
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Brand
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {product.brand}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Color
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {product.color}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails; 