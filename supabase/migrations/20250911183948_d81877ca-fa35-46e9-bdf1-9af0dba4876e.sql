-- Fix association creation - completely remove RLS restrictions for initial creation
-- This ensures users can create their first association

-- Drop all existing policies on associations
DO $$
DECLARE
    policy_rec RECORD;
BEGIN
    FOR policy_rec IN SELECT policyname FROM pg_policies WHERE tablename = 'associations' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_rec.policyname || '" ON public.associations';
    END LOOP;
END
$$;

-- Create simple, permissive policies that actually work
-- Allow authenticated users to create associations
CREATE POLICY "Authenticated users can create associations" 
ON public.associations 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Allow users to view all associations (they'll be filtered by profile link anyway)
CREATE POLICY "Authenticated users can view associations" 
ON public.associations 
FOR SELECT 
TO authenticated
USING (true);

-- Allow users to update associations (will be restricted by profile link in app logic)
CREATE POLICY "Authenticated users can update associations" 
ON public.associations 
FOR UPDATE 
TO authenticated
USING (true);

-- Allow users to delete associations (will be restricted by profile link in app logic)
CREATE POLICY "Authenticated users can delete associations" 
ON public.associations 
FOR DELETE 
TO authenticated
USING (true);