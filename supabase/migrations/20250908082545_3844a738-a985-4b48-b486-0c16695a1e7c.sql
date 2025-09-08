-- Remove the overly permissive policy that allows all operations to everyone
DROP POLICY IF EXISTS "Allow all operations on passengers" ON public.passengers;

-- Create secure RLS policies for passengers table
-- Only authenticated users can view passengers
CREATE POLICY "Authenticated users can view passengers" 
ON public.passengers 
FOR SELECT 
TO authenticated
USING (true);

-- Only authenticated users can insert passengers
CREATE POLICY "Authenticated users can create passengers" 
ON public.passengers 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Only authenticated users can update passengers
CREATE POLICY "Authenticated users can update passengers" 
ON public.passengers 
FOR UPDATE 
TO authenticated
USING (true);

-- Only authenticated users can delete passengers
CREATE POLICY "Authenticated users can delete passengers" 
ON public.passengers 
FOR DELETE 
TO authenticated
USING (true);