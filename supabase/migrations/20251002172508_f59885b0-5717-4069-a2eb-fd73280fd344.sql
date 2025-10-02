-- Fix: Restrict audit trail inserts to administrators only
-- This prevents unauthorized users from manipulating audit records

-- Drop the overly permissive policy that allows anyone to insert
DROP POLICY IF EXISTS "Sistema pode inserir histórico" ON public.contratacoes_historico;

-- Create a new policy that only allows administrators to insert audit records
CREATE POLICY "Only administrators can insert audit records"
ON public.contratacoes_historico
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'administrador'::perfil_acesso));

-- Note: This maintains the existing "Users can view history of their own records" SELECT policy
-- Administrators will be able to log actions, but regular users cannot tamper with the audit trail