
import { useState, useEffect } from "react";
import { Product } from "../types/product";
import { Button } from "./ui/button";
import { ShoppingCart, MessageCircle, X, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { WishlistButton } from "./WishlistButton";
import { useImageBorderColor } from "../hooks/useImageBorderColor";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addItem } = useCart();
  const borderColor = useImageBorderColor(images[currentImageIndex]);

  // 🔒 Evita errores si el producto es null o el modal está cerrado
  if (!isOpen || !product) return null;

  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    setSelectedSize("");
    setSelectedColor("");
    setCurrentImageIndex(0);
  }, [product]);

  const handlePurchase = () => {
    if (!selectedSize || !selectedColor) {
      toast.error("Por favor selecciona talla y color");
      return;
    }
    addItem(product, selectedSize, selectedColor);
    toast.success(`${product.name} agregado al carrito`);
  };

  const handleConsultProduct = () => {
    window.location.href = `/contact?product=${encodeURIComponent(product.name)}`;
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const nextImage = () => {
    if (images.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (images.length === 0) return;
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white rounded-lg w-[60%] max-h-[90vh] overflow-hidden flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botones X y Corazón */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <WishlistButton productId={product.id} className="static bg-white/80 hover:bg-white" />
          <button
            onClick={onClose}
            className="bg-white/80 hover:bg-gray-100 rounded-full p-1 transition-colors"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row overflow-hidden">
          {/* Galería de imágenes */}
          <div className="w-full md:w-1/2 relative flex items-center justify-center" style={{ backgroundColor: borderColor }}>
            <div className="aspect-[3/4] relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: borderColor }}>
              <img
                src={images[currentImageIndex]}
                alt={product.name}
                className="max-w-full max-h-full object-contain"
              />
              
              {/* Navegación del carrusel */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>

                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? "bg-gray-800" : "bg-white/60"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Información producto */}
          <div className="w-full md:w-1/2 p-6 overflow-y-auto max-h-[90vh]">
            <div className="space-y-4">
              {/* Título y precio */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{product.name}</h2>
                <p className="text-2xl font-bold text-gray-900 mt-2">${product.price.toLocaleString('es-AR')}</p>
              </div>

              {/* Descripción */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </h3>
                <p className="text-sm text-gray-600">{product.description}</p>
              </div>

              {/* Talles */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Talla</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => product.inStock && setSelectedSize(size)}
                      disabled={!product.inStock}
                      className={`px-4 py-2 text-sm border rounded transition-colors ${
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
                <h3 className="text-sm font-medium text-gray-700 mb-2">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => product.inStock && setSelectedColor(color)}
                      disabled={!product.inStock}
                      className={`px-4 py-2 text-sm border rounded transition-colors ${
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

              {/* Botón compra */}
              <div className="pt-2">
                {product.inStock ? (
                  <Button
                    onClick={handlePurchase}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white h-12 text-lg"
                  >
                    <ShoppingCart className="size-5 mr-2" />
                    Comprar
                  </Button>
                ) : (
                  <Button
                    onClick={handleConsultProduct}
                    variant="outline"
                    className="w-full border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white h-12 text-lg"
                  >
                    <MessageCircle className="size-5 mr-2" />
                    Consultar por esto
                  </Button>
                )}
              </div>

              {/* Opiniones */}
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Opiniones
                </h3>

                {product.reviews && product.reviews.length > 0 ? (
                  <div className="space-y-3">
                    {product.reviews.map((review, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-800">
                            {review.user}
                          </span>
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-sm text-gray-600">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    Aún no hay valoraciones
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
