-- Fix RLS policy for usernames table to allow INSERT during signup
DROP POLICY IF EXISTS "Users can create their own username" ON public.usernames;

CREATE POLICY "Allow username creation during signup"
ON public.usernames
FOR INSERT
WITH CHECK (true);

-- Make full_name nullable in profiles to prevent trigger failures
ALTER TABLE public.profiles 
ALTER COLUMN full_name DROP NOT NULL;

-- Create trigger to automatically create username mapping from metadata
CREATE OR REPLACE FUNCTION public.handle_username_mapping()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create username mapping if username is provided in metadata
  IF NEW.raw_user_meta_data ? 'username' THEN
    INSERT INTO public.usernames (username, email, user_id)
    VALUES (
      NEW.raw_user_meta_data ->> 'username',
      NEW.email,
      NEW.id
    )
    ON CONFLICT (username) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to create username mapping after user creation
DROP TRIGGER IF EXISTS on_auth_user_created_username ON auth.users;
CREATE TRIGGER on_auth_user_created_username
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_username_mapping();

-- Update handle_new_user to use username as fallback for full_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id, 
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'username',
      'Usuario'
    )
  );
  RETURN NEW;
END;
$$;