// =============================================
// API: CONTACTO
// Endpoint: /api/contact
// Envía email desde el formulario de contacto
// =============================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || 'a7162d001@smtp-brevo.com';
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || 'theekt.tienda@gmail.com';
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'theekt.tienda@gmail.com';

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
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

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
                <!-- Header -->
                <tr>
                  <td style="background-color: #1b5e20; padding: 25px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px;">TheEkt - Nuevo Mensaje de Contacto</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 30px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                          <strong style="color: #666;">Nombre:</strong>
                          <p style="margin: 5px 0 0 0; color: #333; font-size: 16px;">${name}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                          <strong style="color: #666;">Email:</strong>
                          <p style="margin: 5px 0 0 0; color: #333; font-size: 16px;">${email}</p>
                        </td>
                      </tr>
                      ${phone ? `
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                          <strong style="color: #666;">Teléfono:</strong>
                          <p style="margin: 5px 0 0 0; color: #333; font-size: 16px;">${phone}</p>
                        </td>
                      </tr>
                      ` : ''}
                      ${subject ? `
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                          <strong style="color: #666;">Asunto:</strong>
                          <p style="margin: 5px 0 0 0; color: #333; font-size: 16px;">${subject}</p>
                        </td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 10px 0;">
                          <strong style="color: #666;">Mensaje:</strong>
                          <p style="margin: 5px 0 0 0; color: #333; font-size: 16px; white-space: pre-wrap;">${message}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
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

    // Send email to owner
await transporter.sendMail({
      from: SMTP_FROM,
      to: OWNER_EMAIL,
      subject: `Nuevo mensaje de contacto: ${subject || 'Sin asunto'} - ${name}`,
      html: htmlContent,
    });

    // Send confirmation email to customer
    const confirmationHtml = `
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
                <!-- Header -->
                <tr>
                  <td style="background-color: #1b5e20; padding: 25px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px;">TheEkt</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 30px; text-align: center;">
                    <h2 style="margin: 0 0 20px 0; color: #333;">¡Gracias por contactarnos!</h2>
                    <p style="margin: 0; color: #666; font-size: 16px; line-height: 1.6;">
                      Hemos recibido tu mensaje. Te responderemos a la brevedad posible.
                    </p>
                    <div style="margin: 30px 0; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
                      <p style="margin: 0; color: #666; font-size: 14px;"><strong>Tu mensaje:</strong></p>
                      <p style="margin: 10px 0 0 0; color: #333; font-size: 14px; white-space: pre-wrap;">${message}</p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
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

await transporter.sendMail({
      from: SMTP_FROM,
      to: email,
      subject: 'Recibimos tu mensaje - TheEkt',
      html: confirmationHtml,
    });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error enviando mensaje de contacto:', error);
    return res.status(500).json({ error: 'Error al enviar el mensaje' });
  }
}