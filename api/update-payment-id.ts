// =============================================
// API: UPDATE PAYMENT ID
// Endpoint: /api/update-payment-id
// =============================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qyvbfwllqsezteecvieb.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

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
    const { orderNumber, paymentId } = req.body;

    if (!orderNumber || !paymentId) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const { error } = await supabase
      .from('orders')
      .update({ payment_id: paymentId.toString() })
      .eq('order_number', orderNumber);

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error updating payment_id:', error);
    return res.status(500).json({ error: 'Error al actualizar payment_id' });
  }
}