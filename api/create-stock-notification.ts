// =============================================
// API: CREATE STOCK NOTIFICATION
// Endpoint: /api/create-stock-notification
// Crea una notificación de stock cuando el usuario activa el checkbox
// =============================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qyvbfwllqsezteecvieb.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

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
    const { user_id, product_id, notify_email } = req.body;

    if (!user_id || !product_id || !notify_email) {
      return res.status(400).json({ error: 'Faltan datos requeridos: user_id, product_id, notify_email' });
    }

    // Verificar si ya existe una notificación pendiente para este usuario y producto
    const { data: existing } = await supabase
      .from('stock_notifications')
      .select('id')
      .eq('user_id', user_id)
      .eq('product_id', product_id)
      .eq('status', 'pending')
      .maybeSingle();

    if (existing) {
      return res.status(200).json({ 
        success: true, 
        message: 'Ya existe una notificación pendiente para este producto',
        alreadyExists: true
      });
    }

    // Crear la notificación
    const { data: notification, error: insertError } = await supabase
      .from('stock_notifications')
      .insert({
        user_id: user_id,
        product_id: product_id,
        notify_email: notify_email,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) throw insertError;

    console.log(`Stock notification created for user ${user_id}, product ${product_id}, email ${notify_email}`);

    return res.status(200).json({
      success: true,
      notificationId: notification.id,
      message: 'Notificación de stock creada'
    });

  } catch (error: any) {
    console.error('Error creando stock notification:', error);
    return res.status(500).json({ 
      error: 'Error al crear la notificación',
      details: error.message 
    });
  }
}