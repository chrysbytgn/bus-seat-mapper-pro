-- Phase 1: Fix Associations RLS Policies
-- Drop the insecure policy that allows all authenticated users to access all associations
DROP POLICY IF EXISTS "auth_users_all_associations" ON public.associations;

-- Create association-scoped SELECT policy
CREATE POLICY "Users can view their own association"
ON public.associations
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT association_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Create association-scoped UPDATE policy
CREATE POLICY "Users can update their own association"
ON public.associations
FOR UPDATE
TO authenticated
USING (
  id IN (
    SELECT association_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
)
WITH CHECK (
  id IN (
    SELECT association_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Create INSERT policy for new associations
CREATE POLICY "Users can create associations"
ON public.associations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create association-scoped DELETE policy
CREATE POLICY "Users can delete their own association"
ON public.associations
FOR DELETE
TO authenticated
USING (
  id IN (
    SELECT association_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Verify trigger exists for linking new associations to users
-- The trigger handle_new_association already exists and will link new associations to creating user