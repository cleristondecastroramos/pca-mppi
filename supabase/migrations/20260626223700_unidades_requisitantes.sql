-- 1. Criar tabela unidades_requisitantes
CREATE TABLE IF NOT EXISTS public.unidades_requisitantes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(100) NOT NULL,
  exercicio INTEGER NOT NULL DEFAULT 2027,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.unidades_requisitantes ENABLE ROW LEVEL SECURITY;

-- Políticas para unidades_requisitantes
CREATE POLICY "Leitura de unidades requisitantes"
  ON public.unidades_requisitantes FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Administradores podem gerenciar unidades requisitantes"
  ON public.unidades_requisitantes FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'administrador'::public.perfil_acesso));

-- 2. Adicionar unidade_requisitante_id ao profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS unidade_requisitante_id UUID REFERENCES public.unidades_requisitantes(id);

-- 3. Adicionar unidade_requisitante_id as contratacoes
ALTER TABLE public.contratacoes 
  ADD COLUMN IF NOT EXISTS unidade_requisitante_id UUID REFERENCES public.unidades_requisitantes(id);

-- 4. Atualizar a RLS de contratacoes para considerar unidade_requisitante_id
DROP POLICY IF EXISTS "Permitir atualização por criador, gestores ou setor correspondente" ON public.contratacoes;

CREATE POLICY "Permitir atualização por criador, gestores ou setor correspondente"
  ON public.contratacoes FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    public.has_role(auth.uid(), 'gestor'::public.perfil_acesso) OR
    public.has_role(auth.uid(), 'administrador'::public.perfil_acesso) OR
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
