// =============================================
// API: CREATE ORDER
// Endpoint: /api/create-order
// =============================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase desde variables de entorno
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qyvbfwllqsezteecvieb.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// =============================================
// DATOS BANCARIOS PARA TRANSFERENCIA
// =============================================
const BANK_DETAILS = {
  titular: 'Liliana Mercedes Garcia',
  cbu: '3840200500000036322309',
  alias: 'Nany19.1028',
  banco: 'Ualá Bank S.A.U.'
};

const OWNER_EMAIL = 'rubioloj.93@gmail.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurar CORS
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

    // Validar datos requeridos
    if (!customerName || !customerLastname || !customerEmail || !paymentMethod || !items || items.length === 0) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // 1. Generar número de pedido
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    // Contar pedidos de hoy
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString().split('T')[0]);

    const orderNumber = `ORD-${year}-${month}-${day}-${String((count || 0) + 1).padStart(4, '0')}`;

    // 2. Insertar pedido en la base de datos
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
        payment_status: paymentMethod === 'mercadopago' ? 'pagado' : 'pendiente',
        subtotal: subtotal,
        discount: discount || 0,
        total: total,
        status: 'pendiente'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 3. Insertar items del pedido
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

    // 4. Sincronizar con Google Sheets (DESHABILITADO - opcional)
    // try {
    //   await syncToGoogleSheets(order, orderItems, {...});
    // } catch (sheetError) {
    //   console.error('Error sincronizando con Google Sheets:', sheetError);
    // }

    // 5. Enviar emails (en segundo plano)
    try {
      await sendEmails(order, orderItems, {
        customerName,
        customerLastname,
        customerEmail,
        deliveryType,
        deliveryAddress,
        paymentMethod,
        subtotal,
        discount,
        total
      });
    } catch (emailError) {
      console.error('Error enviando emails:', emailError);
      // No fallar la transacción por esto
    }

    return res.status(200).json({
      success: true,
      orderNumber: orderNumber,
      message: 'Pedido creado correctamente'
    });

  } catch (error) {
    console.error('Error creando pedido:', error);
    return res.status(500).json({ 
      error: 'Error al crear el pedido',
      details: error.message 
    });
  }
}

// =============================================
// FUNCIÓN: SINCRONIZAR CON GOOGLE SHEETS
// =============================================
async function syncToGoogleSheets(order, orderItems, customerData) {
  const { google } = await import('googleapis');
  const { JWT } = await import('google-auth-library');
  
  // Obtener credenciales de variable de entorno
  const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '{}';
  console.log('Raw GOOGLE_SERVICE_ACCOUNT_JSON length:', rawJson.length);
  console.log('Raw JSON starts with:', rawJson.substring(0, 50));
  
  let credentials;
  try {
    credentials = JSON.parse(rawJson);
  } catch (parseError) {
    console.error('Error parsing GOOGLE_SERVICE_ACCOUNT_JSON:', parseError.message);
    console.error('Raw value:', rawJson);
    throw new Error('Invalid JSON in GOOGLE_SERVICE_ACCOUNT_JSON');
  }
  
  if (!credentials.client_email || !credentials.private_key) {
    console.error('Missing required fields in credentials');
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON missing client_email or private_key');
  }
  
  const spreadsheetId = process.env.GOOGLE_SHEET_ID || '1oaVh-zrBDzxaz82H8qkeQ5yGegQCbHcwY3XNZg24qR0';

  const auth = new JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );

  const sheets = google.sheets({ version: 'v4', auth });

  // Preparar datos para la fila del pedido
  const productsList = orderItems.map(item => 
    `${item.product_code} - ${item.product_name} (x${item.quantity})`
  ).join(' | ');

  const address = customerData.deliveryType === 'envio' && customerData.deliveryAddress
    ? `${customerData.deliveryAddress.street} ${customerData.deliveryAddress.height}, ${customerData.deliveryAddress.city}, ${customerData.deliveryAddress.province}`
    : 'Retiro en local';

  const row = [
    order.order_number,
    new Date(order.created_at).toLocaleString('es-AR'),
    `${customerData.customerName} ${customerData.customerLastname}`,
    customerData.customerEmail,
    customerData.deliveryType === 'envio' ? 'Envío a domicilio' : 'Retiro en local',
    address,
    customerData.paymentMethod === 'mercadopago' ? 'MercadoPago' : 'Transferencia',
    customerData.paymentMethod === 'mercadopago' ? 'Pagado' : 'Pendiente',
    customerData.total.toString(),
    'Pendiente',
    productsList
  ];

  // Insertar fila en la hoja "Pedidos" (primera hoja)
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Pedidos!A:K',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] }
  });

  // Actualizar códigos de productos en hoja "Productos" (segunda hoja)
  const productsCodes = orderItems.map(item => [item.product_code, item.product_name]);
  
  // Obtener productos existentes para no duplicar
  const existingProducts = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Productos!A:B'
  });
  
  const existingCodes = (existingProducts.data.values || []).map(r => r[0]);
  const newProducts = productsCodes.filter(p => !existingCodes.includes(p[0]));

  if (newProducts.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Productos!A:B',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: newProducts }
    });
  }
}

