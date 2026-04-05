import { supabase } from "./supabase";

export const trackProductView = async (productId: number) => {
  try {
    await supabase.rpc("increment_product_view", { p_product_id: productId });
  } catch (error) {
    console.error("Error tracking product view:", error);
  }
};

export const trackProductFavorite = async (productId: number, added: boolean) => {
  try {
    const increment = added ? 1 : -1;
    await supabase.rpc("increment_product_favorite", { 
      p_product_id: productId, 
      p_increment: increment 
    });
  } catch (error) {
    console.error("Error tracking product favorite:", error);
  }
};

export const trackProductCart = async (productId: number, added: boolean) => {
  try {
    const increment = added ? 1 : -1;
    await supabase.rpc("increment_product_cart", { 
      p_product_id: productId, 
      p_increment: increment 
    });
  } catch (error) {
    console.error("Error tracking product cart:", error);
  }
};

export const trackProductPurchase = async (productId: number, quantity: number) => {
  try {
    await supabase.rpc("increment_product_purchase", { 
      p_product_id: productId, 
      p_quantity: quantity 
    });
  } catch (error) {
    console.error("Error tracking product purchase:", error);
  }
};

export const getProductStats = async (productId: number) => {
  try {
    const { data, error } = await supabase
      .from("product_stats")
      .select("*")
      .eq("product_id", productId)
      .single();
    
    if (error) throw error;
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
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting all product stats:", error);
    return [];
  }
};
