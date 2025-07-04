import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Fragment } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { ShoppingBagIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';

const Layout = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Disclosure as="nav" className="bg-white dark:bg-gray-800 shadow">
        {({ open }) => (
          <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <Link to="/" className="flex-shrink-0 flex items-center">
                    <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      ShoeStore
                    </span>
                  </Link>
                </div>

                <div className="flex items-center">
                  {/* Theme Toggle */}
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {darkMode ? (
                      <SunIcon className="h-6 w-6" />
                    ) : (
                      <MoonIcon className="h-6 w-6" />
                    )}
                  </button>

                  {/* Cart */}
                  <Link
                    to="/cart"
                    className="ml-4 p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 relative"
                  >
                    <ShoppingBagIcon className="h-6 w-6" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Link>

                  {/* User Menu */}
                  {isAuthenticated ? (
                    <Menu as="div" className="ml-4 relative">
                      <Menu.Button className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        <span className="sr-only">Open user menu</span>
                        <div className="h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      </Menu.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {isAdmin && (
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  to="/admin"
                                  className={`${
                                    active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                  } block px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                                >
                                  Admin Dashboard
                                </Link>
                              )}
                            </Menu.Item>
                          )}
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/orders"
                                className={`${
                                  active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                } block px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                              >
                                My Orders
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={handleLogout}
                                className={`${
                                  active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                              >
                                Sign out
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  ) : (
                    <div className="ml-4 flex items-center space-x-4">
                      <Link
                        to="/login"
                        className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        Sign in
                      </Link>
                      <Link
                        to="/register"
                        className="btn btn-primary"
                      >
                        Sign up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </Disclosure>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-white dark:bg-gray-800 shadow mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} ShoeStore. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 