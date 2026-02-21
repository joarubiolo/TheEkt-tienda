import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface CartItem {
  id: number;
  user_id: string;
  product_id: number;
  name: string;
  price: number;
  size: string;
  color: string;
  image: string;
  quantity: number;
  added_at: string;
}

export interface WishlistItem {
  id: number;
  user_id: string;
  product_id: number;
  notify_on_restock: boolean;
  added_at: string;
}

export interface Order {
  id: number;
  user_id: string;
  stripe_payment_intent_id: string | null;
  items: any[];
  total_amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: any;
  created_at: string;
}

// Profile functions
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  return { data, error };
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  return { data, error };
};

export const createProfile = async (profile: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single();
  
  return { data, error };
};

// Cart functions
export const getCartItems = async (userId: string) => {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', userId);
  
  return { data, error };
};

export const addCartItem = async (item: Partial<CartItem>) => {
  const { data, error } = await supabase
    .from('cart_items')
    .insert(item)
    .select()
    .single();
  
  return { data, error };
};

export const updateCartItem = async (itemId: number, updates: Partial<CartItem>) => {
  const { data, error } = await supabase
    .from('cart_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single();
  
  return { data, error };
};

export const deleteCartItem = async (itemId: number) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId);
  
  return { error };
};

export const clearCart = async (userId: string) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);
  
  return { error };
};

// Wishlist functions
export const getWishlist = async (userId: string) => {
  const { data, error } = await supabase
    .from('wishlist')
    .select('*')
    .eq('user_id', userId);
  
  return { data, error };
};

export const addToWishlist = async (item: Partial<WishlistItem>) => {
  const { data, error } = await supabase
    .from('wishlist')
    .insert(item)
    .select()
    .single();
  
  return { data, error };
};

export const removeFromWishlist = async (wishlistId: number) => {
  const { error } = await supabase
    .from('wishlist')
    .delete()
    .eq('id', wishlistId);
  
  return { error };
};

export const updateWishlistNotification = async (wishlistId: number, notify: boolean) => {
  const { data, error } = await supabase
    .from('wishlist')
    .update({ notify_on_restock: notify })
    .eq('id', wishlistId)
    .select()
    .single();
  
  return { data, error };
};

// Orders functions
export const getOrders = async (userId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const createOrder = async (order: Partial<Order>) => {
  const { data, error } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single();
  
  return { data, error };
};
