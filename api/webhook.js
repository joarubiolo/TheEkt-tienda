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

    const signature = req.headers['x-vexor-signature'];
    const webhookSecret = process.env.VEXOR_WEBHOOK_SECRET;

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
        break;
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
  // El payment_id viene en data.id
  const paymentId = data.id;
  
  if (!paymentId) {
    console.error('No se encontró payment_id en los datos del webhook');
    return;
  }

  // Buscar por payment_id
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('payment_id', paymentId.toString())
    .single();

  if (orderError && orderError.code !== 'PGRST116') {
    console.error('Error buscando pedido:', orderError);
    return;
  }

  // Si no se encuentra por payment_id, intentar por order_number en metadata
  if (!order && data.metadata?.order_number) {
    const { data: orderByNumber, error: orderByNumberError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', data.metadata.order_number)
      .single();

    if (!orderByNumberError && orderByNumber) {
      // Actualizar payment_id para futuras referencias
      await supabase
        .from('orders')
        .update({ payment_id: paymentId.toString() })
        .eq('id', orderByNumber.id);
      
      order = orderByNumber;
    }
  }

  if (!order) {
    console.error('Pedido no encontrado para payment_id:', paymentId);
    return;
  }

  if (order.payment_status === 'pagado') {
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

  // Track product purchases
  if (orderItems && orderItems.length > 0) {
    for (const item of orderItems) {
      try {
        await supabase.rpc('increment_product_purchase', {
          p_product_id: item.product_id,
          p_quantity: item.quantity
        });
      } catch (statsError) {
        console.error('Error actualizando stats del producto:', statsError);
      }
    }
  }
}

async function handlePaymentFailure(data) {
  // Payment failed - already logged as error by handlePaymentSuccess catch
}

async function handlePaymentPending(data) {
  // Payment pending - log handled elsewhere
}

async function handleRefundCompleted(data) {
  // Refund completed - log handled elsewhere
}
