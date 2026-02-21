import { useState } from "react";
import { Product } from "../types/product";
import { Button } from "./ui/button";
import { ShoppingCart, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router";
import { WishlistButton } from "./WishlistButton";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const { addItem } = useCart();
  const navigate = useNavigate();

  const handlePurchase = () => {
    if (!selectedSize || !selectedColor) {
      toast.error("Por favor selecciona talla y color");
      return;
    }
    addItem(product, selectedSize, selectedColor);
    toast.success(`${product.name} agregado al carrito`);
    // Resetear selecciones
    setSelectedSize("");
    setSelectedColor("");
  };

  const handleConsultProduct = () => {
    navigate(`/contact?product=${encodeURIComponent(product.name)}`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
      {/* Imagen */}
      <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover hover:scale-105 transition-transform duration-300 ${
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
          <p className="text-sm text-gray-500 mt-1">{product.description}</p>
          <p className="text-xl text-gray-900 mt-2">${product.price}</p>
        </div>

        {/* Talles */}
        <div>
          <label className="text-xs text-gray-600 block mb-2">Talla</label>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => product.inStock && setSelectedSize(size)}
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
        <div>
          <label className="text-xs text-gray-600 block mb-2">Color</label>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((color) => (
              <button
                key={color}
                onClick={() => product.inStock && setSelectedColor(color)}
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
        <div className="mt-auto pt-3">
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