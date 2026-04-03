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
// FUNCIÓN: ENVIAR EMAILS CON RESEND
// =============================================
async function sendEmails(order, orderItems, customerData) {
  const { Resend } = await import('resend');
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  const productsList = orderItems.map(item => 
    `- ${item.product_name} (Talle: ${item.size}, Color: ${item.color}) x${item.quantity} - $${item.subtotal.toLocaleString('es-AR')}`
  ).join('\n');

  // Email al cliente
  let clientSubject = '';
  let clientHtml = '';

  if (customerData.paymentMethod === 'transferencia') {
    clientSubject = `Pedido ${order.order_number} - Datos para Transferencia`;
    clientHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
    .order-number { background: #e8f5e9; border: 1px solid #4caf50; padding: 12px; border-radius: 6px; margin: 15px 0; }
    .bank-details { background: #fff3e0; border: 1px solid #ff9800; padding: 15px; border-radius: 6px; margin: 15px 0; }
    .bank-details pre { background: #fff; padding: 10px; border-radius: 4px; font-family: monospace; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 ¡Gracias por tu compra en TheEkt!</h1>
  </div>
  <div class="content">
    <div class="order-number">
      <strong>Número de pedido:</strong> ${order.order_number}
    </div>
    
    <h3>Detalle del pedido:</h3>
    <pre>${productsList}</pre>
    
    <p><strong>Total:</strong> $${customerData.total.toLocaleString('es-AR')}</p>
    
    <div class="bank-details">
      <h3>💳 Datos para realizar la transferencia:</h3>
      <pre>
Titular: ${BANK_DETAILS.titular}
CBU: ${BANK_DETAILS.cbu}
Alias: ${BANK_DETAILS.alias}
Banco: ${BANK_DETAILS.banco}
      </pre>
      <p>Una vez realizada la transferencia, por favor contactanos para confirmar.</p>
    </div>
    
    <p>Saludos,<br>TheEkt</p>
  </div>
  <div class="footer">
    <p>TheEkt - Tu tienda de confianza</p>
  </div>
</body>
</html>
    `.trim();
  } else {
    clientSubject = `¡Gracias por tu compra en TheEkt! - Pedido ${order.order_number}`;
    clientHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
    .order-number { background: #e8f5e9; border: 1px solid #4caf50; padding: 12px; border-radius: 6px; margin: 15px 0; }
    .success { color: #4caf50; font-size: 18px; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 ¡Gracias por tu compra en TheEkt!</h1>
  </div>
  <div class="content">
    <p class="success">✅ Tu pago ha sido procesado exitosamente.</p>
    
    <div class="order-number">
      <strong>Número de pedido:</strong> ${order.order_number}
    </div>
    
    <h3>Detalle del pedido:</h3>
    <pre>${productsList}</pre>
    
    <p><strong>Total:</strong> $${customerData.total.toLocaleString('es-AR')}</p>
    
    <p>Te informaremos cuando tu pedido esté listo para retirar/enviar.</p>
    
    <p>Saludos,<br>TheEkt</p>
  </div>
  <div class="footer">
    <p>TheEkt - Tu tienda de confianza</p>
  </div>
</body>
</html>
    `.trim();
  }

  // Email a vos (el owner)
  const ownerHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #d32f2f; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
    .order-number { background: #ffebee; border: 1px solid #f44336; padding: 12px; border-radius: 6px; margin: 15px 0; }
    .details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
    pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔔 Nuevo pedido recibido</h1>
  </div>
  <div class="content">
    <div class="order-number">
      <strong>Número de pedido:</strong> ${order.order_number}
    </div>
    
    <div class="details">
      <h3>👤 Cliente:</h3>
      <p><strong>Nombre:</strong> ${customerData.customerName} ${customerData.customerLastname}</p>
      <p><strong>Email:</strong> ${customerData.customerEmail}</p>
    </div>
    
    <div class="details">
      <h3>🚚 Entrega:</h3>
      <p><strong>Tipo:</strong> ${customerData.deliveryType === 'envio' ? 'Envío a domicilio' : 'Retiro en local'}</p>
      ${customerData.deliveryType === 'envio' ? `<p><strong>Dirección:</strong> ${customerData.deliveryAddress.street} ${customerData.deliveryAddress.height}, ${customerData.deliveryAddress.city}, ${customerData.deliveryAddress.province}</p>` : ''}
    </div>
    
    <div class="details">
      <h3>💳 Pago:</h3>
      <p><strong>Método:</strong> ${customerData.paymentMethod === 'mercadopago' ? 'MercadoPago' : 'Transferencia'}</p>
      <p><strong>Estado:</strong> ${customerData.paymentMethod === 'mercadopago' ? 'Pagado' : 'Pendiente'}</p>
      <p><strong>Subtotal:</strong> $${customerData.subtotal.toLocaleString('es-AR')}</p>
      <p><strong>Descuento:</strong> $${customerData.discount.toLocaleString('es-AR')}</p>
      <p><strong>Total:</strong> $${customerData.total.toLocaleString('es-AR')}</p>
    </div>
    
    <div class="details">
      <h3>📦 Productos:</h3>
      <pre>${productsList}</pre>
    </div>
  </div>
  <div class="footer">
    <p>TheEkt - Sistema de Pedidos Automático</p>
  </div>
</body>
</html>
  `.trim();

  // Verificar que el email del cliente sea válido
  if (!customerData.customerEmail || !customerData.customerEmail.includes('@')) {
    console.error('Email del cliente inválido:', customerData.customerEmail);
    // Solo enviar al owner si el email del cliente es inválido
    const ownerResult = await resend.emails.send({
      from: 'TheEkt <onboarding@resend.dev>',
      to: OWNER_EMAIL,
      subject: `Nuevo pedido: ${order.order_number} (email cliente inválido)`,
      html: ownerHtml
    });
    console.log('✅ Email enviado solo al owner (email cliente inválido):', ownerResult.data?.id);
    return;
  }

  // Enviar emails por separado para mejor manejo de errores
  let clientResult = null;
  let ownerResult = null;

  // Email al cliente
  try {
    clientResult = await resend.emails.send({
      from: 'TheEkt <onboarding@resend.dev>',
      to: customerData.customerEmail,
      subject: clientSubject,
      html: clientHtml
    });
    
    if (clientResult.error) {
      console.error('Error enviando email al cliente:', clientResult.error);
    } else {
      console.log('✅ Email enviado al cliente:', clientResult.data?.id);
    }
  } catch (clientError: any) {
    console.error('Excepción enviando email al cliente:', clientError.message);
  }

  // Email al owner
  try {
    ownerResult = await resend.emails.send({
      from: 'TheEkt <onboarding@resend.dev>',
      to: OWNER_EMAIL,
      subject: `Nuevo pedido: ${order.order_number}`,
      html: ownerHtml
    });
    
    if (ownerResult.error) {
      console.error('Error enviando email al owner:', ownerResult.error);
    } else {
      console.log('✅ Email enviado al owner:', ownerResult.data?.id);
    }
  } catch (ownerError: any) {
    console.error('Excepción enviando email al owner:', ownerError.message);
  }
}