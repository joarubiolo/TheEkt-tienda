import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { Button } from "../components/ui/button";
import { CheckCircle, ShoppingBag, Copy, Check, Building2 } from "lucide-react";
import { toast } from "sonner";

interface OrderData {
  items: any[];
  customerEmail: string;
  paymentMethod: string;
  deliveryType: string;
  deliveryAddress: { street: string; height: string; city: string; province: string } | null;
  subtotal: number;
  discount: number;
  total: number;
}

export function SuccessPage() {
  const [searchParams] = useSearchParams();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const paymentMethod = searchParams.get("payment");
  const isTransferencia = paymentMethod === "transferencia";

  useEffect(() => {
    // Retrieve order data from sessionStorage
    const storedData = sessionStorage.getItem("orderData");
    if (storedData) {
      setOrderData(JSON.parse(storedData));
    }
    
    // Get order number
    const storedOrderNumber = sessionStorage.getItem("orderNumber");
    if (storedOrderNumber) {
      setOrderNumber(storedOrderNumber);
    }
  }, []);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success("Copiado al portapapeles");
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error("Error al copiar");
    }
  };

  const bankDetails = {
    titular: "Liliana Mercedes Garcia",
    cbu: "3840200500000036322309",
    alias: "Nany19.1028",
    banco: "Ualá Bank S.A.U.",
  };

  const orderNumber = Math.random().toString(36).substr(2, 9).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isTransferencia ? "¡Pedido Confirmado!" : "¡Pago Exitoso!"}
        </h1>
        
        {isTransferencia ? (
          <p className="text-gray-600 mb-6">
            Tu pedido ha sido confirmado. Realizá la transferencia usando los datos bancarios que aparecen más abajo.
          </p>
        ) : (
          <p className="text-gray-600 mb-6">
            Tu compra ha sido procesada correctamente. Recibirás un correo electrónico 
            con los detalles de tu pedido y el comprobante de pago.
          </p>
        )}

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-800">
            <strong>Número de pedido:</strong> #{orderNumber}
          </p>
          <p className="text-sm text-green-800 mt-1">
            <strong>Estado:</strong> {isTransferencia ? "Esperando transferencia" : "Pagado y en preparación"}
          </p>
        </div>

        {/* Mostrar datos bancarios si es transferencia */}
        {isTransferencia && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Datos para Transferencia</h2>
            </div>
            
            <div className="space-y-4 text-left">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Titular:</span>
                <span className="font-medium text-gray-900">{bankDetails.titular}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">CBU:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 font-mono">{bankDetails.cbu}</span>
                  <button
                    onClick={() => handleCopy(bankDetails.cbu, "cbu")}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Copiar CBU"
                  >
                    {copiedField === "cbu" ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Alias:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 font-mono">{bankDetails.alias}</span>
                  <button
                    onClick={() => handleCopy(bankDetails.alias, "alias")}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Copiar Alias"
                  >
                    {copiedField === "alias" ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Banco:</span>
                <span className="font-medium text-gray-900">{bankDetails.banco}</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Una vez realizada la transferencia, recibirás un correo confirmando tu pedido.
            </p>
          </div>
        )}

        {/* Mostrar dirección de entrega si eligió envío */}
        {orderData?.deliveryType === "envio" && orderData?.deliveryAddress && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Dirección de envío:</h3>
            <p className="text-sm text-gray-600">
              {orderData.deliveryAddress.street} {orderData.deliveryAddress.height}, {orderData.deliveryAddress.city}, {orderData.deliveryAddress.province}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Link to="/">
            <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Seguir Comprando
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Si tienes dudas o consultas <Link to="/contact" className="text-blue-600 hover:underline">contactanos</Link>
        </p>
      </div>
    </div>
  );
}