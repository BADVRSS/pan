-- Agregar columnas para información de pago y turno a la tabla de ventas
ALTER TABLE ventas 
ADD COLUMN turno VARCHAR(10),
ADD COLUMN monto_recibido DECIMAL(10, 2),
ADD COLUMN cambio_devuelto DECIMAL(10, 2),
ADD COLUMN metodo_pago VARCHAR(20);

-- Crear tabla para registrar el cambio inicial del día
CREATE TABLE IF NOT EXISTS cambio_diario (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL UNIQUE,
  cambio_inicial DECIMAL(10, 2) NOT NULL DEFAULT 100.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comentarios sobre las columnas
COMMENT ON COLUMN ventas.turno IS 'Turno de la venta: mañana (7:30-11:30) o tarde (16:30-22:00)';
COMMENT ON COLUMN ventas.monto_recibido IS 'Monto que el cliente entregó';
COMMENT ON COLUMN ventas.cambio_devuelto IS 'Cambio que se devolvió al cliente';
COMMENT ON COLUMN ventas.metodo_pago IS 'exacto o billete';
