// Webhook endpoint para Vexor
// Recibe notificaciones de pagos exitosos y fallidos
// Endpoint: /api/webhook

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Vexor-Signature');

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo aceptar POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, data, id } = req.body;

    // Log para debugging
    console.log('Webhook recibido:', {
      timestamp: new Date().toISOString(),
      type,
      id,
      data,
    });

    // Verificar firma del webhook (si está configurada)
    const signature = req.headers['x-vexor-signature'];
    const webhookSecret = process.env.VEXOR_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      // Aquí iría la validación de firma
      // Por ahora solo logueamos que se recibió
      console.log('Firma del webhook recibida:', signature);
    }

    // Manejar diferentes tipos de eventos
    switch (type) {
      case 'payment.success':
        await handlePaymentSuccess(data);
        break;

      case 'payment.failure':
        await handlePaymentFailure(data);
        break;

      case 'payment.pending':
        await handlePaymentPending(data);
        break;

      case 'refund.completed':
        await handleRefundCompleted(data);
        break;

      default:
        console.log(`Evento no manejado: ${type}`);
    }

    // Siempre responder 200 para confirmar recepción
    return res.status(200).json({ 
      received: true,
      processed: true,
    });

  } catch (error) {
    console.error('Error procesando webhook:', error);
    // Aún así respondemos 200 para evitar reintentos innecesarios
    return res.status(200).json({ 
      received: true,
      processed: false,
      error: error.message,
    });
  }
}

// Manejar pago exitoso
async function handlePaymentSuccess(data) {
  console.log('Pago exitoso:', {
    transactionId: data.transaction_id,
    amount: data.amount,
    currency: data.currency,
    provider: data.provider,
    customerEmail: data.customer_email,
    metadata: data.metadata,
  });

  // TODO: Aquí puedes:
  // 1. Actualizar el estado del pedido en tu base de datos
  // 2. Enviar email de confirmación al cliente
  // 3. Actualizar inventario
  // 4. Crear registro de venta

  // Ejemplo con Firebase/Firestore:
  // await db.collection('orders').doc(data.metadata.order_id).update({
  //   status: 'paid',
  //   transactionId: data.transaction_id,
  //   paidAt: new Date(),
  //   paymentProvider: data.provider,
  // });
}

// Manejar pago fallido
async function handlePaymentFailure(data) {
  console.log('Pago fallido:', {
    transactionId: data.transaction_id,
    errorCode: data.error_code,
    errorMessage: data.error_message,
    customerEmail: data.customer_email,
  });

  // TODO: Aquí puedes:
  // 1. Actualizar el estado del pedido a 'failed'
  // 2. Enviar email al cliente informando del fallo
  // 3. Registrar el error para análisis
}

// Manejar pago pendiente
async function handlePaymentPending(data) {
  console.log('Pago pendiente:', {
    transactionId: data.transaction_id,
    amount: data.amount,
    provider: data.provider,
    pendingReason: data.pending_reason,
  });

  // TODO: Aquí puedes:
  // 1. Actualizar el estado del pedido a 'pending'
  // 2. Programar verificación de estado después
}

// Manejar reembolso completado
async function handleRefundCompleted(data) {
  console.log('Reembolso completado:', {
    transactionId: data.transaction_id,
    refundId: data.refund_id,
    amount: data.amount,
    reason: data.reason,
  });

  // TODO: Aquí puedes:
  // 1. Actualizar el estado del pedido a 'refunded'
  // 2. Enviar email de confirmación de reembolso
  // 3. Actualizar inventario si aplica
}
