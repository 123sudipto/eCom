export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const SHOE_SIZES = [
  6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13
];

export const SHOE_CATEGORIES = [
  { value: 'running', label: 'Running' },
  { value: 'basketball', label: 'Basketball' },
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'sports', label: 'Sports' },
  { value: 'training', label: 'Training' },
  { value: 'walking', label: 'Walking' },
  { value: 'lifestyle', label: 'Lifestyle' }
];

export const ORDER_STATUS = [
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' }
];

export const RAZORPAY_CONFIG = {
  name: 'ShoeStore',
  description: 'Your One-Stop Shop for Footwear',
  image: '/shoe.svg',
  prefill: {
    name: '',
    email: '',
    contact: ''
  },
  theme: {
    color: '#4F46E5'
  }
}; 