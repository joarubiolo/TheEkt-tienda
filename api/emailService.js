// =============================================
// FUNCIONES COMPARTIDAS PARA ENVÍO DE EMAILS
// Usado por: api/create-order.ts y api/webhook.js
// =============================================

import nodemailer from 'nodemailer';

// =============================================
// DATOS BANCARIOS PARA TRANSFERENCIA
// =============================================
export const BANK_DETAILS = {
  titular: 'Liliana Mercedes Garcia',
  cbu: '3840200500000036322309',
  alias: 'Nany19.1028',
  banco: 'Ualá Bank S.A.U.'
};

export const OWNER_EMAIL = 'rubioloj.93@gmail.com';

// =============================================
// CONFIGURACIÓN DE TRANSPORTE SMTP
// =============================================
export function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'a7162d001@smtp-brevo.com',
      pass: process.env.SMTP_PASS
    }
  });
}

// =============================================
// PLANTILLAS HTML PARA EMAILS
// =============================================

// Template para cliente con pago por TRANSFERENCIA
export function getTransferEmailTemplate(order, orderItems, customerData) {
  const productsHtml = orderItems.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.product_name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.size} / ${item.color}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">x${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${item.subtotal.toLocaleString('es-AR')}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #4caf50; font-size: 28px; font-weight: 600;">¡Gracias por tu compra!</h1>
              <p style="margin: 10px 0 0 0; color: #81c784; font-size: 16px;">Tu pedido está casi listo</p>
            </td>
          </tr>
          
          <!-- Order Number -->
          <tr>
            <td style="padding: 30px 30px 20px 30px; text-align: center;">
              <div style="display: inline-block; background-color: #e8f5e9; border: 2px solid #4caf50; border-radius: 8px; padding: 15px 30px;">
                <span style="font-size: 14px; color: #333;">Número de pedido</span><br>
                <strong style="font-size: 20px; color: #1b5e20;">${order.order_number}</strong>
              </div>
            </td>
          </tr>
          
          <!-- Products -->
          <tr>
            <td style="padding: 0 30px;">
              <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">📦 Detalle de tu pedido</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                <tr style="background-color: #f9f9f9;">
                  <th style="padding: 12px; text-align: left; color: #333; font-size: 12px;">PRODUCTO</th>
                  <th style="padding: 12px; text-align: center; color: #333; font-size: 12px;">TALLE/COLOR</th>
                  <th style="padding: 12px; text-align: center; color: #333; font-size: 12px;">CANT.</th>
                  <th style="padding: 12px; text-align: right; color: #333; font-size: 12px;">SUBTOTAL</th>
                </tr>
                ${productsHtml}
                <tr>
                  <td colspan="3" style="padding: 15px 12px; text-align: right; font-weight: bold; color: #333;">Total:</td>
                  <td style="padding: 15px 12px; text-align: right; font-weight: bold; color: #1b5e20; font-size: 18px;">$${customerData.total.toLocaleString('es-AR')}</td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Bank Details -->
          <tr>
            <td style="padding: 30px;">
              <div style="background: linear-gradient(135deg, #fff3e0 0%, #fff8e1 100%); border: 2px solid #ff9800; border-radius: 12px; padding: 25px;">
                <h3 style="margin: 0 0 15px 0; color: #e65100; font-size: 18px;">💳 Datos para realizar la transferencia</h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; color: #333; font-size: 14px;">Titular:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #333;">${BANK_DETAILS.titular}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #333; font-size: 14px;">CBU:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #333; font-family: monospace;">${BANK_DETAILS.cbu}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #333; font-size: 14px;">Alias:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #333;">${BANK_DETAILS.alias}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #333; font-size: 14px;">Banco:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #333;">${BANK_DETAILS.banco}</td>
                  </tr>
                </table>
                <p style="margin: 15px 0 0 0; padding: 12px; background-color: #fff; border-radius: 6px; color: #e65100; font-size: 14px;">
                  ⚠️ <strong>Importante:</strong> Una vez realizada la transferencia, por favor contactanos para confirmar tu pedido.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Contact -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background-color: #f5f5f5; border-radius: 8px; padding: 20px; text-align: center;">
                <p style="margin: 0 0 10px 0; color: #333; font-size: 14px;">¿Tenés alguna duda?</p>
                <p style="margin: 0; color: #333; font-size: 16px;">
                  📱 WhatsApp: <strong>+54 9 XX XXX XXXX</strong><br>
                  📧 Email: <strong>contacto@theekt.com</strong>
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1b5e20; padding: 25px; text-align: center;">
              <p style="margin: 0; color: #aaa; font-size: 14px;">TheEkt - Tu tienda de confianza</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Template para cliente con pago por MERCADOPAGO (confirmación de pago)
