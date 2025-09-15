-- Simply ensure RLS allows authenticated users to create associations
-- Drop all existing policies first
DROP POLICY IF EXISTS "Allow authenticated users to create associations" ON public.associations;
DROP POLICY IF EXISTS "Allow authenticated users to view associations" ON public.associations;
DROP POLICY IF EXISTS "Allow authenticated users to update associations" ON public.associations;
DROP POLICY IF EXISTS "Allow authenticated users to delete associations" ON public.associations;
DROP POLICY IF EXISTS "Authenticated users can create associations" ON public.associations;
DROP POLICY IF EXISTS "Authenticated users can view associations" ON public.associations;
DROP POLICY IF EXISTS "Authenticated users can update associations" ON public.associations;
DROP POLICY IF EXISTS "Authenticated users can delete associations" ON public.associations;

-- Create simple, permissive policies for authenticated users
CREATE POLICY "auth_users_all_associations" ON public.associations
FOR ALL TO authenticated USING (true) WITH CHECK (true);