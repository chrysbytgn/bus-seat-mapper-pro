-- Fix the username mapping trigger
DROP TRIGGER IF EXISTS on_auth_user_created_username ON auth.users;

-- Recreate the trigger to ensure it fires correctly
CREATE TRIGGER on_auth_user_created_username
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_username_mapping();

-- Populate missing username entries for existing users
INSERT INTO public.usernames (username, email, user_id)
SELECT 
  COALESCE(
    raw_user_meta_data->>'username',
    split_part(email, '@', 1)
  ) as username,
  email,
  id as user_id
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.usernames WHERE user_id IS NOT NULL)
ON CONFLICT (username) DO UPDATE 
SET email = EXCLUDED.email,
    user_id = EXCLUDED.user_id;