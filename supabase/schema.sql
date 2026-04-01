-- =============================================
-- TABLAS PARA SISTEMA DE PEDIDOS - THEEKT
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- 1. Tabla de PEDIDOS
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    customer_name TEXT NOT NULL,
    customer_lastname TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    delivery_type TEXT NOT NULL CHECK (delivery_type IN ('envio', 'retiro')),
    delivery_address JSONB,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('mercadopago', 'transferencia')),
    payment_status TEXT DEFAULT 'pendiente' CHECK (payment_status IN ('pendiente', 'pagado')),
    subtotal NUMERIC NOT NULL,
    discount NUMERIC DEFAULT 0,
    total NUMERIC NOT NULL,
    status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'procesando', 'enviado', 'entregado'))
);

-- 2. Tabla de ITEMS DEL PEDIDO
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER,
    product_code TEXT NOT NULL,
    product_name TEXT NOT NULL,
    size TEXT,
    color TEXT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC NOT NULL,
    subtotal NUMERIC NOT NULL
);

-- 3. Tabla de CÓDIGOS DE PRODUCTOS
CREATE TABLE IF NOT EXISTS products_codes (
    id INTEGER PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL
);

-- =============================================
-- SEED DE PRODUCTOS (P001 - P049)
-- =============================================

INSERT INTO products_codes (id, code, name) VALUES
(1, 'P001', 'Remera Sta Monica'),
(2, 'P002', 'Remera MC Driver Club'),
(3, 'P003', 'Jean Fly Back'),
(4, 'P004', 'Jean Total Blue'),
(5, 'P005', 'Jean Wide Leg Chill'),
(6, 'P006', 'Mono Minnie Mouse'),
(7, 'P007', 'Vestido Minnie Mouse'),
(8, 'P008', 'Pupera Negra Minnie'),
(9, 'P009', 'Campera Spider-Man'),
(10, 'P010', 'Campera Minnie Mouse'),
(11, 'P011', 'Campera Frozzen'),
(12, 'P012', 'Campera Mickey Mouse'),
(13, 'P013', 'Campera Avengers'),
(14, 'P014', 'Malla Premium Minnie Mouse'),
(15, 'P015', 'Bikini Premium Minnie Mouse'),
(16, 'P016', 'Top y Calza Stone'),
(17, 'P017', 'Pollera Jean'),
(18, 'P018', 'Bermuda Korea'),
(19, 'P019', 'Calza Biker Minnie Mouse'),
(20, 'P020', 'Top y Calza Minnie Mouse'),
(21, 'P021', 'Top y Calza Mickey Mouse'),
(22, 'P022', 'Top Minnie Mouse'),
(23, 'P023', 'Calza y top Minnie Mouse'),
(24, 'P024', 'Remera Mickey Mouse'),
(25, 'P025', 'Remera Minnie Mouse'),
(26, 'P026', 'Remera Disney'),
(27, 'P027', 'Remera Stitch Oversize'),
(28, 'P028', 'Remera Pupera Minnie Mouse'),
(29, 'P029', 'Musculosa Minnie Mouse'),
(30, 'P030', 'Musculosa Mickey & Minnie'),
(31, 'P031', 'Remera Stitch MC'),
(32, 'P032', 'Remera Minnie Mouse MC'),
(33, 'P033', 'Chaleco Minnie Mouse'),
(34, 'P034', 'Chaleco Avengers'),
(35, 'P035', 'Zapatillas Mickey Mouse'),
(36, 'P036', 'Zapatillas Unicornio Bebe'),
(37, 'P037', 'Zapatillas Capibara'),
(38, 'P038', 'Zapatillas T-Rex'),
(39, 'P039', 'Zapatillas Minnie Mouse'),
(40, 'P040', 'Zapatillas Frozzen'),
(41, 'P041', 'Zapatillas Cars'),
(42, 'P042', 'Zapatillas Super Frozzen'),
(43, 'P043', 'Zapatillas Super Mickey'),
(44, 'P044', 'Zapatillas Super Unicornio'),
(45, 'P045', 'Zapatillas Mini Frozzen'),
(46, 'P046', 'Zapatillas Mini Unicornio'),
(47, 'P047', 'Zapatillas Intensamente'),
(48, 'P048', 'Zapatillas Mini Capibara'),
(49, 'P049', 'Zapatillas Stitch')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- FUNCIONES AUXILIARES
-- =============================================

-- Función para generar número de pedido único
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    order_count INTEGER;
    order_number TEXT;
    year_part TEXT;
    month_part TEXT;
    day_part TEXT;
BEGIN
    year_part := TO_CHAR(NOW(), 'YYYY');
    month_part := TO_CHAR(NOW(), 'MM');
    day_part := TO_CHAR(NOW(), 'DD');
    
    SELECT COUNT(*) + 1 INTO order_count FROM orders 
    WHERE created_at::date = CURRENT_DATE;
    
    order_number := 'ORD-' || year_part || '-' || month_part || '-' || day_part || '-' || 
                   LPAD(order_count::TEXT, 4, '0');
    
    RETURN order_number;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- HABILITAR RLS (Row Level Security)
-- =============================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_codes ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público para escritura (Edge Functions)
CREATE POLICY "Allow public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select products_codes" ON products_codes FOR SELECT USING (true);

-- Habilitar RLS también en las políticas de lectura
CREATE POLICY "Allow public read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public read order_items" ON order_items FOR SELECT USING (true);