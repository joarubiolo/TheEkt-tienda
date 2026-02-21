import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { products } from "../data/products";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { ArrowLeft, Heart, ShoppingCart, Trash2, Bell } from "lucide-react";
import { toast } from "sonner";

export function WishlistPage() {
  const { user } = useAuth();
  const { wishlist, removeItem, toggleNotification, loading } = useWishlist();
  const { addItem } = useCart();
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);

  useEffect(() => {
    // Map wishlist items to full product data
    const mappedProducts = wishlist
      .map((item) => {
        const product = products.find((p) => p.id === item.product_id);
        return product ? { ...product, wishlistId: item.id, notify: item.notify_on_restock } : null;
      })
      .filter(Boolean);
    
    setWishlistProducts(mappedProducts);
  }, [wishlist]);

  const handleAddToCart = (product: any) => {
    // Add with default size and color
    const sizes = product.sizes || ["M"];
    const colors = product.colors || ["black"];
    
    addItem(product, sizes[0], colors[0]);
    toast.success(`${product.name} agregado al carrito`);
  };

  const handleRemove = async (wishlistId: number, productName: string) => {
    await removeItem(wishlistId);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Inicia sesión para ver tus favoritos
          </h2>
          <p className="text-gray-500 mb-6">
            Guarda tus productos favoritos y recibe notificaciones cuando haya ofertas
          </p>
          <Link to="/">
            <Button>Volver a la tienda</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a la tienda
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis Favoritos</h1>
        <Badge variant="secondary" className="text-base px-4 py-2">
          {wishlistProducts.length} producto(s)
        </Badge>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No tienes favoritos aún
          </h2>
          <p className="text-gray-500 mb-6">
            Agrega productos a tu lista de favoritos para recibir notificaciones de ofertas
          </p>
          <Link to="/">
            <Button>Explorar productos</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistProducts.map((product) => (
            <Card key={product.wishlistId} className="group overflow-hidden">
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold">Agotado</span>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                <p className="text-gray-500 text-sm mb-2 line-clamp-2">
                  {product.description}
                </p>
                <p className="text-xl font-bold text-gray-900 mb-4">
                  ${product.price}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Notificar stock</span>
                  </div>
                  <Switch
                    checked={product.notify}
                    onCheckedChange={(checked) => toggleNotification(product.wishlistId, checked)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    disabled={product.stock === 0}
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Agregar al carrito
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleRemove(product.wishlistId, product.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
