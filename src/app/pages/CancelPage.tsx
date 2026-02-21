import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { XCircle, ShoppingCart, RefreshCcw } from "lucide-react";

export function CancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <XCircle className="w-16 h-16 text-red-500 mx-auto" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Pago Cancelado
        </h1>
        
        <p className="text-gray-600 mb-6">
          El proceso de pago fue cancelado o no se completó. No te preocupes, 
          tu carrito sigue guardado y puedes intentarlo de nuevo cuando quieras.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Nota:</strong> No se realizó ningún cargo a tu tarjeta.
          </p>
        </div>

        <div className="space-y-3">
          <Link to="/cart">
            <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Intentar de Nuevo
            </Button>
          </Link>
          
          <Link to="/">
            <Button variant="outline" className="w-full">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Volver a la Tienda
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          ¿Necesitas ayuda? Contactanos en{" "}
          <a href="mailto:soporte@auroraclothes.com" className="text-blue-600 hover:underline">
            soporte@auroraclothes.com
          </a>
        </p>
      </div>
    </div>
  );
}
