import { useState, useTransition } from "react";
import { Link, useNavigate } from "react-router";
import { useCart } from "../context/CartContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  Tag,
  CreditCard,
  Wallet as WalletIcon,
  ShieldCheck,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

import {
  isVexorConfigured,
  createCheckout,
  type CheckoutData,
} from "../services/vexorService";

type PaymentMethod = "mercadopago" | "transferencia";
type DeliveryType = "envio" | "retiro";

export function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCart();
  const [isPending, startTransition] = useTransition();

  // Estados del formulario
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mercadopago");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("retiro");
  const [customerEmail, setCustomerEmail] = useState("");
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  // Estados de dirección
  const [street, setStreet] = useState("");
  const [height, setHeight] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");

  // Cálculos
  const subtotal = getTotalPrice();
  const discount = subtotal * appliedDiscount;
  const total = subtotal - discount;

  // Verificar configuración
  const vexorConfigured = isVexorConfigured();

  // Aplicar cupón
  const handleApplyCoupon = () => {
    const validCoupons: { [key: string]: number } = {
      DESCUENTO10: 0.1,
      DESCUENTO20: 0.2,
      VERANO15: 0.15,
    };

    const upperCoupon = couponCode.toUpperCase();
    if (validCoupons[upperCoupon]) {
      setAppliedDiscount(validCoupons[upperCoupon]);
      toast.success(`Cupón aplicado: ${validCoupons[upperCoupon] * 100}% de descuento`);
    } else {
      toast.error("Cupón inválido");
    }
  };

  // Preparar checkout
  const handlePrepareCheckout = () => {
    if (items.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }

    if (!customerEmail) {
      toast.error("Por favor ingresa tu correo electrónico");
      return;
    }

    // Validar dirección si选择了 envío a domicilio
    if (deliveryType === "envio") {
      if (!street.trim()) {
        toast.error("Por favor ingresa la calle");
        return;
      }
      if (!height.trim()) {
        toast.error("Por favor ingresa la altura");
        return;
      }
      if (!city.trim()) {
        toast.error("Por favor ingresa la ciudad");
        return;
      }
      if (!province.trim()) {
        toast.error("Por favor ingresa la provincia");
        return;
      }
    }

    // Si选择了 transferencia, redirigir directamente a página de éxito
    if (paymentMethod === "transferencia") {
      const orderData = {
        items: items,
        customerEmail,
        paymentMethod: "transferencia",
        deliveryType,
        deliveryAddress: deliveryType === "envio" ? { street, height, city, province } : null,
        subtotal,
        discount,
        total,
      };
      sessionStorage.setItem("orderData", JSON.stringify(orderData));
      clearCart();
      navigate("/success?payment=transferencia");
      return;
    }

    // Si选择了 mercadopago, usar vexorService
    if (!vexorConfigured) {
      toast.error("El sistema de pagos no está configurado");
      return;
    }

    startTransition(async () => {
      try {
        const checkoutData: CheckoutData = {
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            image: item.image,
          })),
          shippingCost: 0,
          discount,
          couponCode: appliedDiscount > 0 ? couponCode : undefined,
          shippingMethod: deliveryType,
          customerEmail,
        };

        toast.info("Preparando tu pago...");

        const response = await createCheckout(checkoutData, "mercadopago");

        if (response && response.payment_url) {
          const orderData = {
            items: items,
            customerEmail,
            paymentMethod: "mercadopago",
            deliveryType,
            deliveryAddress: deliveryType === "envio" ? { street, height, city, province } : null,
            subtotal,
            discount,
            total,
          };
          sessionStorage.setItem("orderData", JSON.stringify(orderData));
          setCheckoutUrl(response.payment_url);
          toast.success("¡Listo! Redirigiendo al pago...");
          setTimeout(() => {
            window.location.href = response.payment_url;
          }, 1500);
        } else {
          toast.error("Error al preparar el pago. Intenta de nuevo.");
        }
      } catch (error) {
        console.error("Error completo:", error);
        
        let errorMessage = "Hubo un error preparando el pago. Intenta de nuevo.";
        
        if (error instanceof Error) {
          errorMessage = error.message;
          console.error("Error message:", error.message);
        }
        
        toast.error(`Error: ${errorMessage}`);
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <Link
        to="/"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="size-4 mr-2" />
        Volver a la tienda
      </Link>

      <h1 className="text-3xl text-gray-900 mb-8">Carrito de Compras</h1>

      {!vexorConfigured && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Modo Demo:</strong> El sistema de pagos no está configurado.
            Para habilitar pagos reales, configura las variables de entorno VEXOR en el archivo{" "}
            <code>.env</code>.
          </p>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Tu carrito está vacío</p>
          <Link to="/">
            <Button>Continuar comprando</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de productos */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-lg p-4 flex gap-4"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-32 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="text-lg text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Talla: {item.size} | Color: {item.color}
                  </p>
                  <p className="text-lg text-gray-900 mt-2">
                    ${(item.purchasePrice || item.price).toLocaleString('es-AR')}
                  </p>

                  {/* Cantidad */}
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={!!checkoutUrl}
                    >
                      <Minus className="size-3" />
                    </Button>
                    <span className="text-sm text-gray-900 w-8 text-center">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={!!checkoutUrl}
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-600"
                    disabled={!!checkoutUrl}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                  <p className="text-lg text-gray-900">
                    ${((item.purchasePrice || item.price) * item.quantity).toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            ))}

            {/* Email del cliente */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg text-gray-900 mb-4">Información de Contacto</h2>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                  disabled={!!checkoutUrl}
                />
                <p className="text-xs text-gray-500">
                  Te enviaremos el comprobante de compra a este correo
                </p>
              </div>
            </div>
          </div>

          {/* Resumen y opciones de pago */}
          <div className="space-y-6">
            {/* Cupón de descuento */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="size-5" />
                Cupón de Descuento
              </h2>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Código de cupón"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1"
                  disabled={!!checkoutUrl}
                />
                <Button onClick={handleApplyCoupon} variant="outline" disabled={!!checkoutUrl}>
                  Aplicar
                </Button>
              </div>
              {appliedDiscount > 0 && (
                <p className="text-sm text-green-600 mt-2">
                  Descuento del {appliedDiscount * 100}% aplicado
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Cupones válidos: DESCUENTO10, DESCUENTO20, VERANO15
              </p>
            </div>

            {/* Método de Pago */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <WalletIcon className="size-5" />
                Método de Pago
              </h2>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                disabled={!!checkoutUrl}
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors mb-2">
                  <RadioGroupItem value="mercadopago" id="mercadopago" />
                  <Label htmlFor="mercadopago" className="cursor-pointer flex-1 font-medium">
                    MercadoPago
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors mb-2">
                  <RadioGroupItem value="transferencia" id="transferencia" />
                  <Label htmlFor="transferencia" className="cursor-pointer flex-1">
                    <span className="font-medium">Transferencia Bancaria</span>
                  </Label>
                </div>
              </RadioGroup>
              {paymentMethod === "transferencia" && (
                <p className="text-xs text-gray-500 mt-2">
                  *al realizar la compra se pasarán los datos bancarios para realizar la transferencia
                </p>
              )}
            </div>

            {/* Forma de Entrega */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg text-gray-900 mb-4">Forma de Entrega</h2>
              <RadioGroup
                value={deliveryType}
                onValueChange={(value) => setDeliveryType(value as DeliveryType)}
                disabled={!!checkoutUrl}
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors mb-2">
                  <RadioGroupItem value="retiro" id="retiro" />
                  <Label htmlFor="retiro" className="cursor-pointer flex-1">
                    <span className="font-medium">Retirar en el local</span>
                  </Label>
                  <span className="text-sm text-green-600 font-medium">Sin costo</span>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="envio" id="envio" />
                  <Label htmlFor="envio" className="cursor-pointer flex-1 font-medium">
                    Envío a domicilio
                  </Label>
                </div>
              </RadioGroup>

              {/* Formulario de dirección si选择了 envío */}
              {deliveryType === "envio" && (
                <div className="mt-4 space-y-3 pl-3 border-l-2 border-gray-200">
                  <div>
                    <Label htmlFor="street" className="text-sm">Calle *</Label>
                    <Input
                      id="street"
                      placeholder="Av. Rivadavia"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      disabled={!!checkoutUrl}
                    />
                  </div>
                  <div>
                    <Label htmlFor="height" className="text-sm">Altura *</Label>
                    <Input
                      id="height"
                      placeholder="1234"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      disabled={!!checkoutUrl}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city" className="text-sm">Ciudad *</Label>
                    <Input
                      id="city"
                      placeholder="Buenos Aires"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      disabled={!!checkoutUrl}
                    />
                  </div>
                  <div>
                    <Label htmlFor="province" className="text-sm">Provincia *</Label>
                    <Input
                      id="province"
                      placeholder="CABA"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      disabled={!!checkoutUrl}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Resumen del pedido */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg text-gray-900 mb-4">Resumen del Pedido</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${subtotal.toLocaleString('es-AR')}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Descuento</span>
                    <span className="text-green-600">-${discount.toLocaleString('es-AR')}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-lg text-gray-900">Total</span>
                    <span className="text-lg text-gray-900">${total.toLocaleString('es-AR')}</span>
                  </div>
                </div>
              </div>

              {/* Botón de pago */}
              <Button
                onClick={handlePrepareCheckout}
                disabled={isPending || items.length === 0}
                className="w-full mt-6 text-white disabled:opacity-50"
                style={{ backgroundColor: "#9ca3af" }}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <WalletIcon className="w-4 h-4 mr-2" />
                    {paymentMethod === "transferencia" 
                      ? "Confirmar Compra" 
                      : `Pagar con MercadoPago`}
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 mt-3">
                <ShieldCheck className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {paymentMethod === "transferencia" 
                    ? "Te enviaremos los datos para transferir" 
                    : "Pago seguro con MercadoPago"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}