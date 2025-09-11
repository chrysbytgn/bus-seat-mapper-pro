-- Fix association creation for new users
-- Allow users to create their first association and become its owner

-- Drop the restrictive association policies
DROP POLICY IF EXISTS "Users can view their association" ON public.associations;
DROP POLICY IF EXISTS "Admins can manage associations" ON public.associations;

-- Create more permissive policies for associations
-- Users can view associations they belong to
CREATE POLICY "Users can view their association" 
ON public.associations 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.association_id = associations.id 
    AND p.id = auth.uid()
  )
);

-- Users can create associations (for first-time setup)
CREATE POLICY "Users can create associations" 
ON public.associations 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Users can update associations they belong to
CREATE POLICY "Users can update their association" 
ON public.associations 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.association_id = associations.id 
    AND p.id = auth.uid()
  )
);

-- Admins can manage all associations
CREATE POLICY "Admins can manage associations" 
ON public.associations 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to handle new association creation
-- This will automatically link the user to the association they create
CREATE OR REPLACE FUNCTION public.handle_new_association()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the user's profile to link them to this association
  UPDATE public.profiles 
  SET association_id = NEW.id
  WHERE id = auth.uid();
  
  RETURN NEW;
END;
$$;

-- Create trigger for new associations
DROP TRIGGER IF EXISTS on_association_created ON public.associations;
CREATE TRIGGER on_association_created
  AFTER INSERT ON public.associations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_association();