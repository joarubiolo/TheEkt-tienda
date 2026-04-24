import { Button } from "./ui/button";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { Heart } from "lucide-react";
import { cn } from "../../lib/utils";
import { trackProductFavorite } from "../services/statsService";

interface WishlistButtonProps {
  productId: number;
  className?: string;
}

export function WishlistButton({ productId, className }: WishlistButtonProps) {
  const { isInWishlist, addItem, removeItem, getWishlistId, loading } = useWishlist();
  const { user } = useAuth();

  const inWishlist = isInWishlist(productId);

const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      console.log("[Wishlist] User not logged in");
      return;
    }

    const wasInWishlist = inWishlist;
    
    if (inWishlist) {
      const wishlistId = getWishlistId(productId);
      if (wishlistId) {
        await removeItem(wishlistId);
        console.log("[Wishlist] Removing, calling trackProductFavorite:", productId, false);
        trackProductFavorite(productId, false).then(r => console.log("[Wishlist] trackProductFavorite result:", r));
      }
    } else {
      console.log("[Wishlist] Adding, calling trackProductFavorite:", productId, true);
      await addItem(productId);
      trackProductFavorite(productId, true).then(r => console.log("[Wishlist] trackProductFavorite result:", r));
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "absolute top-2 right-2 z-10 bg-white/80 hover:bg-white rounded-full shadow-sm transition-all",
        inWishlist && "text-red-500 hover:text-red-600",
        className
      )}
      onClick={handleClick}
      disabled={loading}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-all",
          inWishlist && "fill-current"
        )}
      />
    </Button>
  );
}
