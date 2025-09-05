-- Fix RLS policies to allow public access for excursions and passengers
-- This is needed because the app doesn't have authentication implemented yet

-- Drop existing restrictive policies for excursions
DROP POLICY IF EXISTS "Users can view excursions" ON public.excursions;
DROP POLICY IF EXISTS "Authenticated users can create excursions" ON public.excursions;
DROP POLICY IF EXISTS "Authenticated users can update excursions" ON public.excursions;
DROP POLICY IF EXISTS "Authenticated users can delete excursions" ON public.excursions;

-- Drop existing restrictive policies for passengers
DROP POLICY IF EXISTS "Users can view passengers" ON public.passengers;
DROP POLICY IF EXISTS "Authenticated users can manage passengers" ON public.passengers;

-- Create permissive policies for excursions (allows all operations)
CREATE POLICY "Allow all operations on excursions" ON public.excursions
  FOR ALL USING (true);

-- Create permissive policies for passengers (allows all operations)  
CREATE POLICY "Allow all operations on passengers" ON public.passengers
  FOR ALL USING (true);