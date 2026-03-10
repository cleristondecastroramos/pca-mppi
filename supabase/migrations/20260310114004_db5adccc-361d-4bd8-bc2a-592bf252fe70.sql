
-- Admins e gestores precisam ver todas as notificações (incluindo inativas)
-- para que o UPDATE de ativa=false funcione corretamente
CREATE POLICY "Notificacoes select admin"
ON public.notificacoes
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'administrador'::perfil_acesso) 
  OR has_role(auth.uid(), 'gestor'::perfil_acesso)
);
