import { useState, useEffect, useRef } from "react";
import { Product } from "../types/product";
import { Button } from "./ui/button";
import { ShoppingCart, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { WishlistButton } from "./WishlistButton";
import { trackProductView, trackProductCart } from "../services/statsService";

interface ProductCardProps {
  product: Product;
  onOpenModal: (product: Product) => void;
}

export function ProductCard({ product, onOpenModal }: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const { addItem } = useCart();
  const viewedRef = useRef(false);

  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    
    trackProductView(product.id).then(result => {
      console.log(`[Stats] View tracked for product ${product.id}:`, result);
    }).catch(err => {
      console.error(`[Stats] Error tracking view for product ${product.id}:`, err);
    });
  }, [product.id]);

  const handlePurchase = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedSize || !selectedColor) {
      toast.error("Por favor selecciona talla y color");
      return;
    }
    trackProductCart(product.id, true);
    addItem(product, selectedSize, selectedColor);
    toast.success(`${product.name} agregado al carrito`);
    setSelectedSize("");
    setSelectedColor("");
  };

  const handleConsultProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `/contact?product=${encodeURIComponent(product.name)}`;
  };

  const handleSizeClick = (e: React.MouseEvent, size: string) => {
    e.stopPropagation();
    if (product.inStock) {
      setSelectedSize(size);
    }
  };

  const handleColorClick = (e: React.MouseEvent, color: string) => {
    e.stopPropagation();
    if (product.inStock) {
      setSelectedColor(color);
    }
  };

  const handleCardClick = () => {
    onOpenModal(product);
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Imagen */}
      <div className="aspect-[3/4] overflow-hidden bg-white relative flex items-center justify-center">
        <img
          src={product.image}
          alt={product.name}
          className={`max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-300 ${
            !product.inStock ? "opacity-40" : ""
          }`}
        />
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-gray-900 text-white px-6 py-3 text-lg uppercase tracking-wider">
              Agotado
            </span>
          </div>
        )}
        <WishlistButton productId={product.id} />
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        {/* Nombre y Precio */}
        <div>
          <h3 className="text-lg text-gray-900">{product.name}</h3>
          <div className="mt-2">
            <span className="text-xl text-gray-900 font-semibold">${(product.purchasePrice || product.price).toLocaleString('es-AR')}</span>
            <span className="text-sm text-gray-500 ml-2">${product.price.toLocaleString('es-AR')}*</span>
          </div>
        </div>

        {/* Talles */}
        <div onClick={(e) => e.stopPropagation()}>
          <label className="text-xs text-gray-600 block mb-2">Talla</label>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={(e) => handleSizeClick(e, size)}
                disabled={!product.inStock}
                className={`px-3 py-1.5 text-xs border rounded transition-colors ${
                  !product.inStock
                    ? "opacity-50 cursor-not-allowed"
                    : selectedSize === size
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Colores */}
        <div onClick={(e) => e.stopPropagation()}>
          <label className="text-xs text-gray-600 block mb-2">Color</label>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((color) => (
              <button
                key={color}
                onClick={(e) => handleColorClick(e, color)}
                disabled={!product.inStock}
                className={`px-3 py-1.5 text-xs border rounded transition-colors ${
                  !product.inStock
                    ? "opacity-50 cursor-not-allowed"
                    : selectedColor === color
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        {/* Botón Comprar o Consultar */}
        <div className="mt-auto pt-3" onClick={(e) => e.stopPropagation()}>
          {product.inStock ? (
            <Button
              onClick={handlePurchase}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white"
            >
              <ShoppingCart className="size-4 mr-2" />
              Comprar
            </Button>
          ) : (
            <Button
              onClick={handleConsultProduct}
              variant="outline"
              className="w-full border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
            >
              <MessageCircle className="size-4 mr-2" />
              Consultar por esto
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
