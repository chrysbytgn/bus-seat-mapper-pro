-- Fix critical security vulnerability: Remove overly permissive RLS policies
-- and implement proper authentication-based restrictions

-- Drop existing insecure policies for all tables
DROP POLICY IF EXISTS "Permitir acceso completo a pasajeros" ON public.passengers;
DROP POLICY IF EXISTS "Permitir acceso completo a excursiones" ON public.excursions;
DROP POLICY IF EXISTS "Permitir acceso completo a asociaciones" ON public.associations;

-- Create secure RLS policies for passengers table (most sensitive data)
-- Only authenticated users can access passenger data
CREATE POLICY "Authenticated users can view passengers" 
ON public.passengers 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert passengers" 
ON public.passengers 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update passengers" 
ON public.passengers 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete passengers" 
ON public.passengers 
FOR DELETE 
TO authenticated
USING (true);

-- Create secure RLS policies for excursions table
CREATE POLICY "Authenticated users can view excursions" 
ON public.excursions 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage excursions" 
ON public.excursions 
FOR ALL 
TO authenticated
USING (true);

-- Create secure RLS policies for associations table
CREATE POLICY "Authenticated users can view associations" 
ON public.associations 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage associations" 
ON public.associations 
FOR ALL 
TO authenticated
USING (true);