# Configuración de Mercado Pago - Aurora Clothes

## Resumen

Se ha implementado un backend serverless para procesar pagos con Mercado Pago de forma segura.

## Estructura

```
/api/create-preference.js    # Función serverless para crear preferencias
dev-server.js                # Servidor de desarrollo local
src/app/services/mercadoPagoService.ts  # Servicio frontend
src/app/pages/CartPage.tsx   # Página de checkout
```

## Configuración

### 1. Variables de Entorno

Edita el archivo `.env` y agrega:

```bash
# Mercado Pago - Frontend (pública)
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Mercado Pago - Backend (privada, nunca expuesta al frontend)
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 2. Obtener Credenciales de Mercado Pago

1. Crear cuenta en https://www.mercadopago.com.ar
2. Ir a https://www.mercadopago.com.ar/developers/panel
3. Crear una nueva aplicación
4. Obtener las credenciales de **prueba**:
   - **Public Key** (para el frontend)
   - **Access Token** (para el backend)

### 3. Ejecutar en Desarrollo Local

#### Opción A: Usar Vercel CLI (Recomendado)

```bash
# Instalar Vercel CLI globalmente
npm i -g vercel

# Ejecutar en modo desarrollo
vercel dev
```

#### Opción B: Servidor de desarrollo manual

```bash
# Terminal 1: Backend serverless
node dev-server.js

# Terminal 2: Frontend Vite
npm run dev
```

### 4. Despliegue en Producción (Vercel)

```bash
# Instalar Vercel CLI si no lo tienes
npm i -g vercel

# Desplegar
vercel --prod
```

Configurar variables de entorno en Vercel:
1. Ir a tu proyecto en https://vercel.com/dashboard
2. Settings → Environment Variables
3. Agregar:
   - `MERCADOPAGO_ACCESS_TOKEN` = tu_access_token_de_producción
   - `SITE_URL` = https://tu-dominio.vercel.app

### 5. Activar Modo Producción en Mercado Pago

Cuando estés listo para recibir pagos reales:

1. En tu dashboard de Mercado Pago, ve a Credenciales
2. Cambiar a modo Producción
3. Copiar las credenciales de producción
4. Actualizar las variables en Vercel
5. Redesplegar

## Métodos de Pago Soportados

- Tarjetas de crédito/débito (Visa, Mastercard, Amex)
- Mercado Crédito (hasta 12 cuotas sin tarjeta)
- Efectivo (PagoFácil, Rapipago)
- Transferencia bancaria
- Dinero en cuenta de Mercado Pago

## Flujo de Pago

1. Usuario agrega productos al carrito
2. Ingresa email y selecciona método de envío
3. Hace clic en "Continuar con Mercado Pago"
4. El frontend llama al backend (`/api/create-preference`)
5. Backend crea preferencia con Access Token privado
6. Backend devuelve `preferenceId` e `initPoint`
7. Frontend muestra botón de pago de Mercado Pago
8. Usuario es redirigido a Mercado Pago para pagar
9. Después del pago, redirige a `/success` o `/cancel`

## Seguridad

- ✅ Access Token nunca expuesto al frontend
- ✅ Backend serverless valida datos antes de crear preferencia
- ✅ HTTPS obligatorio en producción
- ✅ CORS configurado apropiadamente

## URLs de Retorno

Las URLs configuradas automáticamente son:
- **Éxito**: `{SITE_URL}/success`
- **Cancelación**: `{SITE_URL}/cancel`
- **Pendiente**: `{SITE_URL}/success`

## Testing

Usa las tarjetas de prueba de Mercado Pago:
- Visa: 4509 9535 6623 3704
- Mastercard: 5031 7557 3453 0604
- Cualquier fecha futura
- Cualquier código de seguridad (3 dígitos)

Más info: https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/test-cards

## Troubleshooting

### Error "MERCADOPAGO_ACCESS_TOKEN no configurado"
Asegúrate de tener la variable de entorno configurada tanto en `.env` local como en Vercel.

### Error de CORS
El backend tiene CORS configurado para aceptar cualquier origen. Si ves errores de CORS, verifica que el backend esté corriendo.

### "Error al preparar el pago"
Revisa la consola del navegador y del servidor para ver el error específico. Comúnmente es un problema con las credenciales.

## Soporte

Documentación oficial: https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/introduction
