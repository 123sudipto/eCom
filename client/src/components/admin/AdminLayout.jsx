import { Outlet, NavLink } from 'react-router-dom';
import {
  ChartBarIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', to: '/admin', icon: ChartBarIcon },
  { name: 'Products', to: '/admin/products', icon: ShoppingBagIcon },
  { name: 'Orders', to: '/admin/orders', icon: ClipboardDocumentListIcon },
  { name: 'Users', to: '/admin/users', icon: UsersIcon }
];

const AdminLayout = () => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-64 min-h-screen bg-white dark:bg-gray-800 shadow-md">
        <div className="p-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Admin Panel
          </h2>
        </div>
        <nav className="mt-4">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  isActive ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400' : ''
                }`
              }
            >
              <item.icon className="h-6 w-6 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout; 