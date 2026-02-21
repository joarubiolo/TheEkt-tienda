import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem } from "../types/cart";
import { Product } from "../types/product";
import { useAuth } from "./AuthContext";
import {
  getCartItems,
  addCartItem,
  updateCartItem,
  deleteCartItem,
  clearCart as clearCartDB,
} from "../services/supabase";
import { toast } from "sonner";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, size: string, color: string) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "aurora_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cart from localStorage on initial mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error("Error parsing cart:", e);
      }
    }
    setLoading(false);
  }, []);

  // Load cart from Supabase when user logs in
  useEffect(() => {
    if (user) {
      loadCartFromSupabase();
    }
  }, [user]);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, loading]);

  const loadCartFromSupabase = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await getCartItems(user.uid);

      if (error) {
        console.error("Error loading cart from Supabase:", error);
        return;
      }

      if (data && data.length > 0) {
        // Merge local cart with Supabase cart
        const dbItems: CartItem[] = data.map((item: any) => ({
          id: item.id,
          productId: item.product_id,
          name: item.name,
          price: item.price,
          image: item.image,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        }));

        // Merge carts - if item exists in both, keep the one with higher quantity
        const mergedItems = [...items];
        dbItems.forEach((dbItem) => {
          const existingIndex = mergedItems.findIndex(
            (item) =>
              item.productId === dbItem.productId &&
              item.size === dbItem.size &&
              item.color === dbItem.color
          );

          if (existingIndex > -1) {
            // Item exists in both, keep the higher quantity
            if (dbItem.quantity > mergedItems[existingIndex].quantity) {
              mergedItems[existingIndex] = dbItem;
            }
          } else {
            // Item only in DB, add it
            mergedItems.push(dbItem);
          }
        });

        setItems(mergedItems);

        // Sync merged cart back to Supabase
        await syncCartToSupabase(mergedItems);
      } else {
        // No items in DB, save local items to DB
        await syncCartToSupabase(items);
      }
    } catch (err) {
      console.error("Error in loadCartFromSupabase:", err);
    } finally {
      setLoading(false);
    }
  };

  const syncCartToSupabase = async (cartItems: CartItem[]) => {
    if (!user) return;

    try {
      // Clear existing items in DB
      await clearCartDB(user.uid);

      // Add all current items
      for (const item of cartItems) {
        await addCartItem({
          user_id: user.uid,
          product_id: item.productId,
          name: item.name,
          price: item.price,
          size: item.size,
          color: item.color,
          image: item.image,
          quantity: item.quantity,
        });
      }
    } catch (err) {
      console.error("Error syncing cart to Supabase:", err);
    }
  };

  const addItem = async (product: Product, size: string, color: string) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          item.productId === product.id &&
          item.size === size &&
          item.color === color
      );

      let newItems;
      if (existingItemIndex > -1) {
        newItems = [...prevItems];
        newItems[existingItemIndex].quantity += 1;
      } else {
        const newItem: CartItem = {
          id: Date.now(),
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          size,
          color,
          quantity: 1,
        };
        newItems = [...prevItems, newItem];
      }

      // Sync to Supabase if user is logged in
      if (user) {
        syncCartToSupabase(newItems);
      }

      return newItems;
    });
  };

  const removeItem = async (id: number) => {
    setItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.id !== id);

      if (user) {
        // Delete from Supabase
        deleteCartItem(id).catch((err) => {
          console.error("Error deleting cart item:", err);
        });
      }

      return newItems;
    });
  };

  const updateQuantity = async (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems((prevItems) => {
      const newItems = prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );

      if (user) {
        const item = newItems.find((i) => i.id === id);
        if (item) {
          updateCartItem(id, { quantity }).catch((err) => {
            console.error("Error updating cart item:", err);
          });
        }
      }

      return newItems;
    });
  };

  const clearCart = async () => {
    setItems([]);

    if (user) {
      try {
        await clearCartDB(user.uid);
      } catch (err) {
        console.error("Error clearing cart:", err);
      }
    }

    localStorage.removeItem(STORAGE_KEY);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
