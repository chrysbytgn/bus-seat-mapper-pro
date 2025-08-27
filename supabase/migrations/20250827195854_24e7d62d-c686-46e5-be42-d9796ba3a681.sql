-- Revert security changes - restore public access to make app functional again

-- Drop the restrictive authenticated-only policies
DROP POLICY IF EXISTS "Authenticated users can view passengers" ON public.passengers;
DROP POLICY IF EXISTS "Authenticated users can insert passengers" ON public.passengers;
DROP POLICY IF EXISTS "Authenticated users can update passengers" ON public.passengers;
DROP POLICY IF EXISTS "Authenticated users can delete passengers" ON public.passengers;

DROP POLICY IF EXISTS "Authenticated users can view excursions" ON public.excursions;
DROP POLICY IF EXISTS "Authenticated users can manage excursions" ON public.excursions;

DROP POLICY IF EXISTS "Authenticated users can view associations" ON public.associations;
DROP POLICY IF EXISTS "Authenticated users can manage associations" ON public.associations;

-- Restore the original permissive policies for app functionality
CREATE POLICY "Permitir acceso completo a pasajeros" ON public.passengers FOR ALL USING (true);
CREATE POLICY "Permitir acceso completo a excursiones" ON public.excursions FOR ALL USING (true);
CREATE POLICY "Permitir acceso completo a asociaciones" ON public.associations FOR ALL USING (true);