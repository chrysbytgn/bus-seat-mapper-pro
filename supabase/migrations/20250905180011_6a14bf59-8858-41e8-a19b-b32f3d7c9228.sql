-- Add available_seats column to excursions table
ALTER TABLE public.excursions 
ADD COLUMN available_seats integer DEFAULT 55 CHECK (available_seats >= 1 AND available_seats <= 55);