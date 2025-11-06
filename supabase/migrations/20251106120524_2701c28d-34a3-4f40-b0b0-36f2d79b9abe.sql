-- Vincular el perfil del usuario actual con la asociación existente
-- Esto permite que el usuario pueda crear y gestionar excursiones
UPDATE public.profiles 
SET association_id = 'f39e9589-af78-4ef1-a96d-7d4eee9473a8' 
WHERE id = '43ad18a3-d855-41b7-bf09-c54f37adaa8a';