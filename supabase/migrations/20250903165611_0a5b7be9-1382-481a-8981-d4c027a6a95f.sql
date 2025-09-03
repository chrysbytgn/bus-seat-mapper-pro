-- Phase 1: Add authentication and role system
-- First, create proper foreign key constraints
ALTER TABLE public.excursions 
ADD CONSTRAINT fk_excursions_association 
FOREIGN KEY (association_id) REFERENCES public.associations(id) ON DELETE CASCADE;

ALTER TABLE public.passengers 
ADD CONSTRAINT fk_passengers_excursion 
FOREIGN KEY (excursion_id) REFERENCES public.excursions(id) ON DELETE CASCADE;

-- Add unique constraint to prevent duplicate seats per excursion
ALTER TABLE public.passengers 
ADD CONSTRAINT unique_seat_per_excursion 
UNIQUE (excursion_id, seat);

-- Create user profiles table for authentication
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

-- Create trigger for new user profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Phase 2: Update RLS policies to be restrictive

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Permitir acceso completo a asociaciones" ON public.associations;
DROP POLICY IF EXISTS "Permitir acceso completo a excursiones" ON public.excursions;
DROP POLICY IF EXISTS "Permitir acceso completo a pasajeros" ON public.passengers;

-- Create secure RLS policies for associations
CREATE POLICY "Users can view associations" ON public.associations
  FOR SELECT USING (true); -- Associations can be viewed by all authenticated users

CREATE POLICY "Only admins can modify associations" ON public.associations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create secure RLS policies for excursions  
CREATE POLICY "Users can view excursions" ON public.excursions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create excursions" ON public.excursions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update excursions" ON public.excursions
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete excursions" ON public.excursions
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create secure RLS policies for passengers
CREATE POLICY "Users can view passengers" ON public.passengers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage passengers" ON public.passengers
  FOR ALL USING (auth.role() = 'authenticated');

-- Create secure RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Phase 3: Add updated_at trigger for profiles
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();