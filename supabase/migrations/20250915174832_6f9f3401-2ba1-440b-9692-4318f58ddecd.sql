-- Create table to map usernames to emails
CREATE TABLE public.usernames (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.usernames ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own username
CREATE POLICY "Users can view their own username" ON public.usernames
FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Allow users to create their own username
CREATE POLICY "Users can create their own username" ON public.usernames  
FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Allow users to update their own username
CREATE POLICY "Users can update their own username" ON public.usernames
FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Create function to get email from username
CREATE OR REPLACE FUNCTION public.get_email_from_username(input_username text)
RETURNS text AS $$
BEGIN
  RETURN (SELECT email FROM public.usernames WHERE username = input_username);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;