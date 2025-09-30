-- Agregar columnas para información de pago a la tabla de ventas
ALTER TABLE ventas 
ADD COLUMN IF NOT EXISTS monto_recibido DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS cambio_devuelto DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS metodo_pago TEXT DEFAULT 'efectivo';

-- Actualizar ventas existentes con valores por defecto
UPDATE ventas 
SET monto_recibido = total,
    cambio_devuelto = 0,
    metodo_pago = 'efectivo'
WHERE monto_recibido IS NULL;
