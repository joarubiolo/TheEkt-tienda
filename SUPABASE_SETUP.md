# Configuración de Supabase para Aurora Clothes

## 🚀 Instrucciones de Configuración

Para que el sistema de autenticación y persistencia funcione correctamente, necesitas crear las tablas en tu proyecto de Supabase.

## 📋 Paso a Paso

### 1. Acceder al Dashboard de Supabase

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto `aurora-clothes`
4. Ve a la sección **SQL Editor** (Editor SQL)

### 2. Ejecutar el Script SQL

Copia y pega el siguiente script SQL en el editor y ejecútalo:

```sql
-- =====================================================
-- TABLAS PARA AURORA CLOTHES
-- =====================================================

-- 1. Tabla de Perfiles de Usuario
-- Almacena información adicional del usuario
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de Items del Carrito
-- Almacena los productos en el carrito de cada usuario
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  image TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id, size, color)
);

-- 3. Tabla de Lista de Deseados (Favoritos)
-- Almacena los productos favoritos del usuario
CREATE TABLE wishlist (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  notify_on_restock BOOLEAN DEFAULT true,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 4. Tabla de Pedidos
-- Almacena el historial de compras
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  shipping_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabla de Notificaciones de Stock
-- Registra las notificaciones enviadas
CREATE TABLE stock_notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('low_stock', 'restocked')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id, type)
);

-- =====================================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Políticas para cart_items
CREATE POLICY "Users can view own cart" 
  ON cart_items FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items" 
  ON cart_items FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items" 
  ON cart_items FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items" 
  ON cart_items FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para wishlist
CREATE POLICY "Users can view own wishlist" 
  ON wishlist FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlist items" 
  ON wishlist FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wishlist" 
  ON wishlist FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist items" 
  ON wishlist FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para orders
CREATE POLICY "Users can view own orders" 
  ON orders FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" 
  ON orders FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Políticas para stock_notifications
CREATE POLICY "Users can view own notifications" 
  ON stock_notifications FOR SELECT 
  USING (auth.uid() = user_id);

-- =====================================================
-- ÍNDICES PARA MEJOR RENDIMIENTO
-- =====================================================

CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_stock_notifications_user_id ON stock_notifications(user_id);
```

### 3. Configurar Auth en Firebase

1. Ve a [https://console.firebase.google.com](https://console.firebase.google.com)
2. Selecciona tu proyecto `aurora-clothes`
3. Ve a **Authentication** → **Get Started**
4. Habilita **Google** como proveedor de inicio de sesión
5. Configura tu correo electrónico de soporte
6. Guarda los cambios

### 4. Verificar Variables de Entorno

Asegúrate de que tu archivo `.env` tenga todas las variables configuradas:

```env
# Firebase
VITE_FIREBASE_API_KEY=AIzaSyD8Eht3lLu8drX3d4xVzUmBgdS-TBzbqIM
VITE_FIREBASE_AUTH_DOMAIN=aurora-clothes.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=aurora-clothes
VITE_FIREBASE_STORAGE_BUCKET=aurora-clothes.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=188938054155
VITE_FIREBASE_APP_ID=1:188938054155:web:7134521977eb1deb94350e
VITE_FIREBASE_MEASUREMENT_ID=G-PGS8PQ29HC

# Supabase
VITE_SUPABASE_URL=https://qyvbfwllqsezteecvieb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ✅ Verificación

Después de configurar todo:

1. Reinicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Abre la aplicación en `http://localhost:5173`

3. Prueba las funcionalidades:
   - Click en "Iniciar sesión" en el header
   - Inicia sesión con Google
   - Agrega productos al carrito
   - Agrega productos a favoritos
   - Verifica que persisten al recargar

## 🎯 Funcionalidades Implementadas

✅ **Autenticación con Google**
- Botón de login en el header
- Modal de autenticación
- Avatar y menú desplegable del usuario
- Persistencia de sesión

✅ **Carrito Persistente**
- Guardado automático en Supabase para usuarios logueados
- LocalStorage para usuarios anónimos
- Merge inteligente entre carritos

✅ **Sistema de Favoritos**
- Botón de corazón en cada producto
- Página de favoritos con notificaciones
- Toggle para activar/desactivar notificaciones

✅ **Perfil de Usuario**
- Página de perfil editable
- Nombre, email, teléfono
- Avatar de Google

✅ **Historial de Pedidos**
- Página de pedidos
- Estados: pendiente, pagado, enviado, entregado, cancelado

✅ **Páginas Nuevas**
- `/profile` - Perfil del usuario
- `/orders` - Historial de pedidos
- `/wishlist` - Favoritos

## 🚀 Listo para Usar

¡El sistema está completamente configurado! Los usuarios pueden:
- Iniciar sesión con Google
- Tener su carrito guardado automáticamente
- Guardar productos favoritos
- Recibir notificaciones (configuración adicional necesaria para emails)
- Ver su historial de compras

## 💰 Costos

Todo el stack es **GRATIS** para tu volumen actual:
- Firebase Auth: 50k usuarios/mes
- Supabase: 500MB + 2GB transferencia
- Total: **$0/mes**

## 📞 Soporte

Si tienes algún problema:
1. Verifica que las tablas se crearon correctamente en Supabase
2. Revisa que Firebase Auth está habilitado
3. Confirma que las variables de entorno son correctas
4. Revisa la consola del navegador para errores
