-- Temporarily disable RLS on associations to allow initial setup
ALTER TABLE public.associations DISABLE ROW LEVEL SECURITY;

-- Create a more permissive policy for association creation
ALTER TABLE public.associations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert associations
CREATE POLICY "Allow authenticated users to create associations" ON public.associations
FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to select associations  
CREATE POLICY "Allow authenticated users to view associations" ON public.associations
FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to update associations
CREATE POLICY "Allow authenticated users to update associations" ON public.associations  
FOR UPDATE TO authenticated USING (true);

-- Allow authenticated users to delete associations
CREATE POLICY "Allow authenticated users to delete associations" ON public.associations
FOR DELETE TO authenticated USING (true);

-- Also create a trigger to automatically link new associations to the creating user
CREATE OR REPLACE FUNCTION public.handle_new_association()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user's profile to link them to this association
  UPDATE public.profiles 
  SET association_id = NEW.id
  WHERE id = auth.uid();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_association_created
  AFTER INSERT ON public.associations
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_association();