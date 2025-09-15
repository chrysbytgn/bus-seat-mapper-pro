-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_association_created ON public.associations;

-- Drop existing function if exists  
DROP FUNCTION IF EXISTS public.handle_new_association();

-- Recreate the function with proper linking
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

-- Recreate the trigger
CREATE TRIGGER on_association_created
  AFTER INSERT ON public.associations
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_association();