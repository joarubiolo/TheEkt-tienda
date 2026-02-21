import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { CheckCircle, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useEffect } from "react";

export function SuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    // Limpiar el carrito cuando se carga la página de éxito
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          ¡Pago Exitoso!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Tu compra ha sido procesada correctamente. Recibirás un correo electrónico 
          con los detalles de tu pedido y el comprobante de pago.
        </p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-800">
            <strong>Número de pedido:</strong> #{Math.random().toString(36).substr(2, 9).toUpperCase()}
          </p>
          <p className="text-sm text-green-800 mt-1">
            <strong>Estado:</strong> Pagado y en preparación
          </p>
        </div>

        <div className="space-y-3">
          <Link to="/">
            <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Seguir Comprando
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          ¿Tienes alguna pregunta? Contactanos en{" "}
          <a href="mailto:soporte@auroraclothes.com" className="text-blue-600 hover:underline">
            soporte@auroraclothes.com
          </a>
        </p>
      </div>
    </div>
  );
}
