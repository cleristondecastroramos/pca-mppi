
-- Fix notificacoes RLS: drop RESTRICTIVE policies and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Notificacoes insert" ON public.notificacoes;
DROP POLICY IF EXISTS "Notificacoes leitura" ON public.notificacoes;
DROP POLICY IF EXISTS "Notificacoes update" ON public.notificacoes;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Notificacoes select permissive"
ON public.notificacoes
FOR SELECT
TO authenticated
USING (ativa = true);

CREATE POLICY "Notificacoes insert permissive"
ON public.notificacoes
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'administrador'::perfil_acesso) 
  OR has_role(auth.uid(), 'gestor'::perfil_acesso)
);

CREATE POLICY "Notificacoes update permissive"
ON public.notificacoes
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'administrador'::perfil_acesso) 
  OR has_role(auth.uid(), 'gestor'::perfil_acesso)
);