export function getMercadoPagoConfirmedEmailTemplate(order, orderItems, customerData) {
  const productsHtml = orderItems.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.product_name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.size} / ${item.color}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">x${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${item.subtotal.toLocaleString('es-AR')}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #00B1EA 0%, #0099D6 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">¡Pago confirmado!</h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Tu pedido está siendo procesado</p>
            </td>
          </tr>
          
          <!-- Success Message -->
          <tr>
            <td style="padding: 30px; text-align: center;">
              <div style="display: inline-block; background-color: #e8f5e9; border-radius: 50%; width: 80px; height: 80px; line-height: 80px; margin-bottom: 20px;">
                <span style="font-size: 40px; color: #4caf50;">✓</span>
              </div>
              <h2 style="margin: 0 0 10px 0; color: #2e7d32; font-size: 24px;">¡Gracias por tu compra!</h2>
              <p style="margin: 0; color: #333; font-size: 16px;">Tu pago fue procesado exitosamente. Te informaremos cuando tu pedido esté listo.</p>
            </td>
          </tr>
          
          <!-- Order Number -->
          <tr>
            <td style="padding: 0 30px 20px 30px; text-align: center;">
              <div style="display: inline-block; background-color: #e3f2fd; border: 2px solid #2196f3; border-radius: 8px; padding: 15px 30px;">
                <span style="font-size: 14px; color: #333;">Número de pedido</span><br>
                <strong style="font-size: 20px; color: #1565c0;">${order.order_number}</strong>
              </div>
            </td>
          </tr>
          
          <!-- Products -->
          <tr>
            <td style="padding: 0 30px;">
              <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">📦 Detalle de tu pedido</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                <tr style="background-color: #f9f9f9;">
                  <th style="padding: 12px; text-align: left; color: #333; font-size: 12px;">PRODUCTO</th>
                  <th style="padding: 12px; text-align: center; color: #333; font-size: 12px;">TALLE/COLOR</th>
                  <th style="padding: 12px; text-align: center; color: #333; font-size: 12px;">CANT.</th>
                  <th style="padding: 12px; text-align: right; color: #333; font-size: 12px;">SUBTOTAL</th>
                </tr>
                ${productsHtml}
                <tr>
                  <td colspan="3" style="padding: 15px 12px; text-align: right; font-weight: bold; color: #333;">Total:</td>
                  <td style="padding: 15px 12px; text-align: right; font-weight: bold; color: #1565c0; font-size: 18px;">$${customerData.total.toLocaleString('es-AR')}</td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Delivery Info -->
          <tr>
            <td style="padding: 30px;">
              <div style="background-color: #f5f5f5; border-radius: 8px; padding: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">🚚 Información de entrega</h3>
                <p style="margin: 0; color: #333; font-size: 14px;">
                  ${customerData.deliveryType === 'envio' 
                    ? `Envío a domicilio: ${customerData.deliveryAddress.street} ${customerData.deliveryAddress.height}, ${customerData.deliveryAddress.city}, ${customerData.deliveryAddress.province}`
                    : 'Retiro en local'}
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Contact -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background-color: #e3f2fd; border-radius: 8px; padding: 20px; text-align: center;">
                <p style="margin: 0 0 10px 0; color: #333; font-size: 14px;">¿Tenés alguna duda?</p>
                <p style="margin: 0; color: #333; font-size: 16px;">
                  📱 WhatsApp: <strong>+54 9 XX XXX XXXX</strong><br>
                  📧 Email: <strong>contacto@theekt.com</strong>
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #00B1EA; padding: 25px; text-align: center;">
              <p style="margin: 0; color: #ffffff; font-size: 14px;">TheEkt - Tu tienda de confianza</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Template para el VENDEDOR
