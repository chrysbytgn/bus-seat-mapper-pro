-- Fix critical security vulnerability: Association business data exposed publicly
-- Replace overly permissive RLS policy with authentication-based restrictions

-- Drop the existing insecure policy that allows public access
DROP POLICY IF EXISTS "Permitir acceso completo a asociaciones" ON public.associations;

-- Create secure RLS policies that require authentication
-- Only authenticated users can view association business information
CREATE POLICY "Authenticated users can view associations" 
ON public.associations 
FOR SELECT 
TO authenticated
USING (true);

-- Only authenticated users can create new associations
CREATE POLICY "Authenticated users can create associations" 
ON public.associations 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Only authenticated users can update association data
CREATE POLICY "Authenticated users can update associations" 
ON public.associations 
FOR UPDATE 
TO authenticated
USING (true);

-- Only authenticated users can delete associations
CREATE POLICY "Authenticated users can delete associations" 
ON public.associations 
FOR DELETE 
TO authenticated
USING (true);