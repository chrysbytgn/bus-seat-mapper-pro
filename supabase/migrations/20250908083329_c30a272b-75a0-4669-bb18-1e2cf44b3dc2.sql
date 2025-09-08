-- First, add association_id to profiles table so users can be linked to associations
ALTER TABLE public.profiles ADD COLUMN association_id uuid REFERENCES public.associations(id);

-- Drop the current overly permissive passenger policies
DROP POLICY IF EXISTS "Authenticated users can view passengers" ON public.passengers;
DROP POLICY IF EXISTS "Authenticated users can create passengers" ON public.passengers;
DROP POLICY IF EXISTS "Authenticated users can update passengers" ON public.passengers;
DROP POLICY IF EXISTS "Authenticated users can delete passengers" ON public.passengers;

-- Create secure RLS policies that restrict passenger access to same association
-- Users can only view passengers for excursions belonging to their association
CREATE POLICY "Users can view passengers from their association" 
ON public.passengers 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.excursions e
    JOIN public.profiles p ON p.association_id = e.association_id
    WHERE e.id = passengers.excursion_id 
    AND p.id = auth.uid()
  )
);

-- Users can only create passengers for excursions in their association
CREATE POLICY "Users can create passengers for their association" 
ON public.passengers 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.excursions e
    JOIN public.profiles p ON p.association_id = e.association_id
    WHERE e.id = passengers.excursion_id 
    AND p.id = auth.uid()
  )
);

-- Users can only update passengers for excursions in their association
CREATE POLICY "Users can update passengers from their association" 
ON public.passengers 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.excursions e
    JOIN public.profiles p ON p.association_id = e.association_id
    WHERE e.id = passengers.excursion_id 
    AND p.id = auth.uid()
  )
);

-- Users can only delete passengers for excursions in their association
CREATE POLICY "Users can delete passengers from their association" 
ON public.passengers 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.excursions e
    JOIN public.profiles p ON p.association_id = e.association_id
    WHERE e.id = passengers.excursion_id 
    AND p.id = auth.uid()
  )
);

-- Also secure the excursions table with similar association-based restrictions
DROP POLICY IF EXISTS "Allow all operations on excursions" ON public.excursions;

CREATE POLICY "Users can view excursions from their association" 
ON public.excursions 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.association_id = excursions.association_id 
    AND p.id = auth.uid()
  )
);

CREATE POLICY "Users can create excursions for their association" 
ON public.excursions 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.association_id = excursions.association_id 
    AND p.id = auth.uid()
  )
);

CREATE POLICY "Users can update excursions from their association" 
ON public.excursions 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.association_id = excursions.association_id 
    AND p.id = auth.uid()
  )
);

CREATE POLICY "Users can delete excursions from their association" 
ON public.excursions 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.association_id = excursions.association_id 
    AND p.id = auth.uid()
  )
);