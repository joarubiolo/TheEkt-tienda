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

    // 4. Sincronizar con Google Sheets (en segundo plano)
    try {
      await syncToGoogleSheets(order, orderItems, {
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
    } catch (sheetError) {
      console.error('Error sincronizando con Google Sheets:', sheetError);
      // No fallar la transacción por esto
    }

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
  const { GoogleApis } = await import('@googleapis/sheets');
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

  const sheets = new GoogleApis({ auth }).sheets('v4');

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
// FUNCIÓN: ENVIAR EMAILS
// =============================================
async function sendEmails(order, orderItems, customerData) {
  // Aquí usaríamos Resend, SendGrid o Supabase built-in para enviar emails
  
  const productsList = orderItems.map(item => 
    `- ${item.product_name} (Talle: ${item.size}, Color: ${item.color}) x${item.quantity} - $${item.subtotal.toLocaleString('es-AR')}`
  ).join('\n');

  // Email al cliente
  let clientSubject = '';
  let clientBody = '';

  if (customerData.paymentMethod === 'transferencia') {
    clientSubject = `Pedido ${order.order_number} - Datos para Transferencia`;
    clientBody = `
¡Gracias por tu compra en TheEkt!

Tu número de pedido es: ${order.order_number}

DETALLE DEL PEDIDO:
${productsList}

Total: $${customerData.total.toLocaleString('es-AR')}

DATOS PARA REALIZAR LA TRANSFERENCIA:
Titular: ${BANK_DETAILS.titular}
CBU: ${BANK_DETAILS.cbu}
Alias: ${BANK_DETAILS.alias}
Banco: ${BANK_DETAILS.banco}

Una vez realizada la transferencia, por favor contactanos para confirmar.

Saludos,
TheEkt
    `.trim();
  } else {
    clientSubject = `¡Gracias por tu compra en TheEkt! - Pedido ${order.order_number}`;
    clientBody = `
¡Gracias por tu compra en TheEkt!

Tu número de pedido es: ${order.order_number}

DETALLE DEL PEDIDO:
${productsList}

Total: $${customerData.total.toLocaleString('es-AR')}

Tu pago ha sido procesado exitosamente. Te informaremos cuando tu pedido esté listo para retirar/enviar.

Saludos,
TheEkt
    `.trim();
  }

  // Email a vos (el owner)
  const ownerSubject = `Nuevo pedido: ${order.order_number}`;
  const ownerBody = `
NUEVO PEDIDO RECIBIDO

Número de pedido: ${order.order_number}

CLIENTE:
Nombre: ${customerData.customerName} ${customerData.customerLastname}
Email: ${customerData.customerEmail}
Teléfono: No proporcionado

ENTREGA:
Tipo: ${customerData.deliveryType === 'envio' ? 'Envío a domicilio' : 'Retiro en local'}
${customerData.deliveryType === 'envio' ? `Dirección: ${customerData.deliveryAddress.street} ${customerData.deliveryAddress.height}, ${customerData.customerCity}, ${customerData.deliveryAddress.province}` : ''}

PAGO:
Método: ${customerData.paymentMethod === 'mercadopago' ? 'MercadoPago' : 'Transferencia'}
Estado: ${customerData.paymentMethod === 'mercadopago' ? 'Pagado' : 'Pendiente'}
Subtotal: $${customerData.subtotal.toLocaleString('es-AR')}
Descuento: $${customerData.discount.toLocaleString('es-AR')}
Total: $${customerData.total.toLocaleString('es-AR')}

PRODUCTOS:
${productsList}

---
TheEkt - Sistema de Pedidos Automático
  `.trim();

  // Enviar emails usando Supabase (o servicio externo)
  // Por ahora simulamos el envío (integrar con Resend/SendGrid después)
  console.log('=== EMAIL AL CLIENTE ===');
  console.log('Para:', customerData.customerEmail);
  console.log('Asunto:', clientSubject);
  console.log('---');
  
  console.log('=== EMAIL A VOS ===');
  console.log('Para:', OWNER_EMAIL);
  console.log('Asunto:', ownerSubject);
  console.log('---');

  // En producción, usarías:
  // const { error } = await supabase.functions.invoke('send-email', { ... })
}