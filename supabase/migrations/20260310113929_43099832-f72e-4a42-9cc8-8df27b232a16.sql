
-- Recriar a política de UPDATE com WITH CHECK explícito
DROP POLICY IF EXISTS "Notificacoes update permissive" ON public.notificacoes;

CREATE POLICY "Notificacoes update permissive"
ON public.notificacoes
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'administrador'::perfil_acesso) 
  OR has_role(auth.uid(), 'gestor'::perfil_acesso)
)
WITH CHECK (
  has_role(auth.uid(), 'administrador'::perfil_acesso) 
  OR has_role(auth.uid(), 'gestor'::perfil_acesso)
);
