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
} from "lucide-react";
import { toast } from "sonner";

import {
  isVexorConfigured,
  createCheckout,
  getAvailablePaymentMethods,
  getProviderInfo,
  getAvailableProviders,
  type CheckoutData,
  type PaymentProvider,
} from "../services/vexorService";

export function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCart();
  const [isPending, startTransition] = useTransition();

  // Estados del formulario
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>("mercadopago");
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [customerEmail, setCustomerEmail] = useState("");
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  // Cálculos
  const subtotal = getTotalPrice();
  const shippingCost =
    shippingMethod === "standard" ? 5.99 : shippingMethod === "express" ? 12.99 : 0;
  const discount = subtotal * appliedDiscount;
  const total = subtotal + shippingCost - discount;

  // Verificar configuración
  const vexorConfigured = isVexorConfigured();
  const availableProviders = getAvailableProviders();
  const paymentMethods = getAvailablePaymentMethods(paymentProvider);
  const providerInfo = getProviderInfo(paymentProvider);

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
          shippingCost,
          discount,
          couponCode: appliedDiscount > 0 ? couponCode : undefined,
          shippingMethod,
          customerEmail,
        };

        toast.info("Preparando tu pago...");

        const response = await createCheckout(checkoutData, paymentProvider);

        if (response && response.payment_url) {
          setCheckoutUrl(response.payment_url);
          toast.success("¡Listo! Redirigiendo al pago...");
          // Redirigir después de un breve delay para mostrar el mensaje
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
          console.error("Error stack:", error.stack);
        }
        
        toast.error(`Error: ${errorMessage}`);
      }
    });
  };

  // Renderizar icono según tipo
  const getPaymentIcon = (iconName: string) => {
    switch (iconName) {
      case "credit-card":
        return <CreditCard className="size-5 text-blue-600" />;
      case "wallet":
        return <WalletIcon className="size-5 text-green-600" />;
      case "banknote":
        return <Tag className="size-5 text-orange-600" />;
      case "landmark":
        return <ShieldCheck className="size-5 text-purple-600" />;
      default:
        return <CreditCard className="size-5 text-gray-600" />;
    }
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
                  <p className="text-lg text-gray-900 mt-2">${item.price}</p>

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
                    ${(item.price * item.quantity).toFixed(2)}
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

            {/* Selección de proveedor de pago */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <WalletIcon className="size-5" />
                Proveedor de Pago
              </h2>
              <RadioGroup
                value={paymentProvider}
                onValueChange={(value) => setPaymentProvider(value as PaymentProvider)}
                disabled={!!checkoutUrl}
              >
                {availableProviders.map((provider) => {
                  const info = getProviderInfo(provider);
                  return (
                    <div
                      key={provider}
                      className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors mb-2"
                      style={{
                        borderColor:
                          paymentProvider === provider ? info.color : "#e5e7eb",
                        backgroundColor:
                          paymentProvider === provider ? `${info.color}10` : "transparent",
                      }}
                    >
                      <RadioGroupItem value={provider} id={provider} />
                      <Label
                        htmlFor={provider}
                        className="cursor-pointer flex items-center gap-2 flex-1"
                      >
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: info.color }}
                        />
                        <span className="font-medium">{info.name}</span>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>

              {/* Métodos de pago disponibles */}
              <div className="bg-gray-50 rounded-lg p-3 mt-3">
                <p className="text-xs text-gray-600 mb-2">
                  Métodos de pago disponibles con {providerInfo.name}:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {paymentMethods.slice(0, 4).map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center gap-1 text-xs text-gray-500"
                    >
                      {getPaymentIcon(method.icon)}
                      <span>{method.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Método de envío */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg text-gray-900 mb-4">Método de Envío</h2>
              <RadioGroup
                value={shippingMethod}
                onValueChange={setShippingMethod}
                disabled={!!checkoutUrl}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard" className="cursor-pointer">
                      Envío Estándar (5-7 días)
                    </Label>
                  </div>
                  <span className="text-sm text-gray-600">$5.99</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="express" id="express" />
                    <Label htmlFor="express" className="cursor-pointer">
                      Envío Express (2-3 días)
                    </Label>
                  </div>
                  <span className="text-sm text-gray-600">$12.99</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <Label htmlFor="pickup" className="cursor-pointer">
                      Recoger en tienda
                    </Label>
                  </div>
                  <span className="text-sm text-gray-600">Gratis</span>
                </div>
              </RadioGroup>
            </div>

            {/* Resumen del pedido */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg text-gray-900 mb-4">Resumen del Pedido</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Envío</span>
                  <span className="text-gray-900">
                    {shippingCost === 0 ? "Gratis" : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Descuento</span>
                    <span className="text-green-600">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-lg text-gray-900">Total</span>
                    <span className="text-lg text-gray-900">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Botón de pago */}
              <Button
                onClick={handlePrepareCheckout}
                disabled={isPending || items.length === 0 || !vexorConfigured}
                className="w-full mt-6 text-white disabled:opacity-50"
                style={{
                  backgroundColor: vexorConfigured ? providerInfo.color : "#9ca3af",
                }}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Preparando pago...
                  </>
                ) : (
                  <>
                    <WalletIcon className="w-4 h-4 mr-2" />
                    Pagar con {providerInfo.name}
                  </>
                )}
              </Button>

              {vexorConfigured && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  <ShieldCheck className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    Pago seguro procesado por {providerInfo.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
