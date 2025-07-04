import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
        calculateTotal(parsedCart);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
      localStorage.removeItem('cart'); // Clear corrupted data
      setItems([]);
      setTotal(0);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
      calculateTotal(items);
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
  }, [items]);

  const calculateTotal = (cartItems) => {
    try {
      const sum = cartItems.reduce((acc, item) => {
        if (!item.product || typeof item.product.price !== 'number' || !item.quantity) {
          console.error('Invalid cart item:', item);
          return acc;
        }
        return acc + (item.product.price * item.quantity);
      }, 0);
      setTotal(sum);
    } catch (error) {
      console.error('Failed to calculate total:', error);
      setTotal(0);
    }
  };

  const addItem = (product, size, quantity = 1) => {
    if (!product || !product._id || !size || quantity < 1) {
      toast.error('Invalid product information');
      return;
    }

    setItems(prevItems => {
      try {
        // Check if item with same product ID and size exists
        const existingItemIndex = prevItems.findIndex(
          item => item.product._id === product._id && item.size === size
        );

        if (existingItemIndex > -1) {
          // Update quantity if item exists
          const updatedItems = [...prevItems];
          updatedItems[existingItemIndex].quantity += quantity;
          toast.success('Cart updated successfully');
          return updatedItems;
        } else {
          // Add new item if it doesn't exist
          toast.success('Item added to cart');
          return [...prevItems, { product, size, quantity }];
        }
      } catch (error) {
        console.error('Failed to add item:', error);
        toast.error('Failed to update cart');
        return prevItems;
      }
    });
  };

  const removeItem = (productId, size) => {
    if (!productId || !size) {
      toast.error('Invalid item information');
      return;
    }

    setItems(prevItems => {
      try {
        const updatedItems = prevItems.filter(
          item => !(item.product._id === productId && item.size === size)
        );
        toast.success('Item removed from cart');
        return updatedItems;
      } catch (error) {
        console.error('Failed to remove item:', error);
        toast.error('Failed to update cart');
        return prevItems;
      }
    });
  };

  const updateQuantity = (productId, size, quantity) => {
    if (!productId || !size || quantity < 0) {
      toast.error('Invalid update information');
      return;
    }

    if (quantity === 0) {
      removeItem(productId, size);
      return;
    }

    setItems(prevItems => {
      try {
        const updatedItems = prevItems.map(item => {
          if (item.product._id === productId && item.size === size) {
            return { ...item, quantity };
          }
          return item;
        });
        toast.success('Cart updated successfully');
        return updatedItems;
      } catch (error) {
        console.error('Failed to update quantity:', error);
        toast.error('Failed to update cart');
        return prevItems;
      }
    });
  };

  const clearCart = () => {
    try {
      setItems([]);
      localStorage.removeItem('cart');
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Failed to clear cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const value = {
    items,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    itemCount: items.length
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 