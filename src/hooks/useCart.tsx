import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

/**
 * Read the stored cart, migrating from the old key if present.
 *
 * Runs synchronously as the initial state rather than in a mount effect.
 * Effects run children-first, so an effect-based load landed *after* a child
 * page had already called clearCart() and quietly restored the basket the
 * customer had just paid for.
 */
function readStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    let savedCart = localStorage.getItem('ihram-cart');

    // If not found, check old key and migrate
    if (!savedCart) {
      const oldCart = localStorage.getItem('ihraam-cart');
      if (oldCart) {
        localStorage.setItem('ihram-cart', oldCart);
        localStorage.removeItem('ihraam-cart');
        savedCart = oldCart;
      }
    }

    if (!savedCart) return [];
    const parsed = JSON.parse(savedCart);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return [];
  }
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>(readStoredCart);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('ihram-cart', JSON.stringify(items));
  }, [items]);

  // Every function below is memoised, and the context value with them. Without
  // this, each render handed consumers brand new function identities: an effect
  // that depended on one and also called it re-ran forever. That is what fired
  // 651 purchase events from a single order on 2026-07-15.
  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems(current => {
      const existingItem = current.find(i => i.id === item.id);
      if (existingItem) {
        return current.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...current, { ...item, quantity }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(current => current.filter(item => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(current =>
      current.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [items]);

  const value = useMemo(() => ({
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
  }), [items, addItem, removeItem, updateQuantity, clearCart, getTotalItems, getTotalPrice]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};