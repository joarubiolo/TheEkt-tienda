import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  updateWishlistNotification,
} from "../services/supabase";
import { toast } from "sonner";

interface WishlistItem {
  id: number;
  product_id: number;
  notify_on_restock: boolean;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  loading: boolean;
  addItem: (productId: number, notifyOnRestock?: boolean) => Promise<void>;
  removeItem: (wishlistId: number) => Promise<void>;
  toggleNotification: (wishlistId: number, notify: boolean) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  getWishlistId: (productId: number) => number | null;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadWishlist();
    } else {
      setWishlist([]);
    }
  }, [user]);

  const loadWishlist = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await getWishlist(user.uid);

      if (error) {
        console.error("Error loading wishlist:", error);
        return;
      }

      if (data) {
        setWishlist(
          data.map((item: any) => ({
            id: item.id,
            product_id: item.product_id,
            notify_on_restock: item.notify_on_restock,
          }))
        );
      }
    } catch (err) {
      console.error("Error loading wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (productId: number, notifyOnRestock = true) => {
    if (!user) {
      toast.error("Debes iniciar sesión para agregar favoritos");
      return;
    }

    try {
      const { data, error } = await addToWishlist({
        user_id: user.uid,
        product_id: productId,
        notify_on_restock: notifyOnRestock,
      });

      if (error) {
        toast.error("Error al agregar a favoritos");
        return;
      }

      if (data) {
        setWishlist([...wishlist, {
          id: data.id,
          product_id: data.product_id,
          notify_on_restock: data.notify_on_restock,
        }]);
        toast.success("Agregado a favoritos");
      }
    } catch (err) {
      toast.error("Error al agregar a favoritos");
      console.error(err);
    }
  };

  const removeItem = async (wishlistId: number) => {
    try {
      const { error } = await removeFromWishlist(wishlistId);

      if (error) {
        toast.error("Error al eliminar de favoritos");
        return;
      }

      setWishlist(wishlist.filter((item) => item.id !== wishlistId));
      toast.success("Eliminado de favoritos");
    } catch (err) {
      toast.error("Error al eliminar de favoritos");
      console.error(err);
    }
  };

  const toggleNotification = async (wishlistId: number, notify: boolean) => {
    try {
      const { data, error } = await updateWishlistNotification(wishlistId, notify);

      if (error) {
        toast.error("Error al actualizar notificaciones");
        return;
      }

      if (data) {
        setWishlist(
          wishlist.map((item) =>
            item.id === wishlistId
              ? { ...item, notify_on_restock: notify }
              : item
          )
        );

        if (notify) {
          toast.success("Recibirás notificaciones cuando el producto reponga stock");
        } else {
          toast.info("Notificaciones desactivadas");
        }
      }
    } catch (err) {
      toast.error("Error al actualizar notificaciones");
      console.error(err);
    }
  };

  const isInWishlist = (productId: number): boolean => {
    return wishlist.some((item) => item.product_id === productId);
  };

  const getWishlistId = (productId: number): number | null => {
    const item = wishlist.find((item) => item.product_id === productId);
    return item ? item.id : null;
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        addItem,
        removeItem,
        toggleNotification,
        isInWishlist,
        getWishlistId,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
