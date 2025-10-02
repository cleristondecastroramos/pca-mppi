-- Phase 1: Fix Critical Security Issues

-- 1. Fix profiles table RLS policies
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Usuários podem ver todos os perfis" ON public.profiles;

-- Add role-based SELECT policy for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admins and gestores can view all profiles"
ON public.profiles
FOR SELECT
USING (
  public.has_role(auth.uid(), 'administrador'::perfil_acesso) OR
  public.has_role(auth.uid(), 'gestor'::perfil_acesso)
);

-- Add missing INSERT policy (only system via trigger)
CREATE POLICY "System can insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Add missing DELETE policy (admins only)
CREATE POLICY "Only admins can delete profiles"
ON public.profiles
FOR DELETE
USING (public.has_role(auth.uid(), 'administrador'::perfil_acesso));

-- 2. Fix audit trail visibility
DROP POLICY IF EXISTS "Todos podem ver histórico" ON public.contratacoes_historico;

CREATE POLICY "Users can view history of their own records"
ON public.contratacoes_historico
FOR SELECT
USING (
  user_id = auth.uid() OR
  public.has_role(auth.uid(), 'gestor'::perfil_acesso) OR
  public.has_role(auth.uid(), 'administrador'::perfil_acesso)
);

-- 3. Fix database functions - add proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, nome_completo, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', ''),
    NEW.email
  );
  
  -- Atribuir role padrão de consulta
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'consulta');
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;