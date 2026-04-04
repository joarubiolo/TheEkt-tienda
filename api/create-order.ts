// =============================================
// API: CREATE ORDER
// Endpoint: /api/create-order
// =============================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { sendOrderEmails } from './emailService.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qyvbfwllqsezteecvieb.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      customerName, 
      customerLastname, 
      customerEmail,
      deliveryType,
      deliveryAddress,
      paymentMethod,
      items,
      subtotal,
      discount,
      total
    } = req.body;

    if (!customerName || !customerLastname || !customerEmail || !paymentMethod || !items || items.length === 0) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString().split('T')[0]);

    const orderNumber = `ORD-${year}-${month}-${day}-${String((count || 0) + 1).padStart(4, '0')}`;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: customerName,
        customer_lastname: customerLastname,
        customer_email: customerEmail,
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'envio' ? deliveryAddress : null,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'mercadopago' ? 'pendiente' : 'pendiente',
        subtotal: subtotal,
        discount: discount || 0,
        total: total,
        status: 'pendiente'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      product_code: `P${String(item.productId).padStart(3, '0')}`,
      product_name: item.name,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      unit_price: item.price,
      subtotal: item.price * item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    if (paymentMethod === 'transferencia') {
      try {
        await sendOrderEmails(order, orderItems, {
          customerName,
          customerLastname,
          customerEmail,
          deliveryType,
          deliveryAddress,
          paymentMethod,
          subtotal,
          discount,
          total
        }, 'transferencia');
      } catch (emailError) {
        console.error('Error enviando emails:', emailError);
      }
    } else {
      console.log('Email de MercadoPago se enviará via webhook cuando se confirme el pago');
    }

    return res.status(200).json({
      success: true,
      orderNumber: orderNumber,
      message: 'Pedido creado correctamente'
    });

  } catch (error: any) {
    console.error('Error creando pedido:', error);
    return res.status(500).json({ 
      error: 'Error al crear el pedido',
      details: error.message 
    });
  }
}