export function getOwnerEmailTemplate(order, orderItems, customerData) {
  const productsHtml = orderItems.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">${item.product_name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; color: #555;">${item.size} / ${item.color}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; color: #555;">x${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; color: #333;">$${item.subtotal.toLocaleString('es-AR')}</td>
    </tr>
  `).join('');

  const paymentStatus = customerData.paymentMethod === 'mercadopago' ? 
    '<span style="background-color: #4caf50; color: white; padding: 4px 12px; border-radius: 4px; font-weight: bold;">PAGADO</span>' :
    '<span style="background-color: #ff9800; color: white; padding: 4px 12px; border-radius: 4px; font-weight: bold;">PENDIENTE</span>';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">🔔 Nuevo pedido recibido</h1>
            </td>
          </tr>
          
          <!-- Order Info -->
          <tr>
            <td style="padding: 25px 30px; text-align: center; background-color: #fff3e0;">
              <h2 style="margin: 0 0 5px 0; color: #333; font-size: 14px;">NÚMERO DE PEDIDO</h2>
              <p style="margin: 0; font-size: 28px; font-weight: bold; color: #d32f2f;">${order.order_number}</p>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #333;">
                ${new Date(order.created_at).toLocaleString('es-AR', { dateStyle: 'full', timeStyle: 'short' })}
              </p>
            </td>
          </tr>
          
          <!-- Customer Info -->
          <tr>
            <td style="padding: 25px 30px;">
              <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px; border-bottom: 2px solid #d32f2f; padding-bottom: 10px;">👤 Datos del cliente</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0; color: #333; width: 100px;">Nombre:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: bold;">${customerData.customerName} ${customerData.customerLastname}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #333;">Email:</td>
                  <td style="padding: 8px 0; color: #1565c0;"><a href="mailto:${customerData.customerEmail}" style="color: #1565c0;">${customerData.customerEmail}</a></td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Payment Info -->
          <tr>
            <td style="padding: 0 30px 25px 30px;">
              <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px; border-bottom: 2px solid #d32f2f; padding-bottom: 10px;">💳 Información de pago</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0; color: #333;">Método:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: bold;">
                    ${customerData.paymentMethod === 'mercadopago' ? 'MercadoPago' : 'Transferencia bancaria'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #333;">Estado:</td>
                  <td style="padding: 8px 0;">${paymentStatus}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #333;">Subtotal:</td>
                  <td style="padding: 8px 0; color: #333;">$${customerData.subtotal.toLocaleString('es-AR')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #333;">Descuento:</td>
                  <td style="padding: 8px 0; color: #ff5722;">-$${customerData.discount.toLocaleString('es-AR')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #333; font-weight: bold;">TOTAL:</td>
                  <td style="padding: 8px 0; color: #2e7d32; font-weight: bold; font-size: 18px;">$${customerData.total.toLocaleString('es-AR')}</td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Delivery Info -->
          <tr>
            <td style="padding: 0 30px 25px 30px;">
              <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px; border-bottom: 2px solid #d32f2f; padding-bottom: 10px;">🚚 Entrega</h3>
              <p style="margin: 0; color: #333;">
                <strong>${customerData.deliveryType === 'envio' ? 'Envío a domicilio' : 'Retiro en local'}</strong>
                ${customerData.deliveryType === 'envio' ? 
                  `<br>${customerData.deliveryAddress.street} ${customerData.deliveryAddress.height}, ${customerData.deliveryAddress.city}, ${customerData.deliveryAddress.province}` : 
                  ''}
              </p>
            </td>
          </tr>
          
          <!-- Products -->
          <tr>
            <td style="padding: 0 30px 25px 30px;">
              <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px; border-bottom: 2px solid #d32f2f; padding-bottom: 10px;">📦 Productos</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 10px; text-align: left; color: #333; font-size: 12px;">PRODUCTO</th>
                  <th style="padding: 10px; text-align: center; color: #333; font-size: 12px;">TALLE/COLOR</th>
                  <th style="padding: 10px; text-align: center; color: #333; font-size: 12px;">CANT.</th>
                  <th style="padding: 10px; text-align: right; color: #333; font-size: 12px;">SUBTOTAL</th>
                </tr>
                ${productsHtml}
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #333; padding: 20px; text-align: center;">
              <p style="margin: 0; color: #888; font-size: 12px;">TheEkt - Sistema de Pedidos Automático</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// =============================================
// FUNCIÓN PRINCIPAL PARA ENVIAR EMAILS
// =============================================
export async function sendOrderEmails(order, orderItems, customerData, emailType = 'transferencia') {
  const transporter = createTransporter();
  
  let clientSubject = '';
  let clientHtml = '';
  
  if (emailType === 'mercadopago') {
    clientSubject = `¡Gracias por tu compra en TheEkt! - Pedido ${order.order_number}`;
    clientHtml = getMercadoPagoConfirmedEmailTemplate(order, orderItems, customerData);
  } else {
    clientSubject = `Pedido ${order.order_number} - Datos para Transferencia`;
    clientHtml = getTransferEmailTemplate(order, orderItems, customerData);
  }
  
  const ownerSubject = `Nuevo pedido: ${order.order_number} - ${emailType === 'mercadopago' ? 'PAGADO' : 'PENDIENTE'}`;
  const ownerHtml = getOwnerEmailTemplate(order, orderItems, customerData);

  // Verificar que el email del cliente sea válido
  if (!customerData.customerEmail || !customerData.customerEmail.includes('@')) {
    console.error('Email del cliente inválido:', customerData.customerEmail);
    await transporter.sendMail({
      from: 'TheEkt <rubioloj.93@gmail.com>',
      to: OWNER_EMAIL,
      subject: `Nuevo pedido: ${order.order_number} (email cliente inválido)`,
      html: ownerHtml
    });
    console.log('Email enviado solo al owner (email cliente inválido)');
    return;
  }

  // Email al cliente
  try {
    await transporter.sendMail({
      from: 'TheEkt <rubioloj.93@gmail.com>',
      to: customerData.customerEmail,
      subject: clientSubject,
      html: clientHtml
    });
    console.log('Email enviado al cliente:', customerData.customerEmail);
  } catch (clientError) {
    console.error('Error enviando email al cliente:', clientError.message);
  }

  // Email al owner
  try {
    await transporter.sendMail({
      from: 'TheEkt <rubioloj.93@gmail.com>',
      to: OWNER_EMAIL,
      subject: ownerSubject,
      html: ownerHtml
    });
    console.log('Email enviado al owner:', OWNER_EMAIL);
  } catch (ownerError) {
    console.error('Error enviando email al owner:', ownerError.message);
  }
}
