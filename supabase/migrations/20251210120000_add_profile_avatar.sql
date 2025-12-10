-- Add avatar_url to profiles to persist user profile photo
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Optional: keep updated_at accurate when avatar_url changes (trigger already updates on any UPDATE)
-- No additional RLS changes required; existing UPDATE policy (auth.uid() = id) applies to the new column.

