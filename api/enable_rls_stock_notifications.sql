-- Agregar políticas RLS para stock_notifications

-- Política para que usuarios puedan ver sus propias notificaciones
CREATE POLICY IF NOT EXISTS 'Users can view own notifications' 
ON stock_notifications FOR SELECT 
USING (auth.uid() = user_id::uuid);

-- Política para que usuarios puedan insertar notificaciones
CREATE POLICY IF NOT EXISTS 'Users can insert notifications' 
ON stock_notifications FOR INSERT 
WITH CHECK (auth.uid() = user_id::uuid);

-- Política para que usuarios puedan actualizar sus notificaciones
CREATE POLICY IF NOT EXISTS 'Users can update own notifications' 
ON stock_notifications FOR UPDATE 
USING (auth.uid() = user_id::uuid);