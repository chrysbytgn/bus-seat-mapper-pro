-- Complete the reversion - drop restrictive policies and add public access for associations

-- Drop the authenticated-only policies for associations
DROP POLICY IF EXISTS "Authenticated users can view associations" ON public.associations;
DROP POLICY IF EXISTS "Authenticated users can create associations" ON public.associations;
DROP POLICY IF EXISTS "Authenticated users can update associations" ON public.associations;
DROP POLICY IF EXISTS "Authenticated users can delete associations" ON public.associations;

-- Restore public access for associations
CREATE POLICY "Permitir acceso completo a asociaciones" ON public.associations FOR ALL USING (true);