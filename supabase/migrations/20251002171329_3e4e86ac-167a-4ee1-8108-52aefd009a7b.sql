-- Fix: Restrict full profile visibility to administrators only
-- Gestores should not have blanket access to all employee personal information

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Admins and gestores can view all profiles" ON public.profiles;

-- Create a new policy that only allows administrators to view all profiles
CREATE POLICY "Only administrators can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'administrador'::perfil_acesso));

-- Note: The "Users can view their own profile" policy already exists and remains in place
-- This ensures users can still see their own data while restricting bulk access to admins only