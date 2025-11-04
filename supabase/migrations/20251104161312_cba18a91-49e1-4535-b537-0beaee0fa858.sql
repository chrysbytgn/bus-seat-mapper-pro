-- Remove the insecure role column from profiles table
-- This eliminates privilege escalation risks by ensuring roles are only managed
-- through the secure user_roles table with proper enum types and RLS policies

ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;