import { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import axios from '../../utils/axios';
import toast from 'react-hot-toast';

const ORDER_STATUS = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' }
];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    startDate: '',
    endDate: ''
  });
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const { data } = await axios.get(`/api/admin/orders?${params.toString()}`);
      setOrders(data.data.orders);
    } catch (error) {
      setError('Failed to fetch orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/admin/orders/${orderId}/status`, {
        status: newStatus
      });
      toast.success('Order status updated successfully');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={fetchOrders}
          className="mt-4 btn btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search orders..."
              className="input pl-10"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          <div>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="input"
            >
              <option value="">All Status</option>
              {ORDER_STATUS.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="input"
              placeholder="Start Date"
            />
          </div>

          <div>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="input"
              placeholder="End Date"
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <FunnelIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">
              No orders found
            </h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order._id} className="card">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Order #{order._id}
                    </h3>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setExpandedOrder(
                        expandedOrder === order._id ? null : order._id
                      )
                    }
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <ChevronDownIcon
                      className={`h-5 w-5 transform transition-transform ${
                        expandedOrder === order._id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>

                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Customer
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {order.user.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Date
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Amount
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                      ${order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                {expandedOrder === order._id && (
                  <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="space-y-6">
                      {/* Order Items */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Order Items
                        </h4>
                        <div className="mt-2 divide-y divide-gray-200 dark:divide-gray-700">
                          {order.items.map((item) => (
                            <div
                              key={item._id}
                              className="py-3 flex items-center space-x-4"
                            >
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="h-16 w-16 object-cover rounded"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {item.product.name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Size: {item.size}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  ${item.price.toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Qty: {item.quantity}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Shipping Address
                        </h4>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                          {order.shippingAddress.state} {order.shippingAddress.zipCode}
                        </p>
                      </div>

                      {/* Status Update */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Update Status
                        </h4>
                        <div className="mt-2 flex space-x-2">
                          {ORDER_STATUS.map(status => (
                            <button
                              key={status.value}
                              onClick={() =>
                                handleStatusUpdate(order._id, status.value)
                              }
                              disabled={order.status === status.value}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                order.status === status.value
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800'
                                  : getStatusColor(status.value)
                              }`}
                            >
                              {status.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders; 