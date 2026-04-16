BEGIN;

-- 1. Remover a política antiga para recriá-la com mais permissões
DROP POLICY IF EXISTS "Setores podem atualizar suas contratações ou admins/gestores podem atualizar todas" ON public.contratacoes;

-- 2. Criar nova política que permite:
--    a) O criador do registro atualizar
--    b) Administradores ou Gestores atualizarem qualquer um
--    c) Usuários com role 'setor_requisitante' atualizarem registros do seu setor (conforme perfil e setores adicionais)
CREATE POLICY "Permitir atualização por criador, gestores ou setor correspondente"
  ON public.contratacoes FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    public.has_role(auth.uid(), 'gestor'::public.perfil_acesso) OR
    public.has_role(auth.uid(), 'administrador'::public.perfil_acesso) OR
    (
      public.has_role(auth.uid(), 'setor_requisitante'::public.perfil_acesso) AND
      setor_requisitante IN (
        SELECT unnest(array_append(setores_adicionais, setor))
        FROM public.profiles
        WHERE id = auth.uid()
      )
    )
  );

COMMIT;
