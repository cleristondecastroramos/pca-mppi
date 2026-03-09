
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Notificacoes admin" ON public.notificacoes;
DROP POLICY IF EXISTS "Notificacoes leitura" ON public.notificacoes;

-- Create permissive SELECT policy for all authenticated users (active only)
CREATE POLICY "Notificacoes leitura"
ON public.notificacoes
FOR SELECT
TO authenticated
USING (ativa = true);

-- Create permissive INSERT policy for admins/gestors
CREATE POLICY "Notificacoes insert"
ON public.notificacoes
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'administrador'::perfil_acesso)
  OR has_role(auth.uid(), 'gestor'::perfil_acesso)
);

-- Create permissive UPDATE policy for admins/gestors
CREATE POLICY "Notificacoes update"
ON public.notificacoes
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'administrador'::perfil_acesso)
  OR has_role(auth.uid(), 'gestor'::perfil_acesso)
);
