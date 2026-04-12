// =============================================
// WEBHOOK: VEXOR MERCADOPAGO
// Endpoint: /api/webhook
// =============================================

import { createClient } from '@supabase/supabase-js';
import { sendOrderEmails, getMercadoPagoConfirmedEmailTemplate, getOwnerEmailTemplate } from './emailService.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qyvbfwllqsezteecvieb.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Vexor-Signature');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, data, id } = req.body;

    console.log('Webhook recibido:', JSON.stringify({ type, data, id }, null, 2));

    const signature = req.headers['x-vexor-signature'];
    const webhookSecret = process.env.VEXOR_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      console.log('Firma del webhook recibida:', signature);
    }

    switch (type) {
      case 'payment':
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

    return res.status(200).json({ 
      received: true,
      processed: true,
    });

  } catch (error) {
    console.error('Error procesando webhook:', error);
    return res.status(200).json({ 
      received: true,
      processed: false,
      error: error.message,
    });
  }
}

async function handlePaymentSuccess(data) {
  console.log('Procesando pago exitoso:', JSON.stringify(data, null, 2));

  const orderNumber = data.metadata?.order_number || data.order_number;
  
  if (!orderNumber) {
    console.error('No se encontró order_number en los datos del webhook');
    return;
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single();

  if (orderError) {
    console.error('Error buscando pedido:', orderError);
    return;
  }

  if (!order) {
    console.error('Pedido no encontrado:', orderNumber);
    return;
  }

  if (order.payment_status === 'pagado') {
    console.log('El pedido ya estaba marcado como pagado:', orderNumber);
    return;
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({ 
      payment_status: 'pagado',
      updated_at: new Date().toISOString()
    })
    .eq('id', order.id);

  if (updateError) {
    console.error('Error actualizando estado del pedido:', updateError);
    return;
  }

  console.log('Pedido actualizado a PAGADO:', orderNumber);

  const { data: orderItems, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id);

  if (itemsError) {
    console.error('Error buscando items del pedido:', itemsError);
    return;
  }

  let deliveryAddress = null;
  if (order.delivery_address) {
    try {
      deliveryAddress = typeof order.delivery_address === 'string' 
        ? JSON.parse(order.delivery_address) 
        : order.delivery_address;
    } catch (e) {
      deliveryAddress = order.delivery_address;
    }
  }

  const customerData = {
    customerName: order.customer_name,
    customerLastname: order.customer_lastname,
    customerEmail: order.customer_email,
    deliveryType: order.delivery_type,
    deliveryAddress: deliveryAddress,
    paymentMethod: 'mercadopago',
    subtotal: order.subtotal,
    discount: order.discount,
    total: order.total
  };

  await sendOrderEmails(order, orderItems || [], customerData, 'mercadopago');
  console.log('Emails de confirmacion enviados para:', orderNumber);

  // Track product purchases
  if (orderItems && orderItems.length > 0) {
    for (const item of orderItems) {
      try {
        await supabase.rpc('increment_product_purchase', {
          p_product_id: item.product_id,
          p_quantity: item.quantity
        });
        console.log(`Stats actualizadas para producto ${item.product_id}: +${item.quantity} compras`);
      } catch (statsError) {
        console.error('Error actualizando stats del producto:', statsError);
      }
    }
  }
}

async function handlePaymentFailure(data) {
  console.log('Pago fallido:', {
    transactionId: data.transaction_id,
    errorCode: data.error_code,
    errorMessage: data.error_message,
    customerEmail: data.customer_email,
    orderNumber: data.metadata?.order_number || data.order_number
  });
}

async function handlePaymentPending(data) {
  console.log('Pago pendiente:', {
    transactionId: data.transaction_id,
    amount: data.amount,
    provider: data.provider,
    pendingReason: data.pending_reason,
    orderNumber: data.metadata?.order_number || data.order_number
  });
}

async function handleRefundCompleted(data) {
  console.log('Reembolso completado:', {
    transactionId: data.transaction_id,
    refundId: data.refund_id,
    amount: data.amount,
    reason: data.reason,
    orderNumber: data.metadata?.order_number || data.order_number
  });
}
