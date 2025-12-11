-- Add 'ramal' column to profiles
alter table public.profiles add column if not exists ramal text;

-- Optional: backfill from existing 'telefone' if desired (commented)
-- update public.profiles set ramal = telefone where ramal is null and telefone is not null;
