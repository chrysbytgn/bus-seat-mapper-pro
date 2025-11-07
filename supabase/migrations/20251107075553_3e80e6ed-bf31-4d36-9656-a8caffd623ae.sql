-- Añadir columna stop_name a la tabla passengers
-- Permite registrar en qué parada sube cada pasajero
ALTER TABLE public.passengers 
ADD COLUMN stop_name text;