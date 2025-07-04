import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { TrashIcon } from '@heroicons/react/24/outline';
import { MinusIcon, PlusIcon } from '@heroicons/react/20/solid';

const Cart = () => {
  const navigate = useNavigate();
  const { items, total, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:max-w-7xl">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Shopping Cart
        </h1>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Your cart is empty
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:max-w-7xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-8">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={`${item.product._id}-${item.size}`}
                className="flex items-center space-x-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
              >
                {/* Product Image */}
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-24 h-24 object-cover rounded"
                />

                {/* Product Details */}
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {item.product.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Size: {item.size}
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    ${item.product.price.toFixed(2)}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.product._id, item.size, item.quantity - 1)}
                      className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="text-gray-900 dark:text-gray-100 w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product._id, item.size, item.quantity + 1)}
                      className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Total and Remove */}
                <div className="text-right">
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeItem(item.product._id, item.size)}
                    className="text-red-500 hover:text-red-600 dark:hover:text-red-400 mt-2"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Order Summary
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                <span className="text-gray-900 dark:text-gray-100">${total.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Shipping</span>
                <span className="text-gray-900 dark:text-gray-100">Free</span>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between">
                  <span className="text-lg font-medium text-gray-900 dark:text-gray-100">Total</span>
                  <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full btn-primary"
              >
                Proceed to Checkout
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full btn-secondary mt-2"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 