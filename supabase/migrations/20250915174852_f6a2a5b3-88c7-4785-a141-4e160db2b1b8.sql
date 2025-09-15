-- Fix the function search path security issue
CREATE OR REPLACE FUNCTION public.get_email_from_username(input_username text)
RETURNS text AS $$
BEGIN
  RETURN (SELECT email FROM public.usernames WHERE username = input_username);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;