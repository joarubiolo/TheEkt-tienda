import { Vexor } from "vexor";
import type { VexorPaymentResponse } from "vexor";

// Configuración de Vexor
const projectId = import.meta.env.VITE_VEXOR_PROJECT_ID || "";
const publishableKey = import.meta.env.VITE_VEXOR_PUBLISHABLE_KEY || "";

// Inicializar instancia de Vexor
export const vexor = new Vexor({
  projectId,
  publishableKey,
});

// Tipos de proveedores de pago soportados
export type PaymentProvider = "mercadopago" | "paypal" | "stripe";

// Interfaz para items del carrito
export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
}

// Interfaz para datos de checkout
export interface CheckoutData {
  items: CartItem[];
  shippingCost: number;
  discount: number;
  couponCode?: string;
  shippingMethod: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
}

// Interfaz para respuesta de checkout
export interface CheckoutResponse {
  payment_url: string;
  payment_id?: string;
  provider: PaymentProvider;
}

// Verificar si Vexor está configurado
export function isVexorConfigured(): boolean {
  const hasProjectId = !!projectId;
  const hasPublishableKey = !!publishableKey;
  
  return hasProjectId && hasPublishableKey;
}

// Crear checkout con Vexor
export async function createCheckout(
  checkoutData: CheckoutData,
  provider: PaymentProvider = "mercadopago"
): Promise<CheckoutResponse | null> {
  try {
    if (!isVexorConfigured()) {
      throw new Error("Vexor no está configurado. Verifica las variables de entorno VITE_VEXOR_PROJECT_ID y VITE_VEXOR_PUBLISHABLE_KEY.");
    }

// Mapear items del carrito al formato de Vexor
    const items = checkoutData.items.map((item) => ({
      id: item.id.toString(),
      title: item.name,
      description: `Talla: ${item.size} | Color: ${item.color}`,
      unit_price: item.price,
      quantity: item.quantity,
    }));

    // Crear el pago con Vexor
    const response: VexorPaymentResponse = await vexor.pay.mercadopago({
      items,
    });

    // Intentar obtener payment_id de la respuesta
    const paymentId = (response as any).payment_id || (response as any).id || null;
    
    return {
      payment_url: response.payment_url,
      payment_id: paymentId,
      provider,
    };
} catch (error) {
    console.error("Error al crear checkout:", error.message);
    
    // Re-lanzar el error para que lo maneje el componente
    throw error;
  }
}

// Función para obtener métodos de pago disponibles por proveedor
export function getAvailablePaymentMethods(provider: PaymentProvider) {
  const methods: Record<PaymentProvider, Array<{ id: string; name: string; icon: string; description: string }>> = {
    mercadopago: [
      {
        id: "credit_card",
        name: "Tarjetas de Crédito",
        icon: "credit-card",
        description: "Visa, Mastercard, American Express",
      },
      {
        id: "debit_card",
        name: "Tarjetas de Débito",
        icon: "credit-card",
        description: "Visa Débito, Mastercard Débito",
      },
      {
        id: "mercado_credito",
        name: "Mercado Crédito",
        icon: "wallet",
        description: "Hasta 12 cuotas sin tarjeta",
      },
      {
        id: "efectivo",
        name: "Efectivo",
        icon: "banknote",
        description: "PagoFácil, Rapipago, Provincia NET",
      },
      {
        id: "transferencia",
        name: "Transferencia Bancaria",
        icon: "landmark",
        description: "Transferencia inmediata",
      },
      {
        id: "mercado_pago",
        name: "Mercado Pago",
        icon: "wallet",
        description: "Dinero en cuenta",
      },
    ],
    paypal: [
      {
        id: "paypal",
        name: "PayPal",
        icon: "wallet",
        description: "Pago seguro con PayPal",
      },
      {
        id: "credit_card",
        name: "Tarjetas",
        icon: "credit-card",
        description: "Visa, Mastercard, Amex",
      },
    ],
    stripe: [
      {
        id: "credit_card",
        name: "Tarjetas",
        icon: "credit-card",
        description: "Visa, Mastercard, Amex",
      },
    ],
  };

  return methods[provider] || methods.mercadopago;
}

// Función para obtener información del proveedor
export function getProviderInfo(provider: PaymentProvider) {
  const providers: Record<PaymentProvider, { name: string; color: string; logo: string }> = {
    mercadopago: {
      name: "Mercado Pago",
      color: "#00B1EA",
      logo: "mercadopago",
    },
    paypal: {
      name: "PayPal",
      color: "#003087",
      logo: "paypal",
    },
    stripe: {
      name: "Stripe",
      color: "#635BFF",
      logo: "stripe",
    },
  };

  return providers[provider];
}

// Lista de proveedores disponibles
export function getAvailableProviders(): PaymentProvider[] {
  // Por ahora solo MercadoPago, pero preparado para agregar más
  return ["mercadopago"];
}
