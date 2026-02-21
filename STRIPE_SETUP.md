# Configuración de Stripe para Aurora Clothes

## Resumen

Se ha integrado un sistema de pagos con **Stripe** en tu tienda Aurora Clothes. Como es un proyecto **frontend-only** (sin backend), he implementado una solución que funciona en modo demo y se puede activar completamente con una configuración adicional.

## Estado Actual

✅ **Implementado:**
- Página de carrito actualizada con opciones de pago
- Páginas de éxito (`/success`) y cancelación (`/cancel`)
- Servicio de Stripe para manejar pagos
- Detección automática de configuración de Stripe
- Modo demo funcional sin configuración

⚠️ **Limitación:** Como no hay backend, el procesamiento real de pagos requiere configuración adicional (ver opciones abajo).

---

## Opciones de Configuración

### Opción 1: Modo Demo (Actual)

**Costo:** Gratis

Sin hacer nada más, el sistema funciona en modo demo:
- Simula el proceso de checkout
- Redirige a página de éxito
- Limpia el carrito
- Perfecto para demostraciones o testing

### Opción 2: Stripe Payment Links (Recomendado para frontend-only)

**Costo:** Solo comisiones de Stripe (2.9% + $0.30 por transacción)

Esta es la mejor opción para tu proyecto sin backend:

#### Pasos:

1. **Crear cuenta en Stripe:**
   - Ve a [stripe.com](https://stripe.com)
   - Regístrate (gratis)
   - Activa modo test primero

2. **Crear un Payment Link:**
   - En el dashboard de Stripe, ve a "Payment Links"
   - Crea un nuevo Payment Link
   - Configura el producto/precio (puedes crear uno genérico)
   - Copia la URL del Payment Link (se verá como: `https://buy.stripe.com/xxxxx`)

3. **Configurar variables de entorno:**
   ```bash
   # Copia el archivo de ejemplo
   cp .env.example .env
   ```

4. **Edita el archivo `.env`:**
   ```env
   VITE_STRIPE_PUBLIC_KEY=pk_test_tu_clave_publica_de_stripe
   VITE_SITE_URL=http://localhost:5173
   VITE_STRIPE_PAYMENT_LINK=https://buy.stripe.com/xxxxx
   ```

5. **Para encontrar tu clave pública:**
   - En el dashboard de Stripe → Developers → API Keys
   - Copia la "Publishable key" (empieza con `pk_test_`)

### Opción 3: Stripe Checkout con Backend (Producción Real)

**Costo:** Comisiones de Stripe + hosting del backend

Para pagos reales con manejo completo de productos, necesitarás:

1. Crear un backend (Node.js/Express, Next.js API routes, etc.)
2. Endpoint `/create-checkout-session` que:
   - Reciba los items del carrito
   - Cree una sesión de Stripe Checkout
   - Retorne la URL de redirección
3. Configurar webhooks para confirmar pagos

**Ejemplo de endpoint:**
```javascript
// /api/create-checkout-session
app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: req.body.items,
    mode: 'payment',
    success_url: `${req.body.siteUrl}/success`,
    cancel_url: `${req.body.siteUrl}/cancel`,
  });
  res.json({ url: session.url });
});
```

---

## Variables de Entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `VITE_STRIPE_PUBLIC_KEY` | Clave pública de Stripe (pk_test_... o pk_live_...) | Sí, para modo real |
| `VITE_SITE_URL` | URL de tu sitio (para redirecciones) | Sí |
| `VITE_STRIPE_PAYMENT_LINK` | URL del Payment Link de Stripe | Para Payment Links |

---

## Comisiones de Stripe

| Tipo de Transacción | Comisión |
|---------------------|----------|
| Tarjetas estándar | 2.9% + $0.30 USD |
| Tarjetas internacionales | +1% adicional |
| Cuota mensual | $0 (sin costos fijos) |

**Ejemplo:** Una compra de $50 USD
- Comisión: $50 × 2.9% + $0.30 = $1.75 USD
- Recibes: $48.25 USD

---

## Testing

### Tarjetas de prueba (modo test):

| Número | Resultado |
|--------|-----------|
| `4242 4242 4242 4242` | Pago exitoso |
| `4000 0000 0000 0002` | Tarjeta declinada |
| `4000 0000 0000 9995` | Fondos insuficientes |

- Usa cualquier fecha futura para expiración
- Usa cualquier CVC de 3 dígitos
- Usa cualquier código postal

---

## Modo Producción

Cuando estés listo para recibir pagos reales:

1. Activa tu cuenta en Stripe (verificación de identidad)
2. Cambia a claves de producción (empiezan con `pk_live_` y `sk_live_`)
3. Actualiza las variables de entorno
4. Despliega tu sitio con HTTPS
5. Configura los webhooks en Stripe Dashboard

---

## Soporte

¿Necesitas ayuda con la configuración?

- Documentación de Stripe: [stripe.com/docs](https://stripe.com/docs)
- Guía de Checkout: [stripe.com/docs/payments/checkout](https://stripe.com/docs/payments/checkout)
- Payment Links: [stripe.com/docs/payments/payment-links](https://stripe.com/docs/payments/payment-links)

---

## Notas Importantes

⚠️ **Seguridad:**
- Nunca expongas tu `STRIPE_SECRET_KEY` en el frontend
- Siempre usa HTTPS en producción
- Valida los montos en el backend (si tienes uno)

⚠️ **Limitaciones del modo frontend-only:**
- No se puede verificar el pago automáticamente sin backend
- Los productos deben estar pre-configurados en Stripe
- Para carritos dinámicos, se recomienda implementar un backend

---

## Próximos Pasos Recomendados

1. Crear cuenta en Stripe (gratis)
2. Probar en modo test con tarjetas de prueba
3. Configurar Payment Links para productos fijos
4. Si el negocio crece, considerar implementar un backend

¡Listo para recibir pagos! 🎉
