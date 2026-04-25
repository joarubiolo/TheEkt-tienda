// =============================================
// API: STOCK NOTIFICATION
// Endpoint: /api/stock-notification
// Envía email cuando un producto repone stock
// =============================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || 'a7162d001@smtp-brevo.com';
const SMTP_PASS = process.env.SMTP_PASS;

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://qyvbfwllqsezteecvieb.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY || '');

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

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
    const { product_id } = req.body;
    const apiKey = req.headers.authorization?.replace('Bearer ', '');

    if (!product_id) {
      return res.status(400).json({ error: 'Falta product_id' });
    }

    if (!apiKey || apiKey !== process.env.NOTIFICATION_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get pending notifications for this product
    const { data: notifications, error: fetchError } = await supabase
      .from('stock_notifications')
      .select('*')
      .eq('product_id', product_id)
      .eq('status', 'pending');

    if (fetchError) {
      console.error('Error fetching notifications:', fetchError);
      return res.status(500).json({ error: 'Error al consultar notificaciones' });
    }

    if (!notifications || notifications.length === 0) {
      return res.status(200).json({ success: true, message: 'No hay notificaciones pendientes' });
    }

    // Get product info
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('id', product_id)
      .single();

    const productName = products?.name || `Producto #${product_id}`;

    // Send emails and update status
    for (const notification of notifications) {
      const email = notification.notify_email;
      // userId disponible si se necesita: const userId = notification.user_id;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                  <tr>
                    <td style="background-color: #1b5e20; padding: 25px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 24px;">TheEkt - ¡Volvió al Stock!</h1>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 30px; text-align: center;">
                      <h2 style="margin: 0 0 20px 0; color: #333;">${productName}</h2>
                      <p style="margin: 0 0 20px 0; color: #666; font-size: 16px;">
                        ¡Buenas noticias! El producto que esperabas ya volvió a estar disponible.
                      </p>
                      <a href="https://theekt.vercel.app/product/${product_id}" style="display: inline-block; background-color: #1b5e20; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                        Ver Producto
                      </a>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="background-color: #1b5e20; padding: 20px; text-align: center;">
                      <p style="margin: 0; color: #aaa; font-size: 14px;">TheEkt - Tu tienda de confianza</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      try {
        await transporter.sendMail({
          from: `TheEkt <${SMTP_USER}>`,
          to: email,
          subject: '¡Volvió al stock! - TheEkt',
          html: htmlContent,
        });

        // Mark as sent
        await supabase
          .from('stock_notifications')
          .update({ status: 'sent' })
          .eq('id', notification.id);

        console.log(`Notification sent to ${email} for product ${product_id}`);
      } catch (emailError: any) {
        console.error(`Error sending email to ${email}:`, emailError);
      }
    }

    return res.status(200).json({ success: true, sent: notifications.length });
  } catch (error: any) {
    console.error('Error en stock notification:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
}