// =============================================
// PLANTILLAS HTML PARA EMAILS
// =============================================

// Template para cliente con pago por TRANSFERENCIA
function getTransferEmailTemplate(order, orderItems, customerData) {
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
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">¡Gracias por tu compra!</h1>
              <p style="margin: 10px 0 0 0; color: #ccc; font-size: 16px;">Tu pedido está casi listo</p>
            </td>
          </tr>
          
          <!-- Order Number -->
          <tr>
            <td style="padding: 30px 30px 20px 30px; text-align: center;">
              <div style="display: inline-block; background-color: #e8f5e9; border: 2px solid #4caf50; border-radius: 8px; padding: 15px 30px;">
                <span style="font-size: 14px; color: #666;">Número de pedido</span><br>
                <strong style="font-size: 20px; color: #2e7d32;">${order.order_number}</strong>
              </div>
            </td>
          </tr>
          
          <!-- Products -->
          <tr>
            <td style="padding: 0 30px;">
              <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">📦 Detalle de tu pedido</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                <tr style="background-color: #f9f9f9;">
                  <th style="padding: 12px; text-align: left; color: #666; font-size: 12px;">PRODUCTO</th>
                  <th style="padding: 12px; text-align: center; color: #666; font-size: 12px;">TALLE/COLOR</th>
                  <th style="padding: 12px; text-align: center; color: #666; font-size: 12px;">CANT.</th>
                  <th style="padding: 12px; text-align: right; color: #666; font-size: 12px;">SUBTOTAL</th>
                </tr>
                ${productsHtml}
                <tr>
                  <td colspan="3" style="padding: 15px 12px; text-align: right; font-weight: bold; color: #333;">Total:</td>
                  <td style="padding: 15px 12px; text-align: right; font-weight: bold; color: #2e7d32; font-size: 18px;">$${customerData.total.toLocaleString('es-AR')}</td>
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
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Titular:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #333;">${BANK_DETAILS.titular}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">CBU:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #333; font-family: monospace;">${BANK_DETAILS.cbu}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Alias:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #333;">${BANK_DETAILS.alias}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Banco:</td>
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
                <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">¿Tenés alguna duda?</p>
                <p style="margin: 0; color: #333; font-size: 16px;">
                  📱 WhatsApp: <strong>+54 9 XX XXX XXXX</strong><br>
                  📧 Email: <strong>contacto@theekt.com</strong>
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 25px; text-align: center;">
              <p style="margin: 0; color: #888; font-size: 14px;">TheEkt - Tu tienda de confianza</p>
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

// Template para cliente con pago por MERCADOPAGO
function getMercadoPagoEmailTemplate(order, orderItems, customerData) {
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
                <span style="font-size: 40px;">✓</span>
              </div>
              <h2 style="margin: 0 0 10px 0; color: #2e7d32; font-size: 24px;">¡Gracias por tu compra!</h2>
              <p style="margin: 0; color: #666; font-size: 16px;">Tu pago fue procesado exitosamente. Te informaremos cuando tu pedido esté listo.</p>
            </td>
          </tr>
          
          <!-- Order Number -->
          <tr>
            <td style="padding: 0 30px 20px 30px; text-align: center;">
              <div style="display: inline-block; background-color: #e3f2fd; border: 2px solid #2196f3; border-radius: 8px; padding: 15px 30px;">
                <span style="font-size: 14px; color: #666;">Número de pedido</span><br>
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
                  <th style="padding: 12px; text-align: left; color: #666; font-size: 12px;">PRODUCTO</th>
                  <th style="padding: 12px; text-align: center; color: #666; font-size: 12px;">TALLE/COLOR</th>
                  <th style="padding: 12px; text-align: center; color: #666; font-size: 12px;">CANT.</th>
                  <th style="padding: 12px; text-align: right; color: #666; font-size: 12px;">SUBTOTAL</th>
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
                <p style="margin: 0; color: #666; font-size: 14px;">
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
                <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">¿Tenés alguna duda?</p>
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
function getOwnerEmailTemplate(order, orderItems, customerData) {
  const productsHtml = orderItems.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">${item.product_name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; color: #666;">${item.size} / ${item.color}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; color: #666;">x${item.quantity}</td>
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
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
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
                  <td style="padding: 8px 0; color: #666; width: 100px;">Nombre:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: bold;">${customerData.customerName} ${customerData.customerLastname}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Email:</td>
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
                  <td style="padding: 8px 0; color: #666;">Método:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: bold;">
                    ${customerData.paymentMethod === 'mercadopago' ? 'MercadoPago' : 'Transferencia bancaria'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Estado:</td>
                  <td style="padding: 8px 0;">${paymentStatus}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Subtotal:</td>
                  <td style="padding: 8px 0; color: #333;">$${customerData.subtotal.toLocaleString('es-AR')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Descuento:</td>
                  <td style="padding: 8px 0; color: #ff5722;">-$${customerData.discount.toLocaleString('es-AR')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">TOTAL:</td>
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
                  <th style="padding: 10px; text-align: left; color: #666; font-size: 12px;">PRODUCTO</th>
                  <th style="padding: 10px; text-align: center; color: #666; font-size: 12px;">TALLE/COLOR</th>
                  <th style="padding: 10px; text-align: center; color: #666; font-size: 12px;">CANT.</th>
                  <th style="padding: 10px; text-align: right; color: #666; font-size: 12px;">SUBTOTAL</th>
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
// FUNCIÓN: ENVIAR EMAILS CON NODEMAILER (BREVO)
// =============================================
async function sendEmails(order, orderItems, customerData) {
  const nodemailer = await import('nodemailer');
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'a7162d001@smtp-brevo.com',
      pass: process.env.SMTP_PASS
    }
  });
  
  // Generar templates según el método de pago
  let clientSubject = '';
  let clientHtml = '';
  
  if (customerData.paymentMethod === 'transferencia') {
    clientSubject = `Pedido ${order.order_number} - Datos para Transferencia`;
    clientHtml = getTransferEmailTemplate(order, orderItems, customerData);
  } else {
    clientSubject = `¡Gracias por tu compra en TheEkt! - Pedido ${order.order_number}`;
    clientHtml = getMercadoPagoEmailTemplate(order, orderItems, customerData);
  }
  
  // Template para el owner
  const ownerSubject = `Nuevo pedido: ${order.order_number}`;
  const ownerHtml = getOwnerEmailTemplate(order, orderItems, customerData);

  // Verificar que el email del cliente sea válido
  if (!customerData.customerEmail || !customerData.customerEmail.includes('@')) {
    console.error('Email del cliente inválido:', customerData.customerEmail);
    // Solo enviar al owner si el email del cliente es inválido
    await transporter.sendMail({
      from: 'TheEkt <rubioloj.93@gmail.com>',
      to: OWNER_EMAIL,
      subject: `Nuevo pedido: ${order.order_number} (email cliente inválido)`,
      html: ownerHtml
    });
    console.log('Email enviado solo al owner (email cliente inválido)');
    return;
  }

  // Enviar emails por separado para mejor manejo de errores
  // Email al cliente
  try {
    await transporter.sendMail({
      from: 'TheEkt <rubioloj.93@gmail.com>',
      to: customerData.customerEmail,
      subject: clientSubject,
      html: clientHtml
    });
    console.log('Email enviado al cliente:', customerData.customerEmail);
  } catch (clientError: any) {
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
  } catch (ownerError: any) {
    console.error('Error enviando email al owner:', ownerError.message);
  }
}