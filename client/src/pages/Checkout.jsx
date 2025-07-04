import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });

  // Verify Razorpay is loaded
  useEffect(() => {
    if (!window.Razorpay) {
      toast.error('Payment system not loaded. Please refresh the page.');
    }
  }, []);

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!window.Razorpay) {
      toast.error('Payment system not loaded. Please refresh the page.');
      return;
    }

    if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
      toast.error('Payment configuration missing. Please contact support.');
      return;
    }

    setLoading(true);

    try {
      // Create order in our backend
      const { data: orderData } = await axios.post('/api/orders', {
        items: cart.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          size: item.size,
          price: item.product.price
        })),
        shippingAddress: formData,
        totalAmount: total
      });

      if (!orderData?.data?.razorpayOrderId) {
        throw new Error('Invalid order response from server');
      }

      // Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: total * 100, // Razorpay expects amount in paise
        currency: 'INR',
        name: 'Shoe Store',
        description: 'Payment for your order',
        order_id: orderData.data.razorpayOrderId,
        handler: async (response) => {
          try {
            if (!response.razorpay_payment_id || !response.razorpay_order_id || !response.razorpay_signature) {
              throw new Error('Invalid payment response');
            }

            // Verify payment with our backend
            await axios.post(`/api/orders/${orderData.data.orderId}/verify`, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });

            // Clear cart and redirect to success page
            clearCart();
            navigate('/orders');
            toast.success('Order placed successfully!');
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error(error.response?.data?.message || 'Payment verification failed. Please contact support.');
            // Redirect to orders page to check status
            navigate('/orders');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: formData.phone
        },
        modal: {
          ondismiss: function() {
            toast.error('Payment cancelled. Please try again.');
          }
        },
        theme: {
          color: '#4F46E5'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function(response) {
        toast.error(response.error.description || 'Payment failed. Please try again.');
      });
      razorpay.open();
    } catch (error) {
      console.error('Checkout failed:', error);
      toast.error(error.response?.data?.message || 'Failed to process checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">
        Checkout
      </h1>

      {/* Order Summary */}
      <div className="card mb-8">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Order Summary
          </h2>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {cart.map((item) => (
              <div key={`${item.product._id}-${item.size}`} className="py-4 flex">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="h-20 w-20 object-cover rounded"
                />
                <div className="ml-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.product.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Size: {item.size}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
            <div className="py-4">
              <div className="flex justify-between">
                <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                  Total
                </p>
                <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                  ${total.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Address Form */}
      <form onSubmit={handleSubmit} className="card">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Shipping Address
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="street" className="label">
                Street Address
              </label>
              <input
                type="text"
                id="street"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                className="input"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="label">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label htmlFor="state" className="label">
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="zipCode" className="label">
                  ZIP Code
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="label">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className={`w-full btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout; 