-- Migration: Atualizar política de RLS para exclusão na tabela contratacoes

DROP POLICY IF EXISTS "Apenas administradores podem excluir contratações" ON public.contratacoes;
DROP POLICY IF EXISTS "Permitir exclusão de contratações por criador, gestores ou administradores" ON public.contratacoes;

CREATE POLICY "Permitir exclusão de contratações por criador, gestores ou administradores"
  ON public.contratacoes FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    public.has_role(auth.uid(), 'administrador'::public.perfil_acesso) OR
    public.has_role(auth.uid(), 'gestor'::public.perfil_acesso) OR
    (
      public.has_role(auth.uid(), 'setor_requisitante'::public.perfil_acesso) AND
      (
        setor_requisitante IN (
          SELECT unnest(array_append(setores_adicionais, setor))
          FROM public.profiles
          WHERE id = auth.uid()
        )
        OR
        unidade_requisitante_id IN (
          SELECT unidade_requisitante_id
          FROM public.profiles
          WHERE id = auth.uid()
        )
      )
    )
  );
