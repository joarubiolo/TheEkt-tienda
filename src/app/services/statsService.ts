import { supabase } from "./supabase";

export const trackProductView = async (productId: number) => {
  if (!productId) return;
  try {
    const { data, error } = await supabase.rpc("increment_product_view", { p_product_id: productId });
    if (error) {
      console.error("Error tracking product view:", error);
    }
  } catch (error) {
    console.error("Error tracking product view:", error);
  }
};

export const trackProductFavorite = async (productId: number, added: boolean) => {
  if (!productId) return;
  try {
    const increment = added ? 1 : -1;
    const { data, error } = await supabase.rpc("increment_product_favorite", { 
      p_product_id: productId, 
      p_increment: increment 
    });
    if (error) {
      console.error("Error tracking product favorite:", error);
    }
  } catch (error) {
    console.error("Error tracking product favorite:", error);
  }
};

export const trackProductCart = async (productId: number, added: boolean) => {
  if (!productId) return;
  try {
    const increment = added ? 1 : -1;
    const { data, error } = await supabase.rpc("increment_product_cart", { 
      p_product_id: productId, 
      p_increment: increment 
    });
    if (error) {
      console.error("Error tracking product cart:", error);
    }
  } catch (error) {
    console.error("Error tracking product cart:", error);
  }
};

export const trackProductPurchase = async (productId: number, quantity: number) => {
  if (!productId || !quantity) return;
  try {
    const { data, error } = await supabase.rpc("increment_product_purchase", { 
      p_product_id: productId, 
      p_quantity: quantity 
    });
    if (error) {
      console.error("Error tracking product purchase:", error);
    }
  } catch (error) {
    console.error("Error tracking product purchase:", error);
  }
};

export const getProductStats = async (productId: number) => {
  if (!productId) return null;
  try {
    const { data, error } = await supabase
      .from("product_stats")
      .select("*")
      .eq("product_id", productId)
      .single();
    
    if (error) {
      console.error("Error getting product stats:", error);
      return null;
    }
    return data;
  } catch (error) {
    console.error("Error getting product stats:", error);
    return null;
  }
};

export const getAllProductStats = async () => {
  try {
    const { data, error } = await supabase
      .from("product_stats")
      .select("*")
      .order("views", { ascending: false });
    
    if (error) {
      console.error("Error getting all product stats:", error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error("Error getting all product stats:", error);
    return [];
  }
};

// Debug function to check stats connection
export const debugStats = async () => {
  console.log("=== DEBUG STATS ===");
  console.log("Supabase URL:", supabase.supabaseUrl);
  
  // Test RPC call
  try {
    const { data, error } = await supabase.rpc("increment_product_view", { p_product_id: 999 });
    console.log("RPC call result:", { data, error });
  } catch (err) {
    console.error("RPC call error:", err);
  }
  
  // Try direct insert
  try {
    const { data, error } = await supabase
      .from("product_stats")
      .upsert({ product_id: 999, views: 1, updated_at: new Date().toISOString() }, { onConflict: 'product_id' })
      .select();
    console.log("Direct upsert result:", { data, error });
  } catch (err) {
    console.error("Direct upsert error:", err);
  }
};
