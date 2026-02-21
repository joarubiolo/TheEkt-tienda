-- =====================================================
-- DESACTIVAR RLS (OPCIÓN A) - Firebase Auth + Supabase
-- =====================================================

-- Desactivar RLS en todas las tablas
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_notifications DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS está desactivado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'cart_items', 'wishlist', 'orders', 'stock_notifications');
